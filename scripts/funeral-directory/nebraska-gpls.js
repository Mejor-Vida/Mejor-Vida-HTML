/**
 * First-party Nebraska GPL overlays for the funeral-resource directory.
 * Copy only published packages from the funeral home. Do not invent dollars.
 * Match by home name (and city when set).
 */
module.exports = [
  {
    name: "Colonial Chapel Funeral Home",
    city: "Lincoln",
    gplKind: "gpl",
    gplHref: "https://my.gather.app/gpl/colonial-chapel-funeral-home",
    gplDateEs: "21 feb. 2024",
    gplDateEn: "Feb 21, 2024",
    sourceEs:
      "Colonial Chapel: lista general de precios Gather vigente 21 feb. 2024. Ataúd, bóveda y lote aparte salvo que la nota lo diga.",
    sourceEn:
      "Colonial Chapel: Gather general price list dated Feb 21, 2024. Casket, vault, and plot extra unless a note says otherwise.",
    packages: [
      {
        id: "directCremation",
        labelEs: "Cremación directa",
        labelEn: "Direct cremation",
        amt: 2595,
        noteEs: "Servicios, traslado, refrigeración, tarifa de cremación y contenedor sencillo.",
        noteEn: "Services, transfer, refrigeration, cremation fee, and a simple container.",
      },
      {
        id: "immediateBurial",
        labelEs: "Entierro inmediato",
        labelEn: "Immediate burial",
        amt: 3555,
        noteEs: "Servicios, traslado, arreglo y carroza. Ataúd y lote aparte.",
        noteEn: "Services, transfer, preparation, and funeral coach. Casket and plot extra.",
      },
      {
        id: "memorialCremation",
        labelEs: "Cremación con memorial",
        labelEn: "Cremation with memorial",
        amt: 4130,
        noteEs: "Servicios, traslado, refrigeración, memorial, cremación y contenedor sencillo.",
        noteEn: "Services, transfer, refrigeration, memorial, cremation, and a simple container.",
      },
      {
        id: "traditional",
        labelEs: "Funeral tradicional con velatorio",
        labelEn: "Traditional funeral with visitation",
        amt: 5875,
        noteEs: "Servicios, traslado, embalsamado, arreglo, ceremonia y pie de tumba. Ataúd aparte.",
        noteEn: "Services, transfer, embalming, preparation, ceremony, and graveside. Casket extra.",
      },
      {
        id: "graveside",
        labelEs: "Servicio a pie de tumba",
        labelEn: "Graveside service",
        amt: 4845,
        noteEs: "Servicios, traslado, embalsamado, arreglo y pie de tumba. Ataúd aparte.",
        noteEn: "Services, transfer, embalming, preparation, and graveside. Casket extra.",
      },
      {
        id: "funeralThenCremation",
        labelEs: "Funeral tradicional seguido de cremación",
        labelEn: "Traditional funeral followed by cremation",
        amt: 6630,
        noteEs: "Ceremonia con ataúd ceremonial, luego cremación. Urna y lote aparte.",
        noteEn: "Ceremony with a ceremonial casket, then cremation. Urn and plot extra.",
      },
    ],
  },
  {
    name: "Lincoln Family Funeral Care",
    city: "Lincoln",
    gplKind: "gpl",
    gplHref: "https://my.gather.app/gpl/lincoln-family-funeral-care",
    gplDateEs: "19 oct. 2022",
    gplDateEn: "Oct 19, 2022",
    sourceEs:
      "Lincoln Family Funeral Care: lista general de precios Gather vigente 19 oct. 2022. Ataúd y bóveda aparte en los renglones comparables.",
    sourceEn:
      "Lincoln Family Funeral Care: Gather general price list dated Oct 19, 2022. Casket and vault extra on the comparable lines.",
    packages: [
      {
        id: "directCremation",
        labelEs: "Cremación directa",
        labelEn: "Direct cremation",
        amt: 1795,
        noteEs: "Servicios, traslado, refrigeración 48 h, cremación y contenedor sencillo.",
        noteEn: "Services, transfer, 48-hour refrigeration, cremation, and a simple container.",
      },
      {
        id: "immediateBurial",
        labelEs: "Entierro inmediato",
        labelEn: "Immediate burial",
        amt: 2650,
        noteEs: "Retiro, autorizaciones, servicios y transporte al cementerio. Ataúd y bóveda aparte.",
        noteEn: "Removal, authorizations, staff, and transport to the cemetery. Casket and vault extra.",
      },
      {
        id: "memorialCremation",
        labelEs: "Cremación con memorial",
        labelEn: "Cremation with memorial",
        amt: 3260,
        noteEs: "Servicios, traslado, refrigeración, memorial y tarifa de cremación.",
        noteEn: "Services, transfer, refrigeration, memorial service, and cremation fee.",
      },
      {
        id: "traditional",
        labelEs: "Funeral tradicional con velatorio",
        labelEn: "Traditional funeral with visitation",
        amt: 4790,
        noteEs: "Servicios, traslado, embalsamado, velatorio y ceremonia. Ataúd y bóveda aparte.",
        noteEn: "Services, transfer, embalming, visitation, and ceremony. Casket and vault extra.",
      },
      {
        id: "graveside",
        labelEs: "Servicio a pie de tumba",
        labelEn: "Graveside service",
        amt: 4100,
        noteEs: "Servicios, traslado, embalsamado y pie de tumba. Ataúd aparte.",
        noteEn: "Services, transfer, embalming, and graveside. Casket extra.",
      },
      {
        id: "funeralThenCremation",
        labelEs: "Funeral tradicional seguido de cremación",
        labelEn: "Traditional funeral followed by cremation",
        amt: 5755,
        noteEs: "Velatorio y ceremonia, luego cremación. Urna aparte.",
        noteEn: "Visitation and ceremony, then cremation. Urn extra.",
      },
    ],
  },
  {
    name: "Aspen Aftercare, Inc",
    city: "Lincoln",
    gplKind: "gpl",
    gplHref: "https://aspenaftercare.com/prices/",
    gplDateEs: "18 sep. 2026",
    gplDateEn: "Sep 18, 2026",
    sourceEs:
      "Aspen Aftercare: página de precios, 18 sep. 2026. Casa de cremación: no publica entierro inmediato ni funeral tradicional.",
    sourceEn:
      "Aspen Aftercare: prices page, Sep 18, 2026. Cremation home: no published immediate burial or traditional funeral.",
    packages: [
      {
        id: "directCremation",
        labelEs: "Cremación directa",
        labelEn: "Direct cremation",
        amt: 1800,
        noteEs: "Paquete C-1 Basic Cremation. Servicios profesionales de la casa.",
        noteEn: "C-1 Basic Cremation package. Professional services of the home.",
      },
      {
        id: "memorialCremation",
        labelEs: "Cremación con memorial",
        labelEn: "Cremation with memorial",
        amt: 2595,
        noteEs: "Paquete C-3a: cremación y reunión (open house) en Aspen.",
        noteEn: "C-3a: cremation with a gathering (open house) at Aspen.",
      },
    ],
  },
  {
    name: "Griffiths-Hovendick Chapel - Beatrice",
    city: "Beatrice",
    gplKind: "gpl",
    gplHref: "https://my.gather.app/gpl/griffiths-hovendick-chapel",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Griffiths-Hovendick Chapel (Beatrice): lista general de precios Gather. No publican un renglón de entierro inmediato.",
    sourceEn:
      "Griffiths-Hovendick Chapel (Beatrice): Gather general price list. No published immediate-burial line.",
    packages: [
      {
        id: "directCremation",
        labelEs: "Cremación directa",
        labelEn: "Direct cremation",
        amt: 2675,
        noteEs: "Servicios básicos, retiro local, traslado al crematorio y cremación.",
        noteEn: "Basic services, local removal, transport to the crematory, and cremation.",
      },
      {
        id: "memorialCremation",
        labelEs: "Cremación con memorial",
        labelEn: "Cremation with memorial",
        amt: 5225,
        noteEs: "Servicios, visita, cremación, materiales impresos y memorial.",
        noteEn: "Services, visitation, cremation, printed materials, and memorial service.",
      },
      {
        id: "traditional",
        labelEs: "Funeral tradicional con velatorio",
        labelEn: "Traditional funeral with visitation",
        amt: 6140,
        noteEs: "Standard Funeral Service. Ataúd y lote aparte.",
        noteEn: "Standard Funeral Service. Casket and plot extra.",
      },
    ],
  },
  {
    name: "Laughlin-Hoevet Funeral Home",
    city: "Wymore",
    gplKind: "gpl",
    gplHref: "https://my.gather.app/gpl/laughlin-hoevet-funeral-home",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Laughlin-Hoevet: lista general de precios Gather. No publican un renglón de entierro inmediato.",
    sourceEn:
      "Laughlin-Hoevet: Gather general price list. No published immediate-burial line.",
    packages: [
      {
        id: "directCremation",
        labelEs: "Cremación directa",
        labelEn: "Direct cremation",
        amt: 2675,
        noteEs: "Servicios básicos, retiro local, traslado al crematorio y cremación.",
        noteEn: "Basic services, local removal, transport to the crematory, and cremation.",
      },
      {
        id: "memorialCremation",
        labelEs: "Cremación con memorial",
        labelEn: "Cremation with memorial",
        amt: 5225,
        noteEs: "Servicios, visita, cremación, materiales impresos y memorial.",
        noteEn: "Services, visitation, cremation, printed materials, and memorial service.",
      },
      {
        id: "traditional",
        labelEs: "Funeral tradicional con velatorio",
        labelEn: "Traditional funeral with visitation",
        amt: 6140,
        noteEs: "Standard Funeral Service. Ataúd y lote aparte.",
        noteEn: "Standard Funeral Service. Casket and plot extra.",
      },
    ],
  },
];
