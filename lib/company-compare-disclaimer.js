/**
 * Required legal note under any table that names or prices competing companies.
 * Funeral GPL republishing: FTC Funeral Rule (16 CFR 453) — the funeral provider’s
 * current GPL is the official list; this site is not the funeral provider.
 * Insurance company lists: NAIC Model 570 — no unfair/incomplete comparison,
 * no disparagement; appointed companies only; products differ.
 */
function funeralHomeCompareNote(lang) {
  if (lang === "es") {
    return `<aside class="sc-compare-legal" role="note">
<p><strong>Aviso de comparación.</strong> Esta tabla es educativa. No es una cotización, no es una oferta de bienes o servicios funerarios, y no es un funeral prepagado. Mejor Vida Seguros LLC es una agencia de seguros independiente. No está afiliada, ni es propiedad, ni está respaldada por las funerarias nombradas, y ellas no respaldan a Mejor Vida. Esto no es un plan pre-necesidad financiado con seguro de vida. Si se emite una póliza de gastos finales, paga efectivo a un beneficiario; puede usarlo en la funeraria que elija.</p>
<p>Las casas que aparecen son las que publican una lista general de precios o paquetes en internet. No son todas las funerarias del área, no es un ranking y no afirmamos que sean los precios más bajos. Las cifras se copian de la lista publicada de cada casa, con las fechas de la línea de fuentes. Un mismo nombre de paquete no incluye lo mismo. Propiedad en cementerio, apertura y cierre, bóveda, lápida, anticipos de efectivo, impuestos y certificados extra no van incluidos salvo que la celda lo diga. Los precios cambian. La lista general de precios vigente de la funeraria es el único precio oficial; la Regla Funeraria de la FTC le permite pedirla. La columna del estimador es un promedio de un tercero para Nebraska, no la cotización de una casa. No garantizamos que las cifras estén completas, vigentes o libres de error. Mejor Vida no fija estos precios y no responde por los bienes o servicios de esas empresas.</p>
</aside>`;
  }
  return `<aside class="sc-compare-legal" role="note">
<p><strong>Comparison notice.</strong> This table is educational. It is not a quote, not an offer to sell funeral goods or services, and not a prepaid funeral. Mejor Vida Insurance LLC is an independent insurance agency. We are not affiliated with, owned by, or endorsed by the funeral homes named here, and they do not endorse Mejor Vida. This is not a preneed funeral funded by life insurance. If a final expense policy is issued, it pays cash to a beneficiary; they may use it at any funeral home they choose.</p>
<p>Homes shown are ones that publish a general price list or package list online. This is not every funeral home in the area, not a ranking, and not a claim that these are the lowest prices available. Figures are copied from each home’s published list as of the source dates above. Packages with the same name do not include the same items. Cemetery property, opening and closing, vaults, markers, cash-advance items, taxes, and extra certificates are not included unless a cell says so. Prices change. The funeral home’s current general price list is the only official price; the FTC Funeral Rule lets you ask that home for it. The estimator column is a third-party Nebraska average, not that home’s quote. We do not warrant that these figures are complete, current, or error-free. Mejor Vida does not set these prices and is not responsible for those businesses’ goods or services.</p>
</aside>`;
}

function appointedCarrierCompareNote(lang) {
  if (lang === "es") {
    return `<aside class="sc-compare-legal" role="note">
<p><strong>Aviso de comparación.</strong> Esta lista es educativa. Muestra compañías de vida designadas que Mejor Vida Seguros puede cotizar, no todas las del mercado. Los puestos y puntajes son un compuesto de calificaciones de terceros (AM Best, Comdex, datos de quejas NAIC y J.D. Power cuando aparecen), no una afirmación de que una compañía sea la mejor para usted. Productos, precios, suscripción y disponibilidad varían por compañía y por estado. No es una comparación completa ni desleal de todas las pólizas, beneficios o tarifas. Mejor Vida Seguros LLC es una agencia independiente designada por estas compañías; no somos esas compañías y ellas no respaldan esta página. Las calificaciones cambian. Confirme productos vigentes y una cotización personal antes de comprar. No es una oferta vinculante.</p>
</aside>`;
  }
  return `<aside class="sc-compare-legal" role="note">
<p><strong>Comparison notice.</strong> This list is educational. It shows appointed life insurance companies Mejor Vida Insurance can quote, not every company in the market. Rankings and scores are a composite of third-party ratings (AM Best, Comdex, NAIC complaint data, and J.D. Power where shown), not a statement that one company is best for you. Products, prices, underwriting, and availability differ by company and state. This is not a complete comparison of all policies, benefits, or rates. Mejor Vida Insurance LLC is an independent agency appointed by these companies; we are not those companies and they do not endorse this page. Ratings change. Confirm current products and a personal quote before you buy. Not a binding offer.</p>
</aside>`;
}

function thirdPartyFuneralAverageNote(lang) {
  if (lang === "es") {
    return `<aside class="sc-compare-legal" role="note">
<p><strong>Aviso de comparación.</strong> Estas cifras son promedios estatales de un tercero, no la lista general de precios de una funeraria nombrada y no una cotización. Los paquetes y los ítems no son iguales de una casa a otra. Los precios cambian. Confirme la lista vigente con la funeraria que elija. Mejor Vida Seguros LLC no fijó estos precios y no garantiza que estén completos o al día.</p>
</aside>`;
  }
  return `<aside class="sc-compare-legal" role="note">
<p><strong>Comparison notice.</strong> These figures are third-party state averages, not a named funeral home’s general price list and not a quote. Packages and line items are not the same from home to home. Prices change. Confirm the current list with the funeral home you choose. Mejor Vida Insurance LLC did not set these prices and does not warrant that they are complete or current.</p>
</aside>`;
}

module.exports = {
  funeralHomeCompareNote,
  appointedCarrierCompareNote,
  thirdPartyFuneralAverageNote,
};
