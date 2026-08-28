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
          intro:
            "In plain terms: this is lifelong coverage for a child. Premiums stay level, a cash value can grow over time, and the policy is designed to leave a set benefit for the family when it’s needed most.",
          cards: [
            {
              h: "Who can be covered & for how much",
              items: [
                "Available for children from <strong>14 days old through age 17</strong>",
                "Coverage (the amount paid to beneficiaries) can be about <strong>$5,000 to $50,000</strong>",
                "Simple health review only — <strong>no doctor visit or medical exam</strong>",
                "One standard rate class (no higher “table” rate categories on this product)",
              ],
            },
            {
              h: "How you pay",
              items: [
                "You can pay <strong>yearly, twice a year, quarterly, or monthly</strong> (monthly is usually by bank draft)",
                "There is a small extra policy fee of about <strong>$12 per year</strong>",
                "As long as premiums are paid as required, your <strong>price does not go up</strong> and the <strong>coverage amount does not go down</strong>",
              ],
            },
            {
              h: "Cash value & payout",
              items: [
                "The policy can build <strong>cash value</strong> over time that the owner may borrow against (loan interest is about <strong>5.66%</strong>)",
                "You generally <strong>cannot take partial cash withdrawals</strong> — access is through a policy loan instead",
                "If premiums stay current, the death benefit stays in force through age <strong>100</strong>",
              ],
            },
          ],
        },
        {
          h2: "Optional add-ons (riders)",
          intro:
            "Riders are optional extras you can add to the policy. On Children’s Whole Life, two common ones help families keep coverage flexible as the child grows — and help keep the policy paid if the owner is no longer here.",
          cards: [
            {
              h: "Guaranteed Insurability",
              items: [
                "Lets the family buy <strong>more coverage later without a new health review</strong> (no new medical exam for eligible options)",
                "Age windows after the child turns <strong>25, 30, 35, and 40</strong>",
                "Also available around big life moments: marriage/civil union, welcoming a child, or buying a home",
                "Up to <strong>5</strong> times total; each option usually must be used within <strong>6 months</strong>",
                "Mutual of Omaha typically sends a reminder about <strong>60 days</strong> before age-based windows",
              ],
            },
            {
              h: "Premium help if the owner passes away",
              items: [
                "If the policy owner dies, premiums can be paused for a one-time period of <strong>90 days</strong>",
                "This help becomes available <strong>24 months</strong> after the policy starts",
                "Those paused premiums are <strong>not taken out</strong> of the policy’s benefit amount",
              ],
            },
          ],
        },
        {
          h2: "How the application works",
          list: [
            "You can apply for up to <strong>8 children</strong> on one form — each child still gets their own policy",
            "Grandparents may be able to sign without a parent’s signature (when product rules allow)",
            "This product does not use a “conditional receipt” (temporary coverage paperwork some other policies use)",
          ],
        },
        {
          h2: "Other Mutual of Omaha options for kids",
          intro:
            "Besides the standalone Children’s Whole Life policy, Mutual of Omaha also has other ways to cover a child. These are <strong>different products</strong> — Mejor Vida Insurance can help you compare which path fits your family.",
          cards: [
            {
              h: "Larger coverage with a full health review",
              items: [
                "Usually for children from about <strong>15 days through age 17</strong>",
                "Higher coverage amounts are possible — often up to about <strong>$250,000</strong> (larger amounts need more review)",
                "A child’s coverage is usually limited to about <strong>half</strong> of what the parent with less life insurance already has",
                "This path is <strong>not available in Washington</strong>",
              ],
            },
            {
              h: "Add-on coverage on a parent’s policy",
              items: [
                "Instead of a separate kids policy, some adult policies can add a small <strong>child rider</strong>",
                "Combined rider coverage is often limited to about <strong>$10,000 per child</strong>",
                "Ask Mejor Vida Insurance for a personalized illustration — rider pricing depends on the adult policy",
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
          intro:
            "En palabras sencillas: es cobertura de por vida para un niño. Las primas se mantienen niveladas, puede acumular valor en efectivo con el tiempo y la póliza está pensada para dejar un beneficio fijo a la familia cuando más se necesite.",
          cards: [
            {
              h: "Quién puede cubrirse y por cuánto",
              items: [
                "Disponible para niños desde los <strong>14 días hasta los 17 años</strong>",
                "La cobertura (el monto que reciben los beneficiarios) puede ser de unos <strong>$5,000 a $50,000</strong>",
                "Solo revisión de salud sencilla — <strong>sin examen médico ni visita al doctor</strong>",
                "Una sola clase de tarifa estándar (sin categorías más altas de “tabla” en este producto)",
              ],
            },
            {
              h: "Cómo se paga",
              items: [
                "Puede pagar <strong>anual, semestral, trimestral o mensual</strong> (lo mensual suele ser por débito bancario)",
                "Hay un cargo adicional pequeño de póliza de unos <strong>$12 al año</strong>",
                "Mientras se paguen las primas requeridas, el <strong>precio no sube</strong> y el <strong>monto de cobertura no baja</strong>",
              ],
            },
            {
              h: "Valor en efectivo y pago por fallecimiento",
              items: [
                "La póliza puede acumular <strong>valor en efectivo</strong> con el tiempo; el dueño puede pedir un préstamo sobre ese valor (interés aproximado <strong>5.66%</strong>)",
                "Por lo general <strong>no se permiten retiros parciales</strong> de efectivo — el acceso suele ser mediante préstamo de la póliza",
                "Si las primas se mantienen al día, el beneficio por fallecimiento permanece hasta los <strong>100</strong> años",
              ],
            },
          ],
        },
        {
          h2: "Complementos opcionales (riders)",
          intro:
            "Los riders son extras opcionales que puede agregar a la póliza. En la vida entera infantil, dos comunes ayudan a mantener la cobertura flexible a medida que el niño crece — y a facilitar el pago de la póliza si el dueño ya no está.",
          cards: [
            {
              h: "Asegurabilidad garantizada",
              items: [
                "Permite comprar <strong>más cobertura más adelante sin una nueva revisión de salud</strong> (sin examen médico nuevo en opciones elegibles)",
                "Ventanas de edad después de que el niño cumpla <strong>25, 30, 35 y 40</strong>",
                "También en momentos importantes: matrimonio/unión civil, llegada de un hijo o compra de vivienda",
                "Hasta <strong>5</strong> veces en total; cada opción suele usarse dentro de <strong>6 meses</strong>",
                "Mutual of Omaha suele enviar un recordatorio unos <strong>60 días</strong> antes de las ventanas por edad",
              ],
            },
            {
              h: "Ayuda con primas si fallece el dueño",
              items: [
                "Si fallece el dueño de la póliza, las primas pueden pausarse una sola vez por <strong>90 días</strong>",
                "Esta ayuda está disponible <strong>24 meses</strong> después de que inicie la póliza",
                "Esas primas pausadas <strong>no se restan</strong> del monto del beneficio de la póliza",
              ],
            },
          ],
        },
        {
          h2: "Cómo funciona la solicitud",
          list: [
            "Puede solicitar hasta <strong>8 niños</strong> en un formulario — cada niño recibe su propia póliza",
            "Los abuelos pueden firmar sin la firma de un padre/madre (cuando las reglas del producto lo permiten)",
            "Este producto no usa un “recibo condicional” (el papeleo de cobertura temporal que usan otras pólizas)",
          ],
        },
        {
          h2: "Otras opciones de Mutual of Omaha para niños",
          intro:
            "Además de la póliza independiente de vida entera infantil, Mutual of Omaha también tiene otras formas de cubrir a un niño. Son <strong>productos distintos</strong> — Mejor Vida Seguros puede ayudar a comparar cuál conviene a su familia.",
          cards: [
            {
              h: "Cobertura mayor con revisión completa de salud",
              items: [
                "Por lo general para niños desde unos <strong>15 días hasta los 17 años</strong>",
                "Se pueden considerar montos más altos — a menudo hasta unos <strong>$250,000</strong> (montos mayores necesitan más revisión)",
                "La cobertura del niño suele limitarse a cerca de la <strong>mitad</strong> de lo que ya tiene el padre/madre con menos seguro de vida",
                "Esta vía <strong>no está disponible en Washington</strong>",
              ],
            },
            {
              h: "Cobertura adicional en la póliza de un adulto",
              items: [
                "En lugar de una póliza infantil separada, algunas pólizas de adultos pueden agregar un pequeño <strong>rider para hijos</strong>",
                "La cobertura combinada del rider suele limitarse a unos <strong>$10,000 por niño</strong>",
                "Consulte a Mejor Vida Seguros una ilustración personalizada — el precio del rider depende de la póliza del adulto",
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
      title: "Assurity — Children's Whole Life (Protect+ & Perform+) | Mejor Vida Insurance",
      description:
        "Assurity Protect+ and Perform+ permanent life insurance for children from 15 days old: coverage amounts, living benefits, ownership at 25, and optional add-ons. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Assurity children's whole life | Mejor Vida Insurance",
      ogDescription:
        "Assurity Protect+/Perform+ for kids — ages, coverage amounts, living benefits, ownership transfer at 25, and optional add-ons. Compare with Mejor Vida Insurance.",
      h1: "Children's whole life (Protect+ & Perform+)",
      lead:
        "<strong>Assurity Protect+</strong> and <strong>Perform+</strong> are lifelong (permanent) life insurance plans. They can cover a child from early infancy — and the same product family also covers adults. Mejor Vida Insurance can help compare Assurity with other children's coverage options.",
      serviceName: "Assurity Protect+ / Perform+ children's whole life",
      serviceType: "Children's Whole Life Insurance",
      sections: [
        {
          h2: "At a glance",
          intro:
            "In plain terms: this is lifelong coverage that can start when a child is very young. Premiums are designed to stay on a set schedule, the policy can build cash value, and the family can leave a set benefit in place as the child grows into adulthood.",
          cards: [
            {
              h: "Who can be covered & for how much",
              items: [
                "Available from <strong>15 days old through age 85</strong> (children and adults use the same product family)",
                "Coverage usually starts at about <strong>$10,000</strong> and can go higher",
                "For children ages <strong>15 days–17</strong>, many applications can be reviewed <strong>without a medical exam</strong> for coverage up to about <strong>$300,000</strong>",
                "Two plan styles: <strong>Protect+</strong> leans toward more death benefit for the premium; <strong>Perform+</strong> leans toward stronger cash-value growth",
              ],
            },
            {
              h: "Ownership & living benefits",
              items: [
                "On a child’s policy, ownership typically <strong>moves to the child automatically at age 25</strong> — no extra paperwork",
                "Built-in <strong>living benefits</strong>: if a covered critical, chronic, or terminal illness qualifies, part of the death benefit may be available early (rules apply)",
                "Critical and chronic living-benefit options are generally available when the insured is issued through age <strong>70</strong>",
              ],
            },
            {
              h: "Where it’s available",
              items: [
                "Per Assurity materials, these plans are offered in all states except <strong>California</strong> and <strong>New York</strong>",
                "Details and optional add-ons still vary by state — confirm before applying",
                "Payment schedules can include options like <strong>10-Pay, 20-Pay, pay to age 65, or pay to age 100</strong> (ask for an illustration)",
              ],
            },
          ],
        },
        {
          h2: "Optional add-ons (riders)",
          intro:
            "Riders are optional extras. Exact amounts and prices depend on the illustration — ask Mejor Vida Insurance for numbers that match your family before relying on any figure.",
          cards: [
            {
              h: "Children’s term add-on (on an adult’s policy)",
              items: [
                "Puts temporary coverage on the children named on an <strong>adult’s</strong> Protect+/Perform+ policy (a different path than buying a full kids policy)",
                "Child ages typically <strong>15 days through 17</strong>; coverage for each child usually ends around age <strong>25</strong>",
                "Common coverage range about <strong>$5,000–$25,000</strong> per child (confirm on an illustration)",
                "New children born or adopted later may be added when rider rules allow",
              ],
            },
            {
              h: "Premium help for a child’s policy (Payor Benefit)",
              items: [
                "Can waive premiums on a <strong>child’s</strong> policy if the person paying premiums dies or becomes totally disabled (while rules still apply)",
                "Usually for child ages <strong>15 days–17</strong>, with the premium payor ages <strong>18–55</strong>",
                "This help generally ends by the child’s age <strong>25</strong> (or earlier under product rules)",
              ],
            },
            {
              h: "Guaranteed Insurability",
              items: [
                "Lets the insured buy <strong>more coverage later without a new health review</strong> (on eligible option dates)",
                "Options are limited (Assurity materials describe up to <strong>five</strong> purchases before age <strong>40</strong>)",
                "Useful as a child grows into adulthood and may want more protection",
              ],
            },
            {
              h: "Extra benefit for accidental death",
              items: [
                "An optional Accidental Death Benefit can pay an extra amount if death is caused by a covered accident",
                "Availability and amounts vary — ask for an illustration",
              ],
            },
          ],
        },
        {
          h2: "Two common ways families use Assurity for kids",
          intro:
            "These are <strong>different paths</strong>. Mejor Vida Insurance can help you compare which one fits — a policy in the child’s name, or smaller temporary coverage attached to a parent’s plan.",
          cards: [
            {
              h: "A permanent policy for the child",
              items: [
                "The child is the insured on Protect+ or Perform+",
                "Coverage can last a lifetime and may build cash value",
                "Ownership typically transfers to the child at age <strong>25</strong>",
              ],
            },
            {
              h: "A temporary add-on on a parent’s policy",
              items: [
                "An adult buys Protect+/Perform+ and adds the Children’s Term rider",
                "Usually smaller dollar amounts that end around each child’s age <strong>25</strong>",
                "Often used when the main goal is modest, short-term protection for several children on one adult plan",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "Assurity — Vida entera infantil (Protect+ y Perform+) | Mejor Vida Seguros",
      description:
        "Assurity Protect+ y Perform+ seguro de vida permanente para niños desde los 15 días: montos, beneficios en vida, propiedad a los 25 y complementos opcionales. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Assurity vida entera infantil | Mejor Vida Seguros",
      ogDescription:
        "Assurity Protect+/Perform+ para niños: edades, montos, beneficios en vida, transferencia a los 25 y complementos opcionales. Compare con Mejor Vida Seguros.",
      h1: "Vida entera infantil (Protect+ y Perform+)",
      lead:
        "<strong>Assurity Protect+</strong> y <strong>Perform+</strong> son planes de seguro de vida permanente (de por vida). Pueden cubrir a un niño desde la primera infancia — y la misma familia de productos también cubre adultos. Mejor Vida Seguros puede ayudar a comparar Assurity con otras opciones infantiles.",
      serviceName: "Assurity Protect+ / Perform+ vida entera infantil",
      serviceType: "Seguro de vida entera infantil",
      sections: [
        {
          h2: "Resumen",
          intro:
            "En palabras sencillas: es cobertura de por vida que puede empezar cuando el niño es muy pequeño. Las primas siguen un calendario definido, la póliza puede acumular valor en efectivo y la familia puede dejar un beneficio fijo a medida que el niño crece.",
          cards: [
            {
              h: "Quién puede cubrirse y por cuánto",
              items: [
                "Disponible desde los <strong>15 días hasta los 85 años</strong> (niños y adultos usan la misma familia de productos)",
                "La cobertura suele empezar en unos <strong>$10,000</strong> y puede ser mayor",
                "Para niños de <strong>15 días a 17 años</strong>, muchas solicitudes pueden revisarse <strong>sin examen médico</strong> por cobertura de hasta unos <strong>$300,000</strong>",
                "Dos estilos de plan: <strong>Protect+</strong> prioriza más beneficio por fallecimiento por la prima; <strong>Perform+</strong> prioriza un crecimiento más fuerte del valor en efectivo",
              ],
            },
            {
              h: "Propiedad y beneficios en vida",
              items: [
                "En una póliza infantil, la propiedad suele <strong>pasar al niño automáticamente a los 25 años</strong> — sin papeleo extra",
                "Incluye <strong>beneficios en vida</strong>: si califica una enfermedad crítica, crónica o terminal cubierta, parte del beneficio por fallecimiento puede estar disponible antes (aplican reglas)",
                "Las opciones de beneficio en vida por enfermedad crítica y crónica suelen estar disponibles cuando el asegurado se emite hasta los <strong>70</strong> años",
              ],
            },
            {
              h: "Dónde está disponible",
              items: [
                "Según materiales de Assurity, estos planes se ofrecen en todos los estados excepto <strong>California</strong> y <strong>Nueva York</strong>",
                "Los detalles y complementos opcionales aún varían por estado — confirme antes de solicitar",
                "Los calendarios de pago pueden incluir opciones como <strong>10 pagos, 20 pagos, pagar hasta los 65 o pagar hasta los 100</strong> (pida una ilustración)",
              ],
            },
          ],
        },
        {
          h2: "Complementos opcionales (riders)",
          intro:
            "Los riders son extras opcionales. Los montos y precios exactos dependen de la ilustración — pida a Mejor Vida Seguros cifras que correspondan a su familia antes de confiar en cualquier número.",
          cards: [
            {
              h: "Complemento temporal para hijos (en la póliza de un adulto)",
              items: [
                "Agrega cobertura temporal a los hijos nombrados en una póliza Protect+/Perform+ de un <strong>adulto</strong> (es un camino distinto a comprar una póliza infantil completa)",
                "Edades del niño suelen ser de <strong>15 días a 17</strong>; la cobertura de cada niño suele terminar cerca de los <strong>25</strong> años",
                "Rango común de cobertura: unos <strong>$5,000–$25,000</strong> por niño (confirme en una ilustración)",
                "Los hijos nacidos o adoptados después pueden agregarse cuando las reglas del rider lo permitan",
              ],
            },
            {
              h: "Ayuda con primas en una póliza infantil (Payor Benefit)",
              items: [
                "Puede eximir las primas de una póliza del <strong>niño</strong> si quien las paga fallece o queda totalmente discapacitado (mientras apliquen las reglas)",
                "Suele ser para niños de <strong>15 días–17</strong>, con el pagador de primas entre <strong>18–55</strong> años",
                "Esta ayuda generalmente termina a los <strong>25</strong> años del niño (o antes según las reglas del producto)",
              ],
            },
            {
              h: "Asegurabilidad garantizada",
              items: [
                "Permite comprar <strong>más cobertura más adelante sin una nueva revisión de salud</strong> (en fechas de opción elegibles)",
                "Las opciones son limitadas (los materiales de Assurity describen hasta <strong>cinco</strong> compras antes de los <strong>40</strong> años)",
                "Útil a medida que el niño crece y puede querer más protección",
              ],
            },
            {
              h: "Beneficio extra por muerte accidental",
              items: [
                "Un Beneficio por Muerte Accidental opcional puede pagar un monto adicional si el fallecimiento se debe a un accidente cubierto",
                "La disponibilidad y los montos varían — pida una ilustración",
              ],
            },
          ],
        },
        {
          h2: "Dos formas comunes en que las familias usan Assurity para niños",
          intro:
            "Son <strong>caminos distintos</strong>. Mejor Vida Seguros puede ayudar a comparar cuál conviene — una póliza a nombre del niño, o una cobertura temporal más pequeña en el plan de un padre/madre.",
          cards: [
            {
              h: "Una póliza permanente para el niño",
              items: [
                "El niño es el asegurado en Protect+ o Perform+",
                "La cobertura puede durar toda la vida y puede acumular valor en efectivo",
                "La propiedad suele transferirse al niño a los <strong>25</strong> años",
              ],
            },
            {
              h: "Un complemento temporal en la póliza de un padre/madre",
              items: [
                "Un adulto compra Protect+/Perform+ y agrega el rider de término infantil",
                "Suelen ser montos más pequeños que terminan cerca de los <strong>25</strong> años de cada niño",
                "A menudo se usa cuando la meta es una protección modesta y de corto plazo para varios hijos en un solo plan de adulto",
              ],
            },
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
      title: "Transamerica — Children's Immediate Solution & Child/Grandchild Add-on | Mejor Vida Insurance",
      description:
        "Transamerica Immediate Solution for children (ages 0–85 product family) plus a child/grandchild add-on on some adult policies. Ages, coverage amounts, and plain-language overview from Mejor Vida Insurance.",
      ogTitle: "Transamerica children's Immediate Solution | Mejor Vida Insurance",
      ogDescription:
        "Immediate Solution for kids — ages, coverage limits, eligibility notes, and child/grandchild add-on facts. Compare with Mejor Vida Insurance.",
      h1: "Immediate Solution for kids & child/grandchild add-on",
      lead:
        "<strong>Transamerica Immediate Solution</strong> is a permanent life insurance plan that can cover children as well as adults. On some adult Immediate Solution policies, families can also add a small <strong>child or grandchild add-on</strong>. Mejor Vida Insurance can help compare which path fits.",
      serviceName: "Transamerica Immediate Solution for children & child/grandchild add-on",
      serviceType: "Children's Whole Life / Child Rider",
      sections: [
        {
          h2: "At a glance — Immediate Solution",
          intro:
            "In plain terms: Immediate Solution is lifelong coverage with a set benefit. When the policy is issued as “Immediate,” the full benefit amount is designed to be in force from day one (as long as the policy stays in force under its terms).",
          cards: [
            {
              h: "Who can be covered & for how much",
              items: [
                "For <strong>children</strong>, coverage usually starts around <strong>$1,000</strong> and can go up to about <strong>$50,000</strong>",
                "Immediate Solution is the <strong>same product adults can buy</strong> — so the carrier’s overall age range is <strong>0–85</strong>, not just kids",
                "At older adult ages the company allows a smaller maximum (about <strong>$40,000</strong> at 56–65, <strong>$30,000</strong> at 66–75, and <strong>$25,000</strong> at 76–85). Those adult caps don’t change the children’s limit above",
                "Children may qualify under preferred or standard kids rate classes (ask for an illustration)",
              ],
            },
            {
              h: "Ownership & eligibility notes",
              items: [
                "A parent or grandparent can own the policy even when the child is the person covered",
                "If health questions show “yes” in <strong>two or more</strong> medical categories, this path is usually not available",
                "A history of childhood cancer typically means this product is not offered — Mejor Vida Insurance can help look at other options",
              ],
            },
            {
              h: "What families often like",
              items: [
                "Full benefit from day one when issued as Immediate Solution",
                "Can start coverage when a child is very young",
                "Optional add-on for children or grandchildren on some adult policies (details below)",
              ],
            },
          ],
        },
        {
          h2: "Optional child/grandchild add-on (on an adult’s policy)",
          intro:
            "This add-on (sometimes called the Children’s/Grandchildren’s Benefit Rider) attaches to <strong>Immediate Solution only</strong> — not to Transamerica’s other final-expense designs on this page. Exact pricing should still be confirmed on an illustration.",
          cards: [
            {
              h: "Who it covers & what it costs",
              items: [
                "Adds temporary coverage for children or grandchildren named on the rider",
                "Premium is very low because the add-on amounts are small: about <strong>$2 per year</strong> for each <strong>$1,000</strong> of coverage, per child (example: about <strong>$10 a year</strong> for <strong>$5,000</strong> on one child)",
                "Parent or grandparent owner ages <strong>18–75</strong>; child ages <strong>15 days through 18</strong>",
                "Up to <strong>9</strong> children or grandchildren on one rider",
              ],
            },
            {
              h: "How much coverage",
              items: [
                "Usually from <strong>$1,000</strong> up to the lesser of the adult policy’s coverage or <strong>$5,000</strong> per child",
                "Every child on the rider gets the <strong>same</strong> coverage amount",
                "Across Transamerica final-expense child/grandchild add-ons, total coverage is generally capped at about <strong>$5,000</strong> per child",
              ],
            },
            {
              h: "When it ends & converting later",
              items: [
                "Coverage for each child typically ends on the rider anniversary after they turn <strong>25</strong>",
                "After <strong>2 years</strong> on the rider, the family may convert to a permanent policy without a new health review (kids’ classes apply by age)",
                "If a child already has a terminal illness expected within <strong>24 months</strong>, they usually cannot be added to this rider",
              ],
            },
          ],
        },
        {
          h2: "Two common ways families use Transamerica for kids",
          intro:
            "These are <strong>different paths</strong>. Mejor Vida Insurance can help you compare a policy in the child’s name versus a small temporary add-on on a parent’s or grandparent’s plan.",
          cards: [
            {
              h: "A permanent policy for the child",
              items: [
                "The child is the insured on Immediate Solution",
                "Coverage amounts follow the age-based limits above",
                "A parent or grandparent can own the policy while the child is young",
              ],
            },
            {
              h: "A temporary add-on on an adult’s policy",
              items: [
                "An adult buys Immediate Solution and adds the child/grandchild rider",
                "Usually smaller amounts (often up to about <strong>$5,000</strong> per child) that end around age <strong>25</strong>",
                "Often used when the goal is modest short-term protection for several children or grandchildren",
              ],
            },
          ],
        },
      ],
    },
    es: {
      title: "Transamerica — Immediate Solution infantil y complemento hijo/nieto | Mejor Vida Seguros",
      description:
        "Transamerica Immediate Solution para niños (familia de producto 0–85) y un complemento para hijo/nieto en algunas pólizas de adultos. Edades, montos y resumen en lenguaje sencillo de Mejor Vida Seguros.",
      ogTitle: "Transamerica Immediate Solution infantil | Mejor Vida Seguros",
      ogDescription:
        "Immediate Solution para niños: edades, límites de cobertura, notas de elegibilidad y hechos del complemento hijo/nieto. Compare con Mejor Vida Seguros.",
      h1: "Immediate Solution para niños y complemento hijo/nieto",
      lead:
        "<strong>Transamerica Immediate Solution</strong> es un plan de seguro de vida permanente que puede cubrir a niños y también a adultos. En algunas pólizas Immediate Solution de adultos, las familias también pueden agregar un pequeño <strong>complemento para hijo o nieto</strong>. Mejor Vida Seguros puede ayudar a comparar qué camino conviene.",
      serviceName: "Transamerica Immediate Solution infantil y complemento hijo/nieto",
      serviceType: "Vida entera infantil / rider infantil",
      sections: [
        {
          h2: "Resumen — Immediate Solution",
          intro:
            "En palabras sencillas: Immediate Solution es cobertura de por vida con un beneficio fijo. Cuando la póliza se emite como “Immediate,” el monto completo del beneficio está pensado para estar en vigor desde el primer día (mientras la póliza se mantenga según sus términos).",
          cards: [
            {
              h: "Quién puede cubrirse y por cuánto",
              items: [
                "Para <strong>niños</strong>, la cobertura suele empezar alrededor de <strong>$1,000</strong> y puede llegar hasta unos <strong>$50,000</strong>",
                "Immediate Solution es el <strong>mismo producto que también pueden comprar los adultos</strong> — por eso el rango general de la aseguradora es <strong>0–85</strong> años, no solo niños",
                "En edades adultas mayores, la compañía permite un máximo más bajo (unos <strong>$40,000</strong> a los 56–65, <strong>$30,000</strong> a los 66–75 y <strong>$25,000</strong> a los 76–85). Esos tope de adultos <strong>no cambian</strong> el límite infantil de arriba",
                "Los niños pueden calificar en clases de tarifa preferente o estándar para menores (pida una ilustración)",
              ],
            },
            {
              h: "Propiedad y notas de elegibilidad",
              items: [
                "Un padre/madre o abuelo puede ser dueño de la póliza aunque el niño sea la persona cubierta",
                "Si las preguntas de salud muestran “sí” en <strong>dos o más</strong> categorías médicas, esta vía suele no estar disponible",
                "Un historial de cáncer infantil normalmente significa que este producto no se ofrece — Mejor Vida Seguros puede ayudar a ver otras opciones",
              ],
            },
            {
              h: "Lo que las familias suelen valorar",
              items: [
                "Beneficio completo desde el primer día cuando se emite como Immediate Solution",
                "Puede empezar la cobertura cuando el niño es muy pequeño",
                "Complemento opcional para hijos o nietos en algunas pólizas de adultos (detalles abajo)",
              ],
            },
          ],
        },
        {
          h2: "Complemento opcional hijo/nieto (en la póliza de un adulto)",
          intro:
            "Este complemento (a veces llamado Children’s/Grandchildren’s Benefit Rider) solo se agrega a <strong>Immediate Solution</strong> — no a otros diseños de gastos finales de Transamerica en esta página. El precio exacto aún debe confirmarse en una ilustración.",
          cards: [
            {
              h: "A quién cubre y cuánto cuesta",
              items: [
                "Agrega cobertura temporal para hijos o nietos nombrados en el complemento",
                "La prima es muy baja porque los montos del complemento son pequeños: unos <strong>$2 al año</strong> por cada <strong>$1,000</strong> de cobertura, por niño (ejemplo: unos <strong>$10 al año</strong> por <strong>$5,000</strong> en un niño)",
                "Dueño padre/madre o abuelo: edades <strong>18–75</strong>; niño: <strong>15 días a 18</strong> años",
                "Hasta <strong>9</strong> hijos o nietos en un mismo complemento",
              ],
            },
            {
              h: "Cuánta cobertura",
              items: [
                "Suele ir desde <strong>$1,000</strong> hasta el menor entre la cobertura de la póliza del adulto o <strong>$5,000</strong> por niño",
                "Todos los niños en el complemento reciben el <strong>mismo</strong> monto de cobertura",
                "En los complementos infantiles/nietos de gastos finales de Transamerica, el total suele toparse en unos <strong>$5,000</strong> por niño",
              ],
            },
            {
              h: "Cuándo termina y convertir después",
              items: [
                "La cobertura de cada niño suele terminar en el aniversario del complemento después de cumplir <strong>25</strong>",
                "Después de <strong>2 años</strong> en el complemento, la familia puede convertir a una póliza permanente sin una nueva revisión de salud (aplican clases por edad)",
                "Si un niño ya tiene una enfermedad terminal con expectativa de <strong>24 meses</strong>, normalmente no puede agregarse a este complemento",
              ],
            },
          ],
        },
        {
          h2: "Dos formas comunes en que las familias usan Transamerica para niños",
          intro:
            "Son <strong>caminos distintos</strong>. Mejor Vida Seguros puede ayudar a comparar una póliza a nombre del niño frente a un pequeño complemento temporal en el plan de un padre/madre o abuelo.",
          cards: [
            {
              h: "Una póliza permanente para el niño",
              items: [
                "El niño es el asegurado en Immediate Solution",
                "Los montos de cobertura siguen los límites por edad de arriba",
                "Un padre/madre o abuelo puede ser dueño de la póliza mientras el niño es pequeño",
              ],
            },
            {
              h: "Un complemento temporal en la póliza de un adulto",
              items: [
                "Un adulto compra Immediate Solution y agrega el rider hijo/nieto",
                "Suelen ser montos más pequeños (a menudo hasta unos <strong>$5,000</strong> por niño) que terminan cerca de los <strong>25</strong> años",
                "A menudo se usa cuando la meta es una protección modesta de corto plazo para varios hijos o nietos",
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
      title: "American Amicable — Children's & Grandchild Coverage | Mejor Vida Insurance",
      description:
        "American Amicable child and grandchild add-ons on some adult final-expense plans, plus Family Solution / Family Choice for younger ages (0–49). Educational overview from Mejor Vida Insurance.",
      ogTitle: "American Amicable children's coverage | Mejor Vida Insurance",
      ogDescription:
        "Grandchild and child add-ons, Family Solution ages and coverage amounts, and plain-language application notes. Compare with Mejor Vida Insurance.",
      h1: "Children’s & grandchild coverage options",
      lead:
        "American Amicable can cover kids in a few different ways: a <strong>small add-on</strong> on some adult final-expense policies, or a <strong>Family Solution / Family Choice</strong> plan that can start at younger ages (including children). Mejor Vida Insurance can help compare — exact add-on dollar amounts need an illustration.",
      serviceName: "American Amicable children's & grandchild coverage",
      serviceType: "Children's / Grandchild Life Insurance",
      sections: [
        {
          h2: "At a glance",
          intro:
            "In plain terms: American Amicable is often used for adult final-expense coverage, and some of those adult plans can add a little protection for children or grandchildren. Separately, Family Solution / Family Choice can insure younger people — including kids — on their own policy.",
          cards: [
            {
              h: "Add-on on an adult’s policy",
              items: [
                "Some adult plans can add a small amount of coverage for <strong>grandchildren</strong> or <strong>children</strong>",
                "These are usually modest, temporary extras — not a full children’s whole-life policy by themselves",
                "Exact coverage amounts and premiums: <strong>ask for an illustration</strong>",
              ],
            },
            {
              h: "A policy for younger ages (including kids)",
              items: [
                "<strong>Family Solution</strong> and <strong>Family Choice</strong> are whole-life style plans for ages <strong>0–49</strong>",
                "Coverage usually starts around <strong>$10,000</strong>",
                "For many “immediate” benefit designs, the maximum is about <strong>$35,000</strong> (ages 0–49)",
              ],
            },
            {
              h: "What to confirm with us",
              items: [
                "Which path fits — add-on vs. a policy in the child’s name",
                "Current availability in your state",
                "A personalized illustration before applying",
              ],
            },
          ],
        },
        {
          h2: "Optional add-ons on adult final-expense plans",
          intro:
            "These extras attach to an adult’s policy. Names like “GCIA” or “CIA” are carrier form labels — what matters for families is who gets covered and that dollar amounts must be confirmed on an illustration.",
          cards: [
            {
              h: "Grandchild add-on",
              items: [
                "Available on adult plans such as <strong>Golden Solution</strong> and <strong>Senior Choice</strong> (typically ages 50–85 for the adult)",
                "Adds a small amount of coverage for grandchildren",
                "Spanish materials are available for some forms",
                "Coverage amount and price: <strong>ask Mejor Vida Insurance for an illustration</strong>",
              ],
            },
            {
              h: "Children’s add-on",
              items: [
                "Available on some final-expense products as a children’s insurance agreement",
                "Puts coverage on children named under the adult’s policy",
                "Exact coverage and premium: <strong>ask for an illustration</strong>",
              ],
            },
          ],
        },
        {
          h2: "Family Solution / Family Choice (younger ages)",
          intro:
            "These plans are designed for people under 50 — including children — rather than only seniors. They are a different path from adding a grandchild rider onto a senior final-expense policy.",
          cards: [
            {
              h: "Who can be covered & for how much",
              items: [
                "Issue ages: <strong>0 through 49</strong>",
                "Minimum coverage typically about <strong>$10,000</strong>",
                "On common immediate-benefit designs: maximum about <strong>$35,000</strong> for ages 0–49",
                "A return-of-premium style option (ages <strong>18–49</strong>) usually tops out around <strong>$20,000</strong>",
              ],
            },
            {
              h: "How families often use this",
              items: [
                "A permanent-style policy for a child or younger adult under one of these family plans",
                "Useful when you want coverage in the child’s name, not only a small add-on on a grandparent’s policy",
                "Mejor Vida Insurance can compare this with Mutual of Omaha, Assurity, Transamerica, and other appointed options",
              ],
            },
          ],
        },
        {
          h2: "Rules when applying for a child",
          intro:
            "American Amicable has some common-sense guidelines when the person covered is a child. These help keep coverage amounts realistic for the family.",
          list: [
            "Children ages <strong>0–17</strong> in the same family are generally expected to have <strong>similar</strong> coverage amounts when applicable",
            "A child’s coverage usually should <strong>not be higher</strong> than what the parents (or legal guardians) already have",
            "Parents or legal guardians typically must already have life insurance in force when applying for the child",
            "If a grandparent or guardian applies, <strong>guardianship papers</strong> may be required",
          ],
        },
      ],
    },
    es: {
      title: "American Amicable — Cobertura infantil y de nietos | Mejor Vida Seguros",
      description:
        "Complementos infantiles y de nietos de American Amicable en algunos planes de gastos finales para adultos, más Family Solution / Family Choice para edades jóvenes (0–49). Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "American Amicable cobertura infantil | Mejor Vida Seguros",
      ogDescription:
        "Complementos para nietos e hijos, edades y montos de Family Solution, y notas de solicitud en lenguaje sencillo. Compare con Mejor Vida Seguros.",
      h1: "Opciones de cobertura infantil y de nietos",
      lead:
        "American Amicable puede cubrir a los niños de varias formas: un <strong>pequeño complemento</strong> en algunas pólizas de gastos finales para adultos, o un plan <strong>Family Solution / Family Choice</strong> que puede empezar en edades más jóvenes (incluyendo niños). Mejor Vida Seguros puede ayudar a comparar — los montos exactos del complemento requieren una ilustración.",
      serviceName: "American Amicable cobertura infantil y de nietos",
      serviceType: "Seguro de vida infantil / nietos",
      sections: [
        {
          h2: "Resumen",
          intro:
            "En palabras sencillas: American Amicable se usa a menudo para gastos finales de adultos, y algunos de esos planes pueden agregar un poco de protección para hijos o nietos. Por separado, Family Solution / Family Choice puede asegurar a personas más jóvenes — incluyendo niños — con su propia póliza.",
          cards: [
            {
              h: "Complemento en la póliza de un adulto",
              items: [
                "Algunos planes de adultos pueden agregar un monto pequeño de cobertura para <strong>nietos</strong> o <strong>hijos</strong>",
                "Suelen ser extras modestos y temporales — no una póliza completa de vida entera infantil por sí solos",
                "Montos y primas exactos: <strong>pida una ilustración</strong>",
              ],
            },
            {
              h: "Una póliza para edades más jóvenes (incluyendo niños)",
              items: [
                "<strong>Family Solution</strong> y <strong>Family Choice</strong> son planes tipo vida entera para edades <strong>0–49</strong>",
                "La cobertura suele empezar alrededor de <strong>$10,000</strong>",
                "En muchos diseños de beneficio “inmediato,” el máximo es de unos <strong>$35,000</strong> (edades 0–49)",
              ],
            },
            {
              h: "Qué confirmar con nosotros",
              items: [
                "Qué camino conviene — complemento vs. una póliza a nombre del niño",
                "Disponibilidad actual en su estado",
                "Una ilustración personalizada antes de solicitar",
              ],
            },
          ],
        },
        {
          h2: "Complementos opcionales en planes de gastos finales para adultos",
          intro:
            "Estos extras se agregan a la póliza de un adulto. Nombres como “GCIA” o “CIA” son etiquetas de formularios de la aseguradora — lo importante para las familias es a quién se cubre y que los montos se confirmen en una ilustración.",
          cards: [
            {
              h: "Complemento para nietos",
              items: [
                "Disponible en planes de adultos como <strong>Golden Solution</strong> y <strong>Senior Choice</strong> (típicamente edades 50–85 para el adulto)",
                "Agrega un monto pequeño de cobertura para nietos",
                "Hay materiales en español para algunos formularios",
                "Monto y precio: <strong>pida una ilustración a Mejor Vida Seguros</strong>",
              ],
            },
            {
              h: "Complemento para hijos",
              items: [
                "Disponible en algunos productos de gastos finales como acuerdo de seguro infantil",
                "Pone cobertura en los hijos nombrados bajo la póliza del adulto",
                "Cobertura y prima exactas: <strong>pida una ilustración</strong>",
              ],
            },
          ],
        },
        {
          h2: "Family Solution / Family Choice (edades más jóvenes)",
          intro:
            "Estos planes están pensados para personas menores de 50 — incluyendo niños — no solo para adultos mayores. Es un camino distinto a agregar un rider de nietos a una póliza de gastos finales de un abuelo.",
          cards: [
            {
              h: "Quién puede cubrirse y por cuánto",
              items: [
                "Edades de emisión: <strong>0 a 49</strong>",
                "Cobertura mínima típica: unos <strong>$10,000</strong>",
                "En diseños comunes de beneficio inmediato: máximo de unos <strong>$35,000</strong> para edades 0–49",
                "Una opción tipo devolución de prima (edades <strong>18–49</strong>) suele toparse alrededor de <strong>$20,000</strong>",
              ],
            },
            {
              h: "Cómo lo usan las familias",
              items: [
                "Una póliza tipo permanente para un niño o adulto joven bajo uno de estos planes familiares",
                "Útil cuando quiere cobertura a nombre del niño, no solo un pequeño complemento en la póliza de un abuelo",
                "Mejor Vida Seguros puede comparar esto con Mutual of Omaha, Assurity, Transamerica y otras opciones designadas",
              ],
            },
          ],
        },
        {
          h2: "Reglas al solicitar para un niño",
          intro:
            "American Amicable tiene algunas guías de sentido común cuando la persona cubierta es un niño. Ayudan a mantener montos realistas para la familia.",
          list: [
            "Los niños de <strong>0–17</strong> años en la misma familia suelen tener montos de cobertura <strong>similares</strong> cuando aplique",
            "La cobertura de un niño normalmente <strong>no debe ser mayor</strong> que la que ya tienen los padres (o tutores legales)",
            "Los padres o tutores legales suelen tener ya un seguro de vida en vigor al solicitar para el niño",
            "Si solicita un abuelo o tutor, pueden pedirse <strong>documentos de tutoría</strong>",
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
      title: "Aetna — Child & Grandchild Add-ons on Final Expense | Mejor Vida Insurance",
      description:
        "Aetna Accendo Level and Protection Series can add temporary child or grandchild coverage on an adult final-expense policy — often in $2,500 steps up to about $10,000 per child. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Aetna child & grandchild add-ons | Mejor Vida Insurance",
      ogDescription:
        "Temporary child/grandchild coverage on Accendo Level and Protection Series adult final expense. Compare with Mejor Vida Insurance — ask for an illustration.",
      h1: "Child & grandchild coverage add-ons",
      lead:
        "With Aetna, kids’ coverage is usually a <strong>temporary add-on</strong> on an adult final-expense policy — not a separate children’s whole-life plan. It can attach to plans like <strong>Accendo Level</strong> or <strong>Protection Series</strong>. Mejor Vida Insurance can help compare this with other appointed options.",
      serviceName: "Aetna child & grandchild coverage add-ons",
      serviceType: "Children's Term Rider on Final Expense",
      sections: [
        {
          h2: "At a glance",
          intro:
            "In plain terms: an adult buys final-expense life insurance, and the family can add a small amount of temporary coverage for children or grandchildren on that same policy.",
          cards: [
            {
              h: "What it is",
              items: [
                "A <strong>temporary</strong> (term) add-on for kids or grandkids — not lifelong kids coverage by itself",
                "Attaches to an <strong>adult</strong> final-expense policy",
                "Often sold in steps of about <strong>$2,500</strong>, up to about <strong>$10,000 per child</strong> on Accendo Level",
              ],
            },
            {
              h: "What it is not",
              items: [
                "Not a standalone children’s whole-life policy (unlike Mutual of Omaha Children’s Whole Life)",
                "Not usually available on Accendo’s <strong>Modified</strong> plan — Level designs are the typical path for these add-ons",
                "Exact child ages, when coverage ends, and the monthly price need an illustration",
              ],
            },
            {
              h: "Who this fits",
              items: [
                "Families who already want adult final-expense coverage and want a little extra for kids or grandkids",
                "People looking for modest, lower-cost temporary protection — not a large permanent kids policy",
                "Ask Mejor Vida Insurance to compare with carriers that offer a full children’s policy",
              ],
            },
          ],
        },
        {
          h2: "Which adult plans can include it",
          intro:
            "The add-on rides on the adult’s policy. The adult ages below are for the person buying the final-expense plan — not the child’s age.",
          cards: [
            {
              h: "Accendo Level",
              items: [
                "Adult final-expense plan, typically ages <strong>40–89</strong>",
                "Child/grandchild term add-on is commonly available in <strong>$2,500</strong> units up to about <strong>$10,000 per child</strong>",
                "Exact child ages and premium: <strong>ask for an illustration</strong>",
              ],
            },
            {
              h: "Protection Series",
              items: [
                "Adult final-expense plan, typically ages <strong>45–89</strong>",
                "Product materials list a <strong>children’s term</strong> add-on",
                "Unit sizes and premiums vary — confirm on an illustration (not fixed on this page)",
              ],
            },
          ],
        },
        {
          h2: "What you should confirm before applying",
          list: [
            "How much coverage per child (and how many children can be included)",
            "What ages a child must be to start, and when the add-on ends",
            "Whether conversion to a permanent policy later is available",
            "The exact monthly cost on your adult policy illustration",
          ],
        },
      ],
    },
    es: {
      title: "Aetna — Complementos infantil/nietos en gastos finales | Mejor Vida Seguros",
      description:
        "Aetna Accendo Level y Protection Series pueden agregar cobertura temporal para hijo o nieto en una póliza adulta de gastos finales — a menudo en pasos de $2,500 hasta unos $10,000 por niño. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Aetna complementos infantil/nietos | Mejor Vida Seguros",
      ogDescription:
        "Cobertura temporal para hijo/nieto en Accendo Level y Protection Series. Compare con Mejor Vida Seguros — pida una ilustración.",
      h1: "Complementos de cobertura infantil y de nietos",
      lead:
        "Con Aetna, la cobertura para niños suele ser un <strong>complemento temporal</strong> en una póliza de gastos finales para adultos — no un plan independiente de vida entera infantil. Puede agregarse a planes como <strong>Accendo Level</strong> o <strong>Protection Series</strong>. Mejor Vida Seguros puede ayudar a comparar con otras opciones designadas.",
      serviceName: "Aetna complementos de cobertura infantil y de nietos",
      serviceType: "Rider de término infantil en gastos finales",
      sections: [
        {
          h2: "Resumen",
          intro:
            "En palabras sencillas: un adulto compra seguro de gastos finales, y la familia puede agregar un monto pequeño de cobertura temporal para hijos o nietos en esa misma póliza.",
          cards: [
            {
              h: "Qué es",
              items: [
                "Un complemento <strong>temporal</strong> (término) para hijos o nietos — no cobertura infantil de por vida por sí solo",
                "Se agrega a una póliza de gastos finales de un <strong>adulto</strong>",
                "A menudo se vende en pasos de unos <strong>$2,500</strong>, hasta unos <strong>$10,000 por niño</strong> en Accendo Level",
              ],
            },
            {
              h: "Qué no es",
              items: [
                "No es una póliza independiente de vida entera infantil (a diferencia de la vida entera infantil de Mutual of Omaha)",
                "Normalmente no está disponible en el plan <strong>Modificado</strong> de Accendo — los diseños Level suelen ser la vía para estos complementos",
                "Las edades exactas del niño, cuándo termina la cobertura y el precio mensual requieren una ilustración",
              ],
            },
            {
              h: "Para quién conviene",
              items: [
                "Familias que ya quieren cobertura de gastos finales para un adulto y un poco extra para hijos o nietos",
                "Quienes buscan una protección temporal modesta y de menor costo — no una póliza infantil permanente grande",
                "Pida a Mejor Vida Seguros comparar con aseguradoras que ofrecen una póliza infantil completa",
              ],
            },
          ],
        },
        {
          h2: "En qué planes de adultos puede incluirse",
          intro:
            "El complemento va en la póliza del adulto. Las edades de abajo son de la persona que compra el plan de gastos finales — no la edad del niño.",
          cards: [
            {
              h: "Accendo Level",
              items: [
                "Plan de gastos finales para adultos, típicamente edades <strong>40–89</strong>",
                "El complemento de término infantil/nietos suele estar disponible en unidades de <strong>$2,500</strong> hasta unos <strong>$10,000 por niño</strong>",
                "Edades exactas del niño y prima: <strong>pida una ilustración</strong>",
              ],
            },
            {
              h: "Protection Series",
              items: [
                "Plan de gastos finales para adultos, típicamente edades <strong>45–89</strong>",
                "Los materiales del producto listan un complemento de <strong>término infantil</strong>",
                "Los tamaños de unidad y primas varían — confirme en una ilustración (no hay cifras fijas en esta página)",
              ],
            },
          ],
        },
        {
          h2: "Qué confirmar antes de solicitar",
          list: [
            "Cuánta cobertura por niño (y cuántos niños pueden incluirse)",
            "Qué edades debe tener el niño para empezar, y cuándo termina el complemento",
            "Si más adelante se puede convertir a una póliza permanente",
            "El costo mensual exacto en la ilustración de la póliza del adulto",
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
      title: "Corebridge — Child Coverage Add-ons (Select-a-Term & American Elite) | Mejor Vida Insurance",
      description:
        "Corebridge children’s coverage is typically a temporary child add-on on an adult Select-a-Term or American Elite policy — often about $1,000–$25,000 through age 25. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Corebridge child coverage add-ons | Mejor Vida Insurance",
      ogDescription:
        "Temporary child coverage on Select-a-Term and American Elite adult policies. Compare with Mejor Vida Insurance — ask for an illustration.",
      h1: "Child coverage add-ons",
      lead:
        "With Corebridge, kids’ coverage on appointed lines is usually a <strong>temporary add-on</strong> on an adult policy — such as <strong>Select-a-Term</strong> or <strong>American Elite</strong> — not a separate children’s whole-life plan. Mejor Vida Insurance can help compare options.",
      serviceName: "Corebridge child coverage add-ons",
      serviceType: "Children's Term Rider",
      sections: [
        {
          h2: "At a glance",
          intro:
            "In plain terms: an adult buys a Corebridge life policy, and the family can add temporary coverage for children on that same plan. The add-on is usually modest and ends when the child reaches a set age.",
          cards: [
            {
              h: "What it is",
              items: [
                "A <strong>temporary</strong> (term) add-on for children on an adult’s policy",
                "Common coverage range about <strong>$1,000–$25,000</strong> (Select-a-Term child rider)",
                "Coverage often lasts until the child reaches age <strong>25</strong>",
              ],
            },
            {
              h: "What it is not",
              items: [
                "Not a standalone children’s whole-life policy",
                "Not lifelong kids coverage by itself — it ends at a set age unless converted later (if conversion is available on your illustration)",
                "Exact child issue ages and monthly price: <strong>ask for an illustration</strong>",
              ],
            },
            {
              h: "Who this fits",
              items: [
                "Families who already want an adult Corebridge policy and a little extra protection for kids",
                "People looking for modest temporary coverage — not a large permanent kids policy",
                "Ask Mejor Vida Insurance to compare with carriers that offer a full children’s policy",
              ],
            },
          ],
        },
        {
          h2: "Where the add-on can attach",
          intro:
            "These are different adult products that can include a child add-on. Exact availability still depends on state and underwriting.",
          cards: [
            {
              h: "Select-a-Term (adult term)",
              items: [
                "Child add-on coverage typically about <strong>$1,000–$25,000</strong>",
                "Coverage generally continues to age <strong>25</strong>",
                "Premium and exact child ages: confirm on an illustration",
              ],
            },
            {
              h: "American Elite (permanent adult path)",
              items: [
                "Can include a child add-on on eligible American Elite policies",
                "The base American Elite product can issue across a wide age range (including younger ages on the base product itself)",
                "For young ages, rates typically do <strong>not</strong> split smoker vs non-smoker the way adult classes do",
                "Ask for an illustration for child coverage amounts and cost on your case",
              ],
            },
          ],
        },
        {
          h2: "What you should confirm before applying",
          list: [
            "How much coverage per child (and how many children can be included)",
            "What ages a child must be to start, and when the add-on ends",
            "Whether the family can convert the child’s coverage to a permanent policy later",
            "The exact premium on your adult policy illustration",
          ],
        },
      ],
    },
    es: {
      title: "Corebridge — Complementos de cobertura infantil (Select-a-Term y American Elite) | Mejor Vida Seguros",
      description:
        "La cobertura infantil de Corebridge suele ser un complemento temporal en una póliza adulta Select-a-Term o American Elite — a menudo unos $1,000–$25,000 hasta los 25 años. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Corebridge complementos de cobertura infantil | Mejor Vida Seguros",
      ogDescription:
        "Cobertura temporal para hijos en pólizas adultas Select-a-Term y American Elite. Compare con Mejor Vida Seguros — pida una ilustración.",
      h1: "Complementos de cobertura infantil",
      lead:
        "Con Corebridge, la cobertura para niños en las líneas designadas suele ser un <strong>complemento temporal</strong> en una póliza de adulto — como <strong>Select-a-Term</strong> o <strong>American Elite</strong> — no un plan independiente de vida entera infantil. Mejor Vida Seguros puede ayudar a comparar opciones.",
      serviceName: "Corebridge complementos de cobertura infantil",
      serviceType: "Rider de término infantil",
      sections: [
        {
          h2: "Resumen",
          intro:
            "En palabras sencillas: un adulto compra una póliza de vida Corebridge, y la familia puede agregar cobertura temporal para hijos en ese mismo plan. El complemento suele ser modesto y termina cuando el niño llega a una edad definida.",
          cards: [
            {
              h: "Qué es",
              items: [
                "Un complemento <strong>temporal</strong> (término) para hijos en la póliza de un adulto",
                "Rango común de cobertura: unos <strong>$1,000–$25,000</strong> (rider infantil Select-a-Term)",
                "La cobertura a menudo dura hasta que el niño cumple <strong>25</strong> años",
              ],
            },
            {
              h: "Qué no es",
              items: [
                "No es una póliza independiente de vida entera infantil",
                "No es cobertura infantil de por vida por sí sola — termina a una edad definida salvo que después se convierta (si la conversión está disponible en su ilustración)",
                "Edades exactas de emisión del niño y precio mensual: <strong>pida una ilustración</strong>",
              ],
            },
            {
              h: "Para quién conviene",
              items: [
                "Familias que ya quieren una póliza Corebridge de adulto y un poco de protección extra para los hijos",
                "Quienes buscan una cobertura temporal modesta — no una póliza infantil permanente grande",
                "Pida a Mejor Vida Seguros comparar con aseguradoras que ofrecen una póliza infantil completa",
              ],
            },
          ],
        },
        {
          h2: "Dónde puede agregarse el complemento",
          intro:
            "Son productos de adulto distintos que pueden incluir un complemento infantil. La disponibilidad exacta aún depende del estado y de la suscripción.",
          cards: [
            {
              h: "Select-a-Term (término para adultos)",
              items: [
                "Cobertura del complemento infantil típicamente unos <strong>$1,000–$25,000</strong>",
                "La cobertura generalmente continúa hasta los <strong>25</strong> años",
                "Prima y edades exactas del niño: confirme en una ilustración",
              ],
            },
            {
              h: "American Elite (vía permanente para adultos)",
              items: [
                "Puede incluir un complemento infantil en pólizas American Elite elegibles",
                "El producto base American Elite puede emitirse en un rango amplio de edades (incluyendo edades más jóvenes en el producto base)",
                "En edades jóvenes, las tarifas normalmente <strong>no</strong> se separan entre fumador y no fumador como en las clases de adultos",
                "Pida una ilustración para montos y costo de la cobertura infantil en su caso",
              ],
            },
          ],
        },
        {
          h2: "Qué confirmar antes de solicitar",
          list: [
            "Cuánta cobertura por niño (y cuántos niños pueden incluirse)",
            "Qué edades debe tener el niño para empezar, y cuándo termina el complemento",
            "Si la familia puede convertir la cobertura del niño a una póliza permanente más adelante",
            "La prima exacta en la ilustración de la póliza del adulto",
          ],
        },
      ],
    },
  },
  {
    id: "americo",
    brand: "Americo",
    enFile: "americo-children.html",
    esFile: "americo-infantil.html",
    parentEn: "americo.html",
    parentEs: "americo.html",
    logoEn: `<picture><source type="image/webp" srcset="../../img/opt/americo-logo.webp"/><img alt="Americo" class="d-inline-block" src="../../img/opt/americo-logo.png" width="398" height="128" style="height:56px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    logoEs: `<picture><source type="image/webp" srcset="../img/opt/americo-logo.webp"/><img alt="Americo" class="d-inline-block" src="../img/opt/americo-logo.png" width="398" height="128" style="height:56px;width:auto;max-width:100%;" loading="eager" decoding="async"/></picture>`,
    en: {
      title: "Americo — Children's Whole Life (AdvantageWL) | Mejor Vida Insurance",
      description:
        "Americo AdvantageWL whole life for children ages 0–17, minimum $15,000. Eagle Select also offers a child/grandchild term rider on an adult policy. Educational overview from Mejor Vida Insurance.",
      ogTitle: "Americo children's whole life | Mejor Vida Insurance",
      ogDescription:
        "AdvantageWL for children ages 0–17 plus an optional child/grandchild rider on Eagle Select. Compare with Mejor Vida Insurance.",
      h1: "Children's whole life and child riders",
      lead:
        "<strong>Americo AdvantageWL</strong> can cover a child as the insured on a permanent whole life policy (ages <strong>0–17</strong>, minimum about <strong>$15,000</strong>). Adult Eagle Select policies can also add a <strong>child/grandchild term rider</strong>. Mejor Vida Insurance can help families compare both paths.",
      serviceName: "Americo AdvantageWL children's whole life",
      serviceType: "Children's Whole Life Insurance",
      sections: [
        {
          h2: "At a glance",
          intro:
            "AdvantageWL is lifelong coverage with level premiums. It is a paper application (not Americo’s instant e-app). Eagle Select’s child rider is a smaller add-on on an adult final-expense policy.",
          cards: [
            {
              h: "AdvantageWL for a child",
              items: [
                "Issue ages <strong>0–17</strong> (the same product also covers adults through 75)",
                "Minimum face about <strong>$15,000</strong> for children; adults typically start at <strong>$25,000</strong>",
                "Simplified health questions — <strong>no medical exam</strong> on typical amounts",
                "Paper application submitted by Mejor Vida Insurance (fax or email)",
              ],
            },
            {
              h: "Child/grandchild rider on Eagle Select",
              items: [
                "Optional term rider on an adult Eagle Select policy",
                "Typical ages: 15 days through under 17; limited face per child",
                "Can cover more than one child, subject to Americo’s rider rules",
                "This is not a standalone children’s policy",
              ],
            },
          ],
        },
        {
          h2: "What to confirm before applying",
          list: [
            "Whether a standalone AdvantageWL policy or an Eagle Select rider fits the family better",
            "The face amount and who will own the policy",
            "Exact monthly premium on a current illustration",
          ],
        },
      ],
    },
    es: {
      title: "Americo — Vida entera infantil (AdvantageWL) | Mejor Vida Seguros",
      description:
        "Americo AdvantageWL para niños de 0 a 17 años, mínimo $15,000. Eagle Select también ofrece un anexo temporal para hijo o nieto. Resumen educativo de Mejor Vida Seguros.",
      ogTitle: "Americo vida entera infantil | Mejor Vida Seguros",
      ogDescription:
        "AdvantageWL para niños de 0 a 17 años y anexo opcional en Eagle Select. Compare con Mejor Vida Seguros.",
      h1: "Vida entera infantil y anexos para hijos",
      lead:
        "<strong>Americo AdvantageWL</strong> puede cubrir a un niño como asegurado en una póliza permanente (edades <strong>0–17</strong>, mínimo unos <strong>$15,000</strong>). En Eagle Select para adultos también se puede agregar un <strong>anexo temporal para hijo o nieto</strong>. Mejor Vida Seguros ayuda a comparar ambos caminos.",
      serviceName: "Americo AdvantageWL vida entera infantil",
      serviceType: "Children's Whole Life Insurance",
      sections: [
        {
          h2: "De un vistazo",
          intro:
            "AdvantageWL es cobertura de por vida con primas niveladas. La solicitud es en papel (no la app instantánea). El anexo de Eagle Select es un complemento más pequeño en la póliza de un adulto.",
          cards: [
            {
              h: "AdvantageWL para un niño",
              items: [
                "Edades de emisión <strong>0–17</strong> (el mismo producto cubre adultos hasta 75)",
                "Monto mínimo unos <strong>$15,000</strong> para niños; los adultos suelen empezar en <strong>$25,000</strong>",
                "Preguntas de salud simplificadas — <strong>sin examen médico</strong> en montos típicos",
                "Solicitud en papel que envía Mejor Vida Seguros (fax o correo)",
              ],
            },
            {
              h: "Anexo hijo/nieto en Eagle Select",
              items: [
                "Anexo temporal opcional en una póliza Eagle Select de un adulto",
                "Edades típicas: 15 días hasta menores de 17; monto limitado por niño",
                "Puede cubrir más de un niño, según reglas del anexo",
                "No es una póliza infantil independiente",
              ],
            },
          ],
        },
        {
          h2: "Qué confirmar antes de solicitar",
          list: [
            "Si conviene AdvantageWL propia o el anexo de Eagle Select",
            "El monto y quién será el dueño de la póliza",
            "La prima mensual exacta en una ilustración vigente",
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

function renderOtherCarriers(current, lang, sectionCount) {
  const isEn = lang === "en";
  const h2 = isEn ? "Other children's carrier pages" : "Otras páginas de aseguradoras infantiles";
  const links = CARRIERS.filter((c) => c.id !== current.id).map((c) => {
    const href = isEn ? c.enFile : c.esFile;
    const label = c.brand;
    return `<a class="btn btn-outline-primary btn-sm me-2 mb-2" href="${href}">${label}</a>`;
  });
  // Alternate from last content section (even index = bg-light)
  const bg = sectionCount % 2 === 0 ? "bg-light" : "bg-white";
  return `<section class="py-5 ${bg} border-bottom">
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
  const guideHref = isEn
    ? "../children-life-insurance.html"
    : "../seguro-vida-infantil.html";
  const parentLink = isEn ? carrier.parentEn : carrier.parentEs;
  const guideLabel = isEn
    ? "Children's life insurance guide"
    : "Guía de seguro de vida infantil";
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
<p class="text-center small mb-0"><a href="${guideHref}">${guideLabel}</a> · <a href="${costHref}">${costLabel}</a> · <a href="${parentLink}">${parentLabel}</a></p>
</div>
</section>

${sectionHtml}

${renderOtherCarriers(carrier, lang, copy.sections.length)}

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
  // EN pages live in en/carriers/ — avatar assets are two levels up
  if (lang === "en") {
    html = html.replace(
      /data-mvi-avatar-base="(?:\.\.\/)+img\/mvi-chat-avatar"/g,
      'data-mvi-avatar-base="../../img/mvi-chat-avatar"'
    );
  }
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
