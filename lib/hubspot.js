/**
 * HubSpot CRM v3 contacts — create/update; optional note. Custom props best-effort.
 */

async function hubspotSearchContact(token, propertyName, value) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [{ propertyName, operator: "EQ", value: String(value).trim() }],
        },
      ],
      limit: 1,
      properties: ["email", "firstname", "lastname", "phone"],
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const row = data.results && data.results[0];
  return row ? String(row.id) : null;
}

async function hubspotCreateContact(token, properties) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`HubSpot create ${r.status}: ${text.slice(0, 400)}`);
  }
  const data = JSON.parse(text);
  return data.id ? String(data.id) : null;
}

async function hubspotUpdateContact(token, id, properties) {
  const r = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HubSpot patch ${r.status}: ${t.slice(0, 400)}`);
  }
}

/**
 * Merge custom properties; on failure retry with base fields only.
 */
async function createOrUpdateContact(token, baseProps, customProps) {
  const email = baseProps.email ? String(baseProps.email).trim().toLowerCase() : "";
  const phone = baseProps.phone ? String(baseProps.phone).trim() : "";

  let existingId = null;
  if (email) {
    existingId = await hubspotSearchContact(token, "email", email);
  }
  if (!existingId && phone) {
    existingId = await hubspotSearchContact(token, "phone", phone);
  }

  const tryMerge = async (props) => {
    if (existingId) {
      await hubspotUpdateContact(token, existingId, props);
      return { contactId: existingId, created: false };
    }
    const id = await hubspotCreateContact(token, props);
    return { contactId: id, created: true };
  };

  const merged = { ...baseProps, ...customProps };
  Object.keys(merged).forEach((k) => {
    if (merged[k] === undefined || merged[k] === null || merged[k] === "") {
      delete merged[k];
    }
  });

  try {
    return await tryMerge(merged);
  } catch (e) {
    const baseOnly = { ...baseProps };
    Object.keys(baseOnly).forEach((k) => {
      if (baseOnly[k] === undefined || baseOnly[k] === null || baseOnly[k] === "") {
        delete baseOnly[k];
      }
    });
    return await tryMerge(baseOnly);
  }
}

async function hubspotAddNote(token, contactId, noteBody) {
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
        },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error(`hubspot note ${r.status}: ${t.slice(0, 200)}`);
  }
}

module.exports = {
  hubspotSearchContact,
  createOrUpdateContact,
  hubspotAddNote,
};
