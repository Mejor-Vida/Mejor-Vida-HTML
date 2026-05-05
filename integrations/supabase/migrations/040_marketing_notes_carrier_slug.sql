-- Public carrier marketing copy keyed by slug (sync with carriers/*.html and GET /api/carrier-marketing).

ALTER TABLE marketing_notes ADD COLUMN IF NOT EXISTS slug text;

COMMENT ON COLUMN marketing_notes.slug IS 'Stable key for carrier detail pages and API (assurity, mutual-of-omaha, american-amicable).';

CREATE UNIQUE INDEX IF NOT EXISTS marketing_notes_slug_unique ON marketing_notes (slug);

INSERT INTO marketing_notes (title, body, status, slug, reviewed_at)
VALUES
(
  'Carrier marketing: Assurity',
  '{"intro_es":"Assurity Life Insurance Company ofrece soluciones de vida entera pensadas para ayudar a las familias a planificar gastos finales con claridad y tranquilidad. Como agente independiente, Julie puede presentar opciones de Assurity cuando encajan con tu situación y presupuesto.","intro_en":"Assurity Life Insurance Company offers whole life solutions designed to help families plan for final expenses with clarity and peace of mind. As an independent agent, Julie can present Assurity options when they fit your situation and budget.","highlights_es":["Enfoque en protección de vida entera para necesidades de gastos finales","Primas niveladas en muchos productos emitidos","Suscripción simplificada para muchos solicitantes sin laboratorio","Julie compara Assurity junto con otras aseguradoras de confianza"],"highlights_en":["Whole life protection oriented toward final expense needs","Level premiums on many issued products","Simplified underwriting paths for many applicants without labs","Julie compares Assurity alongside other trusted carriers"]}',
  'published',
  'assurity',
  now()
),
(
  'Carrier marketing: Mutual of Omaha',
  '{"intro_es":"Mutual of Omaha es una de las marcas más reconocidas en seguros de vida en Estados Unidos, con décadas de historia sirviendo a familias y comunidades. Julie puede ayudarte a explorar productos de Mutual of Omaha cuando buscas cobertura de gastos finales con respaldo de una compañía conocida.","intro_en":"Mutual of Omaha is one of the best-known life insurance brands in the United States, with decades of history serving families and communities. Julie can help you explore Mutual of Omaha products when you want final expense coverage backed by a household name.","highlights_es":["Amplia trayectoria y reconocimiento nacional","Productos de vida entera alineados con planificación de gastos finales","Primas que no suben solo por envejecer después de emitida la póliza","Julie te orienta sin comprometerte con una sola compañía"],"highlights_en":["Long history and broad national recognition","Whole life products aligned with final expense planning","Premiums that do not increase just because you age after issue","Julie helps you compare—you are not locked to one carrier"]}',
  'published',
  'mutual-of-omaha',
  now()
),
(
  'Carrier marketing: American Amicable',
  '{"intro_es":"American Amicable Group lleva más de un siglo ayudando a proteger generaciones con seguros de vida y servicio enfocado en el cliente. Julie puede incorporar American Amicable en tu comparación cuando una póliza de vida entera encaja con tus metas de gastos finales.","intro_en":"For more than a century, American Amicable Group has focused on protecting generations through life insurance and customer-centered service. Julie can include American Amicable in your comparison when whole life coverage aligns with your final expense goals.","highlights_es":["Compañía establecida con enfoque en protección familiar","Portafolio que incluye vida entera para necesidades de largo plazo","Atención y recursos digitales para titulares de póliza","Comparación independiente con Julie—sin presión"],"highlights_en":["Established carrier with a family-protection focus","Portfolio includes whole life for long-term needs","Policyholder service and digital conveniences","Independent comparison with Julie—no pressure"]}',
  'published',
  'american-amicable',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  status = EXCLUDED.status,
  reviewed_at = EXCLUDED.reviewed_at,
  updated_at = now();
