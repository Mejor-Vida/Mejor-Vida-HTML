"use strict";

/**
 * Shared section/field outline for the funeral workbook.
 * HTML print copy uses handwriting lines; the PDF builder maps these to AcroForm fields.
 */
const { copy } = require("./funeral-estate-workbook");

function workbookOutline(lang) {
  const t = copy(lang);
  const isEs = lang === "es";
  const L = (es, en) => (isEs ? es : en);
  return {
    t,
    sections: [
      {
        id: "s1",
        title: t.s1,
        blocks: [
          { type: "p", text: t.s1p },
          {
            type: "grid",
            pairs: [
              [L("Nombre de pila", "First name"), L("Segundo nombre", "Middle name")],
              [L("Apellidos", "Last name"), L("Sufijo (Jr., III)", "Suffix (Jr., III)")],
              [L("Otros nombres o apodo", "Other names or nickname"), L("Nombre de soltera", "Maiden name")],
              [L("Nombre de soltera de la madre", "Mother’s maiden name"), L("Nombre del padre", "Father’s name")],
              [L("Fecha de nacimiento", "Date of birth"), L("Ciudad y estado de nacimiento", "City and state of birth")],
              [
                L("Últimos cuatro del Seguro Social (opcional)", "Last four of SSN (optional)"),
                L("Estado civil", "Marital status"),
              ],
              [
                L("Origen étnico o cultural (si el acta lo pide)", "Ethnic or cultural heritage (if the certificate asks)"),
                L("Nivel de estudios / escuela", "Education / school"),
              ],
            ],
          },
          { type: "field", label: L("Cónyuge o pareja (nombre)", "Spouse or partner (name)") },
          { type: "field", label: L("Fecha y lugar de matrimonio o unión", "Date and place of marriage or union") },
        ],
      },
      {
        id: "s2",
        title: t.s2,
        blocks: [
          {
            type: "field",
            label: L("Hijos (nombre, fecha de nacimiento, ciudad)", "Children (name, birth date, city)"),
            lines: 4,
          },
          { type: "field", label: L("Nietos u otros dependientes", "Grandchildren or other dependents"), lines: 2 },
          { type: "field", label: L("Hermanos (nombre)", "Siblings (name)"), lines: 2 },
        ],
      },
      {
        id: "s3",
        title: t.s3,
        blocks: [
          {
            type: "checks",
            items: [L("Serví en las fuerzas armadas", "I served in the armed forces"), L("No serví", "I did not serve")],
          },
          {
            type: "grid",
            pairs: [
              [L("Rama y país", "Branch and country"), L("Rango al licenciarse", "Rank at discharge")],
              [
                L("Número de serie / servicio", "Service number"),
                L("Fechas de ingreso y baja", "Dates of entry and discharge"),
              ],
              [
                L("Conflicto o teatro, si aplica", "Conflict or theater, if any"),
                L("Dónde está el DD-214 u otra baja", "Where the DD-214 or discharge paper is"),
              ],
              [
                L("¿Cementerio nacional? (confirmar en VA.gov)", "National cemetery? (confirm on VA.gov)"),
                L("Honores militares o de logia en el servicio", "Military or lodge honors at the service"),
              ],
            ],
          },
        ],
      },
      {
        id: "s4",
        title: t.s4,
        blocks: [
          {
            type: "field",
            label: L("Primera persona a notificar — nombre y teléfono", "First person to notify — name and phone"),
            lines: 2,
          },
          { type: "field", label: L("Dirección", "Address"), lines: 2 },
          {
            type: "field",
            label: L("Otra persona de contacto — nombre y teléfono", "Additional contact — name and phone"),
            lines: 2,
          },
          {
            type: "field",
            label: L("Otras personas a avisar (nombre y teléfono)", "Others to notify (name and phone)"),
            lines: 4,
          },
        ],
      },
      {
        id: "s5",
        title: t.s5,
        blocks: [
          { type: "p", text: t.s5p },
          {
            type: "grid",
            pairs: [
              [L("Albacea / executor — nombre y teléfono", "Executor — name and phone"), L("Co-albacea", "Co-executor")],
              [
                L("Poder sobre el dinero — nombre", "Financial power of attorney — name"),
                L("Poder de salud — nombre", "Health-care power of attorney — name"),
              ],
              [
                L("Abogado — nombre y teléfono", "Attorney — name and phone"),
                L("Contador — nombre y teléfono", "Accountant — name and phone"),
              ],
              [L("Médico de cabecera", "Primary doctor"), L("Especialista", "Specialist")],
              [L("Arrendador (si aplica)", "Landlord if any"), L("Empleador (si aplica)", "Employer if any")],
            ],
          },
        ],
      },
      {
        id: "s6",
        title: t.s6,
        blocks: [
          {
            type: "p",
            text: L(
              "Marque las vías que ya existen. No hace falta usarlas todas.",
              "Check the paths that already exist. You do not need all of them."
            ),
          },
          {
            type: "checks",
            items: [
              L("Ahorros o cuenta pagadera al fallecimiento", "Savings or payable-on-death account"),
              L("Póliza de vida / gastos finales", "Life / final expense policy"),
              L("Contrato de funeral prepagado", "Prepaid funeral contract"),
              L("El caudal hereditario / estate", "The estate"),
              L("Otra (describa abajo)", "Other (describe below)"),
            ],
          },
          {
            type: "field",
            label: L(
              "Compañía o funeraria, número de plan o póliza, teléfono",
              "Company or funeral home, plan or policy number, phone"
            ),
            lines: 2,
          },
          {
            type: "field",
            label: L("Cementerio y número de lote, si ya hay", "Cemetery and plot number, if already owned"),
            lines: 2,
          },
          {
            type: "field",
            label: L(
              "Si no hay prepago, quién debe comparar funerarias",
              "If there is no prepaid plan, who should compare funeral homes"
            ),
          },
        ],
      },
      {
        id: "s7",
        title: t.s7,
        blocks: [
          {
            type: "p",
            text: L(
              "Basta con lo esencial. Los detalles de marca son opcionales.",
              "The essentials are enough. Brand details are optional."
            ),
          },
          {
            type: "checks",
            items: [
              L("Funeral tradicional y luego entierro o cremación", "Traditional funeral, then burial or cremation"),
              L("Entierro o cremación directa, con memorial después", "Direct burial or cremation, memorial later"),
              L("Entierro o cremación directa, sin memorial", "Direct burial or cremation, no memorial"),
              L("Donación del cuerpo o de órganos (describa)", "Body or organ donation (describe)"),
              L("Otro", "Other"),
            ],
          },
          {
            type: "checks",
            items: [
              L("Entierro en tierra", "Ground burial"),
              L("Mausoleo o cripta", "Mausoleum or crypt"),
              L(
                "Cremación — urna en casa, nicho, columbario o esparcir (revise la ley local)",
                "Cremation — urn at home, niche, columbarium, or scattering (check local law)"
              ),
              L("Cementerio nacional (elegibilidad VA)", "National cemetery (VA eligibility)"),
            ],
          },
          {
            type: "field",
            label: L("Funeraria o lugar de culto preferido", "Preferred funeral home or place of worship"),
            lines: 2,
          },
          {
            type: "field",
            label: L("Velatorio: sí/no, ataúd abierto o cerrado, lugar", "Visitation: yes/no, open or closed casket, place"),
            lines: 2,
          },
          { type: "field", label: L("Oficiante (primera y segunda opción)", "Officiant (first and second choice)"), lines: 2 },
          {
            type: "field",
            label: L("Fotos, video u otros recuerdos en el velatorio", "Photos, video, or other displays at the visitation"),
            lines: 2,
          },
          {
            type: "field",
            label: L(
              "Si ya eligió ataúd, urna, lápida o libretas, anote lo que la familia debe pedir (opcional)",
              "If you already chose a casket, urn, marker, or register book, write what the family should request (optional)"
            ),
            lines: 3,
          },
        ],
      },
      {
        id: "s8",
        title: t.s8,
        blocks: [
          {
            type: "field",
            label: L("Ropa y joyas (si se quitan, a quién devolverlas)", "Clothing and jewelry (if removed, whom to return them to)"),
            lines: 2,
          },
          { type: "field", label: L("Lentes: ¿quedan o se devuelven?", "Glasses: remain or return to family?") },
          {
            type: "checks",
            items: [L("Con flores", "With flowers"), L("Sin flores — donativos a:", "No flowers — donations to:")],
          },
          {
            type: "field",
            label: L("Organizaciones para donativos en lugar de flores", "Organizations for gifts in lieu of flowers"),
            lines: 2,
          },
          { type: "field", label: L("Música, himnos o que no haya música", "Music, hymns, or no music"), lines: 3 },
          { type: "field", label: L("Lecturas, poemas o quién da el elogio", "Readings, poems, or who gives the eulogy"), lines: 3 },
        ],
      },
      {
        id: "s9",
        title: t.s9,
        blocks: [
          { type: "field", label: L("Portadores del féretro (hasta seis nombres)", "Pallbearers (up to six names)"), lines: 3 },
          {
            type: "field",
            label: L("Transporte de la familia u otras instrucciones", "Family transportation or other instructions"),
            lines: 2,
          },
        ],
      },
      {
        id: "s10",
        title: t.s10,
        blocks: [
          { type: "field", label: L("Trabajo, estudios, iglesia, clubes, logros", "Work, school, church, clubs, achievements"), lines: 4 },
          { type: "field", label: L("Precedido en la muerte por / le sobreviven", "Preceded in death by / survived by"), lines: 3 },
          { type: "field", label: L("Periódicos o sitios donde publicar", "Newspapers or sites to publish"), lines: 2 },
          { type: "checks", items: [L("Incluir foto: sí", "Include a photo: yes"), L("Incluir foto: no", "Include a photo: no")] },
        ],
      },
      {
        id: "s11",
        title: t.s11,
        blocks: [
          {
            type: "p",
            text: L("Escriba la ubicación, no copie el documento entero.", "Write the location; do not copy the whole document."),
          },
          {
            type: "grid",
            pairs: [
              [L("Testamento", "Will"), L("Directiva / poder de salud", "Advance directive / health POA")],
              [L("Poder sobre el dinero", "Financial power of attorney"), L("Pólizas de seguro", "Insurance policies")],
              [L("Acta de nacimiento", "Birth certificate"), L("Acta de matrimonio / divorcio", "Marriage / divorce papers")],
              [L("Escrituras / títulos de auto", "Deeds / vehicle titles"), L("Baja militar", "Military discharge")],
              [
                L("Pasaporte / ciudadanía", "Passport / citizenship"),
                L("Tarjeta del Seguro Social (ubicación)", "Social Security card (location)"),
              ],
              [L("Fideicomiso, si hay", "Trust documents, if any"), L("Adopción / diplomas", "Adoption papers / diplomas")],
              [
                L("Llave de caja de seguridad (quién la tiene)", "Safe-deposit key (who holds it)"),
                L("Licencia de conducir (ubicación, no el número)", "Driver’s license (location, not the number)"),
              ],
            ],
          },
          {
            type: "checks",
            items: [L("Tengo testamento", "I have a will"), L("No tengo testamento todavía", "I do not have a will yet")],
          },
          { type: "field", label: L("Fecha del testamento y quién es el albacea", "Date of will and who the executor is"), lines: 2 },
        ],
      },
      {
        id: "s12",
        title: t.s12,
        blocks: [
          {
            type: "p",
            text: L(
              "Compañía, tipo (temporal, entera, grupo), número de póliza, beneficiario, teléfono. No el usuario del portal.",
              "Company, type (term, whole life, group), policy number, beneficiary, phone. Not the portal username."
            ),
          },
          { type: "field", label: L("Póliza 1", "Policy 1"), lines: 3 },
          { type: "field", label: L("Póliza 2", "Policy 2"), lines: 3 },
        ],
      },
      {
        id: "s13",
        title: t.s13,
        blocks: [
          {
            type: "field",
            label: L("Bancos (nombre, sucursal, tipo de cuenta, últimos cuatro)", "Banks (name, branch, account type, last four)"),
            lines: 3,
          },
          {
            type: "field",
            label: L(
              "Retiro / pensión / 401(k) — compañía y quién administra",
              "Retirement / pension / 401(k) — company and administrator"
            ),
            lines: 2,
          },
          {
            type: "field",
            label: L(
              "Inversiones / corredor (compañía y últimos cuatro, sin claves)",
              "Brokerage / investments (company and last four, no passwords)"
            ),
            lines: 2,
          },
          {
            type: "field",
            label: L(
              "Inmuebles y vehículos (descripción y dónde está el título)",
              "Real estate and vehicles (description and where the title is)"
            ),
            lines: 3,
          },
          {
            type: "field",
            label: L("Hipoteca u otros préstamos (prestamista y teléfono)", "Mortgage or other loans (lender and phone)"),
            lines: 2,
          },
        ],
      },
      {
        id: "s14",
        title: t.s14,
        blocks: [
          {
            type: "field",
            label: L(
              "Sitio, nombre de usuario, y DÓNDE está la contraseña (no la escriba)",
              "Site, username, and WHERE the password is stored (do not write it)"
            ),
            lines: 5,
          },
        ],
      },
      { id: "s15", title: t.s15, blocks: [{ type: "field", label: L("Mensaje", "Message"), lines: 8 }] },
      {
        id: "s16",
        title: t.s16,
        blocks: [
          { type: "p", text: t.signP },
          { type: "field", label: L("Nombre en letra de molde", "Printed name") },
          { type: "grid", pairs: [[L("Firma", "Signature"), L("Fecha", "Date")]] },
          {
            type: "note",
            text: L(
              "Notario opcional: no convierte este cuaderno en testamento.",
              "Optional notary: this does not turn the workbook into a will."
            ),
          },
          { type: "notary", text: L("Espacio para sello notarial (opcional)", "Notary stamp space (optional)") },
        ],
      },
    ],
  };
}

module.exports = { workbookOutline };
