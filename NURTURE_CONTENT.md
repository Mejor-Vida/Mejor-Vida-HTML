# Mejor Vida Insurance — Nurture Content & Placeholder Mapping

## Placeholder Reference

All messages across every channel use these placeholders. The table shows what each maps to in the system.

| Placeholder | Supabase Field | Code Variable | Notes |
|---|---|---|---|
| `[First Name]` / `[Nombre]` | `contacts.full_name` | `(contact.full_name \|\| '').split(' ')[0]` | First word of full_name |
| `[Quote Link]` | — | `https://www.mejorvidainsurance.com/quote.html` | Online quote tool |
| `[Schedule Link]` | — | `https://www.mejorvidainsurance.com/schedule-julie.html` | Julie-only HubSpot scheduler (shareable) |
| `[VCF Link]` | — | `https://www.mejorvidainsurance.com/julie.vcf` | Julie's contact card download |
| `[Email]` | `contacts.email` | `contact.email` | Lead's email address |
| `[Phone]` | `contacts.phone` | `contact.phone` | Lead's phone (E.164) |

### Smart Logic Flags

| Flag | Supabase Field | Set When |
|---|---|---|
| `has_quote` | `lead_state.quote_generated_at` | Quote is generated in MVI Chatflow |
| `has_scheduled_call` | `lead_state.call_scheduled_at` | Lead books via HubSpot/Calendly |
| `vcf_sent_at` | `contacts.vcf_sent_at` | VCF delivered via any channel |
| `twilio_opt_out` | `nurture_sequence.twilio_opt_out` | Lead replies STOP to SMS |
| `email_opt_out` | `nurture_sequence.email_opt_out` | Lead unsubscribes from email |

---

## Channel-Specific Placeholder Formats

### ManyChat (WhatsApp templates)
ManyChat uses `{{First Name}}`, `{{Last Name}}`, `{{Phone}}` etc. as system fields. Custom fields are set via the MVI Chatflow.

### Telnyx SMS (nurture-cron.js)
Placeholders are inserted directly in JavaScript template literals:
```javascript
const name = (contact.full_name || '').split(' ')[0] || 'there';
```

### Resend Email (nurture-cron.js)
Placeholders are inserted in HTML template functions:
```javascript
const quoteUrl = 'https://www.mejorvidainsurance.com/quote.html';
const scheduleUrl = 'https://www.mejorvidainsurance.com/schedule-julie.html';
const VCF_URL = 'https://www.mejorvidainsurance.com/julie.vcf';
```

---

## Immediate Post-Quote Email

**Trigger:** Sent right after the MVI Chatflow completes (quote generated)
**From:** Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>
**API Route:** `/api/post-quote-email`

### English

**Subject:** Your quote is ready, [First Name]!

**Body:**
Hi [First Name],

Great news — I've put together a quote range for you!

Based on what you shared with me, here's your estimated range for final expense coverage:

**Your Estimated Monthly Rate: [Quote Range]**

This means your family would be fully protected — funeral costs, medical bills, everything — for less than a few dollars a day.

**Here's how easy the process is:**
- No medical exam — just a few health questions
- Coverage starts immediately once approved
- Your rate is locked in and never goes up
- Takes less than 10 minutes to complete

[IF has_scheduled_call]
**Your appointment with Julie:**
You're all set! Julie is looking forward to speaking with you at your scheduled time. She'll walk you through your options and answer any questions.
[END IF]

[IF NOT has_scheduled_call]
**Ready to take the next step?**
Schedule a quick call with Julie — no pressure, just a friendly conversation about your options.

[Button: Schedule a Call with Julie] → [Schedule Link]
[END IF]

**Save Julie's contact** so she's always just one tap away:
[Button: Save Julie's Contact Card] → [VCF Link]

Warmly,
Julie
Mejor Vida Insurance

---

### Spanish

**Subject:** ¡Tu cotización está lista, [Nombre]!

**Body:**
Hola [Nombre],

¡Buenas noticias! Ya tengo un rango de cotización para ti.

Según lo que compartiste conmigo, aquí está tu rango estimado para cobertura de gastos finales:

**Tu Tarifa Mensual Estimada: [Quote Range]**

Esto significa que tu familia estaría completamente protegida — gastos funerarios, facturas médicas, todo — por menos de unos dólares al día.

**Así de fácil es el proceso:**
- Sin examen médico — solo unas preguntas de salud
- La cobertura comienza inmediatamente una vez aprobada
- Tu tarifa queda fija y nunca sube
- Toma menos de 10 minutos completarlo

[IF has_scheduled_call]
**Tu cita con Julie:**
¡Todo listo! Julie está emocionada de hablar contigo en tu horario programado. Te explicará tus opciones y responderá cualquier pregunta.
[END IF]

[IF NOT has_scheduled_call]
**¿Lista para el siguiente paso?**
Agenda una llamada rápida con Julie — sin presión, solo una conversación amigable sobre tus opciones.

[Button: Agenda una Llamada] → [Schedule Link]
[END IF]

**Guarda el contacto de Julie** para tenerla siempre a un toque:
[Button: Guardar Contacto] → [VCF Link]

Con cariño,
Julie
Mejor Vida Insurance

---

## Immediate Post-Quote Email — Over Age 85 (no automated quote)

**Trigger:** Same `/api/post-quote-email` route when lead age is **over 85** (from webhook `age`/`edad` or `lead_state.age`).
**From:** Julie from Mejor Vida Insurance <julie@mejorvidainsurance.com>

Do **not** send quote dollar amounts. Julie offers a personal follow-up call and VCF.

### English

**Subject:** Thank you, [First Name] — Julie will follow up personally

**Body:**
Hi [First Name],

Thank you for sharing your information with me.

Based on your age, I wasn't able to generate an automated quote through our standard final expense carriers — the products I work with most commonly issue new coverage through age 85.

That doesn't mean you're out of options. I'd like to speak with you personally to understand your situation and walk through what may still be available — whether that's exploring other paths to help with funeral costs or simply answering your questions with no pressure.

[IF NOT has_scheduled_call]
If you'd like to talk, schedule a brief call at a time that works for you — I'm happy to help in English or Spanish.

[Button: Schedule a Call with Julie] → [Schedule Link]
[END IF]

**Save my contact** so you can reach me anytime:
[Button: Save Julie's Contact Card] → [VCF Link]

Warmly,
Julie

---

### Spanish

**Subject:** Gracias, [Nombre] — Julie te contactará personalmente

**Body:**
Hola [Nombre],

Gracias por compartir tu información conmigo.

Según tu edad, no pude generar una cotización automática con nuestras compañías habituales de gastos finales — los productos con los que trabajo normalmente emiten cobertura nueva hasta los 85 años.

Eso no significa que no haya alternativas. Me gustaría hablar contigo personalmente para entender tu situación y revisar qué opciones pueden existir — ya sea explorar otras formas de ayudar con los gastos funerarios o simplemente responder tus preguntas, sin presión.

[IF NOT has_scheduled_call]
Si te gustaría platicar, agenda una llamada breve cuando te convenga — con gusto te atiendo en español o inglés.

[Button: Agenda una Llamada con Julie] → [Schedule Link]
[END IF]

**Guarda mi contacto** para tenerme siempre a un toque:
[Button: Guardar Contacto de Julie] → [VCF Link]

Con cariño,
Julie

---

## WhatsApp Templates (Phase 1 — 2 messages)

### WA Step 1 — 5 hours after opt-in

**Template:** `nurture_day3` (pending Meta approval for EN)

**EN:** Hi! Julie from Mejor Vida Insurance here. Final expense plans start under $30/month. Ready to find the right fit? Let's chat — I'd love to help!
- Footer: Reply STOP to unsubscribe
- Button: "Book Call with Julie" → [Schedule Link]

**ES:** Hola! Soy Julie de Mejor Vida Insurance. Los planes de gastos finales empiezan desde $30/mes. Lista para encontrar el mejor plan? Hablemos!
- Footer: Responde STOP para cancelar
- Button: "Hablar con Julie" → [Schedule Link]

### WA Step 2 — 21 hours after opt-in

**Template:** `nurture_day_5` (approved EN + ES)

**EN:** Hi! Julie from Mejor Vida Insurance checking in. I'm still here whenever you're ready — no pressure, no rush. Book a call with me at your convenience!
- Footer: Reply STOP to unsubscribe
- Button: "Book Call with Julie" → [Schedule Link]

**ES:** Hola! Soy Julie de Mejor Vida Insurance. Sigo aquí cuando estés lista — sin presión, sin prisa. Agenda una llamada conmigo cuando gustes!
- Footer: Responde STOP para cancelar
- Button: "Hablar con Julie" → [Schedule Link]

---

## SMS Messages (Phase 2 — Days 1, 3, 5)

### SMS Step 1 — Day 1 (24 hours)

**IF no quote:**
Hi [First Name]! This is Julie from Mejor Vida Insurance. You recently asked about final expense coverage — reply QUOTE and I'll send you a free quote link, or reply CALL to schedule a quick chat. Reply STOP to unsubscribe.

**IF has quote:**
Hi [First Name]! Julie from Mejor Vida Insurance here. I sent your quote to your email — did you get a chance to look it over? Reply CALL to schedule a quick chat, or reply QUOTE if you need a new quote. Reply STOP to unsubscribe.

### SMS Step 2 — Day 3 (72 hours)

Hey [First Name], Julie here from Mejor Vida Insurance! Final expense plans start under $30/month — could be a perfect fit for you. Save my contact so I'm just a tap away 👉 [VCF Link] — then reply QUOTE for a free quote or CALL to talk with me directly. Reply STOP to unsubscribe.

*If VCF already sent:* Same message but without the VCF link. Attach VCF as MMS only if not already delivered.

### SMS Step 3 — Day 5 (120 hours)

Hi [First Name], Julie from Mejor Vida Insurance checking in one last time. Reply QUOTE or CALL and I'll take care of the rest. Reply STOP to unsubscribe.

*If call scheduled:* Stop SMS nurture entirely.

---

## Email Nurture (Phase 3 — Weeks 1–4)

### Email 1 — Week 1: Personal Note from Julie + VCF

**EN Subject:** I wanted to reach out personally, [First Name]…

**EN Body:**
Hi [First Name],

I'm Julie, and I work with Mejor Vida Insurance helping families get the final expense coverage they need — without the confusion or the hard sell.

You reached out a little while ago, and I just wanted to check in personally. Life gets busy, I get it. But I didn't want you to fall through the cracks.

Final expense insurance is one of those things that's easy to put off — until it's too late. And once you have it, you never have to think about it again. Plans start under $30/month, and the whole process takes just a few minutes.

Whenever you're ready, I'm here. No pressure, no rush.

[Button: Get My Free Quote] → [Quote Link]
[Button: Schedule a Call with Julie] → [Schedule Link]

P.S. — Save my contact so I'm always just one tap away:
[Button: Save Julie's Contact Card] → [VCF Link]

Warmly,
Julie
Mejor Vida Insurance

---

### Email 2 — Week 2: What IS Final Expense Insurance?

**EN Subject:** What exactly IS final expense insurance? (plain English)

**EN Body:**
Hi [First Name],

I get this question a lot, so I wanted to break it down simply.

Final expense insurance is a small whole life policy — usually between $5,000 and $25,000 — designed to cover end-of-life costs like funeral expenses, burial, and outstanding medical bills.

Here's why people love it:
- No medical exam — just a few health questions
- Fixed monthly premium — it never goes up
- Coverage never expires — as long as you pay, you're covered
- Pays out fast — usually within days, directly to your family

The average funeral today costs between $8,000 and $12,000. Without coverage, that burden falls entirely on the people you love most — at the hardest moment of their lives.

The good news? You can get covered today for less than a dollar a day.

[Button: See My Options] → [Quote Link]
[Button: Talk to Julie] → [Schedule Link]

Warmly,
Julie
Mejor Vida Insurance

---

### Email 3 — Week 3: Julie's Personal Story

**EN Subject:** Why I started doing this work…

**EN Body:**
Hi [First Name],

I wanted to share something personal with you. When my dad passed away, we didn't have a final expense plan… and what should have been a time for family turned into stress trying to figure out how to pay for everything.

That's why I care so much about helping families plan ahead. It's not just about money — it's about protecting the people you love during one of the hardest moments of their lives.

If you've been thinking about it, I'd love to walk you through your options.

[Button: Schedule a Free Call with Julie] → [Schedule Link]
[Button: Get a Free Quote] → [Quote Link]

With care,
Julie
Mejor Vida Insurance

---

**ES Subject:** Por qué hago este trabajo…

**ES Body:**
Hola [Nombre],

Quería compartirte algo personal. Cuando mi papá falleció, no teníamos un plan de gastos finales… y lo que debía ser un momento para estar en familia se convirtió en estrés tratando de ver cómo pagar todo.

Por eso me importa tanto ayudar a las familias a planear con tiempo. No es solo dinero — es proteger a los que amas en un momento muy difícil.

Si lo has estado pensando, con gusto te explico tus opciones.

[Button: Agenda una Llamada] → [Schedule Link]
[Button: Cotización Gratis] → [Quote Link]

Con cariño,
Julie
Mejor Vida Insurance

---

### Email 4 — Week 4: Last Call

**EN Subject:** I don't want to keep bothering you…

**EN Body:**
Hi [First Name],

I've reached out a few times now, and I completely understand if the timing hasn't been right.

I'm not going to keep filling your inbox — I promise this is my last email for a while. But I did want to say one more thing before I give you some space:

The people who need this coverage the most are often the ones who wait the longest. And I've seen firsthand what happens when a family isn't protected. It's heartbreaking — and it's preventable.

If there's any part of you that knows you should have this taken care of, please don't wait for the "right time." It takes less than 10 minutes. Plans start under $30/month.

I'll be here whenever you're ready. Just reply to this email, click below, or give me a call anytime.

[Button: Get My Free Quote — 5 Minutes] → [Quote Link]
[Button: Schedule a Call with Julie] → [Schedule Link]

Take care of yourself,
Julie
Mejor Vida Insurance

---

## Post-Call-Schedule VCF Reminder (via telnyx-sms-webhook or call-scheduled-webhook)

**Trigger:** Lead schedules a call
**Channel:** SMS (Telnyx)
**Condition:** Only if `vcf_sent_at` is null

Hi [First Name]! Your call with Julie is confirmed 🎉 One quick thing — save her contact so you can always reach her directly: [VCF Link] See you soon!
