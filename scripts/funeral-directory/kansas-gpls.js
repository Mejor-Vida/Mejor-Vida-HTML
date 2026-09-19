/**
 * First-party Kansas GPL overlays for the funeral-resource directory.
 * Copy only published packages from the funeral home. Do not invent dollars.
 * Match by home name (and city when set).
 */
function pkg(id, amt, noteEs, noteEn) {
  const labels = {
    directCremation: ["Cremación directa", "Direct cremation"],
    immediateBurial: ["Entierro inmediato", "Immediate burial"],
    memorialCremation: ["Cremación con memorial", "Cremation with memorial"],
    traditional: ["Funeral tradicional con velatorio", "Traditional funeral with visitation"],
  };
  const [labelEs, labelEn] = labels[id];
  return { id, labelEs, labelEn, amt, noteEs, noteEn };
}

module.exports = [
  {
    name: "Lanman Funeral Home",
    city: "Kiowa",
    gplKind: "gpl",
    gplHref: "https://www.lanmanfuneralhome.com/services/general-price-list",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Lanman Funeral Home: lista general de precios en su sitio. Ataúd y lote aparte en el entierro inmediato.",
    sourceEn:
      "Lanman Funeral Home: general price list on its site. Casket and plot extra on immediate burial.",
    packages: [
      pkg(
        "directCremation",
        3245,
        "Retiro, traslado al crematorio, tarifa de cremación y servicios básicos. Contenedor de fibra o el del comprador al mismo precio.",
        "Removal, transport to the crematory, cremation fee, and basic services. Fiberboard or purchaser container at the same price."
      ),
      pkg(
        "immediateBurial",
        2970,
        "Sin ceremonia. Servicios básicos, retiro y traslado al cementerio. Ataúd aparte.",
        "No ceremony. Basic services, removal, and transport to the cemetery. Casket extra."
      ),
      pkg(
        "memorialCremation",
        4175,
        "Cremación con memorial en la capilla o en otro lugar. Sin velatorio con el cuerpo presente.",
        "Cremation with a memorial in the chapel or elsewhere. No visitation with the body present."
      ),
    ],
  },
  {
    name: "Fitzgerald Funeral Home",
    city: "Ness City",
    gplKind: "gpl",
    gplHref: "https://www.fitzgeraldfuneral.com/packages---gpl",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Fitzgerald Funeral Home: paquetes publicados en su sitio. Ataúd y bóveda aparte en el funeral tradicional.",
    sourceEn:
      "Fitzgerald Funeral Home: packages published on its site. Casket and vault extra on the traditional funeral.",
    packages: [
      pkg(
        "memorialCremation",
        5550,
        "Visita sin el cuerpo presente y memorial, luego inhumación de cenizas. Contenedor alternativo incluido.",
        "Visitation without the body present and a memorial, then cemetery committal. Alternative container included."
      ),
      pkg(
        "traditional",
        5745,
        "Velatorio de un día, funeral, carroza y limusina. Ataúd y bóveda aparte.",
        "One-day viewing, funeral, coach, and limousine. Casket and vault extra."
      ),
    ],
  },
  {
    name: "Reflection Pointe Funeral & Cremation Services",
    city: "Wichita",
    gplKind: "gpl",
    gplHref: "https://www.reflection-pointe.com/general-price-list",
    gplDateEs: "1 nov. 2025",
    gplDateEn: "Nov 1, 2025",
    sourceEs:
      "Reflection Pointe: lista general de precios vigente 1 nov. 2025. Ataúd aparte en el entierro inmediato.",
    sourceEn:
      "Reflection Pointe: general price list effective Nov 1, 2025. Casket extra on immediate burial.",
    packages: [
      pkg(
        "directCremation",
        3700,
        "Con contenedor alternativo mínimo de cartón. Incluye retiro, servicios básicos, autorizaciones y tarifa de crematorio.",
        "With the minimum cardboard alternative container. Includes removal, basic services, authorizations, and crematory fee."
      ),
      pkg(
        "immediateBurial",
        2500,
        "Sin ceremonia pública. Retiro, servicios básicos e identificación limitada. Ataúd, bóveda y cementerio aparte.",
        "No public ceremony. Removal, basic services, and limited identification. Casket, vault, and cemetery extra."
      ),
    ],
  },
  {
    name: "Cremation Society of Kansas and Missouri",
    gplKind: "gpl",
    gplHref: "https://www.kccremation.com/kansaspricing.aspx",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Cremation Society of Kansas and Missouri: planes de Kansas en su sitio. Urna aparte.",
    sourceEn:
      "Cremation Society of Kansas and Missouri: Kansas plans on its site. Urn extra.",
    packages: [
      pkg(
        "directCremation",
        1395,
        "Plan básico: traslado en el área metropolitana, contenedor básico y cremación. Urna aparte.",
        "Basic plan: metro-area transfer, basic container, and cremation. Urn extra."
      ),
      pkg(
        "memorialCremation",
        2995,
        "Plan con memorial en iglesia u otro lugar. Cremación incluida. Urna y cuota del lugar aparte.",
        "Memorial service plan at a church or other facility. Cremation included. Urn and facility fee extra."
      ),
    ],
  },
  {
    name: "Heartland Cremation and Burial Society",
    city: "Overland Park",
    gplKind: "gpl",
    gplHref: "https://www.heartlandcremation.com/",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Heartland Cremation: paquetes publicados en su sitio. Incluyen contenedor de cremación y urna temporal.",
    sourceEn:
      "Heartland Cremation: packages published on its site. Cremation container and temporary urn included.",
    packages: [
      pkg(
        "directCremation",
        1495,
        "Cremación sencilla: traslado, documentos, contenedor y urna temporal.",
        "Simple cremation: transfer, documents, container, and temporary urn."
      ),
      pkg(
        "memorialCremation",
        2780,
        "Cremación más celebración de 2 horas en su capilla o espacio, con presentación y papelería.",
        "Cremation plus a 2-hour celebration in their chapel or event space, with slideshow and stationery."
      ),
    ],
  },
  {
    name: "Mid States Cremation",
    city: "Lenexa",
    gplKind: "gpl",
    gplHref: "https://midstatescremation.com/pricing.html",
    gplDateEs: "8 sep. 2025",
    gplDateEn: "Sep 8, 2025",
    sourceEs:
      "Mid States Cremation: lista general de precios vigente 8 sep. 2025.",
    sourceEn: "Mid States Cremation: general price list effective Sep 8, 2025.",
    packages: [
      pkg(
        "directCremation",
        1195,
        "Con contenedor mínimo de fibra. Traslado local, personal y cremación. Johnson y Wyandotte sin recargo de transporte.",
        "With the minimum fiberboard container. Local transfer, staff, and cremation. No extra transport fee in Johnson or Wyandotte."
      ),
    ],
  },
  {
    name: "Webb-Shinkle Mortuary",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/071692a2/files/uploaded/GPL+Master+2-16-26.pdf",
    gplDateEs: "16 feb. 2026",
    gplDateEn: "Feb 16, 2026",
    sourceEs:
      "Webb-Shinkle / Shinkle Mortuary: lista general de precios vigente 16 feb. 2026. Ataúd aparte.",
    sourceEn:
      "Webb-Shinkle / Shinkle Mortuary: general price list dated Feb 16, 2026. Casket extra.",
    packages: [
      pkg(
        "directCremation",
        2999,
        "Con contenedor alternativo de cartón y urna temporal de plástico.",
        "With cardboard alternative container and a temporary plastic urn."
      ),
      pkg(
        "immediateBurial",
        2699,
        "Sin ceremonia. Ataúd del comprador. Cementerio aparte.",
        "No ceremony. Purchaser-provided casket. Cemetery extra."
      ),
      pkg(
        "memorialCremation",
        4250,
        "Paquete básico de cremación en iglesia o capilla, sin velatorio.",
        "Basic church or chapel cremation package without visitation."
      ),
      pkg(
        "traditional",
        4750,
        "Paquete de funeral en iglesia con velatorio. Ataúd aparte.",
        "Traditional church funeral package with visitation. Casket extra."
      ),
    ],
  },
  {
    name: "Shinkle Mortuary",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/071692a2/files/uploaded/GPL+Master+2-16-26.pdf",
    gplDateEs: "16 feb. 2026",
    gplDateEn: "Feb 16, 2026",
    sourceEs:
      "Webb-Shinkle / Shinkle Mortuary: lista general de precios vigente 16 feb. 2026. Ataúd aparte.",
    sourceEn:
      "Webb-Shinkle / Shinkle Mortuary: general price list dated Feb 16, 2026. Casket extra.",
    packages: [
      pkg(
        "directCremation",
        2999,
        "Con contenedor alternativo de cartón y urna temporal de plástico.",
        "With cardboard alternative container and a temporary plastic urn."
      ),
      pkg(
        "immediateBurial",
        2699,
        "Sin ceremonia. Ataúd del comprador. Cementerio aparte.",
        "No ceremony. Purchaser-provided casket. Cemetery extra."
      ),
      pkg(
        "memorialCremation",
        4250,
        "Paquete básico de cremación en iglesia o capilla, sin velatorio.",
        "Basic church or chapel cremation package without visitation."
      ),
      pkg(
        "traditional",
        4750,
        "Paquete de funeral en iglesia con velatorio. Ataúd aparte.",
        "Traditional church funeral package with visitation. Casket extra."
      ),
    ],
  },
  {
    name: "Koup Family Funeral Home",
    city: "Eureka",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/46fad998/files/uploaded/General+Price+List+2026a.pdf",
    gplDateEs: "2026",
    gplDateEn: "2026",
    sourceEs:
      "Koup Family Funeral Home: lista general de precios 2026. Ataúd aparte en el funeral tradicional.",
    sourceEn:
      "Koup Family Funeral Home: 2026 general price list. Casket extra on the traditional funeral.",
    packages: [
      pkg(
        "directCremation",
        2700,
        "Con contenedor alternativo. Sin ritos ni ceremonias.",
        "With alternative container. No rites or ceremonies."
      ),
      pkg(
        "immediateBurial",
        3200,
        "Sin ceremonia. Incluye vestido y colocación en ataúd. Ataúd y cementerio aparte.",
        "No ceremony. Includes dressing and casketing. Casket and cemetery extra."
      ),
      pkg(
        "memorialCremation",
        3350,
        "Paquete de memorial con cremación. Contenedor y urna se compran aparte.",
        "Memorial service cremation package. Container and urn purchased separately."
      ),
      pkg(
        "traditional",
        4950,
        "Funeral completo con visita de 2 horas. Ataúd, bóveda y anticipos aparte.",
        "Full funeral with 2-hour visitation. Casket, vault, and cash advances extra."
      ),
    ],
  },
  {
    name: "Feuerborn Family Funeral Service",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/8a8be176/files/uploaded/2026+FFFS+GPL+5.15.26.pdf",
    gplDateEs: "15 may. 2026",
    gplDateEn: "May 15, 2026",
    sourceEs:
      "Feuerborn Family Funeral Service: lista general de precios vigente 15 may. 2026. Ataúd aparte.",
    sourceEn:
      "Feuerborn Family Funeral Service: general price list dated May 15, 2026. Casket extra.",
    packages: [
      pkg(
        "directCremation",
        3570,
        "Cremación sin ceremonia con contenedor de fibra de la funeraria.",
        "Cremation without ceremony with the funeral home’s fiberboard container."
      ),
      pkg(
        "immediateBurial",
        3445,
        "Sin ceremonia. Ataúd aparte.",
        "No ceremony. Casket extra."
      ),
      pkg(
        "memorialCremation",
        5315,
        "Cremación directa más memorial en la funeraria, sin velatorio.",
        "Direct cremation plus a memorial at the funeral home, without viewing."
      ),
      pkg(
        "traditional",
        5580,
        "Funeral tradicional completo. Ataúd aparte.",
        "Complete traditional funeral. Casket extra."
      ),
    ],
  },
  {
    name: "Baker Funeral Home – Peabody",
    city: "Peabody",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/5dd74555/files/uploaded/Baker+FH_GPL+2026.pdf",
    gplDateEs: "2026",
    gplDateEn: "2026",
    sourceEs: "Baker Funeral Home: lista general de precios 2026 en el PDF de su sitio.",
    sourceEn: "Baker Funeral Home: 2026 general price list PDF on its site.",
    packages: [
      pkg(
        "directCremation",
        899,
        "Cremación directa publicada en su lista 2026.",
        "Direct cremation as published on its 2026 list."
      ),
      pkg(
        "immediateBurial",
        1397,
        "Entierro inmediato o green burial publicado en su lista 2026. Ataúd aparte.",
        "Immediate or green burial as published on its 2026 list. Casket extra."
      ),
      pkg(
        "memorialCremation",
        1797,
        "Cremación directa con memorial en su instalación.",
        "Direct cremation with a memorial at their facility."
      ),
      pkg(
        "traditional",
        5597,
        "Paquete de iglesia o capilla con ataúd de metal 20-gauge incluido. Bóveda y cementerio aparte.",
        "Church or chapel package with a 20-gauge metal casket included. Vault and cemetery extra."
      ),
    ],
  },
  {
    name: "Anderes-Pfeifley Funeral Home",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/fc38229a/files/uploaded/General+Price+List+2025.pdf",
    gplDateEs: "2025",
    gplDateEn: "2025",
    sourceEs:
      "Anderes-Pfeifley: lista general de precios 2025. Ataúd aparte en el entierro inmediato.",
    sourceEn:
      "Anderes-Pfeifley: 2025 general price list. Casket extra on immediate burial.",
    packages: [
      pkg(
        "directCremation",
        2900,
        "Cremación directa con contenedor alternativo.",
        "Direct cremation with alternative container."
      ),
      pkg(
        "immediateBurial",
        3300,
        "Sin ritos. Ataúd del comprador. Cementerio aparte.",
        "No rites. Purchaser-provided casket. Cemetery extra."
      ),
      pkg(
        "memorialCremation",
        4325,
        "Cremación con memorial en sus instalaciones. Mercancía aparte.",
        "Cremation with a memorial at their facility. Merchandise extra."
      ),
    ],
  },
  {
    name: "Cremation Center of Kansas City",
    city: "Roeland Park",
    gplKind: "gpl",
    gplHref: "https://irp.cdn-website.com/f3242eff/files/uploaded/CCKC+GPL+September+2026.pdf",
    gplDateEs: "sep. 2026",
    gplDateEn: "Sep 2026",
    sourceEs:
      "Cremation Center of Kansas City: lista general de precios sep. 2026.",
    sourceEn: "Cremation Center of Kansas City: general price list dated Sep 2026.",
    packages: [
      pkg(
        "directCremation",
        1395,
        "Cremación directa con contenedor alternativo (precio en oficina). El precio solo en línea es $1,295.",
        "Direct cremation with alternative container (in-office price). The online-only price is $1,295."
      ),
    ],
  },
];
