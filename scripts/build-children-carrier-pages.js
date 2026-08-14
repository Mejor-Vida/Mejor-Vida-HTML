#!/usr/bin/env node
/**
 * Build bilingual children's carrier detail pages from structured MASTER facts.
 * Shell cloned from en/carriers/aetna.html + carriers/aetna.html.
 *
 * Usage: node scripts/build-children-carrier-pages.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://www.mejorvidainsurance.com";

const CARRIERS = [
  {
    id: "moo",
    brand: "Mutual of Omaha",
    enFile: "mutual-of-omaha-children.html",
    esFile: "mutual-of-omaha-infantil.html",
    parentEn: "mutual-of-omaha.html",
    parentEs: "mutual-of-omaha.html",
    logoEn: `<picture><source type="image/webp" srcset="../../img/opt/mutual-of-omaha-logo.webp"/><img alt="Mutual of Omaha" class="d-inline-block" src="../../img/opt/mutual-of-omaha-logo.png" width="400" height="94" style="height:88px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    logoEs: `<picture><source type="image/webp" srcset="../img/opt/mutual-of-omaha-logo.webp"/><img alt="Mutual of Omaha" class="d-inline-block" src="../img/opt/mutual-of-omaha-logo.png" width="400" height="94" style="height:88px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    en: {
      title: "Mutual of Omaha — Children's Whole Life | Mejor Vida Insurance",
      description:
        "Mutual of Omaha Children's Whole Life: issue ages 14 days–17, face $5,000–$50,000, Guaranteed Insurability and Waiver of Premium (Death of Owner). Educational overview from Mejor Vida Insurance.",
      ogTitle: "Mutual of Omaha Children's Whole Life | Mejor Vida Insurance",
      ogDescription:
        "Standalone children's whole life from Mutual of Omaha — ages, face amounts, riders, and application notes. Compare with Mejor Vida Insurance.",
      h1: "Children's Whole Life insurance",
      lead:
        "<strong>Mutual of Omaha Children's Whole Life (CWL)</strong> is a standalone simplified-issue whole life policy for children. Mejor Vida Insurance can help families compare this path with other appointed carriers.",
      serviceName: "Mutual of Omaha Children's Whole Life",
      serviceType: "Children's Whole Life Insurance",
      sections: [
        {
          h2: "At a glance",
          cards: [
            {
              h: "Issue ages & face",
              items: [
                "Issue ages: <strong>14 days–17</strong> (age last birthday)",
                "Face amounts: <strong>$5,000–$50,000</strong>",
                "Underwriting class: <strong>Standard only</strong> (no table rates)",
                "No medical exam; limited health questions",
              ],
            },
            {
              h: "Premium modes & fee",
              items: [
                "Annual <strong>1.00</strong> · Semi <strong>0.50</strong> · Quarterly <strong>0.25</strong> · Monthly BSP <strong>0.08333</strong>",
                "Policy fee: <strong>$12/year</strong> (commissionable)",
                "Rates never increase; benefits never decrease (while premiums are paid as required)",
              ],
            },
            {
              h: "Cash value & death benefit",
              items: [
                "Policy loans: <strong>5.66%</strong> in advance",
                "No partial withdrawals",
                "Death benefit guaranteed to age <strong>100</strong> while premiums are paid",
              ],
            },
          ],
        },
        {
          h2: "Riders on Children's Whole Life",
          cards: [
            {
              h: "Guaranteed Insurability (CWL)",
              items: [
                "Option dates after ages <strong>25 / 30 / 35 / 40</strong>",
                "Also on marriage/civil union, birth/adoption, and home purchase",
                "Maximum <strong>5</strong> elections; exercise within <strong>6 months</strong>",
                "No evidence of insurability required for eligible elections",
                "Reminders typically <strong>60 days</strong> before age-based option dates",
              ],
            },
            {
              h: "Waiver of Premium — Death of Owner",
              items: [
                "One-time <strong>90-day</strong> waiver of premium after the owner's death",
                "Available <strong>24 months</strong> after issue",
                "Waived premiums are <strong>not</strong> deducted from the death benefit",
              ],
            },
          ],
        },
        {
          h2: "Application notes (CWL)",
          list: [
            "Up to <strong>8 children</strong> on one application; separate policy per child",
            "Grandparents may sign without a parent signature (per CWL rules)",
            "No conditional receipt for Children's Whole Life",
          ],
        },
        {
          h2: "Related Mutual of Omaha paths (not CWL)",
          intro:
            "These are <strong>different</strong> from standalone Children's Whole Life — ask Mejor Vida Insurance which path fits.",
          cards: [
            {
              h: "Fully underwritten juvenile guidelines",
              items: [
                "Ages generally <strong>15 days–17</strong>",
                "Generally max face about <strong>$250,000</strong> (higher amounts need extra underwriting support)",
                "Face typically ≤ <strong>50%</strong> of the lesser-insured parent",
                "Not available in <strong>Washington</strong>",
              ],
            },
            {
              h: "Child Rider (on adult products)",
              items: [
                "Combined child-rider limit about <strong>$10,000 per child</strong> across products",
                "Separate from a CWL base policy — ask for an illustration for rider pricing",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "Mutual of Omaha — Vida entera infantil | Mejor Vida Seguros",
      description:
        "Vida entera infantil de Mutual of Omaha: edades 14 días–17, capital $5,000–$50,000, asegurabilidad garantizada y exención por fallecimiento del dueño. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Mutual of Omaha vida entera infantil | Mejor Vida Seguros",
      ogDescription:
        "Póliza independiente de vida entera para niños de Mutual of Omaha: edades, capitales, riders y notas de solicitud. Compare con Mejor Vida Seguros.",
      h1: "Seguro de vida entera infantil",
      lead:
        "La <strong>vida entera infantil de Mutual of Omaha (CWL)</strong> es una póliza independiente de emisión simplificada para niños. Mejor Vida Seguros puede ayudar a comparar esta opción con otras aseguradoras designadas.",
      serviceName: "Mutual of Omaha vida entera infantil",
      serviceType: "Seguro de vida entera infantil",
      sections: [
        {
          h2: "Resumen",
          cards: [
            {
              h: "Edades y capital",
              items: [
                "Edades de emisión: <strong>14 días–17</strong> (edad en el último cumpleaños)",
                "Capital asegurado: <strong>$5,000–$50,000</strong>",
                "Clase de suscripción: solo <strong>Standard</strong> (sin tarifas de tabla)",
                "Sin examen médico; preguntas de salud limitadas",
              ],
            },
            {
              h: "Modos de prima y cargo",
              items: [
                "Anual <strong>1.00</strong> · Semestral <strong>0.50</strong> · Trimestral <strong>0.25</strong> · Mensual BSP <strong>0.08333</strong>",
                "Cargo de póliza: <strong>$12/año</strong> (comisionable)",
                "Las primas no aumentan; los beneficios no disminuyen (mientras se paguen las primas requeridas)",
              ],
            },
            {
              h: "Valor en efectivo y beneficio por fallecimiento",
              items: [
                "Préstamos sobre la póliza: <strong>5.66%</strong> por adelantado",
                "Sin retiros parciales",
                "Beneficio por fallecimiento garantizado hasta los <strong>100</strong> años mientras se paguen las primas",
              ],
            },
          ],
        },
        {
          h2: "Riders en vida entera infantil",
          cards: [
            {
              h: "Asegurabilidad garantizada (CWL)",
              items: [
                "Fechas de opción después de los <strong>25 / 30 / 35 / 40</strong> años",
                "También por matrimonio/unión civil, nacimiento/adopción y compra de vivienda",
                "Máximo <strong>5</strong> elecciones; ejercer dentro de <strong>6 meses</strong>",
                "Sin evidencia de asegurabilidad en elecciones elegibles",
                "Recordatorios típicamente <strong>60 días</strong> antes de las opciones por edad",
              ],
            },
            {
              h: "Exención de primas — fallecimiento del dueño",
              items: [
                "Exención única de primas por <strong>90 días</strong> tras el fallecimiento del dueño",
                "Disponible <strong>24 meses</strong> después de la emisión",
                "Las primas exentas <strong>no</strong> se descuentan del beneficio por fallecimiento",
              ],
            },
          ],
        },
        {
          h2: "Notas de solicitud (CWL)",
          list: [
            "Hasta <strong>8 niños</strong> en una solicitud; póliza separada por niño",
            "Los abuelos pueden firmar sin firma del padre/madre (según reglas CWL)",
            "Sin recibo condicional para vida entera infantil",
          ],
        },
        {
          h2: "Otras vías de Mutual of Omaha (no son CWL)",
          intro:
            "Estas son <strong>distintas</strong> de la vida entera infantil independiente — consulte a Mejor Vida Seguros cuál conviene.",
          cards: [
            {
              h: "Guías juveniles de suscripción completa",
              items: [
                "Edades generalmente <strong>15 días–17</strong>",
                "Capital máximo generalmente cerca de <strong>$250,000</strong> (montos mayores requieren apoyo adicional de suscripción)",
                "El capital suele ser ≤ <strong>50%</strong> del padre/madre con menor cobertura",
                "No disponible en <strong>Washington</strong>",
              ],
            },
            {
              h: "Rider infantil (en productos para adultos)",
              items: [
                "Límite combinado del rider infantil de unos <strong>$10,000 por niño</strong> entre productos",
                "Es distinto de una póliza base CWL — consulte una ilustración para el precio del rider",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "assurity",
    brand: "Assurity",
    enFile: "assurity-children.html",
    esFile: "assurity-infantil.html",
    parentEn: "assurity.html",
    parentEs: "assurity.html",
    logoEn: `<img alt="Assurity" class="d-inline-block" decoding="async" height="52" src="../../img/carriers/assurity-logo.svg" style="height:72px;width:auto;max-width:100%;" width="220" loading="eager"/>`,
    logoEs: `<img alt="Assurity" class="d-inline-block" decoding="async" height="52" src="../img/carriers/assurity-logo.svg" style="height:72px;width:auto;max-width:100%;" width="220" loading="eager"/>`,
    en: {
      title: "Assurity — Children's / Juvenile Whole Life (Protect+ & Perform+) | Mejor Vida Insurance",
      description:
        "Assurity Protect+ and Perform+ can issue from early childhood (15 days) with juvenile accelerated underwriting bands, ownership transfer at 25, and built-in living benefits. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Assurity juvenile whole life | Mejor Vida Insurance",
      ogDescription:
        "Assurity Protect+/Perform+ for juveniles — ages, living benefits, ownership transfer at 25, and optional riders. Compare with Mejor Vida Insurance.",
      h1: "Juvenile whole life (Protect+ & Perform+)",
      lead:
        "<strong>Assurity Protect+</strong> and <strong>Perform+</strong> are permanent whole life products that can cover juveniles as well as adults. Mejor Vida Insurance can help compare Assurity with other children's coverage options.",
      serviceName: "Assurity Protect+ / Perform+ juvenile whole life",
      serviceType: "Juvenile Whole Life Insurance",
      sections: [
        {
          h2: "At a glance",
          cards: [
            {
              h: "Issue ages & face",
              items: [
                "Issue ages: <strong>15 days–85</strong>",
                "Minimum face typically <strong>$10,000+</strong>",
                "Accelerated underwriting juvenile band: ages <strong>15 days–17</strong>, max face <strong>$300,000</strong>",
              ],
            },
            {
              h: "Ownership & living benefits",
              items: [
                "Automatic ownership transfer at age <strong>25</strong> (no forms)",
                "Built-in accelerated death benefits for critical / chronic / terminal illness (Form <strong>R I2422</strong>)",
                "Chronic and critical ADB available through issue age <strong>70</strong>",
              ],
            },
            {
              h: "Availability note",
              items: [
                "Available in all states except <strong>California</strong> and <strong>New York</strong> (per Assurity product materials)",
                "Features and riders still vary by state — confirm before applying",
              ],
            },
          ],
        },
        {
          h2: "Optional riders (names)",
          intro:
            "Exact rider amounts and premiums depend on the illustration. Ask Mejor Vida Insurance for an illustration before relying on any dollar figure.",
          list: [
            "Children's Term Rider — amounts <strong>unknown on this page</strong>; ask for an illustration",
            "Payor Benefit",
            "Guaranteed Insurability",
            "Accidental Death Benefit",
            "Other riders may appear on Assurity materials depending on product and state",
          ],
        },
      ],
    },
    es: {
      title: "Assurity — Vida entera juvenil (Protect+ y Perform+) | Mejor Vida Seguros",
      description:
        "Assurity Protect+ y Perform+ pueden emitirse desde la infancia (15 días), con bandas juveniles de suscripción acelerada, transferencia de propiedad a los 25 y beneficios en vida incluidos. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Assurity vida entera juvenil | Mejor Vida Seguros",
      ogDescription:
        "Assurity Protect+/Perform+ para menores: edades, beneficios en vida, transferencia a los 25 y riders opcionales. Compare con Mejor Vida Seguros.",
      h1: "Vida entera juvenil (Protect+ y Perform+)",
      lead:
        "<strong>Assurity Protect+</strong> y <strong>Perform+</strong> son productos de vida entera permanentes que pueden cubrir a menores y adultos. Mejor Vida Seguros puede ayudar a comparar Assurity con otras opciones infantiles.",
      serviceName: "Assurity Protect+ / Perform+ vida entera juvenil",
      serviceType: "Seguro de vida entera juvenil",
      sections: [
        {
          h2: "Resumen",
          cards: [
            {
              h: "Edades y capital",
              items: [
                "Edades de emisión: <strong>15 días–85</strong>",
                "Capital mínimo típico <strong>$10,000+</strong>",
                "Banda juvenil de suscripción acelerada: <strong>15 días–17</strong>, capital máximo <strong>$300,000</strong>",
              ],
            },
            {
              h: "Propiedad y beneficios en vida",
              items: [
                "Transferencia automática de propiedad a los <strong>25</strong> años (sin formularios)",
                "Beneficios acelerados por fallecimiento por enfermedad crítica / crónica / terminal (Formulario <strong>R I2422</strong>)",
                "ADB crónica y crítica disponibles hasta edad de emisión <strong>70</strong>",
              ],
            },
            {
              h: "Disponibilidad",
              items: [
                "Disponible en todos los estados excepto <strong>California</strong> y <strong>Nueva York</strong> (según materiales de Assurity)",
                "Características y riders varían por estado — confirme antes de solicitar",
              ],
            },
          ],
        },
        {
          h2: "Riders opcionales (nombres)",
          intro:
            "Los montos y primas exactos dependen de la ilustración. Consulte una ilustración con Mejor Vida Seguros antes de confiar en cualquier cifra.",
          list: [
            "Rider de término infantil — montos <strong>desconocidos en esta página</strong>; consulte una ilustración",
            "Beneficio del pagador (Payor Benefit)",
            "Asegurabilidad garantizada",
            "Beneficio por muerte accidental",
            "Pueden aparecer otros riders según el producto y el estado",
          ],
        },
      ],
    },
  },
  {
    id: "transamerica",
    brand: "Transamerica",
    enFile: "transamerica-children.html",
    esFile: "transamerica-infantil.html",
    parentEn: "transamerica.html",
    parentEs: "transamerica.html",
    logoEn: `<picture><source type="image/webp" srcset="../../img/opt/transamerica-logo.webp?v=20260723-nobg"/><img alt="Transamerica" class="d-inline-block" src="../../img/opt/transamerica-logo.png?v=20260723-nobg" width="480" height="114" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    logoEs: `<picture><source type="image/webp" srcset="../img/opt/transamerica-logo.webp?v=20260723-nobg"/><img alt="Transamerica" class="d-inline-block" src="../img/opt/transamerica-logo.png?v=20260723-nobg" width="480" height="114" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    en: {
      title: "Transamerica — Immediate Solution Juvenile & Child/Grandchild Rider | Mejor Vida Insurance",
      description:
        "Transamerica Immediate Solution for juveniles (ages 0–85 base product) plus Children's/Grandchildren's Benefit Rider (CGR) rules. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Transamerica juvenile Immediate Solution | Mejor Vida Insurance",
      ogDescription:
        "Immediate Solution juvenile classes, face limits by age, underwriting notes, and CGR rider facts. Compare with Mejor Vida Insurance.",
      h1: "Immediate Solution (juvenile) & child/grandchild rider",
      lead:
        "<strong>Transamerica Immediate Solution</strong> can issue with Preferred/Standard Juvenile classes. Some adult Immediate policies can also add a <strong>Children's/Grandchildren's Benefit Rider (CGR)</strong>. Mejor Vida Insurance can help compare options.",
      serviceName: "Transamerica Immediate Solution juvenile & CGR",
      serviceType: "Juvenile Final Expense / Child Rider",
      sections: [
        {
          h2: "Immediate Solution — base product",
          cards: [
            {
              h: "Ages & face amounts",
              items: [
                "Issue ages: <strong>0–85</strong>",
                "Minimum face: <strong>$1,000</strong>",
                "Maximum by age: <strong>0–55 $50,000</strong> · <strong>56–65 $40,000</strong> · <strong>66–75 $30,000</strong> · <strong>76–85 $25,000</strong>",
                "Full death benefit from day one (when issued as Immediate)",
                "Preferred / Standard Juvenile underwriting classes",
              ],
            },
            {
              h: "Ownership & juvenile UW notes",
              items: [
                "Ownership may differ from the insured",
                "Not eligible if <strong>2 or more</strong> medical categories are answered yes",
                "Childhood cancers: typically a decline",
              ],
            },
          ],
        },
        {
          h2: "Children's / Grandchildren's Benefit Rider (CGR)",
          intro: "CGR attaches to Immediate Solution only (not other TA FE designs on this page).",
          cards: [
            {
              h: "Pricing & parties",
              items: [
                "<strong>$2.00 annual</strong> per unit (<strong>$1,000</strong>) per child",
                "Parent/grandparent owner ages <strong>18–75</strong>",
                "Child ages <strong>15 days–18</strong>; maximum <strong>9</strong> children",
              ],
            },
            {
              h: "Face & limits",
              items: [
                "Rider face <strong>$1,000</strong> up to the lesser of base face or <strong>$5,000</strong>",
                "Same face for all children on the rider",
                "Combined limit ≤ <strong>$5,000</strong> across all Transamerica FE child/grandchild riders",
              ],
            },
            {
              h: "Termination & conversion",
              items: [
                "Terminates on the rider anniversary after the child reaches age <strong>25</strong>",
                "Convertible after <strong>2 years</strong>: ages 0–17 to juvenile standard; ages 18–25 to standard non-tobacco",
                "Terminal illness benefit: <strong>24-month</strong> exclusion applies on the rider path",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "Transamerica — Immediate Solution juvenil y rider infantil/nietos | Mejor Vida Seguros",
      description:
        "Transamerica Immediate Solution para menores (producto base 0–85) y reglas del rider Children's/Grandchildren's Benefit (CGR). Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Transamerica Immediate Solution juvenil | Mejor Vida Seguros",
      ogDescription:
        "Clases juveniles Immediate Solution, límites de capital por edad, notas de suscripción y hechos del rider CGR. Compare con Mejor Vida Seguros.",
      h1: "Immediate Solution (juvenil) y rider infantil/nietos",
      lead:
        "<strong>Transamerica Immediate Solution</strong> puede emitirse con clases Preferred/Standard Juvenile. Algunas pólizas Immediate para adultos también pueden añadir el <strong>rider Children's/Grandchildren's Benefit (CGR)</strong>. Mejor Vida Seguros puede ayudar a comparar opciones.",
      serviceName: "Transamerica Immediate Solution juvenil y CGR",
      serviceType: "Gastos finales juveniles / rider infantil",
      sections: [
        {
          h2: "Immediate Solution — producto base",
          cards: [
            {
              h: "Edades y capitales",
              items: [
                "Edades de emisión: <strong>0–85</strong>",
                "Capital mínimo: <strong>$1,000</strong>",
                "Máximo por edad: <strong>0–55 $50,000</strong> · <strong>56–65 $40,000</strong> · <strong>66–75 $30,000</strong> · <strong>76–85 $25,000</strong>",
                "Beneficio completo por fallecimiento desde el primer día (cuando se emite como Immediate)",
                "Clases de suscripción Preferred / Standard Juvenile",
              ],
            },
            {
              h: "Propiedad y notas de suscripción juvenil",
              items: [
                "La propiedad puede diferir del asegurado",
                "No elegible si se responde sí a <strong>2 o más</strong> categorías médicas",
                "Cánceres infantiles: típicamente un rechazo",
              ],
            },
          ],
        },
        {
          h2: "Rider Children's / Grandchildren's Benefit (CGR)",
          intro: "El CGR solo se adjunta a Immediate Solution (no a otros diseños FE de TA en esta página).",
          cards: [
            {
              h: "Precio y partes",
              items: [
                "<strong>$2.00 anuales</strong> por unidad (<strong>$1,000</strong>) por niño",
                "Padre/madre o abuelo dueño: edades <strong>18–75</strong>",
                "Niño: <strong>15 días–18</strong>; máximo <strong>9</strong> niños",
              ],
            },
            {
              h: "Capital y límites",
              items: [
                "Capital del rider <strong>$1,000</strong> hasta el menor entre el capital base o <strong>$5,000</strong>",
                "Mismo capital para todos los niños en el rider",
                "Límite combinado ≤ <strong>$5,000</strong> en todos los riders infantiles/nietos FE de Transamerica",
              ],
            },
            {
              h: "Terminación y conversión",
              items: [
                "Termina en el aniversario del rider después de que el niño cumpla <strong>25</strong>",
                "Convertible después de <strong>2 años</strong>: 0–17 a juvenile standard; 18–25 a standard no fumador",
                "Beneficio por enfermedad terminal: exclusión de <strong>24 meses</strong> en la vía del rider",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "amam",
    brand: "American Amicable",
    enFile: "american-amicable-children.html",
    esFile: "american-amicable-infantil.html",
    parentEn: "american-amicable.html",
    parentEs: "american-amicable.html",
    logoEn: `<picture><source type="image/webp" srcset="../../img/opt/american-amicable-logo.webp"/><img alt="American Amicable" class="d-inline-block" src="../../img/opt/american-amicable-logo.png" width="520" height="109" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    logoEs: `<picture><source type="image/webp" srcset="../img/opt/american-amicable-logo.webp"/><img alt="American Amicable" class="d-inline-block" src="../img/opt/american-amicable-logo.png" width="520" height="109" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    en: {
      title: "American Amicable — Child & Grandchild Riders / Juvenile Guidelines | Mejor Vida Insurance",
      description:
        "American Amicable GCIA grandchild rider, CIA children's agreement, juvenile application guidelines, and Family Solution / Family Choice notes. Educational overview from Mejor Vida Insurance.",
      ogTitle: "American Amicable children's coverage | Mejor Vida Insurance",
      ogDescription:
        "GCIA, CIA, juvenile app rules, and Family Solution ages/faces. Ask Mejor Vida Insurance for an illustration — rider amounts vary.",
      h1: "Child & grandchild coverage paths",
      lead:
        "American Amicable offers <strong>child/grandchild riders</strong> on some final expense products and separate <strong>Family Solution / Family Choice</strong> designs that can include younger ages. Mejor Vida Insurance can help compare — rider dollar amounts are not listed here; ask for an illustration.",
      serviceName: "American Amicable child & grandchild coverage",
      serviceType: "Children's / Grandchild Life Insurance Riders",
      sections: [
        {
          h2: "Riders on adult final expense",
          cards: [
            {
              h: "GCIA — Grandchild Rider",
              items: [
                "Available on <strong>Golden Solution</strong> and <strong>Senior Choice</strong>",
                "Spanish form reference: <strong>3838S</strong>",
                "Rider amounts: <strong>unknown on this page</strong> — ask for an illustration",
              ],
            },
            {
              h: "CIA — Children's Insurance Agreement",
              items: [
                "Available on some final expense products",
                "Form reference: <strong>ICC15-AA3215</strong>",
                "Exact face and premium: ask for an illustration",
              ],
            },
          ],
        },
        {
          h2: "Juvenile application guidelines",
          list: [
            "Ages <strong>0–17</strong> equally insured among siblings when applicable",
            "Do not insure juveniles for more coverage than the parents carry",
            "Parents must have coverage in force",
            "Juvenile Questionnaire: <strong>ICC20-9825</strong>",
            "Guardianship documents required if a grandparent or guardian applies",
          ],
        },
        {
          h2: "Family Solution / Family Choice",
          cards: [
            {
              h: "Ages & face",
              items: [
                "Issue ages: <strong>0–49</strong>",
                "Minimum face: <strong>$10,000</strong>",
                "IMD maximum: <strong>$35,000</strong> (ages 0–49)",
                "ROP (ages 18–49) maximum: <strong>$20,000</strong>",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "American Amicable — Riders infantiles/nietos y guías juveniles | Mejor Vida Seguros",
      description:
        "Rider de nietos GCIA de American Amicable, acuerdo CIA, guías de solicitud juvenil y notas de Family Solution / Family Choice. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "American Amicable cobertura infantil | Mejor Vida Seguros",
      ogDescription:
        "GCIA, CIA, reglas de solicitud juvenil y edades/capitales de Family Solution. Consulte una ilustración con Mejor Vida Seguros — los montos del rider varían.",
      h1: "Vías de cobertura infantil y de nietos",
      lead:
        "American Amicable ofrece <strong>riders infantiles/nietos</strong> en algunos productos de gastos finales y diseños <strong>Family Solution / Family Choice</strong> que pueden incluir edades más jóvenes. Mejor Vida Seguros puede ayudar a comparar — los montos del rider no se listan aquí; consulte una ilustración.",
      serviceName: "American Amicable cobertura infantil y de nietos",
      serviceType: "Riders de seguro de vida infantil / nietos",
      sections: [
        {
          h2: "Riders en gastos finales para adultos",
          cards: [
            {
              h: "GCIA — Rider de nietos",
              items: [
                "Disponible en <strong>Golden Solution</strong> y <strong>Senior Choice</strong>",
                "Formulario en español: <strong>3838S</strong>",
                "Montos del rider: <strong>desconocidos en esta página</strong> — consulte una ilustración",
              ],
            },
            {
              h: "CIA — Children's Insurance Agreement",
              items: [
                "Disponible en algunos productos de gastos finales",
                "Formulario: <strong>ICC15-AA3215</strong>",
                "Capital y prima exactos: consulte una ilustración",
              ],
            },
          ],
        },
        {
          h2: "Guías de solicitud juvenil",
          list: [
            "Edades <strong>0–17</strong> asegurados de forma equitativa entre hermanos cuando aplique",
            "No asegure a menores por más cobertura que la que tienen los padres",
            "Los padres deben tener cobertura en vigor",
            "Cuestionario juvenil: <strong>ICC20-9825</strong>",
            "Documentos de tutoría requeridos si solicita un abuelo o tutor",
          ],
        },
        {
          h2: "Family Solution / Family Choice",
          cards: [
            {
              h: "Edades y capital",
              items: [
                "Edades de emisión: <strong>0–49</strong>",
                "Capital mínimo: <strong>$10,000</strong>",
                "Máximo IMD: <strong>$35,000</strong> (edades 0–49)",
                "Máximo ROP (edades 18–49): <strong>$20,000</strong>",
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "aetna",
    brand: "Aetna",
    enFile: "aetna-children.html",
    esFile: "aetna-infantil.html",
    parentEn: "aetna.html",
    parentEs: "aetna.html",
    logoEn: `<img alt="Aetna" class="d-inline-block" src="../../img/carriers/aetna-logo.svg" width="512" height="98" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/>`,
    logoEs: `<img alt="Aetna" class="d-inline-block" src="../img/carriers/aetna-logo.svg" width="512" height="98" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/>`,
    en: {
      title: "Aetna — Child / Grandchild Term Riders on Final Expense | Mejor Vida Insurance",
      description:
        "Aetna Accendo Level and Protection Series children's / grandchild term riders typically use $2,500 units up to $10,000 per child on adult final expense. Exact ages and premiums: ask for an illustration. Mejor Vida Insurance.",
      ogTitle: "Aetna child/grandchild term riders | Mejor Vida Insurance",
      ogDescription:
        "Child term riders on Accendo Level and Protection Series adult final expense. Compare with Mejor Vida Insurance — ask for an illustration for ages and premiums.",
      h1: "Child / grandchild term riders",
      lead:
        "Aetna's appointed final expense lines are adult policies. Children's coverage here is typically a <strong>term rider</strong> on <strong>Accendo Level</strong> or <strong>Protection Series</strong> — not a standalone kids whole life. Mejor Vida Insurance can help compare.",
      serviceName: "Aetna child/grandchild term riders",
      serviceType: "Children's Term Rider on Final Expense",
      sections: [
        {
          h2: "Where the rider attaches",
          cards: [
            {
              h: "Accendo Level",
              items: [
                "Base Accendo adult final expense issue ages typically <strong>40–89</strong>",
                "Child/grandchild term rider often in <strong>$2,500</strong> units up to about <strong>$10,000 per child</strong>",
                "Exact child ages, termination age, and premium: <strong>ask for an illustration</strong>",
              ],
            },
            {
              h: "Protection Series (CLI)",
              items: [
                "Base Protection Series / CLI adult FE issue ages typically <strong>45–89</strong>",
                "Children's term rider referenced on product flyer materials",
                "Unit sizes and premiums: ask for an illustration — not published as fixed numbers on this page",
              ],
            },
          ],
        },
        {
          h2: "What is known vs unknown",
          list: [
            "Known pattern: small per-child term units on an adult FE policy",
            "Unknown without an illustration: exact issue ages for the child, termination, conversion, and monthly premium",
            "This is not a standalone children's whole life product on the Aetna FE portal",
          ],
        },
      ],
    },
    es: {
      title: "Aetna — Riders de término infantil/nietos en gastos finales | Mejor Vida Seguros",
      description:
        "Los riders de término infantil/nietos de Aetna Accendo Level y Protection Series suelen usar unidades de $2,500 hasta $10,000 por niño en pólizas adultas de gastos finales. Edades y primas exactas: consulte una ilustración. Mejor Vida Seguros.",
      ogTitle: "Aetna riders infantiles/nietos | Mejor Vida Seguros",
      ogDescription:
        "Riders de término infantil en Accendo Level y Protection Series. Compare con Mejor Vida Seguros — consulte una ilustración para edades y primas.",
      h1: "Riders de término infantil / nietos",
      lead:
        "Las líneas de gastos finales designadas de Aetna son pólizas para adultos. La cobertura infantil aquí suele ser un <strong>rider de término</strong> en <strong>Accendo Level</strong> o <strong>Protection Series</strong> — no una vida entera infantil independiente. Mejor Vida Seguros puede ayudar a comparar.",
      serviceName: "Aetna riders de término infantil/nietos",
      serviceType: "Rider de término infantil en gastos finales",
      sections: [
        {
          h2: "Dónde se adjunta el rider",
          cards: [
            {
              h: "Accendo Level",
              items: [
                "Edades de emisión de la póliza base Accendo adulta: típicamente <strong>40–89</strong>",
                "Rider de término infantil/nietos a menudo en unidades de <strong>$2,500</strong> hasta unos <strong>$10,000 por niño</strong>",
                "Edades exactas del niño, terminación y prima: <strong>consulte una ilustración</strong>",
              ],
            },
            {
              h: "Protection Series (CLI)",
              items: [
                "Edades de emisión de la póliza base Protection Series / CLI: típicamente <strong>45–89</strong>",
                "Rider de término infantil mencionado en materiales del producto",
                "Tamaños de unidad y primas: consulte una ilustración — no se publican cifras fijas en esta página",
              ],
            },
          ],
        },
        {
          h2: "Lo conocido frente a lo desconocido",
          list: [
            "Patrón conocido: unidades pequeñas de término por niño en una póliza FE adulta",
            "Desconocido sin ilustración: edades exactas del niño, terminación, conversión y prima mensual",
            "No es un producto de vida entera infantil independiente en el portal FE de Aetna",
          ],
        },
      ],
    },
  },
  {
    id: "corebridge",
    brand: "Corebridge",
    enFile: "corebridge-children.html",
    esFile: "corebridge-infantil.html",
    parentEn: "corebridge.html",
    parentEs: "corebridge.html",
    logoEn: `<img alt="Corebridge" class="d-inline-block" src="../../img/carriers/corebridge-logo.svg" width="576" height="188" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/>`,
    logoEs: `<img alt="Corebridge" class="d-inline-block" src="../img/carriers/corebridge-logo.svg" width="576" height="188" style="height:72px;width:auto;max-width:100%;" loading="eager" decoding="async"/>`,
    en: {
      title: "Corebridge — Child Term Riders (Select-a-Term & American Elite) | Mejor Vida Insurance",
      description:
        "Corebridge Select-a-Term Child Rider ($1,000–$25,000 to age 25) and American Elite 2 Child Rider (form 16420N). Educational overview from Mejor Vida Insurance — ask for an illustration for premiums.",
      ogTitle: "Corebridge child term riders | Mejor Vida Insurance",
      ogDescription:
        "Select-a-Term and American Elite child riders — faces, ages, and juvenile class notes. Compare with Mejor Vida Insurance.",
      h1: "Child term riders",
      lead:
        "Corebridge children's coverage on appointed lines is typically a <strong>child term rider</strong> on an adult policy (Select-a-Term or American Elite), not a standalone kids whole life. Mejor Vida Insurance can help compare options.",
      serviceName: "Corebridge child term riders",
      serviceType: "Children's Term Rider",
      sections: [
        {
          h2: "Select-a-Term Child Rider",
          cards: [
            {
              h: "Coverage band",
              items: [
                "Face amounts: <strong>$1,000–$25,000</strong>",
                "Coverage to age <strong>25</strong>",
                "Premium and exact child issue ages: ask for an illustration",
              ],
            },
          ],
        },
        {
          h2: "American Elite 2 Child Rider",
          cards: [
            {
              h: "Form & base product notes",
              items: [
                "Form <strong>16420N</strong>",
                "Base product issue ages: <strong>0–99</strong>",
                "Ages <strong>0–19</strong> juvenile: not smoker-distinct",
                "Underwriting class: <strong>Composite (juvenile)</strong>",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "Corebridge — Riders de término infantil (Select-a-Term y American Elite) | Mejor Vida Seguros",
      description:
        "Rider infantil Select-a-Term de Corebridge ($1,000–$25,000 hasta los 25) y American Elite 2 Child Rider (formulario 16420N). Resumen educativo de Mejor Vida Seguros — consulte una ilustración para primas.",
      ogTitle: "Corebridge riders infantiles | Mejor Vida Seguros",
      ogDescription:
        "Riders infantiles Select-a-Term y American Elite: capitales, edades y notas de clase juvenil. Compare con Mejor Vida Seguros.",
      h1: "Riders de término infantil",
      lead:
        "La cobertura infantil de Corebridge en las líneas designadas suele ser un <strong>rider de término infantil</strong> en una póliza adulta (Select-a-Term o American Elite), no una vida entera infantil independiente. Mejor Vida Seguros puede ayudar a comparar opciones.",
      serviceName: "Corebridge riders de término infantil",
      serviceType: "Rider de término infantil",
      sections: [
        {
          h2: "Rider infantil Select-a-Term",
          cards: [
            {
              h: "Banda de cobertura",
              items: [
                "Capitales: <strong>$1,000–$25,000</strong>",
                "Cobertura hasta los <strong>25</strong> años",
                "Prima y edades exactas de emisión del niño: consulte una ilustración",
              ],
            },
          ],
        },
        {
          h2: "American Elite 2 Child Rider",
          cards: [
            {
              h: "Formulario y notas del producto base",
              items: [
                "Formulario <strong>16420N</strong>",
                "Edades de emisión del producto base: <strong>0–99</strong>",
                "Edades <strong>0–19</strong> juveniles: no distingue fumador",
                "Clase de suscripción: <strong>Composite (juvenil)</strong>",
              ],
            },
          ],
        },
      ],
    },
  },
];

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function renderSection(section, altBg) {
  const bg = altBg ? "bg-light" : "bg-white";
  const parts = [
    `<section class="py-5 ${bg} border-bottom">`,
    `<div class="container" style="max-width:60rem;">`,
    `<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">${section.h2}</h2>`,
  ];
  if (section.intro) {
    parts.push(`<p class="text-body-secondary mb-3">${section.intro}</p>`);
  }
  if (section.cards && section.cards.length) {
    parts.push(`<div class="row g-3">`);
    for (const card of section.cards) {
      const col =
        section.cards.length === 1
          ? "col-12"
          : section.cards.length % 3 === 0
            ? "col-12 col-md-4"
            : "col-12 col-md-6";
      parts.push(`<div class="${col}"><div class="h-100 p-4 rounded-3 border bg-white">`);
      parts.push(`<h3 class="h5 fw-bold mb-3">${card.h}</h3>`);
      parts.push(`<ul class="mb-0 ps-3 text-body-secondary small">`);
      for (const item of card.items) {
        parts.push(`<li class="mb-2">${item}</li>`);
      }
      parts.push(`</ul></div></div>`);
    }
    parts.push(`</div>`);
  }
  if (section.list && section.list.length) {
    parts.push(`<ul class="text-body-secondary mb-0 ps-3">`);
    for (const item of section.list) {
      parts.push(`<li class="mb-2">${item}</li>`);
    }
    parts.push(`</ul>`);
  }
  parts.push(`</div></section>`);
  return parts.join("\n");
}

function renderOtherCarriers(current, lang) {
  const isEn = lang === "en";
  const h2 = isEn ? "Other children's carrier pages" : "Otras páginas de aseguradoras infantiles";
  const links = CARRIERS.filter((c) => c.id !== current.id).map((c) => {
    const href = isEn ? c.enFile : c.esFile;
    const label = c.brand;
    return `<a class="btn btn-outline-primary btn-sm me-2 mb-2" href="${href}">${label}</a>`;
  });
  return `<section class="py-5 bg-light border-bottom">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-3" style="color:#1a365d;">${h2}</h2>
<div>${links.join("\n")}</div>
</div>
</section>`;
}

function renderMain(carrier, lang) {
  const isEn = lang === "en";
  const copy = isEn ? carrier.en : carrier.es;
  const logo = isEn ? carrier.logoEn : carrier.logoEs;
  const costHref = isEn
    ? "../children-life-insurance-cost.html"
    : "../costo-seguro-vida-infantil.html";
  const parentLink = isEn ? carrier.parentEn : carrier.parentEs;
  const costLabel = isEn ? "Children's life insurance cost" : "Costo del seguro de vida infantil";
  const parentLabel = isEn
    ? `${carrier.brand} carrier overview`
    : `Resumen de ${carrier.brand}`;
  const ctaH = isEn
    ? `Ready to compare ${carrier.brand} children's options?`
    : `¿Listo para comparar opciones infantiles de ${carrier.brand}?`;
  const ctaP = isEn
    ? "Mejor Vida Insurance can help compare children's whole life and child/grandchild riders across appointed carriers — free quote."
    : "Mejor Vida Seguros puede ayudar a comparar vida entera infantil y riders infantiles/nietos entre aseguradoras designadas — cotización gratis.";
  const quoteHref = isEn ? "../quote.html" : "../quote.html";
  const quoteLabel = isEn ? "Free quote" : "Cotización gratis";
  const waText = isEn
    ? "Hi%2C%20I%27m%20interested%20in%20children%27s%20life%20insurance."
    : "Hola%2C%20me%20interesa%20el%20seguro%20de%20vida%20infantil.";
  const waLabel = isEn ? "WhatsApp" : "WhatsApp";
  const disc = isEn
    ? `<p class="small text-muted mb-2"><strong>Educational disclaimer:</strong> This page summarizes carrier materials for children's / juvenile coverage related to <strong>${carrier.brand}</strong>. It is not a policy, illustration, or contract. Benefits, forms, ages, and availability vary by state and underwriting. The issuing company is responsible for its products. Not connected with or endorsed by the U.S. Government or the Federal Medicare program.</p>
<p class="small text-muted mb-0">Figures marked as unknown require an illustration. Mejor Vida Insurance can help compare options — ask for current product details before applying.</p>`
    : `<p class="small text-muted mb-2"><strong>Aviso educativo:</strong> Esta página resume materiales de la aseguradora sobre cobertura infantil / juvenil relacionada con <strong>${carrier.brand}</strong>. No es una póliza, ilustración ni contrato. Beneficios, formularios, edades y disponibilidad varían por estado y suscripción. La compañía emisora es responsable de sus productos. No está conectado ni respaldado por el gobierno de EE. UU. ni por el programa Federal Medicare.</p>
<p class="small text-muted mb-0">Las cifras marcadas como desconocidas requieren una ilustración. Mejor Vida Seguros puede ayudar a comparar opciones — solicite detalles actuales del producto antes de solicitar.</p>`;

  const sectionHtml = copy.sections
    .map((s, i) => renderSection(s, i % 2 === 0))
    .join("\n\n");

  return `<main class="carrier-detail-readability">
<section class="py-5 bg-white border-bottom">
<div class="container" style="max-width:60rem;">
<div class="text-center mb-4">
${logo}
</div>
<h1 class="h2 fw-bold text-center mb-3" style="color:#1a365d;">${copy.h1}</h1>
<p class="lead text-body-secondary text-center mb-3">${copy.lead}</p>
<p class="text-center small mb-0"><a href="${costHref}">${costLabel}</a> · <a href="${parentLink}">${parentLabel}</a></p>
</div>
</section>

${sectionHtml}

${renderOtherCarriers(carrier, lang)}

<section class="py-5 text-white" style="background:#1a365d;">
<div class="container text-center" style="max-width:60rem;">
<h2 class="h3 fw-bold mb-3">${ctaH}</h2>
<p class="mb-4 text-white-50">${ctaP}</p>
<div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
<a class="btn btn-primary-gold px-4 py-3 rounded fw-bold d-inline-flex align-items-center justify-content-center" href="${quoteHref}"><i class="fas fa-file-invoice-dollar me-2"></i>${quoteLabel}</a>
<a class="btn px-4 py-3 rounded fw-bold d-inline-flex align-items-center justify-content-center" href="https://wa.me/14024405438?text=${waText}" rel="noopener" style="background:#0b3a7a;border-color:#0b3a7a;color:#fff;" target="_blank"><i class="fab fa-whatsapp me-2"></i><span>${waLabel}</span></a>
</div>
</div>
</section>

<section class="py-4 bg-white">
<div class="container" style="max-width:60rem;">
${disc}
</div>
</section>
</main>`;
}

function replaceBetween(html, startRe, endRe, replacement) {
  const start = html.search(startRe);
  if (start < 0) throw new Error("start marker not found: " + startRe);
  const afterStart = html.slice(start);
  const endRel = afterStart.search(endRe);
  if (endRel < 0) throw new Error("end marker not found: " + endRe);
  // include end match length for </main>
  const endMatch = afterStart.match(endRe);
  const end = start + endRel + endMatch[0].length;
  return html.slice(0, start) + replacement + html.slice(end);
}

function setMeta(html, lang, carrier, copy, enUrl, esUrl) {
  const canonical = lang === "en" ? enUrl : esUrl;

  // Remove noindex if present (prefer indexable children pages)
  html = html.replace(/\s*<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*["']\s*\/?>/i, "\n");

  // Spanish pages: explicit index robots for SEO strength
  if (lang === "es") {
    if (!/name=["']robots["']/i.test(html)) {
      html = html.replace(
        /(<meta content="width=device-width[^>]*>)/i,
        `$1\n<meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>`
      );
    } else {
      html = html.replace(
        /<meta[^>]*name=["']robots["'][^>]*>/i,
        `<meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>`
      );
    }
  }

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${copy.title}</title>`);
  html = html.replace(
    /<meta content="[^"]*" name="description"\/>/,
    `<meta content="${escapeAttr(copy.description)}" name="description"/>`
  );
  // also handle reversed attribute order
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta content="${escapeAttr(copy.description)}" name="description"/>`
  );

  html = html.replace(
    /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" rel="canonical"\/>/,
    `<link href="${canonical}" rel="canonical"/>`
  );

  // hreflang block — replace consecutive alternate links near head
  html = html.replace(
    /<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="es" rel="alternate"\/>\s*<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="en" rel="alternate"\/>\s*(?:<link href="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" hreflang="x-default" rel="alternate"\/>\s*)?/,
    `<link href="${esUrl}" hreflang="es" rel="alternate"/>\n<link href="${enUrl}" hreflang="en" rel="alternate"/>\n<link href="${esUrl}" hreflang="x-default" rel="alternate"/>\n`
  );

  html = html.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    `<meta content="${escapeAttr(copy.ogTitle)}" property="og:title"/>`
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:description"\/>/,
    `<meta content="${escapeAttr(copy.ogDescription)}" property="og:description"/>`
  );
  html = html.replace(
    /<meta content="https:\/\/www\.mejorvidainsurance\.com\/[^"]*" property="og:url"\/>/,
    `<meta content="${canonical}" property="og:url"/>`
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:title"\/>/,
    `<meta content="${escapeAttr(copy.ogTitle)}" name="twitter:title"/>`
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:description"\/>/,
    `<meta content="${escapeAttr(copy.ogDescription)}" name="twitter:description"/>`
  );

  if (lang === "es") {
    const kidsImg = `${BASE}/img/opt/lic-hero-children-playground.jpg`;
    html = html.replace(
      /<meta content="https:\/\/www\.mejorvidainsurance\.com\/img\/opt\/[^"]+" property="og:image"\/>/g,
      `<meta content="${kidsImg}" property="og:image"/>`
    );
    html = html.replace(
      /<meta content="https:\/\/www\.mejorvidainsurance\.com\/img\/opt\/[^"]+" name="twitter:image"\/>/g,
      `<meta content="${kidsImg}" name="twitter:image"/>`
    );
    if (!/og:site_name/.test(html)) {
      html = html.replace(
        /(<meta content="es_ES" property="og:locale"\/>)/,
        `$1\n<meta content="Mejor Vida Seguros" property="og:site_name"/>\n<meta content="en_US" property="og:locale:alternate"/>`
      );
    }
  }

  // Lang FAB → paired page
  if (lang === "en") {
    html = html.replace(
      /<a href="[^"]*" class="mvi-lang-fab text-decoration-none" title="Ver sitio en español">Español<\/a>/,
      `<a href="../../carriers/${carrier.esFile}" class="mvi-lang-fab text-decoration-none" title="Ver sitio en español">Español</a>`
    );
  } else {
    html = html.replace(
      /<a href="[^"]*" class="mvi-lang-fab text-decoration-none" title="View site in English">English<\/a>/,
      `<a href="../en/carriers/${carrier.enFile}" class="mvi-lang-fab text-decoration-none" title="View site in English">English</a>`
    );
  }

  const jsonLd =
    lang === "es"
      ? {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${canonical}#webpage`,
              url: canonical,
              name: copy.title,
              description: copy.description,
              inLanguage: "es",
              isPartOf: {
                "@type": "WebSite",
                name: "Mejor Vida Seguros",
                url: `${BASE}/`,
              },
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: `${BASE}/img/opt/lic-hero-children-playground.jpg`,
                width: 1024,
                height: 682,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: `${BASE}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Costo del seguro de vida infantil",
                  item: `${BASE}/costo-seguro-vida-infantil.html`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: carrier.brand,
                  item: canonical,
                },
              ],
            },
            {
              "@type": "Service",
              name: copy.serviceName,
              description: copy.description,
              url: canonical,
              serviceType: copy.serviceType,
              provider: {
                "@type": "InsuranceAgency",
                name: "Mejor Vida Seguros",
                legalName: "Mejor Vida Insurance LLC",
                url: `${BASE}/`,
              },
              brand: { "@type": "Brand", name: carrier.brand },
              potentialAction: {
                "@type": "CommunicateAction",
                name: "Obtener cotización gratis",
                target: `${BASE}/quote.html`,
              },
            },
          ],
        }
      : {
          "@context": "https://schema.org",
          "@type": "Service",
          name: copy.serviceName,
          description: copy.description,
          url: canonical,
          serviceType: copy.serviceType,
          provider: {
            "@type": "InsuranceAgency",
            name: "Mejor Vida Insurance LLC",
            url: `${BASE}/en/`,
          },
          brand: { "@type": "Brand", name: carrier.brand },
          potentialAction: {
            "@type": "CommunicateAction",
            name: "Get a free quote",
            target: `${BASE}/en/quote.html`,
          },
        };

  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*<\/body>/,
    `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>\n\n</body>`
  );

  return html;
}

function buildPage(carrier, lang) {
  const templatePath =
    lang === "en"
      ? path.join(ROOT, "en/carriers/aetna.html")
      : path.join(ROOT, "carriers/aetna.html");
  let html = fs.readFileSync(templatePath, "utf8");
  const copy = lang === "en" ? carrier.en : carrier.es;
  const enUrl = `${BASE}/en/carriers/${carrier.enFile}`;
  const esUrl = `${BASE}/carriers/${carrier.esFile}`;
  const main = renderMain(carrier, lang);
  html = replaceBetween(html, /<main\b/, /<\/main>/, main);
  html = setMeta(html, lang, carrier, copy, enUrl, esUrl);
  const outPath =
    lang === "en"
      ? path.join(ROOT, "en/carriers", carrier.enFile)
      : path.join(ROOT, "carriers", carrier.esFile);
  fs.writeFileSync(outPath, html);
  return path.relative(ROOT, outPath);
}

function main() {
  const written = [];
  for (const carrier of CARRIERS) {
    written.push(buildPage(carrier, "en"));
    written.push(buildPage(carrier, "es"));
  }
  console.log("Wrote", written.length, "pages:");
  for (const f of written) console.log(" ", f);
}

main();
