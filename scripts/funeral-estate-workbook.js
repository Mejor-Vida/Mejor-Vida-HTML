"use strict";

/**
 * Original Mejor Vida funeral + papers workbook (ES/EN).
 * Topics overlap a typical funeral-planning packet; wording, grouping, and
 * branding are original. Does not collect passwords.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "guides");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function field(label, lines) {
  const n = lines || 1;
  const extra = Array.from({ length: n }, () => `<div class="wb-line"></div>`).join("");
  return `<div class="wb-field"><p class="wb-label">${esc(label)}</p>${extra}</div>`;
}

function checks(items) {
  return `<ul class="wb-checks">${items
    .map((t) => `<li><span class="wb-box"></span>${esc(t)}</li>`)
    .join("")}</ul>`;
}

function pairGrid(pairs) {
  return `<div class="wb-grid">${pairs
    .map(([a, b]) => `${field(a)}${field(b)}`)
    .join("")}</div>`;
}

function copy(lang) {
  const isEs = lang === "es";
  if (isEs) {
    return {
      title: "Cuaderno de deseos funerarios y papeles | Mejor Vida Seguros",
      docTitle: "Cuaderno de deseos funerarios y papeles",
      agency: "Mejor Vida Seguros",
      legalName: "Mejor Vida Insurance LLC",
      kicker: "Regalo gratuito para su familia",
      intro:
        "Use este cuaderno para escribir a mano lo que su familia necesitará cuando usted fallezca y, si llega el caso, si usted no puede decidir por sí mismo.",
      intro2:
        "No es un testamento, un poder notarial ni un contrato con una funeraria. Imprímalo, llénelo y dé copias a personas de confianza. Dígales dónde está el original.",
      introPdf:
        "Use este cuaderno para anotar lo que su familia necesitará cuando usted fallezca y, si llega el caso, si usted no puede decidir por sí mismo.",
      intro2Pdf:
        "No es un testamento, un poder notarial ni un contrato con una funeraria. Escriba en los campos, guarde el archivo y dé copias a personas de confianza. Dígales dónde está el original.",
      howH: "Cómo usarlo",
      how1: "Escríbalo con bolígrafo. Si más adelante cambia de idea, tache la respuesta anterior, escriba la nueva con la fecha y vuelva a entregar copias.",
      howPdf1:
        "Escriba en los campos de este PDF en la computadora o el teléfono. Guarde el archivo. Imprima copias para personas de confianza. La firma puede ir a mano después de imprimir.",
      how2: "No escriba contraseñas ni el número completo de una tarjeta. Anote el banco o el sitio, los últimos cuatro dígitos si hace falta distinguir cuentas, y quién puede abrir su administrador de contraseñas.",
      how3: "Puede dejar aquí los deseos del funeral sin pagarle ahora a una funeraria. El prepago es una decisión aparte.",
      contactH: "Mejor Vida Seguros — contacto",
      phone: "402-440-5438",
      sms: "SMS: 402-844-1199",
      email: "julie@mejorvidainsurance.com",
      web: "www.mejorvidainsurance.com",
      wa: "WhatsApp: 402-440-5438",
      npn: "Agente: Julie Braunsroth · NPN #21695431",
      s1: "1. Datos para el acta de defunción",
      s1p: "El estado pide estos datos para el certificado. Téngalos juntos para no buscarlos con prisa.",
      s2: "2. Familia",
      s3: "3. Servicio militar",
      s4: "4. A quién llamar primero",
      s5: "5. Quién decide (albacea, poderes, profesionales)",
      s5p: "El albacea y los poderes se firman en documentos legales aparte. Aquí solo anota los nombres para que la familia sepa a quién buscar.",
      s6: "6. Cómo se puede pagar el funeral",
      s7: "7. Qué quiero para mi cuerpo y el servicio",
      s8: "8. Ropa, flores, música y lecturas",
      s9: "9. Portadores y transporte",
      s10: "10. Notas para el obituario",
      s11: "11. Dónde están los papeles",
      s12: "12. Seguros",
      s13: "13. Bancos, deudas y bienes (sin claves)",
      s14: "14. Cuentas en internet (sin contraseñas)",
      s15: "15. Palabras para mi familia",
      s16: "16. Firma",
      signP:
        "Firmo este cuaderno para que mi familia sepa que estas son mis preferencias. No sustituye un testamento ni un poder de mi estado. Pido que las honren en la medida que la ley y las circunstancias lo permitan.",
      disc:
        "Educativo. No es asesoría legal, fiscal ni financiera. Mejor Vida Insurance LLC es una agencia independiente. Las cotizaciones en el sitio web son estimaciones.",
      yes: "Sí",
      no: "No",
    };
  }
  return {
    title: "Funeral wishes and papers workbook | Mejor Vida Insurance",
    docTitle: "Funeral wishes and papers workbook",
    agency: "Mejor Vida Insurance",
    legalName: "Mejor Vida Insurance LLC",
    kicker: "A free gift for your family",
    intro:
      "Use this workbook to write, by hand, what your family will need when you die — and, if it comes to that, if you cannot make decisions for yourself.",
    intro2:
      "It is not a will, a power of attorney, or a contract with a funeral home. Print it, fill it in, and give copies to people you trust. Tell them where the original is kept.",
    introPdf:
      "Use this workbook to record what your family will need when you die — and, if it comes to that, if you cannot make decisions for yourself.",
    intro2Pdf:
      "It is not a will, a power of attorney, or a contract with a funeral home. Type in the fields, save the file, and give copies to people you trust. Tell them where the original is kept.",
    howH: "How to use it",
    how1: "Fill it in with a pen. If you change your mind later, cross out the old answer, write the new one with the date, and give out fresh copies.",
    howPdf1:
      "Type your answers in the fields on a computer or phone. Save the file. Print copies for people you trust. You can sign in ink after you print.",
    how2: "Do not write passwords or full credit-card numbers. Name the bank or website, the last four digits if you need to tell accounts apart, and who can open your password manager.",
    how3: "You can record funeral wishes here without paying a funeral home now. Prepaying is a separate decision.",
    contactH: "Mejor Vida Insurance — contact",
    phone: "402-440-5438",
    sms: "SMS: 402-844-1199",
    email: "julie@mejorvidainsurance.com",
    web: "www.mejorvidainsurance.com",
    wa: "WhatsApp: 402-440-5438",
    npn: "Agent: Julie Braunsroth · NPN #21695431",
    s1: "1. Facts for the death certificate",
    s1p: "The state asks for these facts on the certificate. Keep them together so no one is hunting under pressure.",
    s2: "2. Family",
    s3: "3. Military service",
    s4: "4. Whom to call first",
    s5: "5. Who decides (executor, powers, professionals)",
    s5p: "The executor and powers of attorney are signed on separate legal forms. Here you only record names so the family knows whom to find.",
    s6: "6. How the funeral can be paid",
    s7: "7. What I want for my body and the service",
    s8: "8. Clothing, flowers, music, and readings",
    s9: "9. Pallbearers and transportation",
    s10: "10. Notes for the obituary",
    s11: "11. Where the papers live",
    s12: "12. Insurance",
    s13: "13. Banks, debts, and property (no passwords)",
    s14: "14. Online accounts (no passwords)",
    s15: "15. Words for my family",
    s16: "16. Signature",
    signP:
      "I sign this workbook so my family knows these are my preferences. It does not replace a will or a power of attorney in my state. I ask that they honor it as far as the law and the circumstances allow.",
    disc:
      "Educational only. Not legal, tax, or financial advice. Mejor Vida Insurance LLC is an independent agency. Quotes on the website are estimates.",
    yes: "Yes",
    no: "No",
  };
}

function section(id, title, inner) {
  return `<section class="wb-sec" id="${id}"><h2>${esc(title)}</h2>${inner}</section>`;
}

function bodyHtml(lang) {
  const t = copy(lang);
  const isEs = lang === "es";
  const L = (es, en) => (isEs ? es : en);

  const cover = `
<header class="wb-cover">
<p class="wb-kicker">${esc(t.kicker)}</p>
<h1>${esc(t.docTitle)}</h1>
<p class="wb-intro">${esc(t.intro)}</p>
<p class="wb-intro">${esc(t.intro2)}</p>
</header>
<section class="wb-sec">
<h2>${esc(t.howH)}</h2>
<ul class="wb-bullets">
<li>${esc(t.how1)}</li>
<li>${esc(t.how2)}</li>
<li>${esc(t.how3)}</li>
</ul>
</section>`;

  const s1 = section(
    "s1",
    t.s1,
    `<p class="wb-p">${esc(t.s1p)}</p>` +
      pairGrid([
        [L("Nombre de pila", "First name"), L("Segundo nombre", "Middle name")],
        [L("Apellidos", "Last name"), L("Sufijo (Jr., III)", "Suffix (Jr., III)")],
        [L("Otros nombres o apodo", "Other names or nickname"), L("Nombre de soltera", "Maiden name")],
        [L("Nombre de soltera de la madre", "Mother’s maiden name"), L("Nombre del padre", "Father’s name")],
        [L("Fecha de nacimiento", "Date of birth"), L("Ciudad y estado de nacimiento", "City and state of birth")],
        [L("Últimos cuatro del Seguro Social (opcional)", "Last four of SSN (optional)"), L("Estado civil", "Marital status")],
        [L("Origen étnico o cultural (si el acta lo pide)", "Ethnic or cultural heritage (if the certificate asks)"), L("Nivel de estudios / escuela", "Education / school")],
      ]) +
      field(L("Cónyuge o pareja (nombre)", "Spouse or partner (name)")) +
      field(L("Fecha y lugar de matrimonio o unión", "Date and place of marriage or union"))
  );

  const s2 = section(
    "s2",
    t.s2,
    field(L("Hijos (nombre, fecha de nacimiento, ciudad)", "Children (name, birth date, city)"), 4) +
      field(L("Nietos u otros dependientes", "Grandchildren or other dependents"), 2) +
      field(L("Hermanos (nombre)", "Siblings (name)"), 2)
  );

  const s3 = section(
    "s3",
    t.s3,
    checks([L("Serví en las fuerzas armadas", "I served in the armed forces"), L("No serví", "I did not serve")]) +
      pairGrid([
        [L("Rama y país", "Branch and country"), L("Rango al licenciarse", "Rank at discharge")],
        [L("Número de serie / servicio", "Service number"), L("Fechas de ingreso y baja", "Dates of entry and discharge")],
        [L("Conflicto o teatro, si aplica", "Conflict or theater, if any"), L("Dónde está el DD-214 u otra baja", "Where the DD-214 or discharge paper is")],
        [L("¿Cementerio nacional? (confirmar en VA.gov)", "National cemetery? (confirm on VA.gov)"), L("Honores militares o de logia en el servicio", "Military or lodge honors at the service")],
      ])
  );

  const s4 = section(
    "s4",
    t.s4,
    field(L("Primera persona a notificar — nombre y teléfono", "First person to notify — name and phone"), 2) +
      field(L("Dirección", "Address"), 2) +
      field(L("Otra persona de contacto — nombre y teléfono", "Additional contact — name and phone"), 2) +
      field(L("Otras personas a avisar (nombre y teléfono)", "Others to notify (name and phone)"), 4)
  );

  const s5 = section(
    "s5",
    t.s5,
    `<p class="wb-p">${esc(t.s5p)}</p>` +
      pairGrid([
        [L("Albacea / executor — nombre y teléfono", "Executor — name and phone"), L("Co-albacea", "Co-executor")],
        [L("Poder sobre el dinero — nombre", "Financial power of attorney — name"), L("Poder de salud — nombre", "Health-care power of attorney — name")],
        [L("Abogado — nombre y teléfono", "Attorney — name and phone"), L("Contador — nombre y teléfono", "Accountant — name and phone")],
        [L("Médico de cabecera", "Primary doctor"), L("Especialista", "Specialist")],
        [L("Arrendador (si aplica)", "Landlord if any"), L("Empleador (si aplica)", "Employer if any")],
      ])
  );

  const s6 = section(
    "s6",
    t.s6,
    `<p class="wb-p">${esc(
      L(
        "Marque las vías que ya existen. No hace falta usarlas todas.",
        "Check the paths that already exist. You do not need all of them."
      )
    )}</p>` +
      checks([
        L("Ahorros o cuenta pagadera al fallecimiento", "Savings or payable-on-death account"),
        L("Póliza de vida / gastos finales", "Life / final expense policy"),
        L("Contrato de funeral prepagado", "Prepaid funeral contract"),
        L("El caudal hereditario / estate", "The estate"),
        L("Otra (describa abajo)", "Other (describe below)"),
      ]) +
      field(L("Compañía o funeraria, número de plan o póliza, teléfono", "Company or funeral home, plan or policy number, phone"), 2) +
      field(L("Cementerio y número de lote, si ya hay", "Cemetery and plot number, if already owned"), 2) +
      field(
        L(
          "Si no hay prepago, quién debe comparar funerarias",
          "If there is no prepaid plan, who should compare funeral homes"
        )
      )
  );

  const s7 = section(
    "s7",
    t.s7,
    `<p class="wb-p">${esc(
      L(
        "Basta con lo esencial. Los detalles de marca son opcionales.",
        "The essentials are enough. Brand details are optional."
      )
    )}</p>` +
      checks([
        L("Funeral tradicional y luego entierro o cremación", "Traditional funeral, then burial or cremation"),
        L("Entierro o cremación directa, con memorial después", "Direct burial or cremation, memorial later"),
        L("Entierro o cremación directa, sin memorial", "Direct burial or cremation, no memorial"),
        L("Donación del cuerpo o de órganos (describa)", "Body or organ donation (describe)"),
        L("Otro", "Other"),
      ]) +
      checks([
        L("Entierro en tierra", "Ground burial"),
        L("Mausoleo o cripta", "Mausoleum or crypt"),
        L("Cremación — urna en casa, nicho, columbario o esparcir (revise la ley local)", "Cremation — urn at home, niche, columbarium, or scattering (check local law)"),
        L("Cementerio nacional (elegibilidad VA)", "National cemetery (VA eligibility)"),
      ]) +
      field(L("Funeraria o lugar de culto preferido", "Preferred funeral home or place of worship"), 2) +
      field(L("Velatorio: sí/no, ataúd abierto o cerrado, lugar", "Visitation: yes/no, open or closed casket, place"), 2) +
      field(L("Oficiante (primera y segunda opción)", "Officiant (first and second choice)"), 2) +
      field(L("Fotos, video u otros recuerdos en el velatorio", "Photos, video, or other displays at the visitation"), 2) +
      field(
        L(
          "Si ya eligió ataúd, urna, lápida o libretas, anote lo que la familia debe pedir (opcional)",
          "If you already chose a casket, urn, marker, or register book, write what the family should request (optional)"
        ),
        3
      )
  );

  const s8 = section(
    "s8",
    t.s8,
    field(L("Ropa y joyas (si se quitan, a quién devolverlas)", "Clothing and jewelry (if removed, whom to return them to)"), 2) +
      field(L("Lentes: ¿quedan o se devuelven?", "Glasses: remain or return to family?")) +
      checks([
        L("Con flores", "With flowers"),
        L("Sin flores — donativos a:", "No flowers — donations to:"),
      ]) +
      field(L("Organizaciones para donativos en lugar de flores", "Organizations for gifts in lieu of flowers"), 2) +
      field(L("Música, himnos o que no haya música", "Music, hymns, or no music"), 3) +
      field(L("Lecturas, poemas o quién da el elogio", "Readings, poems, or who gives the eulogy"), 3)
  );

  const s9 = section(
    "s9",
    t.s9,
    field(L("Portadores del féretro (hasta seis nombres)", "Pallbearers (up to six names)"), 3) +
      field(L("Transporte de la familia u otras instrucciones", "Family transportation or other instructions"), 2)
  );

  const s10 = section(
    "s10",
    t.s10,
    field(L("Trabajo, estudios, iglesia, clubes, logros", "Work, school, church, clubs, achievements"), 4) +
      field(L("Precedido en la muerte por / le sobreviven", "Preceded in death by / survived by"), 3) +
      field(L("Periódicos o sitios donde publicar", "Newspapers or sites to publish"), 2) +
      checks([L("Incluir foto: sí", "Include a photo: yes"), L("Incluir foto: no", "Include a photo: no")])
  );

  const s11 = section(
    "s11",
    t.s11,
    `<p class="wb-p">${esc(
      L(
        "Escriba la ubicación, no copie el documento entero.",
        "Write the location; do not copy the whole document."
      )
    )}</p>` +
      pairGrid([
        [L("Testamento", "Will"), L("Directiva / poder de salud", "Advance directive / health POA")],
        [L("Poder sobre el dinero", "Financial power of attorney"), L("Pólizas de seguro", "Insurance policies")],
        [L("Acta de nacimiento", "Birth certificate"), L("Acta de matrimonio / divorcio", "Marriage / divorce papers")],
        [L("Escrituras / títulos de auto", "Deeds / vehicle titles"), L("Baja militar", "Military discharge")],
        [L("Pasaporte / ciudadanía", "Passport / citizenship"), L("Tarjeta del Seguro Social (ubicación)", "Social Security card (location)")],
        [L("Fideicomiso, si hay", "Trust documents, if any"), L("Adopción / diplomas", "Adoption papers / diplomas")],
        [L("Llave de caja de seguridad (quién la tiene)", "Safe-deposit key (who holds it)"), L("Licencia de conducir (ubicación, no el número)", "Driver’s license (location, not the number)")],
      ]) +
      checks([L("Tengo testamento", "I have a will"), L("No tengo testamento todavía", "I do not have a will yet")]) +
      field(L("Fecha del testamento y quién es el albacea", "Date of will and who the executor is"), 2)
  );

  const s12 = section(
    "s12",
    t.s12,
    `<p class="wb-p">${esc(
      L(
        "Compañía, tipo (temporal, entera, grupo), número de póliza, beneficiario, teléfono. No el usuario del portal.",
        "Company, type (term, whole life, group), policy number, beneficiary, phone. Not the portal username."
      )
    )}</p>` +
      field(L("Póliza 1", "Policy 1"), 3) +
      field(L("Póliza 2", "Policy 2"), 3)
  );

  const s13 = section(
    "s13",
    t.s13,
    field(L("Bancos (nombre, sucursal, tipo de cuenta, últimos cuatro)", "Banks (name, branch, account type, last four)"), 3) +
      field(L("Retiro / pensión / 401(k) — compañía y quién administra", "Retirement / pension / 401(k) — company and administrator"), 2) +
      field(L("Inversiones / corredor (compañía y últimos cuatro, sin claves)", "Brokerage / investments (company and last four, no passwords)"), 2) +
      field(L("Inmuebles y vehículos (descripción y dónde está el título)", "Real estate and vehicles (description and where the title is)"), 3) +
      field(L("Hipoteca u otros préstamos (prestamista y teléfono)", "Mortgage or other loans (lender and phone)"), 2)
  );

  const s14 = section(
    "s14",
    t.s14,
    field(
      L(
        "Sitio, nombre de usuario, y DÓNDE está la contraseña (no la escriba)",
        "Site, username, and WHERE the password is stored (do not write it)"
      ),
      5
    )
  );

  const s15 = section("s15", t.s15, field(L("Mensaje", "Message"), 8));

  const s16 = section(
    "s16",
    t.s16,
    `<p class="wb-p">${esc(t.signP)}</p>` +
      field(L("Nombre en letra de molde", "Printed name")) +
      pairGrid([
        [L("Firma", "Signature"), L("Fecha", "Date")],
      ]) +
      `<p class="wb-note">${esc(
        L(
          "Notario opcional: no convierte este cuaderno en testamento.",
          "Optional notary: this does not turn the workbook into a will."
        )
      )}</p>` +
      `<div class="wb-notary">${esc(L("Espacio para sello notarial (opcional)", "Notary stamp space (optional)"))}</div>`
  );

  return cover + s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8 + s9 + s10 + s11 + s12 + s13 + s14 + s15 + s16;
}

function documentHtml(lang) {
  const t = copy(lang);
  const isEs = lang === "es";
  const logo = isEs ? "../img/opt/logo-spanish2-workbook.png" : "../img/opt/logo-english2-workbook.png";
  const logoW = isEs ? 373 : 357;
  const inner = bodyHtml(lang);
  return `<!DOCTYPE html>
<html lang="${isEs ? "es-US" : "en-US"}">
<head>
<meta charset="utf-8"/>
<title>${esc(t.title)}</title>
<meta name="robots" content="noindex"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
@page { size: letter; margin: 0.55in 0.6in 0.65in; }
html, body { margin: 0; padding: 0; background: #fff; color: #1a365d; font-family: Georgia, "Times New Roman", serif; }
.wb { max-width: 8.5in; margin: 0 auto; padding: 0.12in 0.4in 0.5in; }
.wb-brand { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; border-bottom: 6px solid #1a365d; padding-bottom: 2px; margin-bottom: 0; }
.wb-brand img { height: 120px; width: auto; max-width: 4.6in; display: block; }
.wb-brand-meta { text-align: right; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; line-height: 1.4; flex: 0 0 auto; padding-bottom: 6px; }
.wb-gold { height: 5px; background: #c9a227; margin: 0 0 14px; }
.wb-kicker { font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a227; margin: 0 0 6px; font-weight: 700; }
h1 { font-size: 26px; line-height: 1.2; margin: 0 0 12px; color: #1a365d; }
.wb-intro { font-size: 14.5px; line-height: 1.5; color: #334155; margin: 0 0 12px; }
.wb-sec { break-inside: avoid; margin: 0 0 18px; padding-top: 4px; }
.wb-sec h2 { font-size: 16px; margin: 0 0 8px; color: #1a365d; border-left: 4px solid #c9a227; padding-left: 8px; }
.wb-p, .wb-note { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #334155; margin: 0 0 8px; line-height: 1.4; }
.wb-bullets { margin: 0 0 8px; padding-left: 1.15rem; font-family: Arial, Helvetica, sans-serif; font-size: 12.5px; line-height: 1.45; color: #334155; }
.wb-field { margin: 0 0 8px; }
.wb-label { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; font-weight: 700; margin: 0 0 3px; color: #1a365d; }
.wb-line { border-bottom: 1px solid #94a3b8; height: 22px; }
.wb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.wb-checks { list-style: none; margin: 0 0 10px; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 12.5px; }
.wb-checks li { margin: 0 0 5px; display: flex; gap: 8px; align-items: flex-start; }
.wb-box { flex: 0 0 12px; width: 12px; height: 12px; border: 1px solid #1a365d; margin-top: 2px; }
.wb-notary { min-height: 72px; border: 1px dashed #94a3b8; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #64748b; }
.wb-foot { margin-top: 18px; padding-top: 10px; border-top: 2px solid #1a365d; font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #64748b; line-height: 1.4; }
@media print {
  .wb { padding: 0; }
  a { color: inherit; text-decoration: none; }
}
</style>
</head>
<body>
<div class="wb">
<div class="wb-brand">
<img src="${logo}" alt="${esc(t.agency)}" width="${logoW}" height="120"/>
<div class="wb-brand-meta">
<strong>${esc(t.legalName)}</strong><br/>
${esc(t.phone)}<br/>
${esc(t.web)}
</div>
</div>
<div class="wb-gold"></div>
${inner}
<footer class="wb-foot">${esc(t.disc)} ${esc(t.phone)} · ${esc(t.email)}</footer>
</div>
</body>
</html>
`;
}

function writeWorkbooks() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const esPath = path.join(OUT_DIR, "guia-planificacion-funeral-mejor-vida.html");
  const enPath = path.join(OUT_DIR, "mvi-funeral-estate-planning-workbook.html");
  fs.writeFileSync(esPath, documentHtml("es"), "utf8");
  fs.writeFileSync(enPath, documentHtml("en"), "utf8");
  return { esPath, enPath };
}

if (require.main === module) {
  const out = writeWorkbooks();
  console.log("Wrote", out.esPath);
  console.log("Wrote", out.enPath);
}

module.exports = { writeWorkbooks, documentHtml, copy };
