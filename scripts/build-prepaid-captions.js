#!/usr/bin/env node
/** Build Spanish VTT for the prepaid-funeral teaching video from the spoken script. */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DURATION = 283.36;
const OUT = path.join(ROOT, "data/teaching-videos/funerales-prepagados.es.vtt");

const SECTIONS = [
  {
    label: "Qué es un funeral prepagado",
    text: `Hola. Soy Jhenny, la asistente educativa de Mejor Vida Seguros.
Un funeral prepagado es un acuerdo con una funeraria. Usted elige los bienes y los servicios ahora, y paga una parte o el total de esa cuenta antes de que hagan falta. No es un seguro de vida. Planear y pagar también son dos decisiones distintas. Usted puede dejar por escrito sus deseos para la familia, sin enviar dinero a una sola funeraria.`,
  },
  {
    label: "Por qué importa",
    text: `Cuando alguien fallece, alguien tiene que pagar el cuidado del cuerpo, el lugar de descanso y, si la familia lo quiere, un servicio. Esa cuenta llega rápido. Medicare no la paga. El Seguro Social puede pagar 255 dólares una sola vez, si se cumplen sus reglas. Eso no cubre un funeral típico.
Mucha gente quiere ahorrarles a sus hijos esa factura y esas decisiones. Algunas personas firman ahora con una funeraria y pagan por adelantado. Otras dejan efectivo a alguien de confianza, para que esa persona pague después. Esas dos ideas suenan parecidas, porque las dos buscan que la familia no tenga que improvisar. No son lo mismo. Un contrato prepagado queda atado a una funeraria y a los artículos que usted nombró. El efectivo, no. Esa diferencia se nota si la familia se muda, si el plan cambia, o si ese negocio cierra.`,
  },
  {
    label: "Cómo se arma el contrato",
    text: `Cuando usted paga por adelantado, no está comprando “un funeral” como un solo paquete. Está comprando artículos concretos del menú escrito de esa funeraria: cosas como el traslado del cuerpo, un velatorio, el personal, y un ataúd o una urna. Ese menú se llama lista de precios generales. La funeraria tiene que entregársela. Pídala primero. Compare por lo menos dos funerarias. Marque solo las líneas que de verdad quiere. Luego pida un estado de cuenta escrito de cada artículo y del total, antes de pagar.
Una regla federal de la Comisión Federal de Comercio sigue aplicando cuando usted planea con anticipación. Usted puede comprar solo lo que necesita. Puede llevar un ataúd o una urna comprados en otro lugar. Y no dé por hecho que el cementerio va incluido. La parcela, abrir la tumba y el marcador suelen ser cuentas aparte.`,
  },
  {
    label: "Dónde queda el dinero",
    text: `La regla federal de la que acabamos de hablar cubre cómo usted compra. Lo que ocurre con su dinero después de pagarle a la funeraria se basa en la ley estatal, no en la ley federal. No hay una sola protección federal que funcione igual en todos los estados.
Algunos contratos prepagados con una funeraria ponen una parte del pago en un fideicomiso regulado. Otros contratos prepagados con una funeraria usan un seguro de vida asignado a esa misma funeraria, para que el negocio quede nombrado a cobrar el beneficio y prestar el servicio. Las protecciones no son iguales en todos los estados. La FTC advierte que algunas leyes estatales ofrecen poca protección efectiva. Si la funeraria no pone por escrito cuál de esos caminos usa este contrato, no firme.
Pagarle ahora a la funeraria tampoco congela de forma automática el precio de hoy. Algunos contratos prepagados con una funeraria fijan el precio por escrito. Otros lo calculan cuando ocurre el fallecimiento. Si eso no está garantizado en el contrato, la familia todavía puede deber un complemento. Pregunte qué pasa si usted cancela, si se muda, o si esa funeraria cierra. Algunos de estos contratos son irrevocables: no se pueden deshacer a voluntad. El efectivo de un seguro de vida viaja con la persona que usted nombró. Un paquete prepagado en una funeraria, por lo general, no.`,
  },
  {
    label: "Errores comunes",
    text: `Dígale a la familia que el contrato existe y dónde está. Si nadie sabe que usted ya pagó, pueden pagar el mismo funeral dos veces. No deje la única copia en un testamento o en una caja de seguridad que nadie pueda abrir ese fin de semana.`,
  },
  {
    label: "Cotización gratis",
    text: `Un funeral prepagado es un contrato por artículos nombrados en una funeraria. No es efectivo en las manos de alguien, y no congela el precio de forma automática.
Esperamos que esta información le ayude a entender mejor sus opciones de seguro de vida.
Si desea saber cuánto podría costar su cobertura, visite mejorvidaseguros.com o escríbanos por WhatsApp al 402-440-5438. Puede recibir una cotización gratuita y sin compromiso.
Estamos aquí para ayudarle a encontrar una opción que se ajuste a sus necesidades y a su presupuesto.`,
  },
];

function words(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function wrapCue(text) {
  const w = words(text);
  if (w.length <= 6) return text.trim();
  const mid = Math.ceil(w.length / 2);
  return w.slice(0, mid).join(" ") + "\n" + w.slice(mid).join(" ");
}

function splitCues(text) {
  const sentences = String(text)
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const cues = [];
  for (const sentence of sentences) {
    const w = words(sentence);
    if (w.length <= 14) {
      cues.push(sentence);
      continue;
    }
    for (let i = 0; i < w.length; i += 12) {
      cues.push(w.slice(i, i + 12).join(" "));
    }
  }
  return cues;
}

function fmt(seconds) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = s % 60;
  const whole = Math.floor(rest);
  const ms = Math.round((rest - whole) * 1000);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(whole).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
}

const sectionWordCounts = SECTIONS.map((sec) => words(sec.text).length);
const totalWords = sectionWordCounts.reduce((a, b) => a + b, 0);
let t = 0;
const chapters = [];
const cues = [];

for (let i = 0; i < SECTIONS.length; i++) {
  const sec = SECTIONS[i];
  const share = sectionWordCounts[i] / totalWords;
  const secDur = DURATION * share;
  chapters.push({ t: Math.round(t), label: sec.label });
  const parts = splitCues(sec.text);
  const partWords = parts.map((p) => words(p).length);
  const partTotal = partWords.reduce((a, b) => a + b, 0) || 1;
  let local = 0;
  for (let j = 0; j < parts.length; j++) {
    const start = t + (local / partTotal) * secDur;
    local += partWords[j];
    const end = t + (local / partTotal) * secDur;
    cues.push({ start, end: Math.min(DURATION, Math.max(end, start + 1.2)), text: wrapCue(parts[j]) });
  }
  t += secDur;
}
if (cues.length) cues[cues.length - 1].end = DURATION;

const vtt =
  "WEBVTT\n\n" +
  cues
    .map((c) => fmt(c.start) + " --> " + fmt(c.end) + "\n" + c.text)
    .join("\n\n") +
  "\n";

fs.writeFileSync(OUT, vtt);
console.log("Wrote", path.relative(ROOT, OUT));
console.log(JSON.stringify({ duration: DURATION, chapters, cues: cues.length }, null, 2));
