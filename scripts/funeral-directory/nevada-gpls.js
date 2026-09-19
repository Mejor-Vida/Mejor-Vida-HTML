/**
 * First-party Nevada GPL overlays for the funeral-resource directory.
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

module.exports = [];
