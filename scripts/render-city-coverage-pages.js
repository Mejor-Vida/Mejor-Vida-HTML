#!/usr/bin/env node
/**
 * Bilingual city final-expense pages (Nebraska: Omaha, Lincoln).
 * Usage: node scripts/render-city-coverage-pages.js
 */
const fs = require("fs");
const path = require("path");
const { guideMain } = require("./lincoln-guide-html");

const ROOT = path.join(__dirname, "..");
const HEADER_ES = path.join(ROOT, "includes/site-header-inner.html");
const HEADER_EN = path.join(ROOT, "includes/en-site-header.html");
const FOOTER_ES = path.join(ROOT, "includes/site-footer-inner.html");
const FOOTER_EN = path.join(ROOT, "includes/en-site-footer.html");

const NPN = "21695431";
const CSS_VER = "20260917-lincoln-calc2";

const LICENSE = {
  NE: {
    typeEs: "Productora residente",
    typeEn: "Resident producer",
    number: "21695431",
    code: "NE",
  },
};

const CITIES = [
  {
    slug: "omaha",
    nameEs: "Omaha",
    nameEn: "Omaha",
    stateSlug: "nebraska",
    stateNameEs: "Nebraska",
    stateNameEn: "Nebraska",
    stateCode: "NE",
    heroFile: "omaha-bob-kerrey-bridge",
    heroCaptionEs: "Puente peatonal Bob Kerrey, Omaha",
    heroCaptionEn: "Bob Kerrey Pedestrian Bridge, Omaha",
    heroClass: "",
    heroW: 1024,
    heroH: 591,
    heroVer: "bridge-v1",
    titleEs: "Seguro de gastos finales en Omaha | Mejor Vida Seguros",
    titleEn: "Final Expense Insurance in Omaha | Mejor Vida Insurance",
    descEs:
      "Mejor Vida Seguros compara seguro de gastos finales en Omaha. Precios de funerarias locales, primas ilustrativas y licencia de Nebraska (NPN #21695431).",
    descEn:
      "Mejor Vida Insurance compares final expense coverage in Omaha. Local funeral-home prices, illustrative premiums, and Nebraska licensing (NPN #21695431).",
    bulletsEs: [
      `Cremación directa publicada en Omaha desde <strong>$995</strong> (Chapel of Memories). Un entierro con velatorio en la región ronda <strong>$8,755</strong> (NFDA 2023).`,
      `Mejor Vida Seguros compara compañías designadas según su edad, salud y presupuesto.`,
      `Licenciados para vender seguro de vida en Nebraska. NPN #${NPN}.`,
    ],
    bulletsEn: [
      `Direct cremation in Omaha is published from <strong>$995</strong> (Chapel of Memories). A funeral with viewing in the region is about <strong>$8,755</strong> (NFDA 2023).`,
      `Mejor Vida Insurance compares appointed companies based on your age, health, and budget.`,
      `Licensed to sell life insurance in Nebraska. NPN #${NPN}.`,
    ],
    funeralIntroEs:
      "No publicamos un “promedio de Omaha” inventado. Estas cifras salen de funerarias que publican su lista o de tableros que citan esas listas. Pida siempre la <strong>lista general de precios (GPL)</strong> a la funeraria. El lote, la bóveda y la lápida casi nunca van incluidos.",
    funeralIntroEn:
      "We do not invent an “average funeral in Omaha.” These figures come from funeral homes that publish a list, or from boards that cite those lists. Always ask the home for its <strong>General Price List (GPL)</strong>. The cemetery plot, vault, and marker are almost never included.",
    funeralRowsEs: [
      {
        source:
          '<a href="https://chapelofmemories.com/" rel="noopener" target="_blank">Chapel of Memories</a><br/><span class="small text-body-secondary">4712 S 82nd St, Omaha · 402-551-1011</span>',
        price: "Cremación directa desde <strong>$995</strong>",
        notes:
          "Revisado 16 sep. 2026. Atienden Omaha y el condado Douglas. No es un precio de Mejor Vida Seguros.",
      },
      {
        source:
          '<a href="https://www.funeralocity.com/search/ne/omaha/" rel="noopener" target="_blank">Funeralocity · Omaha</a>',
        price: "Cremación directa listada cerca de <strong>$995–$1,760</strong>",
        notes: "Tablero de varias funerarias, no una mediana. Los precios cambian; pida la GPL.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Entierro con velatorio <strong>$8,755</strong> · Cremación con velatorio <strong>$6,713</strong>",
        notes: "Mediana regional (Nebraska comparte esta región). El cementerio es aparte.",
      },
    ],
    funeralRowsEn: [
      {
        source:
          '<a href="https://chapelofmemories.com/" rel="noopener" target="_blank">Chapel of Memories</a><br/><span class="small text-body-secondary">4712 S 82nd St, Omaha · 402-551-1011</span>',
        price: "Direct cremation from <strong>$995</strong>",
        notes: "Checked 16 Sep 2026. Serves Omaha and Douglas County. Not a Mejor Vida Insurance price.",
      },
      {
        source:
          '<a href="https://www.funeralocity.com/search/ne/omaha/" rel="noopener" target="_blank">Funeralocity · Omaha</a>',
        price: "Direct cremation listed around <strong>$995–$1,760</strong>",
        notes: "A board of several homes, not a median. Prices change; ask for the GPL.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Burial with viewing <strong>$8,755</strong> · Cremation with viewing <strong>$6,713</strong>",
        notes: "Regional median (Nebraska shares this region). Cemetery is extra.",
      },
    ],
    cemeteries: null,
    coverageNoteEs:
      "Para una cremación sencilla en Omaha, $5,000 a $10,000 suele alcanzar. Un entierro tradicional, con lote y marcador, suele pedir $10,000 a $20,000. Mejor Vida Seguros compara compañías designadas; no hay garantía de emisión ni de precio. El detalle de cada aseguradora está en la <a href=\"../nebraska.html#aseguradoras\">guía de Nebraska</a>.",
    coverageNoteEn:
      "For a simple Omaha cremation, $5,000 to $10,000 is often enough. A traditional burial, with plot and marker, often needs $10,000 to $20,000. Mejor Vida Insurance compares appointed companies; there is no guarantee of issue or price. Carrier detail lives on the <a href=\"../nebraska.html#carriers\">Nebraska guide</a>.",
    metroEs: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
    metroEn: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
    metroTitleEs: "Área que atendemos en el metro de Omaha",
    metroTitleEn: "Omaha metro we serve",
    metroNoteEs:
      'Cotizamos por teléfono, WhatsApp y en línea a residentes de Nebraska en estas comunidades. No hay oficina de atención al público. Lincoln tiene <a href="lincoln.html">su propia guía</a>.',
    metroNoteEn:
      'We quote by phone, WhatsApp, and online for Nebraska residents in these communities. There is no public walk-in office. Lincoln has <a href="lincoln.html">its own guide</a>.',
    faqCremationEs: {
      q: "¿Cuánta cobertura suele alcanzar para una cremación en Omaha?",
      a: "Con cremación directa publicada desde $995, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más, a menudo $10,000 a $20,000, porque el lote, la bóveda y la lápida no van en el paquete de la funeraria.",
    },
    faqCremationEn: {
      q: "How much coverage is usually enough for cremation in Omaha?",
      a: "With direct cremation published from $995, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more, commonly $10,000 to $20,000, because the plot, vault, and marker are not in the funeral-home package.",
    },
    faqPrepaidEs: {
      q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
      a: "El prepagado se ata a una funeraria y puede fijar el precio del servicio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Chapel of Memories, en otra funeraria, o en otros gastos finales.",
    },
    faqPrepaidEn: {
      q: "What is the difference between a prepaid funeral and this insurance?",
      a: "A prepaid plan is tied to one funeral home and may lock that home’s service price. Final expense insurance pays cash to your beneficiary. They can use it at Chapel of Memories, another home, or for other final bills.",
    },
  },
  {
    slug: "lincoln",
    layout: "guide",
    hideBasedIn: true,
    nameEs: "Lincoln",
    nameEn: "Lincoln",
    stateSlug: "nebraska",
    stateNameEs: "Nebraska",
    stateNameEn: "Nebraska",
    stateCode: "NE",
    heroFile: "lincoln-state-capitol",
    heroCaptionEs: "Capitolio de Nebraska, Lincoln",
    heroCaptionEn: "Nebraska State Capitol, Lincoln",
    heroClass: "sc-hero--lincoln",
    heroW: 1024,
    heroH: 714,
    heroVer: "capitol-v1",
    titleEs: "Seguro de gastos finales en Lincoln | Mejor Vida Seguros",
    titleEn: "Final Expense Insurance in Lincoln | Mejor Vida Insurance",
    descEs:
      "Qué es el seguro de gastos finales en Lincoln, listas de funerarias lado a lado, lotes y reventa, y una calculadora de cobertura. Licencia de Nebraska, NPN #21695431.",
    descEn:
      "What final expense insurance is in Lincoln, side-by-side funeral-home lists, plots and resale, and a coverage calculator. Nebraska license, NPN #21695431.",
    ctaSubEs:
      "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
    ctaSubEn:
      "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
    bulletsEs: [
      `Qué es el seguro de gastos finales y cómo se usa para el funeral.`,
      `Una tabla de paquetes de funerarias en Lincoln, del más económico al más caro.`,
      `Por qué el lote no entra en la lista de precios, y anuncios de reventa más baratos.`,
      `Una calculadora para estimar el funeral, la cobertura y la prima mensual.`,
    ],
    bulletsEn: [
      `What final expense insurance is, and how it pays for a funeral.`,
      `A Lincoln funeral-home package table, from the least expensive to the most expensive.`,
      `Why the burial plot is not on the funeral price list, plus lower-cost resale ads.`,
      `A calculator for funeral cost, coverage, and a monthly premium.`,
    ],
    funeralIntroEs:
      "No publicamos un “promedio de Lincoln” inventado. Estas cifras salen de listas generales de precios (GPL) y de paquetes publicados. Pida siempre la GPL a la funeraria. El lote, la bóveda y la lápida casi nunca van incluidos.",
    funeralIntroEn:
      "We do not invent an “average funeral in Lincoln.” These figures come from published General Price Lists (GPL) and packages. Always ask the home for its GPL. The cemetery plot, vault, and marker are almost never included.",
    funeralRowsEs: [
      {
        source:
          '<a href="https://www.lincolnfh.com/" rel="noopener" target="_blank">Lincoln Memorial Funeral Home</a><br/><span class="small text-body-secondary">6800 S 14th St, Lincoln · 402-423-1515</span>',
        price:
          "Cremación directa desde <strong>$3,910</strong>; entierro inmediato desde <strong>$4,920</strong>; paquete Tribute <strong>$11,935</strong>",
        notes:
          "GPL y paquetes Dignity Memorial, vigentes 6 ago. 2026. Tribute $11,935 sin bóveda; cremación Tribute $5,795. El lote no va incluido. No es un precio de Mejor Vida Seguros.",
      },
      {
        source:
          '<a href="https://lincolnalternativefuneral.com/our-services/" rel="noopener" target="_blank">Alternative Funeral and Cremation Services</a><br/><span class="small text-body-secondary">245 N 27th St, Suite B, Lincoln · 402-429-1450</span>',
        price:
          "Cremación directa sin servicio <strong>$1,595</strong>; con memorial $2,595; entierro inmediato $1,805",
        notes:
          "Revisado 17 sep. 2026 en su propia página. Atienden Lincoln. No es un precio de Mejor Vida Seguros.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Entierro con velatorio <strong>$8,755</strong> · Cremación con velatorio <strong>$6,713</strong>",
        notes: "Mediana regional (Nebraska comparte esta región). El cementerio es aparte.",
      },
    ],
    funeralRowsEn: [
      {
        source:
          '<a href="https://www.lincolnfh.com/" rel="noopener" target="_blank">Lincoln Memorial Funeral Home</a><br/><span class="small text-body-secondary">6800 S 14th St, Lincoln · 402-423-1515</span>',
        price:
          "Direct cremation from <strong>$3,910</strong>; immediate burial from <strong>$4,920</strong>; Tribute package <strong>$11,935</strong>",
        notes:
          "Dignity Memorial GPL and packages, effective 6 Aug 2026. Tribute $11,935 without a vault; Tribute cremation $5,795. Plot not included. Not a Mejor Vida Insurance price.",
      },
      {
        source:
          '<a href="https://lincolnalternativefuneral.com/our-services/" rel="noopener" target="_blank">Alternative Funeral and Cremation Services</a><br/><span class="small text-body-secondary">245 N 27th St, Suite B, Lincoln · 402-429-1450</span>',
        price:
          "Direct cremation without services <strong>$1,595</strong>; with memorial $2,595; immediate burial $1,805",
        notes:
          "Checked 17 Sep 2026 on their own site. Serves Lincoln. Not a Mejor Vida Insurance price.",
      },
      {
        source: "NFDA 2023 · West North Central",
        price:
          "Burial with viewing <strong>$8,755</strong> · Cremation with viewing <strong>$6,713</strong>",
        notes: "Regional median (Nebraska shares this region). Cemetery is extra.",
      },
    ],
    cemeteries: [
      {
        sourceEs:
          '<a href="https://www.wyuka.com/" rel="noopener" target="_blank">Wyuka Funeral Home &amp; Cemetery</a><br/><span class="small text-body-secondary">3600 O St, Lincoln · 402-474-3600</span>',
        sourceEn:
          '<a href="https://www.wyuka.com/" rel="noopener" target="_blank">Wyuka Funeral Home &amp; Cemetery</a><br/><span class="small text-body-secondary">3600 O St, Lincoln · 402-474-3600</span>',
        priceEs: "Venden lotes nuevos en la oficina del cementerio",
        priceEn: "Sells new plots at the cemetery office",
        notesEs:
          "No publican un precio de lote en su web. Llame para el precio actual, apertura y cierre.",
        notesEn:
          "They do not publish a plot price on their site. Call for current plot, opening, and closing prices.",
      },
      {
        sourceEs:
          '<a href="https://www.lincolnfh.com/" rel="noopener" target="_blank">Lincoln Memorial Park</a><br/><span class="small text-body-secondary">6800 S 14th St, Lincoln · 402-423-1515</span>',
        sourceEn:
          '<a href="https://www.lincolnfh.com/" rel="noopener" target="_blank">Lincoln Memorial Park</a><br/><span class="small text-body-secondary">6800 S 14th St, Lincoln · 402-423-1515</span>',
        priceEs: "Lotes a la venta; no están en la GPL de la funeraria",
        priceEn: "Plots for sale; not on the funeral-home GPL",
        notesEs:
          "Misma dirección que Lincoln Memorial Funeral Home. La GPL lista bóvedas de <strong>$1,495–$5,095</strong>, no el lote. Confirme el espacio, apertura y cierre con la oficina.",
        notesEn:
          "Same address as Lincoln Memorial Funeral Home. The GPL lists vaults at <strong>$1,495–$5,095</strong>, not the plot. Confirm space, opening, and closing with the office.",
      },
      {
        sourceEs:
          '<a href="https://www.calvarycatholic.com/pre-planning/" rel="noopener" target="_blank">Calvary Catholic Cemetery and Mausoleum</a><br/><span class="small text-body-secondary">3880 L St, Lincoln · 402-476-8787</span>',
        sourceEn:
          '<a href="https://www.calvarycatholic.com/pre-planning/" rel="noopener" target="_blank">Calvary Catholic Cemetery and Mausoleum</a><br/><span class="small text-body-secondary">3880 L St, Lincoln · 402-476-8787</span>',
        priceEs: "Venden lotes, nichos y mausoleo; pida mapa y precios",
        priceEn: "Sells plots, niches, and mausoleum space; ask for a map and prices",
        notesEs:
          "Cementerio de la diócesis. Hay planes de pago para el espacio; apertura y cierre no entran en ese plan. No publican cifras en la web.",
        notesEn:
          "Diocesan cemetery. Payment plans are available for the space; opening and closing are not on that plan. They do not publish figures on the website.",
      },
    ],
    plotResaleIntroEs:
      "La <strong>lista general de precios de la funeraria no incluye el lote</strong>. Tampoco la lista de paquetes Dignity. Para un espacio nuevo hay que llamar a la oficina del cementerio (en Lincoln Memorial, el mismo número de la funeraria: 402-423-1515) y pedir la lista de precios del cementerio por escrito: lote, apertura y cierre, y marcador. Wyuka: 402-474-3600. Calvary: 402-476-8787.",
    plotResaleIntroEn:
      "The funeral home <strong>General Price List does not include the burial plot</strong>. Neither do the Dignity packages. For a new space, call the cemetery office (at Lincoln Memorial, the same number as the funeral home: 402-423-1515) and ask for a written cemetery price list: plot, opening and closing, and marker. Wyuka: 402-474-3600. Calvary: 402-476-8787.",
    plotResales: [
      {
        sourceEs:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004059" rel="noopener" target="_blank">Eturnal Rest · Sec. N, lote 463, espacio 3</a>',
        sourceEn:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004059" rel="noopener" target="_blank">Eturnal Rest · Sec. N, lot 463, space 3</a>',
        priceEs: "Pide <strong>$700</strong> (o mejor oferta)",
        priceEn: "Asking <strong>$700</strong> (or best offer)",
        notesEs: "Lincoln Memorial Park. Un espacio. El vendedor cita un avalúo de $2,975. Revise si sigue activo.",
        notesEn: "Lincoln Memorial Park. One space. The seller cites an appraisal of $2,975. Check that it is still listed.",
      },
      {
        sourceEs:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004051" rel="noopener" target="_blank">Eturnal Rest · Sec. U, lote 374, espacios 5 y 6</a>',
        sourceEn:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004051" rel="noopener" target="_blank">Eturnal Rest · Sec. U, lot 374, spaces 5 and 6</a>',
        priceEs: "Pide <strong>$1,795</strong> por los dos",
        priceEn: "Asking <strong>$1,795</strong> for both",
        notesEs: "Jardín Risen Christ. El vendedor cita lista del cementerio cerca de $2,600. No es la lista oficial.",
        notesEn: "Risen Christ Garden. The seller cites a cemetery list around $2,600. That is not the official list.",
      },
      {
        sourceEs:
          '<a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">Eturnal Rest · Sec. O, lote 147, espacio 6</a>',
        sourceEn:
          '<a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">Eturnal Rest · Sec. O, lot 147, space 6</a>',
        priceEs: "Pide <strong>$2,250</strong> + transferencia <strong>$495</strong>",
        priceEn: "Asking <strong>$2,250</strong> + <strong>$495</strong> transfer",
        notesEs: "El vendedor cita $4,495 de lista del cementerio. La transferencia se paga a la oficina.",
        notesEn: "The seller cites a $4,495 cemetery list price. The transfer is paid to the office.",
      },
      {
        sourceEs:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004057" rel="noopener" target="_blank">Eturnal Rest · Sec. P, lote 11, espacios 8 y 9</a>',
        sourceEn:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004057" rel="noopener" target="_blank">Eturnal Rest · Sec. P, lot 11, spaces 8 and 9</a>',
        priceEs: "Pide <strong>$4,000</strong> por los dos",
        priceEn: "Asking <strong>$4,000</strong> for both",
        notesEs: "El vendedor cita $4,495 por espacio en la lista del cementerio. Confirme con la oficina.",
        notesEn: "The seller cites $4,495 per space on the cemetery list. Confirm with the office.",
      },
      {
        sourceEs:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004048" rel="noopener" target="_blank">Eturnal Rest · Sec. P, cuatro espacios</a>',
        sourceEn:
          '<a href="https://eturnalrest.com/products/grave-for-sale-lincoln-memorial-cemetery-lincoln-cb-004048" rel="noopener" target="_blank">Eturnal Rest · Sec. P, four spaces</a>',
        priceEs: "Pide <strong>$10,000</strong> por cuatro",
        priceEn: "Asking <strong>$10,000</strong> for four",
        notesEs: "Lotes 41 y 157. El vendedor cita unos $20,000 de lista. Apertura y marcador aparte.",
        notesEn: "Lots 41 and 157. The seller cites about $20,000 list. Opening and marker extra.",
      },
    ],
    plotResaleFootEs:
      'Revisado 17 sep. 2026. En Eturnal Rest había <strong>11 anuncios</strong> en Lincoln Memorial Park, de <strong>$700 a $10,000</strong> (mediana de pedido $4,000). Son precios de particulares, no de Mejor Vida Seguros ni del cementerio. La oficina cobra una transferencia (anuncios citan $295–$495) y debe registrar la escritura. <a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">Ver todos los anuncios en Eturnal Rest</a> · <a href="https://www.gravesolutions.com/for-sale/cemetery-properties/nebraska" rel="noopener" target="_blank">Nebraska en Grave Solutions</a>. Un anuncio de Wyuka a $3,600 por dos lotes ya aparece como vendido.',
    plotResaleFootEn:
      'Checked 17 Sep 2026. Eturnal Rest had <strong>11 ads</strong> at Lincoln Memorial Park, from <strong>$700 to $10,000</strong> (median ask $4,000). These are private asking prices, not Mejor Vida Insurance or cemetery prices. The office charges a transfer (ads cite $295–$495) and must record the deed. <a href="https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/" rel="noopener" target="_blank">See all Eturnal Rest ads</a> · <a href="https://www.gravesolutions.com/for-sale/cemetery-properties/nebraska" rel="noopener" target="_blank">Nebraska on Grave Solutions</a>. A Wyuka ad at $3,600 for two plots is already marked sold.',
    coverageNoteEs:
      "Para una cremación sencilla en Lincoln, $5,000 a $10,000 suele alcanzar. Un entierro tradicional en Lincoln Memorial, con lote y marcador, suele pedir $15,000 a $25,000: el paquete Tribute empieza en $11,935 y el lote va aparte. Mejor Vida Seguros compara compañías designadas; no hay garantía de emisión ni de precio. El detalle de cada aseguradora está en la <a href=\"../nebraska.html#aseguradoras\">guía de Nebraska</a>.",
    coverageNoteEn:
      "For a simple Lincoln cremation, $5,000 to $10,000 is often enough. A traditional burial at Lincoln Memorial, with plot and marker, often needs $15,000 to $25,000: the Tribute package starts at $11,935 and the plot is extra. Mejor Vida Insurance compares appointed companies; there is no guarantee of issue or price. Carrier detail lives on the <a href=\"../nebraska.html#carriers\">Nebraska guide</a>.",
    metroEs: ["Lincoln", "Hickman", "Waverly", "Roca", "Bennet", "Malcolm"],
    metroEn: ["Lincoln", "Hickman", "Waverly", "Roca", "Bennet", "Malcolm"],
    metroTitleEs: "Área que atendemos en Lincoln",
    metroTitleEn: "Lincoln area we serve",
    metroNoteEs:
      'Cotizamos por teléfono, WhatsApp y en línea a residentes de Nebraska en estas comunidades del condado Lancaster. No hay oficina de atención al público. Omaha tiene <a href="omaha.html">su propia guía</a>.',
    metroNoteEn:
      'We quote by phone, WhatsApp, and online for Nebraska residents in these Lancaster County communities. There is no public walk-in office. Omaha has <a href="omaha.html">its own guide</a>.',
    faqCremationEs: {
      q: "¿Cuánta cobertura suele alcanzar para una cremación en Lincoln?",
      a: "Con cremación directa publicada desde $1,595 en Alternative y desde $3,910 en Lincoln Memorial, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional en Lincoln Memorial suele necesitar más: el paquete Tribute empieza en $11,935 y el lote, la bóveda y la lápida van aparte.",
    },
    faqCremationEn: {
      q: "How much coverage is usually enough for cremation in Lincoln?",
      a: "With direct cremation published from $1,595 at Alternative and from $3,910 at Lincoln Memorial, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial at Lincoln Memorial often needs more: the Tribute package starts at $11,935, and the plot, vault, and marker are extra.",
    },
    faqPrepaidEs: {
      q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
      a: "El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Lincoln Memorial, Alternative Funeral, Wyuka, Calvary, o en otros gastos finales.",
    },
    faqPrepaidEn: {
      q: "What is the difference between a prepaid funeral and this insurance?",
      a: "A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at Lincoln Memorial, Alternative Funeral, Wyuka, Calvary, or for other final bills.",
    },
    faqPlotEs: {
      q: "¿El funeral incluye el lote del cementerio?",
      a: "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en la oficina del cementerio (Lincoln Memorial Park: 402-423-1515). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
    },
    faqPlotEn: {
      q: "Does the funeral include the cemetery plot?",
      a: "No. The funeral home price is one bill. The plot is another. Ask the cemetery office for its list (Lincoln Memorial Park: 402-423-1515). Resale plots can cost less; the cemetery still has to change the deed.",
    },
    faqCalcEs: {
      q: "¿Cómo uso la calculadora de esta página?",
      a: "Está al final. Indique edad, sexo y si fuma. Elija el servicio y la funeraria. Verá un funeral estimado, una cobertura y una prima mensual de las tarifas de compañías designadas. Luego pida una cotización real.",
    },
    faqCalcEn: {
      q: "How do I use the calculator on this page?",
      a: "It is at the bottom. Enter age, sex, and whether you smoke. Pick the service and funeral home. You will see an estimated funeral, suggested coverage, and a monthly premium from appointed-company rate charts. Then get a real quote.",
    },
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadHeaderEs(city) {
  let html = fs.readFileSync(HEADER_ES, "utf8").replace(/__PREFIX__/g, "../../");
  html = html.replace(
    /href="\/en\/"(?=[^>]*mvi-lang-fab)/,
    `href="/en/states/${city.stateSlug}/${city.slug}.html"`
  );
  html = html.replace(
    /(<a href=")\/en\/(" class="mvi-lang-fab)/,
    `$1/en/states/${city.stateSlug}/${city.slug}.html$2`
  );
  return html;
}

function loadHeaderEn(city) {
  let html = fs.readFileSync(HEADER_EN, "utf8");
  html = html.replace(/((?:href|src|srcset)=")(\.\.\/)/g, "$1../../../");
  html = html.replace(
    /((?:href|src|srcset)=")(?!https?:|\/|#|\.\.|tel:|mailto:|sms:)([^"]+)/g,
    "$1../../$2"
  );
  html = html.replace(
    /(<a href=")[^"]+(" class="mvi-lang-fab)/,
    `$1/estados/${city.stateSlug}/${city.slug}.html$2`
  );
  return html;
}

function loadFooterEs() {
  return fs.readFileSync(FOOTER_ES, "utf8").replace(/__PREFIX__/g, "../../");
}

function loadFooterEn() {
  return fs
    .readFileSync(FOOTER_EN, "utf8")
    .replace(/__ASSET__/g, "../../../")
    .replace(/__PAGE__/g, "../../");
}

function licenseModal(lang) {
  const title = lang === "es" ? "Licencia" : "License";
  const close = lang === "es" ? "Cerrar" : "Close";
  return `<div id="mvi-lic-modal" class="mvi-lic-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="mvi-lic-modal-title">
  <div class="mvi-lic-modal">
    <div class="mvi-lic-modal-head">
      <h2 id="mvi-lic-modal-title">${title}</h2>
      <button type="button" class="mvi-lic-modal-close" id="mvi-lic-modal-close" aria-label="${close}">×</button>
    </div>
    <div class="mvi-lic-modal-body" id="mvi-lic-modal-body"></div>
    <div class="mvi-lic-modal-foot">
      <button type="button" class="btn btn-secondary" id="mvi-lic-modal-close-2">${close}</button>
    </div>
  </div>
</div>`;
}

function cityHero(lang, root, quoteHref, city) {
  const lic = LICENSE[city.stateCode];
  const title =
    lang === "es"
      ? `Seguro de gastos finales en ${city.nameEs}`
      : `Final Expense Insurance in ${city.nameEn}`;
  const bullets = lang === "es" ? city.bulletsEs : city.bulletsEn;
  const ctaLabel = lang === "es" ? "Cotización gratuita" : "Free quote";
  const ctaSub =
    (lang === "es" ? city.ctaSubEs : city.ctaSubEn) ||
    (lang === "es"
      ? "Compare precios de varias compañías. La tabla de primas es ilustrativa, no una cotización oficial."
      : "Compare prices from multiple companies. The premium table is illustrative, not an official quote.");
  const scheduleHref = lang === "es" ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const agentLabel =
    lang === "es" ? `Agente licenciada en ${city.stateNameEs}` : `Licensed agent in ${city.stateNameEn}`;
  const viewLic = lang === "es" ? `Ver licencia (${city.stateCode})` : `View license (${city.stateCode})`;
  const naic = lang === "es" ? "Verificar en NAIC" : "Verify on NAIC";
  const basedIn = lang === "es" ? "Con sede en Lincoln, NE" : "Based in Lincoln, NE";
  const julieAlt =
    lang === "es" ? "Julie Braunsroth, agente de seguros" : "Julie Braunsroth, insurance agent";
  const agentBarId = lang === "es" ? "licencia" : "license";
  const heroWebp = `${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}`;
  const heroJpg = `${root}img/opt/${city.heroFile}.jpg?v=${city.heroVer}`;
  const caption = lang === "es" ? city.heroCaptionEs : city.heroCaptionEn;
  const extraClass = city.heroClass ? ` ${city.heroClass}` : "";

  return `<section class="sc-hero sc-hero--city${extraClass}" aria-label="${esc(title)}">
  <div class="sc-hero-visual" aria-hidden="true">
    <picture>
      <source type="image/webp" srcset="${heroWebp}"/>
      <img src="${heroJpg}" alt="" width="${city.heroW}" height="${city.heroH}" decoding="async" fetchpriority="high"/>
    </picture>
  </div>
  <div class="sc-hero-shade" aria-hidden="true"></div>
  <div class="container sc-hero-inner">
    <div class="sc-hero-copy">
      <h1 class="sc-hero-title">${esc(title)}</h1>
      <ul class="sc-hero-bullets">
${bullets.map((b) => `<li>${b}</li>`).join("\n")}
      </ul>
      <p class="sc-hero-cta-note">${ctaSub}</p>
      <div class="sc-hero-cta-row">
        <a class="btn sc-hero-cta" href="${quoteHref}">${esc(ctaLabel)}</a>
        <a class="btn sc-hero-cta-secondary" href="${scheduleHref}">${
    lang === "es" ? "Agendar una llamada" : "Schedule a call"
  }</a>
      </div>
      <p class="sc-hero-caption">${esc(caption)}</p>
    </div>
  </div>
  <div class="sc-hero-agentbar" id="${agentBarId}">
    <div class="container sc-hero-agentbar-inner">
      <div class="sc-hero-agent-identity">
        <picture class="sc-hero-agent-photo">
          <source type="image/webp" srcset="${root}img/opt/julie-omaha-portrait.webp?v=portrait-v1"/>
          <img src="${root}img/opt/julie-omaha-portrait.jpg?v=portrait-v1" alt="${esc(julieAlt)}" width="320" height="320" loading="lazy" decoding="async"/>
        </picture>
        <div class="sc-hero-agent-meta">
          <p class="sc-hero-agent-kicker mb-1">${esc(agentLabel)}</p>
          <p class="sc-hero-agent-name mb-1"><strong>Julie Braunsroth</strong> · ${esc(
            lang === "es" ? lic.typeEs : lic.typeEn
          )} · ${lang === "es" ? "Licencia" : "License"} <strong>#${esc(lic.number)}</strong></p>
          <p class="sc-hero-agent-npn mb-0">NPN #${NPN}${
            city.hideBasedIn ? "" : ` · ${esc(basedIn)}`
          }</p>
        </div>
      </div>
      <div class="sc-hero-agent-actions">
        <button type="button" class="btn btn-sm sc-hero-lic-btn" data-mvi-open-license="${esc(city.stateCode)}">${esc(viewLic)}</button>
        <a class="btn btn-sm sc-hero-lic-btn-outline" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=${esc(city.stateCode)}&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">${esc(naic)}</a>
      </div>
    </div>
  </div>
</section>`;
}

function faqItems(lang, city) {
  const extras = (
    lang === "es"
      ? [city.faqCremationEs, city.faqPrepaidEs, city.faqPlotEs, city.faqCalcEs]
      : [city.faqCremationEn, city.faqPrepaidEn, city.faqPlotEn, city.faqCalcEn]
  ).filter(Boolean);
  if (lang === "es") {
    return [
      {
        q: "¿Necesito un examen médico?",
        a: "Muchas pólizas de gastos finales en Nebraska se emiten con preguntas de salud y sin examen. Si la salud es un obstáculo, puede haber aceptación garantizada, casi siempre con un período de espera.",
      },
      {
        q: "¿El seguro paga desde el primer día?",
        a: "Si lo aprueban en emisión simplificada, el beneficio suele ser completo desde el primer día para reclamos cubiertos. La emisión garantizada paga de forma limitada durante los primeros dos o tres años y luego el beneficio completo.",
      },
      ...extras,
      {
        q: "¿Están licenciados en Nebraska?",
        a: "Sí. Mejor Vida Seguros cotiza seguro de vida en Nebraska. Julie Braunsroth es productora residente, NPN #21695431. Puede ver la licencia de Nebraska y verificarla en la NAIC. El mapa completo de estados está en la página de licencias.",
      },
      {
        q: "¿Atienden en español?",
        a: "Sí. Puede cotizar y hablar en español por teléfono, WhatsApp o el formulario en línea.",
      },
    ];
  }
  return [
    {
      q: "Do I need a medical exam?",
      a: "Many final expense policies in Nebraska use health questions and no exam. If health is a barrier, guaranteed acceptance may be available, usually with a waiting period.",
    },
    {
      q: "Does the policy pay from day one?",
      a: "If you are approved for simplified issue, the full benefit typically pays from day one on covered claims. Guaranteed issue pays a limited benefit for the first two or three years, then the full benefit.",
    },
    ...extras,
    {
      q: "Are you licensed in Nebraska?",
      a: "Yes. Mejor Vida Insurance quotes life insurance in Nebraska. Julie Braunsroth is a resident producer, NPN #21695431. You can view the Nebraska license and verify it on the NAIC. The full state map is on the licenses page.",
    },
    {
      q: "Do you work in Spanish?",
      a: "Yes. You can quote and speak in Spanish by phone, WhatsApp, or the online form.",
    },
  ];
}

function faqHtml(lang, city) {
  return faqItems(lang, city)
    .map(
      (item) => `<details>
      <summary>${esc(item.q)}</summary>
      <p>${esc(item.a)}</p>
    </details>`
    )
    .join("\n    ");
}

function jsonLd(lang, canon, city) {
  const items = faqItems(lang, city);
  const crumbState =
    lang === "es"
      ? `https://www.mejorvidainsurance.com/estados/${city.stateSlug}.html`
      : `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}.html`;
  const stateName = lang === "es" ? city.stateNameEs : city.stateNameEn;
  const pageName =
    lang === "es"
      ? `Seguro de gastos finales en ${city.nameEs}`
      : `Final Expense Insurance in ${city.nameEn}`;
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: pageName,
        url: canon,
        inLanguage: lang === "es" ? "es-US" : "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: stateName, item: crumbState },
          { "@type": "ListItem", position: 2, name: city.nameEn, item: canon },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  })}</script>`;
}

function rateRows() {
  return [
    { age: 60, female: 33, male: 43 },
    { age: 65, female: 41, male: 54 },
    { age: 70, female: 53, male: 70 },
    { age: 75, female: 71, male: 97 },
    { age: 80, female: 98, male: 136 },
  ];
}

function tableRows(rows) {
  return rows
    .map(
      (r) => `          <tr>
            <td>${r.source}</td>
            <td>${r.price}</td>
            <td>${r.notes}</td>
          </tr>`
    )
    .join("\n");
}

function plotResaleHtml(lang, city) {
  if (!city.plotResales || !city.plotResales.length) return "";
  const intro = lang === "es" ? city.plotResaleIntroEs : city.plotResaleIntroEn;
  const foot = lang === "es" ? city.plotResaleFootEs : city.plotResaleFootEn;
  const heading = lang === "es" ? "Anuncios de reventa de lotes" : "Private plot resale ads";
  const col1 = lang === "es" ? "Anuncio" : "Listing";
  const col2 = lang === "es" ? "Precio pedido" : "Asking price";
  const col3 = lang === "es" ? "Notas" : "Notes";
  return `<h3 class="h5 fw-bold mt-5 mb-3" style="color:#1a365d;">${esc(heading)}</h3>
    <p class="text-body-secondary mb-3">${intro}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">${col1}</th>
            <th scope="col">${col2}</th>
            <th scope="col">${col3}</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.plotResales.map((c) => ({
    source: lang === "es" ? c.sourceEs : c.sourceEn,
    price: lang === "es" ? c.priceEs : c.priceEn,
    notes: lang === "es" ? c.notesEs : c.notesEn,
  }))
)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">${foot}</p>`;
}

function cemeterySection(lang, city) {
  if (!city.cemeteries || !city.cemeteries.length) return "";
  const name = lang === "es" ? city.nameEs : city.nameEn;
  const resale = plotResaleHtml(lang, city);
  if (lang === "es") {
    return `<section class="py-5 bg-light border-bottom" id="cementerios">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Dónde comprar un lote en ${esc(name)}</h2>
    <p class="text-body-secondary mb-3">La GPL de la funeraria cubre el servicio, no el terreno. Estos cementerios venden espacios nuevos. Ninguno publica esa lista en su web: hay que llamar. El lote, la apertura y cierre, la bóveda y la lápida son aparte del funeral.</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Cementerio</th>
            <th scope="col">Qué venden</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.cemeteries.map((c) => ({
    source: c.sourceEs,
    price: c.priceEs,
    notes: c.notesEs,
  }))
)}
        </tbody>
      </table>
    </div>
    ${resale}
  </div>
</section>
`;
  }
  return `<section class="py-5 bg-light border-bottom" id="cemeteries">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Where to buy a plot in ${esc(name)}</h2>
    <p class="text-body-secondary mb-3">The funeral-home GPL covers the service, not the ground. These cemeteries sell new spaces. None publish that list on their website: you have to call. The plot, opening and closing, vault, and marker are separate from the funeral.</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Cemetery</th>
            <th scope="col">What they sell</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
${tableRows(
  city.cemeteries.map((c) => ({
    source: c.sourceEn,
    price: c.priceEn,
    notes: c.notesEn,
  }))
)}
        </tbody>
      </table>
    </div>
    ${resale}
  </div>
</section>
`;
}

function guideAssets(lang, city) {
  const isEs = lang === "es";
  const root = isEs ? "../../" : "../../../";
  const en = "../../";
  const quoteHref = isEs ? `${root}quote.html` : `${en}quote.html`;
  const canon = isEs
    ? `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`
    : `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const altCanon = isEs
    ? `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`
    : `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  return { isEs, root, en, quoteHref, canon, altCanon, stateHref };
}

function documentGuide(lang, city) {
  const { isEs, root, en, quoteHref, canon, altCanon, stateHref } = guideAssets(lang, city);
  const title = isEs ? city.titleEs : city.titleEn;
  const desc = isEs ? city.descEs : city.descEn;
  const faqId = isEs ? "preguntas" : "faq";
  const faqTitle = isEs ? `Preguntas frecuentes en ${city.nameEs}` : `${city.nameEn} FAQs`;
  const ctaTitle = isEs
    ? `Cotice gastos finales en ${city.nameEs}`
    : `Get a final expense quote in ${city.nameEn}`;
  const ctaP = isEs
    ? "Cotización gratuita. Mejor Vida Seguros compara opciones según su edad, salud y presupuesto. No es una cotización oficial hasta que una aseguradora la confirme."
    : "Free quote. Mejor Vida Insurance compares options based on your age, health, and budget. It is not an official quote until a carrier confirms it.";
  const ctaQuote = isEs ? "Cotización gratuita" : "Free quote";
  const ctaCall = isEs ? "Agendar una llamada" : "Schedule a call";
  const scheduleHref = isEs ? "/schedule-julie.html" : "/en/schedule-julie.html";
  const header = isEs ? loadHeaderEs(city) : loadHeaderEn(city);
  const footer = isEs ? loadFooterEs() : loadFooterEn();
  const robots = isEs ? "index, follow" : "noindex, follow";
  const hreflang = isEs
    ? `<link href="${canon}" hreflang="es-US" rel="alternate"/>
<link href="${altCanon}" hreflang="en-US" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>`
    : `<link href="${altCanon}" hreflang="es-US" rel="alternate"/>
<link href="${canon}" hreflang="en-US" rel="alternate"/>`;
  const ogLocale = isEs ? `<meta property="og:locale" content="es_US"/>` : "";
  const htmlLang = isEs ? "es-US" : "en-US";
  const htmlClass = isEs ? "lang-es" : "lang-en";
  const bootLang = isEs
    ? `document.documentElement.lang="es-US";document.documentElement.className="lang-es";`
    : `document.documentElement.lang="en-US";document.documentElement.className="lang-en";`;

  return `<!DOCTYPE html>
<html class="${htmlClass}" lang="${htmlLang}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="robots" content="${robots}"/>
<link href="${canon}" rel="canonical"/>
${hreflang}
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
${ogLocale}
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){${bootLang}})();</script>
${jsonLd(lang, canon, city)}
</head>
<body class="bg-white state-coverage-page sc-lincoln-guide" data-licenses-base="${root}licenses/">
${header}
<main class="state-coverage-readability">
${cityHero(lang, root, quoteHref, city)}
${guideMain(lang, city, { root, quoteHref, stateHref, en })}
<section class="py-5 bg-light border-bottom sc-city-faq" id="${faqId}">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(faqTitle)}</h2>
    ${faqHtml(lang, city)}
  </div>
</section>
<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">${esc(ctaTitle)}</h2>
    <p class="mb-4 text-white-50">${esc(ctaP)}</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">${esc(ctaQuote)}</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="${scheduleHref}">${esc(ctaCall)}</a>
    </div>
  </div>
</section>
</main>
${licenseModal(lang)}
${footer}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<script defer src="${root}js/lincoln-city-guide.js?v=${CSS_VER}"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

function documentEs(city) {
  if (city.layout === "guide") return documentGuide("es", city);
  const root = "../../";
  const quoteHref = `${root}quote.html`;
  const canon = `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const enCanon = `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  const metro = city.metroEs.map((n) => `<li>${esc(n)}</li>`).join("");
  const funeralAlt = city.cemeteries ? "bg-white" : "bg-white";
  const coverageBg = city.cemeteries ? "bg-white" : "bg-light";
  const premiumsBg = city.cemeteries ? "bg-light" : "bg-white";
  const metroBg = city.cemeteries ? "bg-white" : "bg-light";
  const licenseBg = city.cemeteries ? "bg-light" : "bg-white";
  const faqBg = city.cemeteries ? "bg-white" : "bg-light";

  return `<!DOCTYPE html>
<html class="lang-es" lang="es-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(city.titleEs)}</title>
<meta name="description" content="${esc(city.descEs)}"/>
<meta name="robots" content="index, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${canon}" hreflang="es-US" rel="alternate"/>
<link href="${enCanon}" hreflang="en-US" rel="alternate"/>
<link href="${canon}" hreflang="x-default" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(city.titleEs)}"/>
<meta property="og:description" content="${esc(city.descEs)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
<meta property="og:locale" content="es_US"/>
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){document.documentElement.lang="es-US";document.documentElement.className="lang-es";})();</script>
${jsonLd("es", canon, city)}
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEs(city)}
<main class="state-coverage-readability">
${cityHero("es", root, quoteHref, city)}

<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="Migas de pan">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(city.nameEs)}</span>
    </nav>
  </div>
</section>

<section class="py-5 ${funeralAlt} border-bottom" id="funerarias">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué puede costar un funeral en ${esc(city.nameEs)}</h2>
    <p class="text-body-secondary mb-3">${city.funeralIntroEs}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Fuente</th>
            <th scope="col">Qué publican</th>
            <th scope="col">Notas</th>
          </tr>
        </thead>
        <tbody>
${tableRows(city.funeralRowsEs)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Regla funeraria de la FTC: tiene derecho a ver la lista general de precios. Estas cifras no son una cotización de seguro ni un contrato con la funeraria. <a href="${root}cuanto-cuesta-un-funeral.html">Guía de costos funerarios</a>.</p>
  </div>
</section>

${cemeterySection("es", city)}
<section class="py-5 ${coverageBg} border-bottom" id="cobertura">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Qué es el seguro de gastos finales</h2>
    <p class="text-body-secondary mb-3">Es un <strong>seguro de vida entera</strong> de monto modesto ($5,000 a $25,000 es habitual) para funeral, cremación, deudas médicas y cuentas pequeñas. No es un funeral prepagado. El beneficio se paga en efectivo a su beneficiario.</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Emisión simplificada:</strong> preguntas de salud, sin examen. Si lo aprueban, el beneficio suele ser completo desde el primer día.</li>
      <li class="mb-2"><strong>Aceptación garantizada:</strong> sin preguntas de salud, con un período de espera de dos o tres años.</li>
      <li class="mb-2"><strong>Primas niveladas</strong> si se pagan a tiempo; la póliza no vence a cierta edad como un temporal.</li>
    </ul>
    <p class="text-body-secondary mb-0">${city.coverageNoteEs}</p>
  </div>
</section>

<section class="py-5 ${premiumsBg} border-bottom" id="primas">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Primas ilustrativas · $10,000</h2>
    <p class="text-body-secondary mb-3">Primas ilustrativas para ciudades de Nebraska. Salen de la edad, el sexo, el tabaco, el monto y la clase de salud. Esta tabla es educativa, de compañías designadas, no fumador, plan nivel / inmediato (al 20 ago. 2026). <strong>No es una cotización oficial.</strong></p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Edad</th>
            <th scope="col" class="text-end">Mujer · no fumadora</th>
            <th scope="col" class="text-end">Hombre · no fumador</th>
          </tr>
        </thead>
        <tbody>
${rateRows()
  .map(
    (r) => `          <tr>
            <th scope="row">${r.age}</th>
            <td class="text-end">$${r.female}/mes</td>
            <td class="text-end">$${r.male}/mes</td>
          </tr>`
  )
  .join("\n")}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Las preguntas de salud y la aseguradora confirman el número real. El tabaco, un plan escalonado o la aceptación garantizada suelen costar más. <a href="${quoteHref}">Cotice en línea</a> o llame al <a href="tel:+14024405438">402-440-5438</a>.</p>
  </div>
</section>

<section class="py-5 ${metroBg} border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEs)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEs}</p>
    <ul class="sc-city-pills">${metro}</ul>
  </div>
</section>

<section class="py-5 ${licenseBg} border-bottom" id="licencia-nebraska">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Licencia en Nebraska</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Seguros está autorizado a cotizar y vender seguro de vida en <strong>Nebraska</strong>. Julie Braunsroth es productora residente, NPN #${NPN}, con sede en Lincoln. Esta página no lista otros estados: el mapa y las copias están en <a href="${root}licencias.html">licencias</a>.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#licencia">Ver licencia de Nebraska</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">Verificar en la NAIC</a>
    </div>
  </div>
</section>

<section class="py-5 ${faqBg} border-bottom sc-city-faq" id="preguntas">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Preguntas frecuentes en ${esc(city.nameEs)}</h2>
    ${faqHtml("es", city)}
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Cotice gastos finales en ${esc(city.nameEs)}</h2>
    <p class="mb-4 text-white-50">Cotización gratuita. Mejor Vida Seguros compara opciones según su edad, salud y presupuesto. No es una cotización oficial hasta que una aseguradora la confirme.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">Cotización gratuita</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/schedule-julie.html">Agendar una llamada</a>
    </div>
  </div>
</section>
</main>
${licenseModal("es")}
${loadFooterEs()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

function documentEn(city) {
  if (city.layout === "guide") return documentGuide("en", city);
  const root = "../../../";
  const en = "../../";
  const quoteHref = `${en}quote.html`;
  const canon = `https://www.mejorvidainsurance.com/en/states/${city.stateSlug}/${city.slug}.html`;
  const esCanon = `https://www.mejorvidainsurance.com/estados/${city.stateSlug}/${city.slug}.html`;
  const stateHref = `../${city.stateSlug}.html`;
  const metro = city.metroEn.map((n) => `<li>${esc(n)}</li>`).join("");
  const funeralAlt = "bg-white";
  const coverageBg = city.cemeteries ? "bg-white" : "bg-light";
  const premiumsBg = city.cemeteries ? "bg-light" : "bg-white";
  const metroBg = city.cemeteries ? "bg-white" : "bg-light";
  const licenseBg = city.cemeteries ? "bg-light" : "bg-white";
  const faqBg = city.cemeteries ? "bg-white" : "bg-light";

  return `<!DOCTYPE html>
<html class="lang-en" lang="en-US">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K921EG6JWG');</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(city.titleEn)}</title>
<meta name="description" content="${esc(city.descEn)}"/>
<meta name="robots" content="noindex, follow"/>
<link href="${canon}" rel="canonical"/>
<link href="${esCanon}" hreflang="es-US" rel="alternate"/>
<link href="${canon}" hreflang="en-US" rel="alternate"/>
<link href="${root}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="${root}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="${root}css/quote-flow-shared.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="${root}css/state-coverage.css?v=${CSS_VER}" rel="stylesheet"/>
<link href="${root}css/mvi-licensing-map.css?v=20260726-state-cov" rel="stylesheet"/>
<link href="${root}css/mvi-assistant-widget.css?v=20260808-chat-sm" rel="stylesheet"/>
<link href="${root}css/fontawesome-mvi.min.css?v=20260723-brands-fix" rel="stylesheet"/>
<link href="${root}css/site-header.css?v=20260723-ver-precios-gold" rel="stylesheet"/>
<link href="${root}css/nav-questions-dropdown.css" rel="stylesheet"/>
<link href="${root}css/nav-about-mega.css?v=20260905-search" rel="stylesheet"/>
<link href="${root}css/nav-funeral-resources.css?v=20260728-photo-stronger" rel="stylesheet"/>
<link href="${root}css/nav-life-insurance.css?v=20260831-navicons" rel="stylesheet"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(city.titleEn)}"/>
<meta property="og:description" content="${esc(city.descEn)}"/>
<meta property="og:url" content="${canon}"/>
<meta property="og:image" content="https://www.mejorvidainsurance.com/img/opt/${city.heroFile}.jpg"/>
<link rel="preload" as="image" href="${root}img/opt/${city.heroFile}.webp?v=${city.heroVer}" type="image/webp" fetchpriority="high"/>
<script>(function(){document.documentElement.lang="en-US";document.documentElement.className="lang-en";})();</script>
${jsonLd("en", canon, city)}
</head>
<body class="bg-white state-coverage-page" data-licenses-base="${root}licenses/">
${loadHeaderEn(city)}
<main class="state-coverage-readability">
${cityHero("en", root, quoteHref, city)}

<section class="py-4 bg-white border-bottom">
  <div class="container sc-city-prose">
    <nav class="sc-city-crumb" aria-label="Breadcrumb">
      <a href="${stateHref}">Nebraska</a>
      <span class="text-body-secondary mx-2">/</span>
      <span>${esc(city.nameEn)}</span>
    </nav>
  </div>
</section>

<section class="py-5 ${funeralAlt} border-bottom" id="funeral-homes">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What a funeral can cost in ${esc(city.nameEn)}</h2>
    <p class="text-body-secondary mb-3">${city.funeralIntroEn}</p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Source</th>
            <th scope="col">What they publish</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
${tableRows(city.funeralRowsEn)}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">FTC Funeral Rule: you can request the General Price List. These figures are not an insurance quote or a funeral-home contract. <a href="${en}how-much-does-a-funeral-cost.html">Funeral cost guide</a>.</p>
  </div>
</section>

${cemeterySection("en", city)}
<section class="py-5 ${coverageBg} border-bottom" id="coverage">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">What final expense insurance is</h2>
    <p class="text-body-secondary mb-3">It is <strong>whole life insurance</strong> in a modest amount ($5,000 to $25,000 is typical) for funeral, cremation, medical bills, and small debts. It is not a prepaid funeral. The benefit is paid in cash to your beneficiary.</p>
    <ul class="text-body-secondary ps-3 mb-3">
      <li class="mb-2"><strong>Simplified issue:</strong> health questions, no exam. If approved, the full benefit usually pays from day one.</li>
      <li class="mb-2"><strong>Guaranteed acceptance:</strong> no health questions, with a two- or three-year waiting period.</li>
      <li class="mb-2"><strong>Level premiums</strong> when paid on time; the policy does not expire at a set age the way term does.</li>
    </ul>
    <p class="text-body-secondary mb-0">${city.coverageNoteEn}</p>
  </div>
</section>

<section class="py-5 ${premiumsBg} border-bottom" id="premiums">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Illustrative premiums · $10,000</h2>
    <p class="text-body-secondary mb-3">Illustrative premiums for cities in Nebraska. They come from age, sex, tobacco, face amount, and health class. This table is educational, from appointed companies, non-tobacco, level / immediate (as of 20 Aug 2026). <strong>It is not an official quote.</strong></p>
    <div class="sc-cost-table-wrap">
      <table class="sc-cost-table">
        <thead>
          <tr>
            <th scope="col">Age</th>
            <th scope="col" class="text-end">Female · non-tobacco</th>
            <th scope="col" class="text-end">Male · non-tobacco</th>
          </tr>
        </thead>
        <tbody>
${rateRows()
  .map(
    (r) => `          <tr>
            <th scope="row">${r.age}</th>
            <td class="text-end">$${r.female}/mo</td>
            <td class="text-end">$${r.male}/mo</td>
          </tr>`
  )
  .join("\n")}
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-3 mb-0">Health questions and the carrier confirm the real number. Tobacco, graded plans, or guaranteed acceptance usually cost more. <a href="${quoteHref}">Get a quote online</a> or call <a href="tel:+14024405438">402-440-5438</a>.</p>
  </div>
</section>

<section class="py-5 ${metroBg} border-bottom" id="metro">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.metroTitleEn)}</h2>
    <p class="text-body-secondary mb-3">${city.metroNoteEn}</p>
    <ul class="sc-city-pills">${metro}</ul>
  </div>
</section>

<section class="py-5 ${licenseBg} border-bottom" id="nebraska-license">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">Nebraska license</h2>
    <p class="text-body-secondary mb-3">Mejor Vida Insurance is authorized to quote and sell life insurance in <strong>Nebraska</strong>. Julie Braunsroth is a resident producer, NPN #${NPN}, based in Lincoln. This page does not list other states: the map and copies are on the <a href="${en}licenses.html">licenses</a> page.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-outline-primary" href="#license">View Nebraska license</a>
      <a class="btn btn-outline-secondary" href="https://external-lookup-web.prod.naic.org/lookup?jurisdiction=NE&amp;searchType=Licensee&amp;entityType=IND&amp;npn=${NPN}" target="_blank" rel="noopener">Verify on the NAIC</a>
    </div>
  </div>
</section>

<section class="py-5 ${faqBg} border-bottom sc-city-faq" id="faq">
  <div class="container sc-city-prose">
    <h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${esc(city.nameEn)} FAQs</h2>
    ${faqHtml("en", city)}
  </div>
</section>

<section class="py-5 text-white" style="background:#1a365d;">
  <div class="container text-center" style="max-width:60rem;">
    <h2 class="h3 fw-bold mb-3">Get a final expense quote in ${esc(city.nameEn)}</h2>
    <p class="mb-4 text-white-50">Free quote. Mejor Vida Insurance compares options based on your age, health, and budget. It is not an official quote until a carrier confirms it.</p>
    <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
      <a class="btn btn-primary-gold px-4 py-3 rounded fw-bold" href="${quoteHref}">Free quote</a>
      <a class="btn px-4 py-3 rounded fw-bold text-white" style="background:#0b3a7a;" href="/en/schedule-julie.html">Schedule a call</a>
    </div>
  </div>
</section>
</main>
${licenseModal("en")}
${loadFooterEn()}
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script defer src="${root}bootstrap/js/bootstrap.bundle.min.js"></script>
<script defer src="${root}script.js"></script>
<script defer src="${root}js/mvi-nav-questions.js?v=20260828-family"></script>
<script defer src="${root}js/mvi-licensing-map.js?v=20260726-lic-popup"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="${root}js/website-assistant-widget.js"></script>
</body>
</html>
`;
}

for (const city of CITIES) {
  const esDir = path.join(ROOT, "estados", city.stateSlug);
  const enDir = path.join(ROOT, "en", "states", city.stateSlug);
  fs.mkdirSync(esDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });
  const esPath = path.join(esDir, `${city.slug}.html`);
  const enPath = path.join(enDir, `${city.slug}.html`);
  fs.writeFileSync(esPath, documentEs(city));
  fs.writeFileSync(enPath, documentEn(city));
  console.log("wrote", esPath);
  console.log("wrote", enPath);
}
