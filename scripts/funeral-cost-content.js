"use strict";

const fs = require("fs");
const path = require("path");
const { quoteRailHtml, PHONE, TEL } = require("./lic-quote-rail");
const { LINKS, faqsHtml, nextStepBandHtml } = require("./preexisting-conditions-content");

const FO_JSON = path.join(
  __dirname,
  "..",
  "integrations/knowledge/Funeralocity_State_Costs/all-states-detailed.json"
);

const FO_KEYS = [
  { key: "fullBurial", mod: "lic-fun-bar--burial-full" },
  { key: "immediateBurial", mod: "lic-fun-bar--burial-direct" },
  { key: "fullCremation", mod: "lic-fun-bar--crem-full" },
  { key: "directCremation", mod: "lic-fun-bar--crem-direct" },
];

function money(n) {
  return "$" + Math.round(Number(n)).toLocaleString("en-US");
}

function loadFuneralocityStates() {
  const raw = JSON.parse(fs.readFileSync(FO_JSON, "utf8"));
  const rows = Object.keys(raw.states)
    .map((code) => {
      const st = raw.states[code];
      const short = st.short || {};
      if (
        !short.fullBurial ||
        !short.immediateBurial ||
        !short.fullCremation ||
        !short.directCremation
      ) {
        return null;
      }
      return {
        code,
        name: st.name,
        fullBurial: short.fullBurial.Average,
        immediateBurial: short.immediateBurial.Average,
        fullCremation: short.fullCremation.Average,
        directCremation: short.directCremation.Average,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  const n = rows.length;
  const mean = (key) => rows.reduce((sum, row) => sum + row[key], 0) / n;
  const extrema = (key) => {
    const sorted = rows.slice().sort((a, b) => a[key] - b[key]);
    return { min: sorted[0], max: sorted[sorted.length - 1] };
  };
  return {
    capturedAt: raw.capturedAt,
    rows,
    means: {
      fullBurial: mean("fullBurial"),
      immediateBurial: mean("immediateBurial"),
      fullCremation: mean("fullCremation"),
      directCremation: mean("directCremation"),
    },
    extrema: {
      fullBurial: extrema("fullBurial"),
      immediateBurial: extrema("immediateBurial"),
      fullCremation: extrema("fullCremation"),
      directCremation: extrema("directCremation"),
    },
  };
}

function foBarsHtml(c, fo) {
  const values = FO_KEYS.map(({ key }) => fo.means[key]);
  const max = Math.max.apply(null, values);
  const labels = [c.bar1, c.bar2, c.bar3, c.bar4];
  return `<div class="lic-fun-bars" role="img" aria-label="${c.foChartAria}">
${FO_KEYS.map(({ key, mod }, i) => {
    const value = fo.means[key];
    const pct = Math.max(10, Math.round((value / max) * 100));
    return `<div class="lic-fun-bar ${mod}">
<div class="lic-fun-bar__top"><span class="lic-fun-bar__label">${labels[i]}</span><span class="lic-fun-bar__amt">${money(value)}</span></div>
<div class="lic-fun-bar__track" aria-hidden="true"><div class="lic-fun-bar__fill" style="width:${pct}%"></div></div>
</div>`;
  }).join("\n")}
</div>`;
}

function nfdaCardsHtml(c) {
  return `<div class="lic-fun-nfda">
<div class="lic-fun-nfda__card">
<p class="lic-fun-nfda__kicker">${c.nfdaKicker1}</p>
<p class="lic-fun-nfda__amt">$8,300</p>
<p class="lic-fun-nfda__label">${c.nfda1}</p>
</div>
<div class="lic-fun-nfda__card lic-fun-nfda__card--gold">
<p class="lic-fun-nfda__kicker">${c.nfdaKicker2}</p>
<p class="lic-fun-nfda__amt">$6,280</p>
<p class="lic-fun-nfda__label">${c.nfda2}</p>
</div>
</div>`;
}

function stateTableHtml(c, fo) {
  const body = fo.rows
    .map(
      (row) => `<tr>
<th scope="row">${row.name}</th>
<td>${money(row.fullBurial)}</td>
<td>${money(row.immediateBurial)}</td>
<td>${money(row.fullCremation)}</td>
<td>${money(row.directCremation)}</td>
</tr>`
    )
    .join("\n");
  return `<details class="lic-fun-states">
<summary>${c.statesSummary}</summary>
<div class="lic-fun-table-wrap">
<table class="lic-fun-table">
<caption>${c.statesCaption}</caption>
<thead>
<tr>
<th scope="col">${c.thState}</th>
<th scope="col">${c.bar1}</th>
<th scope="col">${c.bar2}</th>
<th scope="col">${c.bar3}</th>
<th scope="col">${c.bar4}</th>
</tr>
</thead>
<tbody>
${body}
</tbody>
</table>
</div>
<p class="lic-rate-note">${c.statesFoot}</p>
</details>`;
}

function copyFuneralCost(lang) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const estimator = "final-expense-estimator.html";
  const prepaid = isEs
    ? "blog/final-expense-vs-prepagado-funerario-2026-07-19.html"
    : "blog/final-expense-vs-prepaid-funeral-2026-07-19.html";
  const payPage = isEs
    ? "blog/medicare-paga-gastos-finales.html"
    : "../blog/medicare-paga-gastos-finales.html";
  const premiumGuide = isEs
    ? "blog/cuanto-cuesta-seguro-gastos-finales.html"
    : "final-expense-cost.html";
  const crem = isEs ? "seguro-para-cremacion.html" : "cremation-insurance.html";
  if (isEs) {
    return {
      title: "¿Cuánto cuesta un funeral? Entierro, cremación y extras (2026) | Mejor Vida Seguros",
      desc: "Qué suele incluir la factura de una funeraria, medianas nacionales de 2023, promedios estatales de 2026, extras del cementerio y cómo pedir la lista de precios. No es una cotización de funeraria.",
      h1: "¿Cuánto cuesta un funeral?",
      lead: "La factura de un funeral suele ser más de un solo cargo. Puede incluir la funeraria, el cementerio y extras que la familia elija, como flores o una lápida. Esta página explica esos costos, muestra cifras nacionales para orientarse y cómo pedir a una funeraria local su lista de precios por escrito.",
      crumbEnd: "Costo de un funeral",
      take1: "Hay cuatro caminos habituales: funeral con servicio y entierro, entierro sin velatorio, funeral con servicio y cremación, y cremación sin servicio. El precio cambia con esa elección, no con un único “promedio de EE. UU.”",
      take2: "En 2023, la <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> publicó una mediana nacional de <strong>$8,300</strong> para un funeral con velatorio y entierro, y <strong>$6,280</strong> con velatorio y cremación. Parcela, bóveda, lápida y flores suelen ir aparte.",
      take3: "Pida la <strong>lista de precios generales</strong> (GPL): el documento que la funeraria debe entregar antes de que usted elija. La <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">Funeral Rule de la FTC</a> le permite comprar solo lo que necesita.",
      callout: "Un promedio nacional no es la factura de su ciudad. Úselo para ver el tamaño de la cuenta; luego pida la GPL local o use la calculadora por estado.",
      needH: "La factura que llega a la familia",
      needP1: "Cuando alguien fallece, alguien tiene que pagar el cuidado del cuerpo, el lugar de descanso y, si la familia lo quiere, un servicio. Esa cuenta no la paga Medicare. El <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Seguro Social</a> puede entregar un único pago de $255 si se cumplen sus reglas. Eso no cubre un sepelio.",
      needP2: "Las familias suelen mezclar dos preguntas: “¿cuánto cobra la funeraria?” y “¿cuánto cuesta un seguro para dejar ese dinero?” No son lo mismo. Aquí se enseña la primera. La segunda está en la <a href=\"" +
        premiumGuide +
        "\">guía del precio del seguro</a> y en <a href=\"" +
        L.fe +
        "\">seguro de gastos finales</a>.",
      whatH: "Qué hay dentro de una cuenta funeraria",
      whatP1: "La <a href=\"https://consumer.ftc.gov/articles/types-funerals\" rel=\"noopener\" target=\"_blank\">FTC</a> describe tres arreglos básicos que la gente confunde con un solo producto. Un <strong>funeral tradicional</strong> (a veces llamado de servicio completo) suele incluir el traslado, el cuidado del cuerpo, el velatorio o visita, un servicio y luego el entierro o la cremación. Un <strong>entierro directo</strong> lleva el cuerpo al cementerio sin velatorio ni servicio en la funeraria. Una <strong>cremación directa</strong> crema el cuerpo sin ese velatorio; la familia puede usar un contenedor sencillo en lugar de un ataúd de exposición.",
      whatP2: "Esas etiquetas describen el tipo de servicio, no un precio fijo. Dos funerarias en la misma ciudad pueden empaquetar cosas distintas bajo el mismo nombre. Por eso el siguiente paso no es memorizar un promedio: es leer qué líneas están en la GPL.",
      fact1H: "Lo que suele cobrar la funeraria",
      fact1P: "Traslado, cuidado del cuerpo, uso de las instalaciones, personal del servicio, ataúd o urna, y el cargo básico no declinable que casi todas las funerarias publican.",
      fact2H: "Lo que suele cobrar el cementerio",
      fact2P: "Parcela o nicho, apertura y cierre de la tumba, a veces una bóveda o contenedor exterior, y el marcador. Esas líneas a menudo no están en la mediana de “funeral con velatorio.”",
      fact3H: "Lo que la familia añade",
      fact3P: "Flores, obituario, transporte de familiares, comida, honorarios religiosos o un recibimiento. Son opcionales y varían mucho.",
      howH: "Cómo se cotiza, en la práctica",
      howP1: "Antes de elegir, pida la <strong>lista de precios generales</strong> (GPL): el menú escrito de bienes y servicios. La Funeral Rule de la FTC dice que debe poder verla. También puede comprar un ataúd o una urna en otro lugar y la funeraria no puede negarse a usarlo ni cobrarle un recargo solo por eso.",
      howP2: "Usted no está obligado a comprar un “paquete” entero. Puede tomar el cargo básico, el traslado y una cremación directa, y dejar el velatorio. Puede querer el velatorio y un ataúd sencillo. El precio correcto es el de las líneas que sí va a usar.",
      howP3: "Si le dan un total de palabra, pida que coincida con la GPL. Un promedio de internet no sustituye esa hoja.",
      numsH: "Cifras nacionales, leídas con cuidado",
      numsP: "Hay dos conjuntos públicos, de años distintos, que miden cosas distintas. No los mezclamos en un solo “precio 2026.” Léalos como un tamaño de cuenta, no como la factura de una funeraria concreta.",
      nfdaH: "Medianas NFDA de 2023 (funeral con velatorio)",
      nfdaP: "Una <strong>mediana</strong> es el valor del medio: la mitad de los casos quedó por debajo y la mitad por encima. La NFDA publicó, para 2023, <strong>$8,300</strong> para un funeral con velatorio y entierro, y <strong>$6,280</strong> para un funeral con velatorio y cremación. Esas cifras son del proveedor funerario. No tratan de adivinar la parcela ni la lápida.",
      nfdaKicker1: "Mediana 2023",
      nfdaKicker2: "Mediana 2023",
      nfda1: "Funeral con velatorio y entierro",
      nfda2: "Funeral con velatorio y cremación",
      nfdaLearn: "Lo que debe llevarse: un sepelio con visita y servicio suele estar en miles de dólares, y la cremación con el mismo tipo de servicio no es “gratis” — sigue siendo una cuenta grande, solo más baja que el entierro con velatorio.",
      nfdaNote: "Algunos resúmenes comerciales de ese mismo estudio mencionan un total más alto cuando se añade una bóveda. No pudimos reabrir el comunicado original de la NFDA al escribir esta página, así que no publicamos esa cifra extra. Confirme la bóveda en la GPL y en el cementerio.",
      foH: "Promedios de paquetes por estado (Funeralocity, julio 2026)",
      foP: "Un <strong>promedio</strong> suma los valores y los divide. Funeralocity publica un precio promedio de paquete por estado para cuatro arreglos. El gráfico de abajo es el promedio de esos 50 estados más D.C., con la misma fecha (julio 2026). Incluye caminos sin velatorio, que la mediana NFDA de “con velatorio” no muestra.",
      foChartAria: "Promedio de paquetes funerarios por tipo, julio 2026",
      bar1: "Funeral con servicio, entierro",
      bar2: "Entierro sin velatorio",
      bar3: "Funeral con servicio, cremación",
      bar4: "Cremación sin servicio",
      foLearn: "Lo que debe llevarse: saltarse el velatorio baja la cuenta de forma clara. La cremación directa es, en promedio, el camino más económico de estos cuatro. Un funeral con servicio y entierro es el más alto. Su ciudad puede quedar fuera de ese orden.",
      foRange: "Entre esos estados, el paquete de funeral con servicio y entierro promedió desde unos $7,554 (Oregón) hasta unos $9,697 (Minnesota). La cremación directa, desde unos $1,332 (Oregón) hasta unos $3,183 (Dakota del Norte). Eso muestra variación, no una cotización.",
      extraH: "Lo que suele ir aparte",
      extraP: "Aunque pague el paquete de la funeraria, el cementerio puede cobrar parcela, apertura y cierre, un contenedor exterior si el camposanto lo exige, y el marcador. Flores, comida y viaje de la familia tampoco suelen estar en esas medianas. Si suma esas líneas, la cuenta total puede superar cómodamente los $8,300 o los $6,280.",
      extra1H: "Cementerio",
      extra1P: "Parcela o nicho, abrir y cerrar, y a veces reglas sobre bóveda o tipo de marcador.",
      extra2H: "Ataúd o urna",
      extra2P: "El modelo de exposición puede costar mucho más que un contenedor sencillo. Puede comprarlo en otro lugar.",
      extra3H: "Después del servicio",
      extra3P: "Obituario, flores, recepción, honorarios del oficiante y boletos de avión de un hijo que vive lejos.",
      varyH: "Por qué su ciudad no coincide con el promedio",
      varyP: "El costo sigue al mercado local: competencia entre funerarias, si hay crematorio propio, precios de terreno y lo que la familia elige. Un estado caro en el promedio no significa que cada pueblo de ese estado sea caro. Pida dos o tres GPL. Use la <a href=\"" +
        estimator +
        "\">calculadora de gastos finales</a> para un estimado por estado, no como factura.",
      statesSummary: "Ver el promedio de Funeralocity en cada estado (julio 2026)",
      statesCaption: "Promedio de paquete publicado por Funeralocity, julio 2026. No es una cotización de una funeraria.",
      thState: "Estado",
      statesFoot: "Cifras redondeadas al dólar. Son promedios de paquetes listados, no el mínimo legal ni el máximo posible. Cementerio y extras pueden faltar.",
      limitsH: "Lo que estas cifras no predicen",
      limitsP: "Los precios de funerales suben y bajan con el resto de la economía. La Oficina de Estadísticas Laborales publica un índice de gastos funerarios, pero la inflación de un año no es una promesa para los próximos 30. No dibujamos una línea hasta 2056: el futuro no está en la GPL de hoy.",
      limitsP2: "La NFDA proyectó que en 2025 la cremación sería el 63.4% de las disposiciones y el entierro el 31.6%. Eso describe lo que las familias eligen, no un descuento automático. Un “funeral ecológico” puede interesar a mucha gente; no publicamos un precio nacional porque no hay una mediana verificada que lo cubra.",
      faqTitle: "Preguntas frecuentes",
      faq1q: "¿Cuál suele ser el camino más económico?",
      faq1a: "En los promedios de Funeralocity de julio 2026, la cremación sin servicio es el más bajo de los cuatro paquetes. Eso no obliga a nadie a elegirla, y una funeraria concreta puede cobrar más o menos.",
      faq2q: "¿Los $8,300 incluyen la parcela del cementerio?",
      faq2a: "Por lo general, no. La mediana NFDA de 2023 es un funeral con velatorio y entierro del lado de la funeraria. Parcela, apertura, bóveda y lápida suelen ser otras facturas.",
      faq3q: "¿Puedo comprar el ataúd en otro lugar?",
      faq3a: "Sí. La Funeral Rule de la FTC permite llevar un ataúd o una urna comprados fuera. La funeraria no puede negarse a usarlos ni cobrarle un recargo solo por eso.",
      faq4q: "¿Por qué dos funerarias de la misma ciudad cobran distinto?",
      faq4a: "Empaquetan líneas distintas, tienen costos distintos y compiten de forma distinta. Compare GPL, no un solo total de palabra.",
      faq5q: "¿El funeral se duplicará de precio en 30 años?",
      faq5a: "No lo sabemos, y no publicamos esa proyección. Use la GPL actual y, si quiere un colchón, deje efectivo o un contrato aparte. La inflación pasada no garantiza el futuro.",
      faq6q: "¿El Seguro Social paga el funeral?",
      faq6a: "Puede pagar $255 una sola vez si se cumplen sus reglas. No cubre un sepelio típico.",
      faq7q: "¿Medicare paga el funeral?",
      faq7a: "Medicare es seguro médico. No lo tratamos aquí como un plan funerario. Más detalle en la guía de <a href=\"" +
        payPage +
        "\">cómo se relaciona Medicare con los gastos finales</a>.",
      faq8q: "¿El VA ayuda con el entierro de un veterano?",
      faq8a: "A veces, si se cumplen las reglas del Departamento de Asuntos de Veteranos. Para una muerte no relacionada con el servicio el 1 de octubre de 2025 o después, el VA publica $1,002 de asignación de entierro y $1,002 de parcela. Si la muerte está relacionada con el servicio (desde el 11 de septiembre de 2001), el máximo de entierro que publica es $2,000. La elegibilidad no es automática. Confirme en <a href=\"https://www.va.gov/burials-memorials/veterans-burial-allowance/\" rel=\"noopener\" target=\"_blank\">la página del VA</a>.",
      faq9q: "¿Los gastos del funeral se deducen en mi declaración de ingresos?",
      faq9a: "En general, no como un gasto personal en el Formulario 1040 del sobreviviente. Algunas reglas de impuesto al patrimonio son distintas. La <a href=\"https://www.irs.gov/publications/p559\" rel=\"noopener\" target=\"_blank\">Publicación 559 del IRS</a> cubre a los sobrevivientes. Esto no es asesoría fiscal.",
      faq10q: "¿Hace falta una autopsia para tener un funeral?",
      faq10a: "El funeral en sí no exige una autopsia. Un médico forense o un examinador médico puede ordenarla según las reglas del estado y las circunstancias de la muerte. Eso no lo decide la funeraria como un “extra” de paquete.",
      faq11q: "¿Un seguro de gastos finales es lo mismo que prepagar en la funeraria?",
      faq11a: "No. Un <strong>funeral prepagado</strong> es un contrato con una funeraria por bienes o servicios. Un seguro de gastos finales es una póliza de vida: paga efectivo a la persona que usted nombró. Compare ambos en la <a href=\"" +
        prepaid +
        "\">guía de funerales prepagados</a>.",
      faq12q: "¿Cuánta cobertura de seguro tendría que comprar?",
      faq12a: "Empiece por una GPL local, sume cementerio y un colchón si quiere viaje o deudas pequeñas, y luego mire el mes que puede pagar. Un promedio nacional no es su monto. La <a href=\"" +
        estimator +
        "\">calculadora</a> ayuda a dimensionar la cuenta; una cotización confirma la prima.",
      payH: "Cómo se paga esa cuenta",
      payP: "Las familias usan ahorros, una cuenta conjunta, una colecta, un contrato ya pagado en una funeraria, beneficios de veterano si aplican, o efectivo de un seguro de vida. Ninguna de esas vías es “la correcta” para todos. Lo que cambia es quién controla el dinero y qué queda atado a un proveedor.",
      pay1H: "Ahorros o una cuenta",
      pay1P: "Si el dinero ya está apartado y la familia puede usarlo al momento, no hace falta un producto nuevo del mismo tamaño.",
      pay2H: "Contrato en la funeraria",
      pay2P: "Un prepago puede fijar bienes o servicios con un proveedor. Si se muda, ese contrato puede ser difícil de mover. No es un seguro de vida.",
      pay3H: "Efectivo de una póliza",
      pay3P: "El beneficiario recibe dinero y decide cómo gastarlo. La funeraria no cobra a menos que esa persona pague allí.",
      insH: "Si quiere dejar efectivo, no un paquete",
      insP1: "Un <strong>seguro de gastos finales</strong> es una póliza pequeña de <strong>vida entera</strong>: cobertura que no vence a los 10 o 20 años mientras se pague a tiempo. La <strong>prima</strong> es la cuota regular. El <strong>beneficiario</strong> es la persona que usted nombra. El <strong>beneficio de muerte</strong> es el efectivo que esa persona recibe. No reserva un servicio en una funeraria concreta.",
      insP2: "Ese producto se enseña completo en <a href=\"" +
        L.fe +
        "\">seguro de gastos finales</a>. El precio mensual —edad, salud, tabaco, monto— está en la <a href=\"" +
        premiumGuide +
        "\">guía de cuánto cuesta el seguro</a>. Si la meta es solo una cremación, vea también <a href=\"" +
        crem +
        "\">seguro para cremación</a>: en las compañías que cotizamos es el mismo tipo de póliza, no un paquete de crematorio.",
      faqTitle2: "",
      nextH: "Siguiente paso",
      nextLead: "Pida una cotización gratuita con su edad y salud, o agende una llamada con Mejor Vida Seguros.",
      nextMore:
        "Licencias actuales en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>. Esta página no cotiza una funeraria.",
      nextPrimary: "Cotización gratuita",
      nextPrimaryHref: L.quote,
      nextSecondary: "Agendar una llamada",
      nextSecondaryHref: L.schedule,
      quoteTitle: "Estime el costo",
      quote1: "Precios típicos por estado",
      quote2: "Entierro y cremación",
      quoteCta: "Calcular ahora",
      srcTitle: "Fuentes",
      src1: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: estadísticas</a> — medianas 2023 de funeral con velatorio y entierro ($8,300) o cremación ($6,280); proyección 2025 de cremación 63.4%.',
      src2: '<a href="https://www.funeralocity.com/average-funeral-price" rel="noopener" target="_blank">Funeralocity: precio promedio de funeral</a> — paquetes por estado (captura de julio 2026 en esta página).',
      src3: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, comprar solo lo necesario, ataúd o urna de otro vendedor.',
      src4: '<a href="https://consumer.ftc.gov/articles/types-funerals" rel="noopener" target="_blank">FTC: tipos de funerales</a> — funeral tradicional, entierro directo y cremación directa.',
      src5: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">Seguro Social: pago único por fallecimiento</a> — $255 si aplican las reglas.',
      src6: '<a href="https://www.va.gov/burials-memorials/veterans-burial-allowance/" rel="noopener" target="_blank">VA: asignación de entierro</a> — montos según fecha y si la muerte está relacionada con el servicio.',
      src7: '<a href="https://www.irs.gov/publications/p559" rel="noopener" target="_blank">IRS, Publicación 559</a> — sobrevivientes; los gastos del funeral no suelen ser una deducción personal en el 1040.',
      discTitle: "Divulgaciones",
      discBody:
        "Esta página es educativa. Los precios de funeraria y cementerio los fija cada proveedor. Las cifras nacionales no son una cotización. El seguro de vida, si se menciona, varía por edad, salud, tabaco, monto, producto y estado. Mejor Vida Insurance LLC es una agencia independiente (NPN 21695431). Las licencias actuales están en la página de <a href=\"" +
        L.licenses +
        "\">licencias</a>.",
    };
  }
  return {
    title: "How much does a funeral cost? Burial, cremation, extras (2026) | Mejor Vida Insurance",
    desc: "What a funeral home bill usually includes, 2023 national medians, 2026 state package averages, cemetery extras, and how to ask for a price list. Not a funeral-home quote.",
    h1: "How much does a funeral cost?",
    lead: "A funeral bill is usually more than one charge. It can include the funeral home, the cemetery, and extras the family chooses, such as flowers or a headstone. This page explains those costs, shows national figures as a starting point, and shows how to ask a local funeral home for its written price list.",
    crumbEnd: "Funeral cost",
    take1: "There are four common paths: a funeral with service and burial, burial with no viewing, a funeral with service and cremation, and cremation with no service. Price follows that choice, not a single “U.S. average.”",
    take2: "In 2023 the <a href=\"https://content.nfda.org/news/statistics\" rel=\"noopener\" target=\"_blank\">NFDA</a> published a national median of <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> with viewing and cremation. Plot, vault, marker, and flowers are usually extra.",
    take3: "Ask for the <strong>general price list</strong> (GPL): the written menu the funeral home must give you before you choose. The <a href=\"https://consumer.ftc.gov/articles/ftc-funeral-rule\" rel=\"noopener\" target=\"_blank\">FTC Funeral Rule</a> lets you buy only what you need.",
    callout: "A national average is not your city’s invoice. Use it to see the size of the bill, then ask for a local GPL or use the state calculator.",
    needH: "The bill that lands on the family",
    needP1: "When someone dies, someone pays for care of the body, a resting place, and a service if the family wants one. Medicare does not pay that bill. <a href=\"https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment\" rel=\"noopener\" target=\"_blank\">Social Security</a> may pay $255 once if its rules are met. That does not cover a funeral.",
    needP2: "Families often mix two questions: “what does the funeral home charge?” and “what does insurance cost to leave that money?” They are not the same. This page teaches the first. The second is on the <a href=\"" +
      premiumGuide +
      "\">insurance price guide</a> and <a href=\"" +
      L.fe +
      "\">final expense insurance</a>.",
    whatH: "What is inside a funeral bill",
    whatP1: "The <a href=\"https://consumer.ftc.gov/articles/types-funerals\" rel=\"noopener\" target=\"_blank\">FTC</a> describes three basic arrangements people treat as one product. A <strong>traditional funeral</strong> (sometimes called full-service) often includes transfer, care of the body, a viewing, a service, then burial or cremation. A <strong>direct burial</strong> takes the body to the cemetery with no viewing or funeral-home service. A <strong>direct cremation</strong> cremates the body without that viewing; the family may use a simple container instead of a display casket.",
    whatP2: "Those labels describe the type of service, not a fixed price. Two funeral homes in the same city can bundle different lines under the same name. The next step is not memorizing an average. It is reading which lines are on the GPL.",
    fact1H: "What the funeral home usually bills",
    fact1P: "Transfer, care of the body, use of the facilities, staff for the service, a casket or urn, and the non-declinable basic services fee almost every funeral home publishes.",
    fact2H: "What the cemetery usually bills",
    fact2P: "Plot or niche, opening and closing, sometimes an outer container if the cemetery requires one, and the marker. Those lines are often missing from a “funeral with viewing” median.",
    fact3H: "What the family adds",
    fact3P: "Flowers, an obituary, travel, a meal, clergy, or a reception. Those are optional and vary widely.",
    howH: "How prices are quoted, in practice",
    howP1: "Before you choose, ask for the <strong>general price list</strong> (GPL): the written menu of goods and services. The FTC Funeral Rule says you should be able to see it. You may also buy a casket or urn elsewhere; the funeral home cannot refuse to use it or add a fee just for that.",
    howP2: "You do not have to buy a whole “package.” You can take the basic fee, the transfer, and a direct cremation, and skip the viewing. You can want the viewing and a simple casket. The right price is the lines you will actually use.",
    howP3: "If someone gives you a spoken total, ask that it match the GPL. An internet average does not replace that sheet.",
    numsH: "National figures, read carefully",
    numsP: "There are two public sets, from different years, that measure different things. We do not mash them into one “2026 price.” Read them as a size check, not as a quote from a funeral home.",
    nfdaH: "NFDA 2023 medians (funeral with viewing)",
    nfdaP: "A <strong>median</strong> is the middle value: half of the cases were lower, half were higher. For 2023 the NFDA published <strong>$8,300</strong> for a funeral with viewing and burial, and <strong>$6,280</strong> for a funeral with viewing and cremation. Those figures are the funeral-home package. They are not trying to guess the plot or the marker.",
    nfdaKicker1: "2023 median",
    nfdaKicker2: "2023 median",
    nfda1: "Funeral with viewing and burial",
    nfda2: "Funeral with viewing and cremation",
    nfdaLearn: "What to take from this: a funeral with a visit and a service is a multi-thousand-dollar bill, and cremation with the same kind of service is not “free” — it is still a large bill, only lower than burial with a viewing.",
    nfdaNote: "Some trade write-ups of that same study mention a higher total when a vault is added. We could not reopen NFDA’s original press page when this page was written, so we do not publish that extra figure. Confirm a vault on the GPL and with the cemetery.",
    foH: "State package averages (Funeralocity, July 2026)",
    foP: "An <strong>average</strong> adds the values and divides. Funeralocity publishes a package average by state for four arrangements. The chart below is the average of those 50 states plus D.C., all as of July 2026. It includes paths with no viewing, which the NFDA “with viewing” median does not show.",
    foChartAria: "Average funeral package prices by type, July 2026",
    bar1: "Funeral with service, burial",
    bar2: "Burial with no viewing",
    bar3: "Funeral with service, cremation",
    bar4: "Cremation with no service",
    foLearn: "What to take from this: skipping the viewing lowers the bill in a clear way. Direct cremation is, on average, the lowest of these four paths. A funeral with service and burial is the highest. Your city can sit outside that order.",
    foRange: "Across those states, the full-service burial package averaged from about $7,554 (Oregon) to about $9,697 (Minnesota). Direct cremation averaged from about $1,332 (Oregon) to about $3,183 (North Dakota). That is spread, not a quote.",
    extraH: "What is usually extra",
    extraP: "Even after you pay the funeral-home package, the cemetery may bill a plot, opening and closing, an outer container if required, and the marker. Flowers, food, and family travel are usually not in those medians either. Add those lines and the total can sit well above $8,300 or $6,280.",
    extra1H: "Cemetery",
    extra1P: "Plot or niche, open and close, and sometimes rules about a vault or marker style.",
    extra2H: "Casket or urn",
    extra2P: "A display model can cost far more than a simple container. You may buy it elsewhere.",
    extra3H: "After the service",
    extra3P: "Obituary, flowers, a reception, clergy, and a plane ticket for a child who lives far away.",
    varyH: "Why your city will not match the average",
    varyP: "Cost follows the local market: how many funeral homes compete, whether there is an on-site crematory, land prices, and what the family chooses. An expensive state average does not mean every town in that state is expensive. Ask for two or three GPLs. Use the <a href=\"" +
      estimator +
      "\">funeral cost calculator</a> for a state-level estimate, not as an invoice.",
    statesSummary: "See Funeralocity’s average in every state (July 2026)",
    statesCaption: "Funeralocity listed package averages, July 2026. Not a quote from a funeral home.",
    thState: "State",
    statesFoot: "Rounded to the nearest dollar. These are listed package averages, not a legal minimum or a ceiling. Cemetery and extras may be missing.",
    limitsH: "What these figures do not forecast",
    limitsP: "Funeral prices move with the rest of the economy. The Bureau of Labor Statistics publishes a funeral-expenses index, but one year’s change is not a promise for the next 30. We do not draw a line to 2056: the future is not on today’s GPL.",
    limitsP2: "NFDA projected that in 2025 cremation would be 63.4% of dispositions and burial 31.6%. That describes what families choose, not an automatic discount. “Green” funerals interest many people; we do not publish a national price because there is no verified median that covers them.",
    faqTitle: "Frequently asked questions",
    faq1q: "What is usually the lowest-cost path?",
    faq1a: "In Funeralocity’s July 2026 averages, cremation with no service is the lowest of the four packages. That does not require anyone to choose it, and a given funeral home may charge more or less.",
    faq2q: "Does the $8,300 include the cemetery plot?",
    faq2a: "Usually no. The 2023 NFDA median is a funeral with viewing and burial on the funeral-home side. Plot, opening, vault, and marker are usually other bills.",
    faq3q: "Can I buy the casket somewhere else?",
    faq3a: "Yes. The FTC Funeral Rule lets you bring a casket or urn bought elsewhere. The funeral home cannot refuse to use it or add a fee just for that.",
    faq4q: "Why do two funeral homes in the same city charge different amounts?",
    faq4a: "They bundle different lines, have different costs, and compete differently. Compare GPLs, not one spoken total.",
    faq5q: "Will funeral prices double in 30 years?",
    faq5a: "We do not know, and we do not publish that forecast. Use today’s GPL and, if you want a cushion, leave cash or a separate contract. Past inflation does not lock in the future.",
    faq6q: "Does Social Security pay for the funeral?",
    faq6a: "It may pay $255 once if its rules are met. That does not cover a typical funeral.",
    faq7q: "Does Medicare pay for the funeral?",
    faq7a: "Medicare is medical insurance. We do not treat it here as a funeral plan. More detail in the guide on <a href=\"" +
      payPage +
      "\">how Medicare relates to final expenses</a>.",
    faq8q: "Does the VA help with a Veteran’s burial?",
    faq8a: "Sometimes, if Department of Veterans Affairs rules are met. For a non-service-connected death on or after October 1, 2025, VA publishes a $1,002 burial allowance and $1,002 for a plot. For a service-connected death (on or after September 11, 2001), the published burial maximum is $2,000. Eligibility is not automatic. Confirm on the <a href=\"https://www.va.gov/burials-memorials/veterans-burial-allowance/\" rel=\"noopener\" target=\"_blank\">VA page</a>.",
    faq9q: "Can I deduct funeral costs on my income tax return?",
    faq9a: "Generally not as a personal expense on a survivor’s Form 1040. Some estate-tax rules are different. <a href=\"https://www.irs.gov/publications/p559\" rel=\"noopener\" target=\"_blank\">IRS Publication 559</a> covers survivors. This is not tax advice.",
    faq10q: "Is an autopsy required in order to have a funeral?",
    faq10a: "The funeral itself does not require an autopsy. A medical examiner or coroner may order one under state rules and the circumstances of the death. That is not a funeral-home “package extra.”",
    faq11q: "Is final expense insurance the same as prepaying at the funeral home?",
    faq11a: "No. A <strong>prepaid funeral</strong> is a contract with a funeral home for goods or services. Final expense insurance is a life policy: it pays cash to the person you named. Compare both in the <a href=\"" +
      prepaid +
      "\">prepaid funeral guide</a>.",
    faq12q: "How much insurance should I buy?",
    faq12a: "Start with a local GPL, add cemetery and a cushion if you want travel or small debts, then look at the monthly premium you can keep. A national average is not your amount. The <a href=\"" +
      estimator +
      "\">calculator</a> helps size the bill; a quote confirms the premium.",
    payH: "How families pay that bill",
    payP: "Families use savings, a joint account, a collection, a contract already paid at a funeral home, Veteran benefits if they apply, or cash from a life policy. None of those paths is “the right one” for everyone. What changes is who controls the money and what is tied to one provider.",
    pay1H: "Savings or an account",
    pay1P: "If the money is already set aside and the family can use it at the time, you may not need a new product of the same size.",
    pay2H: "A funeral-home contract",
    pay2P: "A prepay can lock goods or services with one provider. If you move, that contract can be hard to move. It is not life insurance.",
    pay3H: "Cash from a policy",
    pay3P: "The beneficiary receives money and decides how to spend it. The funeral home is paid only if that person pays them.",
    insH: "If you want to leave cash, not a package",
    insP1: "<strong>Final expense insurance</strong> is a small <strong>whole life</strong> policy: coverage that does not end after 10 or 20 years if you pay on time. The <strong>premium</strong> is the regular payment. The <strong>beneficiary</strong> is the person you name. The <strong>death benefit</strong> is the cash that person receives. It does not reserve a service at a specific funeral home.",
    insP2: "That product is taught in full on <a href=\"" +
      L.fe +
      "\">final expense insurance</a>. Monthly price — age, health, tobacco, amount — is on the <a href=\"" +
      premiumGuide +
      "\">insurance cost guide</a>. If the goal is only a cremation, see also <a href=\"" +
      crem +
      "\">cremation insurance</a>: at the companies we quote it is the same kind of policy, not a crematory package.",
    nextH: "Next step",
    nextLead: "Get a free quote for your age and health, or schedule a call with Mejor Vida Insurance.",
    nextMore:
      "Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page. This page does not quote a funeral home.",
    nextPrimary: "Get a free quote",
    nextPrimaryHref: L.quote,
    nextSecondary: "Schedule a call",
    nextSecondaryHref: L.schedule,
    quoteTitle: "Estimate the cost",
    quote1: "Typical prices by state",
    quote2: "Burial and cremation",
    quoteCta: "Calculate now",
    srcTitle: "Sources",
    src1: '<a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA: statistics</a> — 2023 medians for a funeral with viewing and burial ($8,300) or cremation ($6,280); 2025 cremation share projected at 63.4%.',
    src2: '<a href="https://www.funeralocity.com/average-funeral-price" rel="noopener" target="_blank">Funeralocity: average funeral price</a> — state package figures (July 2026 capture on this page).',
    src3: '<a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC: Funeral Rule</a> — GPL, buy only what you need, casket or urn from another seller.',
    src4: '<a href="https://consumer.ftc.gov/articles/types-funerals" rel="noopener" target="_blank">FTC: types of funerals</a> — traditional funeral, direct burial, and direct cremation.',
    src5: '<a href="https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" rel="noopener" target="_blank">SSA: lump-sum death payment</a> — $255 if the rules apply.',
    src6: '<a href="https://www.va.gov/burials-memorials/veterans-burial-allowance/" rel="noopener" target="_blank">VA: burial allowance</a> — amounts by date of death and whether the death was service-connected.',
    src7: '<a href="https://www.irs.gov/publications/p559" rel="noopener" target="_blank">IRS Publication 559</a> — survivors; funeral costs are generally not a personal 1040 deduction.',
    discTitle: "Disclosure",
    discBody:
      "This page is educational. Funeral-home and cemetery prices are set by each provider. National figures are not a quote. Life insurance, when mentioned, changes by age, health, tobacco, amount, product, and state. Mejor Vida Insurance LLC is an independent agency (NPN 21695431). Current licenses are on the <a href=\"" +
      L.licenses +
      "\">licenses</a> page.",
  };
}

function funeralCostMain(lang, page, c) {
  const isEs = lang === "es";
  const L = LINKS[lang];
  const assets = isEs ? "" : "../";
  const home = "index.html";
  const fo = loadFuneralocityStates();
  const related = isEs
    ? `<p class="lic-rate-note">Más en esta sección:
<a href="final-expense-estimator.html">Calculadora</a> ·
<a href="${L.fe}">Seguro de gastos finales</a> ·
<a href="blog/cuanto-cuesta-seguro-gastos-finales.html">Precio del seguro</a> ·
<a href="blog/final-expense-vs-prepagado-funerario-2026-07-19.html">Prepagado</a> ·
<a href="seguro-para-cremacion.html">Cremación</a></p>`
    : `<p class="lic-rate-note">More in this section:
<a href="final-expense-estimator.html">Calculator</a> ·
<a href="${L.fe}">Final expense</a> ·
<a href="final-expense-cost.html">Insurance cost</a> ·
<a href="blog/final-expense-vs-prepaid-funeral-2026-07-19.html">Prepaid</a> ·
<a href="cremation-insurance.html">Cremation</a></p>`;
  return `<main>
<section class="lic-hero">
<div class="lic-hero-media lic-hero-media--${page.hero.modifier}" aria-hidden="true">
<picture>
<source srcset="${assets}img/opt/${page.hero.base}.webp?v=${page.hero.cache}" type="image/webp"/>
<img src="${assets}img/opt/${page.hero.base}.jpg?v=${page.hero.cache}" alt="" width="${page.hero.width}" height="${page.hero.height}" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb"><a href="${home}">${isEs ? "Inicio" : "Home"}</a> › ${c.crumbEnd}</p>
<h1>${c.h1}</h1>
<p class="lic-hero-lead">${c.lead}</p>
</div>
</div>
</section>
<div class="lic-layout lic-layout--split lic-layout--clear">
<div class="lic-main">
<nav class="lic-toc-bar" aria-label="${isEs ? "En esta página" : "On this page"}">
<a href="#need">${isEs ? "La factura" : "The bill"}</a>
<a href="#what">${isEs ? "Qué incluye" : "What’s included"}</a>
<a href="#how">${isEs ? "Cómo se cotiza" : "How it’s quoted"}</a>
<a href="#numbers">${isEs ? "Cifras" : "Figures"}</a>
<a href="#faq">${isEs ? "Preguntas" : "Questions"}</a>
<a href="#pay">${isEs ? "Cómo pagar" : "How to pay"}</a>
</nav>
<div class="lic-takeaways">
<h2>${isEs ? "Tres hechos para empezar" : "Three facts to start with"}</h2>
<ul>
<li>${c.take1}</li>
<li>${c.take2}</li>
<li>${c.take3}</li>
</ul>
</div>
<div class="lic-helpful"><p>${c.callout}</p></div>
<section class="lic-section" id="need">
<h2>${c.needH}</h2>
<p>${c.needP1}</p>
<p>${c.needP2}</p>
</section>
<section class="lic-section" id="what">
<h2>${c.whatH}</h2>
<p>${c.whatP1}</p>
<p>${c.whatP2}</p>
<div class="lic-fact-trio">
<div><h3>${c.fact1H}</h3><p>${c.fact1P}</p></div>
<div><h3>${c.fact2H}</h3><p>${c.fact2P}</p></div>
<div><h3>${c.fact3H}</h3><p>${c.fact3P}</p></div>
</div>
</section>
<section class="lic-section" id="how">
<h2>${c.howH}</h2>
<p>${c.howP1}</p>
<p>${c.howP2}</p>
<p>${c.howP3}</p>
</section>
<section class="lic-section" id="numbers">
<h2>${c.numsH}</h2>
<p>${c.numsP}</p>
<h3>${c.nfdaH}</h3>
<p>${c.nfdaP}</p>
${nfdaCardsHtml(c)}
<p class="lic-cost-lesson">${c.nfdaLearn}</p>
<p class="lic-factor__gap">${c.nfdaNote}</p>
<h3>${c.foH}</h3>
<p>${c.foP}</p>
${foBarsHtml(c, fo)}
<p class="lic-cost-lesson">${c.foLearn}</p>
<p>${c.foRange}</p>
</section>
<section class="lic-section" id="extras">
<h2>${c.extraH}</h2>
<p>${c.extraP}</p>
<div class="lic-fact-trio">
<div><h3>${c.extra1H}</h3><p>${c.extra1P}</p></div>
<div><h3>${c.extra2H}</h3><p>${c.extra2P}</p></div>
<div><h3>${c.extra3H}</h3><p>${c.extra3P}</p></div>
</div>
</section>
<section class="lic-section" id="vary">
<h2>${c.varyH}</h2>
<p>${c.varyP}</p>
${stateTableHtml(c, fo)}
</section>
<section class="lic-section" id="limits">
<h2>${c.limitsH}</h2>
<p>${c.limitsP}</p>
<p>${c.limitsP2}</p>
</section>
<section class="lic-section lic-faq" id="faq">
<h2>${c.faqTitle}</h2>
${faqsHtml(c)}
</section>
<section class="lic-section" id="pay">
<h2>${c.payH}</h2>
<p>${c.payP}</p>
<div class="lic-fact-trio">
<div><h3>${c.pay1H}</h3><p>${c.pay1P}</p></div>
<div><h3>${c.pay2H}</h3><p>${c.pay2P}</p></div>
<div><h3>${c.pay3H}</h3><p>${c.pay3P}</p></div>
</div>
</section>
<section class="lic-section" id="insurance">
<h2>${c.insH}</h2>
<p>${c.insP1}</p>
<p>${c.insP2}</p>
</section>
${nextStepBandHtml(lang, c, { quoteHref: c.nextPrimaryHref })}
<section class="lic-section" id="disclosures">
<h2>${c.discTitle}</h2>
<p>${c.discBody}</p>
</section>
<section class="lic-section" id="sources">
<h2>${c.srcTitle}</h2>
<ul>
${[c.src1, c.src2, c.src3, c.src4, c.src5, c.src6, c.src7].filter(Boolean).map((s) => `<li>${s}</li>`).join("\n")}
</ul>
</section>
${related}
</div>
${quoteRailHtml({
    lang,
    title: c.quoteTitle,
    line1: c.quote1,
    line2: c.quote2,
    quoteHref: "final-expense-estimator.html",
    cta: c.quoteCta,
  })}
</div>
</main>`;
}

module.exports = { copyFuneralCost, funeralCostMain };
