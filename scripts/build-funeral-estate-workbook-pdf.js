#!/usr/bin/env node
/**
 * Build branded fillable (AcroForm) workbooks as PDF.
 * The HTML print copies stay handwriting-only.
 *
 * Usage: node scripts/build-funeral-estate-workbook-pdf.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb, PDFName, PDFBool } = require("pdf-lib");
const { writeWorkbooks } = require("./funeral-estate-workbook");
const { workbookOutline } = require("./funeral-estate-workbook-outline");

const ROOT = path.join(__dirname, "..");
const PAGE_W = 612;
const PAGE_H = 792;
const ML = 40;
const MR = 40;
const MT = 28;
const MB = 34;
const GAP = 12;
const CONTENT_W = PAGE_W - ML - MR;
const COL_W = (CONTENT_W - GAP) / 2;

const NAVY = rgb(0.102, 0.212, 0.365);
const GOLD = rgb(0.788, 0.635, 0.153);
const SLATE = rgb(0.2, 0.255, 0.333);
const MUTED = rgb(0.392, 0.455, 0.545);
const FIELD_BG = rgb(0.957, 0.969, 0.98);
const FIELD_BORDER = rgb(0.58, 0.639, 0.722);

function pdfSafe(s) {
  return String(s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/\u00a0/g, " ");
}

function wrapLines(text, font, size, width) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= width) cur = trial;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (font.widthOfTextAtSize(cur, size) > width) {
        let chunk = "";
        for (const ch of cur) {
          const next = chunk + ch;
          if (font.widthOfTextAtSize(next, size) <= width) chunk = next;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        cur = chunk;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

class FillableWorkbook {
  constructor({ pdfDoc, form, fonts, logo, t, lang }) {
    this.doc = pdfDoc;
    this.form = form;
    this.fonts = fonts;
    this.logo = logo;
    this.t = t;
    this.lang = lang;
    this.page = null;
    this.pageIndex = 0;
    this.y = 0;
    this.n = 0;
  }

  fieldName() {
    this.n += 1;
    return `${this.lang}_${this.n}`;
  }

  bottomLimit() {
    return MB + 18;
  }

  ensure(h) {
    if (!this.page || this.y - h < this.bottomLimit()) this.addPage();
  }

  addPage() {
    if (this.page) this.drawFooter();
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pageIndex += 1;
    this.y = PAGE_H - MT;
    this.drawHeader();
  }

  drawHeader() {
    const isFirst = this.pageIndex === 1;
    const logoH = isFirst ? 64 : 22;
    const logoW = (this.logo.width / this.logo.height) * logoH;
    this.page.drawImage(this.logo, {
      x: ML,
      y: this.y - logoH,
      width: logoW,
      height: logoH,
    });
    const metaSize = isFirst ? 9 : 7.5;
    const metaFont = this.fonts.helvBold;
    const lines = [this.t.legalName, this.t.phone, this.t.web];
    let my = this.y - (isFirst ? 16 : 8);
    for (const line of lines) {
      const safe = pdfSafe(line);
      const w = metaFont.widthOfTextAtSize(safe, metaSize);
      this.page.drawText(safe, {
        x: PAGE_W - MR - w,
        y: my - metaSize,
        size: metaSize,
        font: metaFont,
        color: SLATE,
      });
      my -= metaSize + 2.5;
    }
    this.y -= logoH + 3;
    this.page.drawRectangle({
      x: ML,
      y: this.y - 5,
      width: CONTENT_W,
      height: 5,
      color: NAVY,
    });
    this.y -= 5;
    this.page.drawRectangle({
      x: ML,
      y: this.y - 3.5,
      width: CONTENT_W,
      height: 3.5,
      color: GOLD,
    });
    this.y -= isFirst ? 12 : 10;
  }

  drawFooter() {
    const page = this.page;
    page.drawRectangle({
      x: ML,
      y: 26,
      width: CONTENT_W,
      height: 1.6,
      color: NAVY,
    });
    const foot = pdfSafe(`${this.t.phone}  ·  ${this.t.email}`);
    page.drawText(foot, {
      x: ML,
      y: 14,
      size: 7.5,
      font: this.fonts.helv,
      color: MUTED,
    });
    const pageStr = String(this.pageIndex);
    const pw = this.fonts.helv.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: PAGE_W - MR - pw,
      y: 14,
      size: 8,
      font: this.fonts.helv,
      color: MUTED,
    });
  }

  drawWrapped(text, { font, size, color, width = CONTENT_W, leading, x = ML }) {
    const lines = wrapLines(text, font, size, width);
    const lh = leading || size + 3;
    this.ensure(lines.length * lh);
    for (const line of lines) {
      this.page.drawText(line, {
        x,
        y: this.y - size,
        size,
        font,
        color,
      });
      this.y -= lh;
    }
  }

  drawCover() {
    const t = this.t;
    this.drawWrapped(t.kicker, {
      font: this.fonts.helvBold,
      size: 8,
      color: GOLD,
      leading: 12,
    });
    this.y -= 2;
    this.drawWrapped(t.docTitle, {
      font: this.fonts.timesBold,
      size: 20,
      color: NAVY,
      leading: 24,
    });
    this.y -= 4;
    this.drawWrapped(t.introPdf, {
      font: this.fonts.helv,
      size: 10,
      color: SLATE,
      leading: 13,
    });
    this.y -= 4;
    this.drawWrapped(t.intro2Pdf, {
      font: this.fonts.helv,
      size: 10,
      color: SLATE,
      leading: 13,
    });
    this.y -= 6;
    this.drawSectionTitle(t.howH);
    for (const item of [t.howPdf1, t.how2, t.how3]) {
      this.drawBullet(item);
    }
    this.y -= 4;
  }

  drawBullet(text) {
    const indent = 12;
    const lines = wrapLines(text, this.fonts.helv, 9.5, CONTENT_W - indent);
    this.ensure(lines.length * 12 + 2);
    this.page.drawText("•", {
      x: ML,
      y: this.y - 9.5,
      size: 10,
      font: this.fonts.helv,
      color: GOLD,
    });
    for (const line of lines) {
      this.page.drawText(line, {
        x: ML + indent,
        y: this.y - 9.5,
        size: 9.5,
        font: this.fonts.helv,
        color: SLATE,
      });
      this.y -= 11;
    }
    this.y -= 1;
  }

  drawSectionTitle(title) {
    const lines = wrapLines(title, this.fonts.timesBold, 12, CONTENT_W - 10);
    const h = lines.length * 15 + 8;
    this.ensure(h);
    const barH = Math.max(12, lines.length * 15 - 2);
    this.page.drawRectangle({
      x: ML,
      y: this.y - barH,
      width: 3.5,
      height: barH,
      color: GOLD,
    });
    for (const line of lines) {
      this.page.drawText(line, {
        x: ML + 9,
        y: this.y - 11,
        size: 12,
        font: this.fonts.timesBold,
        color: NAVY,
      });
      this.y -= 14;
    }
    this.y -= 3;
  }

  textFieldOpts(height) {
    return {
      height,
      borderWidth: 0.75,
      borderColor: FIELD_BORDER,
      backgroundColor: FIELD_BG,
      textColor: NAVY,
    };
  }

  addTextField({ x, width, height, multiline, maxLength }) {
    const field = this.form.createTextField(this.fieldName());
    if (multiline) field.enableMultiline();
    if (maxLength) field.setMaxLength(maxLength);
    const y = this.y - height;
    field.addToPage(this.page, { x, y, width, ...this.textFieldOpts(height) });
    field.setFontSize(9);
    return y;
  }

  fieldHeight(lines) {
    const n = lines || 1;
    return n <= 1 ? 15 : n * 13;
  }

  measureLabeledField(label, lines, width) {
    const labelLines = wrapLines(label, this.fonts.helvBold, 8, width);
    return labelLines.length * 10 + this.fieldHeight(lines) + 4;
  }

  drawLabeledField(label, lines, x, width) {
    const labelLines = wrapLines(label, this.fonts.helvBold, 8, width);
    const fieldH = this.fieldHeight(lines);
    this.ensure(labelLines.length * 10 + fieldH + 4);
    for (const line of labelLines) {
      this.page.drawText(line, {
        x,
        y: this.y - 8,
        size: 8,
        font: this.fonts.helvBold,
        color: NAVY,
      });
      this.y -= 10;
    }
    const maxLength = /last four of ssn|últimos cuatro del seguro social/i.test(label) ? 4 : undefined;
    this.addTextField({
      x,
      width,
      height: fieldH,
      multiline: (lines || 1) > 1,
      maxLength,
    });
    this.y -= fieldH + 4;
  }

  drawGrid(pairs) {
    for (const [left, right] of pairs) {
      const hL = this.measureLabeledField(left, 1, COL_W);
      const hR = this.measureLabeledField(right, 1, COL_W);
      this.ensure(Math.max(hL, hR));
      const yStart = this.y;
      this.drawLabeledField(left, 1, ML, COL_W);
      const yAfterLeft = this.y;
      this.y = yStart;
      this.drawLabeledField(right, 1, ML + COL_W + GAP, COL_W);
      this.y = Math.min(yAfterLeft, this.y);
    }
  }

  drawChecks(items) {
    const box = 11;
    for (const item of items) {
      const lines = wrapLines(item, this.fonts.helv, 9, CONTENT_W - box - 8);
      const h = Math.max(box + 2, lines.length * 11) + 2;
      this.ensure(h);
      const cb = this.form.createCheckBox(this.fieldName());
      cb.addToPage(this.page, {
        x: ML,
        y: this.y - box,
        width: box,
        height: box,
        borderWidth: 1,
        borderColor: NAVY,
        backgroundColor: rgb(1, 1, 1),
      });
      let ty = this.y - 9;
      for (const line of lines) {
        this.page.drawText(line, {
          x: ML + box + 6,
          y: ty,
          size: 9,
          font: this.fonts.helv,
          color: SLATE,
        });
        ty -= 11;
      }
      this.y -= h;
    }
    this.y -= 1;
  }

  drawNotary(text) {
    const minH = 40;
    let h = 48;
    const extra = 4;
    const afterNotary = extra + 22;
    if (this.page && this.y - (h + afterNotary) < this.bottomLimit()) {
      const available = this.y - this.bottomLimit() - afterNotary;
      if (available >= minH) h = available;
      else this.addPage();
    }
    const y = this.y - h;
    this.page.drawRectangle({
      x: ML,
      y,
      width: CONTENT_W,
      height: h,
      borderWidth: 0.8,
      borderColor: FIELD_BORDER,
      color: rgb(1, 1, 1),
    });
    const label = pdfSafe(text);
    const size = 9;
    const w = this.fonts.helv.widthOfTextAtSize(label, size);
    this.page.drawText(label, {
      x: ML + (CONTENT_W - w) / 2,
      y: y + h / 2 - size / 2,
      size,
      font: this.fonts.helv,
      color: MUTED,
    });
    this.y = y - 4;
  }

  drawBlock(block) {
    if (block.type === "p" || block.type === "note") {
      this.drawWrapped(block.text, {
        font: this.fonts.helv,
        size: 9,
        color: SLATE,
        leading: 12,
      });
      this.y -= 1;
      return;
    }
    if (block.type === "grid") {
      this.drawGrid(block.pairs);
      return;
    }
    if (block.type === "field") {
      this.drawLabeledField(block.label, block.lines, ML, CONTENT_W);
      return;
    }
    if (block.type === "checks") {
      this.drawChecks(block.items);
      return;
    }
    if (block.type === "notary") {
      this.drawNotary(block.text);
    }
  }

  drawSections(sections) {
    for (const sec of sections) {
      this.drawSectionTitle(sec.title);
      for (const block of sec.blocks) this.drawBlock(block);
      this.y -= 2;
    }
    this.drawWrapped(this.t.disc, {
      font: this.fonts.helv,
      size: 7.5,
      color: MUTED,
      leading: 10,
    });
  }

  finish() {
    if (this.page) this.drawFooter();
  }
}

async function buildPdf(lang, outPath) {
  const { t, sections } = workbookOutline(lang);
  const isEs = lang === "es";
  const logoFile = path.join(
    ROOT,
    "img/opt",
    isEs ? "logo-spanish2-workbook.png" : "logo-english2-workbook.png"
  );

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(t.title);
  pdfDoc.setAuthor("Mejor Vida Insurance LLC");
  pdfDoc.setCreator("Mejor Vida Insurance");
  pdfDoc.setLanguage(isEs ? "es-US" : "en-US");

  const fonts = {
    helv: await pdfDoc.embedFont(StandardFonts.Helvetica),
    helvBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    timesBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
  };
  const logo = await pdfDoc.embedPng(fs.readFileSync(logoFile));
  const form = pdfDoc.getForm();

  const wb = new FillableWorkbook({ pdfDoc, form, fonts, logo, t, lang });
  wb.addPage();
  wb.drawCover();
  wb.drawSections(sections);
  wb.finish();

  form.updateFieldAppearances(fonts.helv);
  form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);

  const bytes = await pdfDoc.save({ updateFieldAppearances: true });
  fs.writeFileSync(outPath, bytes);
  return form.getFields().length;
}

async function main() {
  const { esPath, enPath } = writeWorkbooks();
  const esPdf = esPath.replace(/\.html$/, ".pdf");
  const enPdf = enPath.replace(/\.html$/, ".pdf");
  const esFields = await buildPdf("es", esPdf);
  const enFields = await buildPdf("en", enPdf);
  console.log("Wrote fillable PDF", esPdf, `(${esFields} fields)`);
  console.log("Wrote fillable PDF", enPdf, `(${enFields} fields)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
