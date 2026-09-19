/**
 * First-party Colorado GPL overlays for the funeral-resource directory.
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
    name: "Harris Funeral Directors",
    city: "Aurora",
    gplKind: "gpl",
    gplHref: "https://www.harrisfuneraldirectors.com/pricing---packages",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Harris Funeral Directors: paquetes publicados en su sitio. Ataúd del comprador en el entierro inmediato.",
    sourceEn:
      "Harris Funeral Directors: packages published on its site. Purchaser casket on immediate burial.",
    packages: [
      pkg(
        "directCremation",
        1625,
        "Cremación directa con contenedor alternativo del comprador.",
        "Direct cremation with alternative container provided by the purchaser."
      ),
      pkg(
        "immediateBurial",
        3500,
        "Entierro inmediato con ataúd del comprador. Lote aparte.",
        "Immediate burial with casket provided by the purchaser. Plot extra."
      ),
    ],
  },
  {
    name: "Maltbie Funeral Services",
    city: "Springfield",
    gplKind: "gpl",
    gplHref: "https://www.maltbiefuneralservices.com/services/general-price-list",
    gplDateEs: "",
    gplDateEn: "",
    sourceEs:
      "Maltbie Funeral Services: paquetes publicados en su sitio. Lote y bóveda aparte salvo que la nota lo diga.",
    sourceEn:
      "Maltbie Funeral Services: packages published on its site. Plot and vault extra unless a note says otherwise.",
    packages: [
      pkg(
        "directCremation",
        2350,
        "Cremación directa sin servicio. Contenedor alternativo (fibra o similar).",
        "Direct cremation with no service. Alternative container (fiberboard or similar)."
      ),
      pkg(
        "immediateBurial",
        3250,
        "Entierro inmediato o natural: servicios, traslado, preparación, pie de tumba local y carroza. Ataúd y lote aparte.",
        "Immediate or natural burial: services, transfer, preparation, local graveside, and hearse. Casket and plot extra."
      ),
      pkg(
        "traditional",
        3575,
        "Funeral tradicional completo: servicios, traslado, embalsamado, arreglo y ceremonia. Ataúd y lote aparte.",
        "Traditional burial package: services, transfer, embalming, dressing, and ceremony. Casket and plot extra."
      ),
    ],
  },
];
