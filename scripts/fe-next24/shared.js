"use strict";

const DATE = "2026-09-06";

const pledgeEs = {
  aiFreePledgeLabel: "Revisado por Mejor Vida Seguros",
  aiFreePledgeModalTitle: "Cómo se revisa esta guía",
  aiFreePledgeModalBody:
    "El equipo de Mejor Vida Seguros revisa esta guía con materiales de compañías designadas y fuentes públicas. Las cotizaciones y la aprobación dependen de la aseguradora, del estado y de su solicitud.",
};

const pledgeEn = {
  aiFreePledgeLabel: "Reviewed by Mejor Vida Insurance",
  aiFreePledgeModalTitle: "How this guide is reviewed",
  aiFreePledgeModalBody:
    "The Mejor Vida Insurance team reviews this guide against appointed-company materials and public sources. Quotes and approval depend on the insurer, your state, and your application.",
};

function pack(slug, slugEn, relatedSlugs, es, en) {
  return {
    slug,
    slugEn,
    published: DATE,
    modified: DATE,
    relatedSlugs,
    es: { ...pledgeEs, ...es },
    en: { ...pledgeEn, ...en },
  };
}

const ctaEs = {
  title: "Vea un precio para su situación",
  body: "Mejor Vida Seguros compara compañías de gastos finales. Empiece con una cotización gratuita, agende una llamada o escríbanos por WhatsApp.",
  quote: "Cotización gratuita",
  schedule: "Agendar una llamada",
};

const ctaEn = {
  title: "See a price for your situation",
  body: "Mejor Vida Insurance compares final expense companies. Start with a free quote, schedule a call, or message us on WhatsApp.",
  quote: "Get a free quote",
  schedule: "Schedule a call",
};

const SRC = {
  ssa: { label: "Social Security Administration — lump-sum death payment", url: "https://www.ssa.gov/personal-record/when-someone-dies/lump-sum-death-payment" },
  medicare: { label: "Medicare.gov — what Medicare covers", url: "https://www.medicare.gov/what-medicare-covers" },
  nfda: { label: "National Funeral Directors Association — 2023 General Price List study", url: "https://content.nfda.org/news/statistics" },
  ftc: { label: "FTC — Shopping for Funeral Services", url: "https://consumer.ftc.gov/articles/shopping-funeral-services" },
  naic: { label: "NAIC — Life insurance consumer information", url: "https://content.naic.org/consumer/life-insurance.htm" },
};

module.exports = { pack, ctaEs, ctaEn, SRC, DATE };
