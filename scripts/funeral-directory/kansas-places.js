/**
 * Kansas directory-only cities (no full city-guide page yet).
 * Contact facts from each home’s own site. Do not invent GPL dollars.
 */
function home(id, name, href, address, phone) {
  return { id, name, href, address, phone };
}

function cem(name, address, phone, noteEs, noteEn) {
  return { name, address, phone: phone || "", noteEs: noteEs || "", noteEn: noteEn || "" };
}

module.exports = [
  {
    slug: "salina",
    nameEs: "Salina",
    nameEn: "Salina",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Saline",
    countyEn: "Saline County",
    metroEs: ["Salina"],
    metroEn: ["Salina"],
    homes: [
      home("ryan", "Ryan Mortuary", "https://www.ryanmortuary.com/", "137 N 8th St", "785-825-4242"),
      home("carlson", "Carlson-Geisendorf", "https://www.carlsonfh.net/", "500 S Ohio St", "785-823-3456"),
    ],
    cemeteries: [
      cem("Norview Gardens", "", "785-823-3456", "Cementerio de Carlson-Geisendorf. Pida la lista en la funeraria.", "Carlson-Geisendorf cemetery. Ask the funeral home for the list."),
    ],
  },
  {
    slug: "hutchinson",
    nameEs: "Hutchinson",
    nameEn: "Hutchinson",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Reno",
    countyEn: "Reno County",
    metroEs: ["Hutchinson"],
    metroEn: ["Hutchinson"],
    homes: [
      home("elliott", "Elliott Mortuary", "https://www.elliottmortuary.com/", "1219 N Main St", "620-663-3327"),
      home("pg-hutch", "Penwell-Gabel Hutchinson", "http://www.penwellgabelhutchinson.com/", "300 E 30th Ave", "620-662-1201"),
    ],
    cemeteries: [],
  },
  {
    slug: "leavenworth",
    nameEs: "Leavenworth",
    nameEn: "Leavenworth",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Leavenworth",
    countyEn: "Leavenworth County",
    metroEs: ["Leavenworth"],
    metroEn: ["Leavenworth"],
    homes: [
      home("davis", "Davis Funeral Chapel", "https://www.davisfuneralchapelinc.com/", "531 Shawnee St", "913-682-5523"),
      home("leintz", "R. L. Leintz Funeral Home", "https://www.leintzfh.com/", "4701 10th Ave", "913-351-0200"),
      home("charter-lv", "Charter Funerals Leavenworth", "https://www.charterfunerals.com/", "16731 Springdale Rd", "913-682-5400"),
    ],
    cemeteries: [
      cem("Sunset Memory Gardens", "16731 Springdale Rd", "913-682-3501", "Misma propiedad que Charter Leavenworth.", "Same grounds as Charter Leavenworth."),
    ],
  },
  {
    slug: "garden-city",
    nameEs: "Garden City",
    nameEn: "Garden City",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Finney",
    countyEn: "Finney County",
    metroEs: ["Garden City", "Lakin"],
    metroEn: ["Garden City", "Lakin"],
    homes: [
      home("garnand", "Garnand Funeral Home", "https://www.garnandfuneralhomes.com/", "412 N 7th St", "620-276-3219"),
      home("robson", "Robson Funeral Home", "https://www.robsonfuneralhome.com/", "620 N Main", "620-276-2364"),
    ],
    cemeteries: [],
  },
  {
    slug: "dodge-city",
    nameEs: "Dodge City",
    nameEn: "Dodge City",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Ford",
    countyEn: "Ford County",
    metroEs: ["Dodge City", "Cimarron"],
    metroEn: ["Dodge City", "Cimarron"],
    homes: [
      home("swaim", "Swaim Funeral Chapel", "https://www.swaimfuneralhome.com/", "1901 6th Ave", "620-227-2136"),
      home("ziegler", "Ziegler Funeral Chapel", "https://www.zieglerfuneralchapel.com/", "1901 N 14th Ave", "620-225-0518"),
    ],
    cemeteries: [],
  },
  {
    slug: "emporia",
    nameEs: "Emporia",
    nameEn: "Emporia",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Lyon",
    countyEn: "Lyon County",
    metroEs: ["Emporia"],
    metroEn: ["Emporia"],
    homes: [
      home("rbb", "Roberts-Blue-Barnett", "https://www.robertsblue.com/", "605 State St", "620-342-2134"),
      home("charter-emp", "Charter Funerals Emporia", "https://www.charterfunerals.com/charter-funerals-emporia", "501 W 6th Ave", "620-342-5522"),
    ],
    cemeteries: [
      cem("Maplewood Memorial Lawn", "2000 Prairie St", "620-342-8317", "Cementerio de Charter en Emporia.", "Charter cemetery in Emporia."),
    ],
  },
  {
    slug: "hays",
    nameEs: "Hays",
    nameEn: "Hays",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Ellis",
    countyEn: "Ellis County",
    metroEs: ["Hays"],
    metroEn: ["Hays"],
    homes: [
      home("hays-mem", "Hays Memorial Chapel", "https://www.haysmemorial.com/", "1906 Pine St", "785-628-1009"),
    ],
    cemeteries: [],
  },
  {
    slug: "manhattan",
    nameEs: "Manhattan",
    nameEn: "Manhattan",
    stateCode: "KS",
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    countyEs: "condado Riley",
    countyEn: "Riley County",
    metroEs: ["Manhattan", "Junction City", "Wamego"],
    metroEn: ["Manhattan", "Junction City", "Wamego"],
    homes: [
      home("yml", "Yorgensen-Meloan-Londeen", "https://www.ymlfuneralhome.com/", "1616 Poyntz Ave", "785-539-7481"),
      home("irvin", "Irvin-Parkview", "https://www.irvinparkview.com/", "1317 Poyntz Ave", "785-537-2110"),
    ],
    cemeteries: [],
  }
];
