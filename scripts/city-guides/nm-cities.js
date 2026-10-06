/**
 * New Mexico city guides. Estimator column is New Mexico Funeralocity averages
 * (captured 26 Jul 2026). No local home publishes a first-party four-package list here,
 * so the chart is estimator-only.
 */
const { makeCity } = require("./nm-factory");

const HERO = {
  heroVer: "landmark-v1",
};

const CITIES = [
  {
    "slug": "albuquerque",
    "name": "Albuquerque"
  },
  {
    "slug": "las-cruces",
    "name": "Las Cruces"
  },
  {
    "slug": "rio-rancho",
    "name": "Rio Rancho"
  },
  {
    "slug": "santa-fe",
    "name": "Santa Fe"
  }
];

function near(except) {
  return CITIES.filter((c) => c.slug !== except);
}

const shared = {
  analysisSameEs:
    "Un paquete con el mismo nombre puede incluir o no el ataúd, la urna o el velatorio. Lea la lista de esa funeraria. El lote del cementerio no va en ninguno.",
  analysisSameEn:
    "A package with the same name may or may not include the casket, urn, or visitation. Read that funeral home’s list. The cemetery plot is in none of them.",
  prepaidCemEs: "o en el cementerio que elija",
  prepaidCemEn: "or at the cemetery you choose",
  tableFootEs:
    "La columna del estimador son promedios de Nuevo México de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
  tableFootEn:
    "The estimator column is New Mexico Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/new-mexico",
};

module.exports = [
  makeCity({
    ...shared,
    ...HERO,
    slug: "albuquerque",
    heroFile: "albuquerque-sandia-tram",
    heroClass: "sc-hero--albuquerque",
    heroW: 1200,
    heroH: 900,
    nameEn: "Albuquerque",
    heroCaptionEs: "Tranvía de Sandia Peak, Albuquerque",
    heroCaptionEn: "Sandia Peak Tramway, Albuquerque",
    countyEs: "condado de Bernalillo",
    countyEn: "Bernalillo County",
    metroEs: ["Albuquerque","Los Ranchos","North Valley","South Valley"],
    metroEn: ["Albuquerque","Los Ranchos","North Valley","South Valley"],
    metroTitleEs: "Albuquerque y el condado de Bernalillo",
    metroTitleEn: "Albuquerque and Bernalillo County",
    nearbyGuides: near("albuquerque"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio en el cementerio. Esta guía no publica un precio de lote nuevo para Albuquerque. Pida la lista en el cementerio que elija. Abrir y cerrar, la bóveda y la lápida son cargos aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the cemetery space. This guide does not publish a new-lot price for Albuquerque. Ask the cemetery you choose for its list. Opening and closing, the vault, and the marker are separate charges.",
    officesNoteEs: "Estas cifras serían del cementerio, no de la funeraria. No hay un precio de lote nuevo publicado para Albuquerque en esta página.",
    officesNoteEn: "These figures would come from the cemetery, not the funeral home. This page does not have a published new-lot price for Albuquerque.",
    newListEs: "No hay un precio de lote nuevo publicado para Albuquerque en esta guía. Llame al cementerio que elija y pida la lista por escrito. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    newListEn: "This guide does not have a published new-lot price for Albuquerque. Call the cemetery you choose and ask for the list in writing. Private-party ads are on the New Mexico Grave Solutions board.",
    officesEs: ["Albuquerque. Lote nuevo: pida la lista en el cementerio que elija."],
    officesEn: ["Albuquerque. New lot: ask the cemetery you choose for the list."],
    analysisPlotEs: "El lote no está en el promedio de la funeraria. En Albuquerque no hay un precio de lote nuevo publicado en esta guía. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    analysisPlotEn: "The plot is not in the funeral-home average. This guide does not have a published new-lot price for Albuquerque. Private-party ads are on the New Mexico Grave Solutions board.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "las-cruces",
    heroFile: "las-cruces-organ-mountains",
    heroClass: "sc-hero--las-cruces",
    heroW: 1600,
    heroH: 690,
    nameEn: "Las Cruces",
    heroCaptionEs: "Montañas Organ, Las Cruces",
    heroCaptionEn: "Organ Mountains, Las Cruces",
    countyEs: "condado de Doña Ana",
    countyEn: "Doña Ana County",
    metroEs: ["Las Cruces","Mesilla","Anthony","Sunland Park"],
    metroEn: ["Las Cruces","Mesilla","Anthony","Sunland Park"],
    metroTitleEs: "Las Cruces y el condado de Doña Ana",
    metroTitleEn: "Las Cruces and Doña Ana County",
    nearbyGuides: near("las-cruces"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio. El 28 de septiembre de 2026, anuncios de particulares para Hillcrest Memorial Gardens, en Las Cruces, pedían $10,000 y $11,500 por dos espacios juntos. Eso es lo que pide el vendedor, no la lista del cementerio. Abrir y cerrar, la bóveda y la lápida van aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the space. On September 28, 2026, private ads for Hillcrest Memorial Gardens in Las Cruces asked $10,000 and $11,500 for two spaces together. Those are asking prices, not the cemetery’s price list. Opening and closing, the vault, and the marker are extra.",
    officesNoteEs: "Esas cifras son anuncios de particulares para dos espacios juntos. No son un precio de lote nuevo del cementerio.",
    officesNoteEn: "Those figures are private ads for two spaces together. They are not a new-lot price from the cemetery.",
    newListEs: "El 28 de septiembre de 2026, Grave Solutions mostraba dos anuncios activos en Hillcrest Memorial Gardens, Las Cruces: $10,000 y $11,500, cada uno por dos espacios juntos. Pida a la oficina del cementerio la lista de lotes nuevos y confirme que el anuncio sigue vigente.",
    newListEn: "On September 28, 2026, Grave Solutions showed two active ads at Hillcrest Memorial Gardens, Las Cruces: $10,000 and $11,500, each for two spaces together. Ask the cemetery office for the new-lot list and confirm the ad is still active.",
    officesEs: ["Hillcrest Memorial Gardens, Las Cruces. Reventa vista el 28 de septiembre de 2026: $10,000 o $11,500 por dos espacios juntos. Lote nuevo: pida la lista en la oficina."],
    officesEn: ["Hillcrest Memorial Gardens, Las Cruces. Resale seen September 28, 2026: $10,000 or $11,500 for two spaces together. New lot: ask the office for the list."],
    analysisPlotEs: "El 28 de septiembre de 2026, anuncios de particulares en Hillcrest Memorial Gardens pedían <strong>$10,000</strong> y <strong>$11,500</strong> por dos espacios juntos. Eso no está en el promedio de la funeraria. Abrir y cerrar, la bóveda y la lápida van aparte.",
    analysisPlotEn: "On September 28, 2026, private ads at Hillcrest Memorial Gardens asked <strong>$10,000</strong> and <strong>$11,500</strong> for two spaces together. That is not in the funeral-home average. Opening and closing, the vault, and the marker are extra.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "rio-rancho",
    heroFile: "rio-rancho-welcome-sign",
    heroClass: "sc-hero--rio-rancho",
    heroW: 1600,
    heroH: 900,
    nameEn: "Rio Rancho",
    heroCaptionEs: "Letrero de bienvenida de Rio Rancho",
    heroCaptionEn: "Rio Rancho welcome sign",
    countyEs: "condado de Sandoval",
    countyEn: "Sandoval County",
    metroEs: ["Rio Rancho","Bernalillo","Corrales","Placitas"],
    metroEn: ["Rio Rancho","Bernalillo","Corrales","Placitas"],
    metroTitleEs: "Rio Rancho y el condado de Sandoval",
    metroTitleEn: "Rio Rancho and Sandoval County",
    nearbyGuides: near("rio-rancho"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio en el cementerio. Esta guía no publica un precio de lote nuevo para Rio Rancho. Pida la lista en el cementerio que elija. Abrir y cerrar, la bóveda y la lápida son cargos aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the cemetery space. This guide does not publish a new-lot price for Rio Rancho. Ask the cemetery you choose for its list. Opening and closing, the vault, and the marker are separate charges.",
    officesNoteEs: "Estas cifras serían del cementerio, no de la funeraria. No hay un precio de lote nuevo publicado para Rio Rancho en esta página.",
    officesNoteEn: "These figures would come from the cemetery, not the funeral home. This page does not have a published new-lot price for Rio Rancho.",
    newListEs: "No hay un precio de lote nuevo publicado para Rio Rancho en esta guía. Llame al cementerio que elija y pida la lista por escrito. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    newListEn: "This guide does not have a published new-lot price for Rio Rancho. Call the cemetery you choose and ask for the list in writing. Private-party ads are on the New Mexico Grave Solutions board.",
    officesEs: ["Rio Rancho. Lote nuevo: pida la lista en el cementerio que elija."],
    officesEn: ["Rio Rancho. New lot: ask the cemetery you choose for the list."],
    analysisPlotEs: "El lote no está en el promedio de la funeraria. En Rio Rancho no hay un precio de lote nuevo publicado en esta guía. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    analysisPlotEn: "The plot is not in the funeral-home average. This guide does not have a published new-lot price for Rio Rancho. Private-party ads are on the New Mexico Grave Solutions board.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "santa-fe",
    heroFile: "santa-fe-palace",
    heroClass: "sc-hero--santa-fe",
    heroW: 1448,
    heroH: 900,
    nameEn: "Santa Fe",
    heroCaptionEs: "Palacio de los Gobernadores, Santa Fe",
    heroCaptionEn: "Palace of the Governors, Santa Fe",
    countyEs: "condado de Santa Fe",
    countyEn: "Santa Fe County",
    metroEs: ["Santa Fe","Eldorado","Agua Fria","La Cienega"],
    metroEn: ["Santa Fe","Eldorado","Agua Fria","La Cienega"],
    metroTitleEs: "Santa Fe y el condado de Santa Fe",
    metroTitleEn: "Santa Fe and Santa Fe County",
    nearbyGuides: near("santa-fe"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio en el cementerio. Esta guía no publica un precio de lote nuevo para Santa Fe. Pida la lista en el cementerio que elija. Abrir y cerrar, la bóveda y la lápida son cargos aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the cemetery space. This guide does not publish a new-lot price for Santa Fe. Ask the cemetery you choose for its list. Opening and closing, the vault, and the marker are separate charges.",
    officesNoteEs: "Estas cifras serían del cementerio, no de la funeraria. No hay un precio de lote nuevo publicado para Santa Fe en esta página.",
    officesNoteEn: "These figures would come from the cemetery, not the funeral home. This page does not have a published new-lot price for Santa Fe.",
    newListEs: "No hay un precio de lote nuevo publicado para Santa Fe en esta guía. Llame al cementerio que elija y pida la lista por escrito. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    newListEn: "This guide does not have a published new-lot price for Santa Fe. Call the cemetery you choose and ask for the list in writing. Private-party ads are on the New Mexico Grave Solutions board.",
    officesEs: ["Santa Fe. Lote nuevo: pida la lista en el cementerio que elija."],
    officesEn: ["Santa Fe. New lot: ask the cemetery you choose for the list."],
    analysisPlotEs: "El lote no está en el promedio de la funeraria. En Santa Fe no hay un precio de lote nuevo publicado en esta guía. Los anuncios de particulares están en el tablero de Nuevo México de Grave Solutions.",
    analysisPlotEn: "The plot is not in the funeral-home average. This guide does not have a published new-lot price for Santa Fe. Private-party ads are on the New Mexico Grave Solutions board.",
    plotNew: null,
    plotResale: null,
  })
];
