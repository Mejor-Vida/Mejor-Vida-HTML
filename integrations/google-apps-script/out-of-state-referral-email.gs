/**
 * Out-of-state referral email notifier for referrals@mejorvidainsurance.com
 *
 * Receives POST JSON from Vercel api/out-of-state-referral.js (OOS_EMAIL_NOTIFIER_URL).
 *
 * SETUP
 * 1. script.google.com → New project → paste this file → Save.
 * 2. Project Settings → Script properties → Add:
 *    - OOS_SECRET = (same value as Vercel OOS_EMAIL_NOTIFIER_SECRET, optional but recommended)
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (anonymous callers need this for Vercel server-to-GAS)
 * 4. Copy Web app URL → Vercel env OOS_EMAIL_NOTIFIER_URL
 * 5. If you use OOS_SECRET, set OOS_EMAIL_NOTIFIER_SECRET in Vercel to the same value.
 *
 * EMAIL: sends from the account that owns the script (your Google user). Set recipient below.
 */
var OOS_EMAIL_TO = 'referrals@mejorvidainsurance.com';

function doPost(e) {
  var out = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  };
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return out({ ok: false, error: 'no body' });
    }
    var data = JSON.parse(e.postData.contents);
    var expected = PropertiesService.getScriptProperties().getProperty('OOS_SECRET');
    if (expected) {
      if (!data.notifierSecret || data.notifierSecret !== expected) {
        return out({ ok: false, error: 'unauthorized' });
      }
    }
    delete data.notifierSecret;

    var firstName = String(data.firstName || '').trim();
    var lastName = String(data.lastName || '').trim();
    var email = String(data.email || '').trim();
    var phone = String(data.phone || '').trim();
    var stateCode = String(data.stateCode || '').trim();
    var message = String(data.message || '').trim();
    var recordId = data.recordId ? String(data.recordId) : '';
    var submittedAt = String(data.submittedAt || '');
    var consent = data.consent === true || data.consent === 'true';

    var subject = '[Out-of-state referral] ' + stateCode + ' — ' + firstName + ' ' + lastName;

    var lines = [
      'New out-of-state referral request (final expense / licensed agent help).',
      '',
      'State: ' + stateCode,
      'Name: ' + firstName + ' ' + lastName,
      'Email: ' + email,
      'Phone: ' + (phone || '(none)'),
      'Consent (licensed agent in their state): ' + (consent ? 'yes' : 'no'),
      '',
      'Message:',
      message || '(none)',
      '',
      'Supabase record id: ' + (recordId || 'n/a'),
      'Submitted (UTC): ' + submittedAt,
    ];
    var body = lines.join('\n');

    MailApp.sendEmail({
      to: OOS_EMAIL_TO,
      subject: subject,
      body: body,
      name: 'Mejor Vida — OOS form',
    });

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('OOS referral notifier — POST JSON only').setMimeType(
    ContentService.MimeType.TEXT
  );
}
