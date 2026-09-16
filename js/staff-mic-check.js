/**
 * Staff mic + speech diagnostic.
 *
 * Standalone page (no CRM sign-in) that reproduces exactly what the Voice
 * Prompter needs — a secure context, mic permission, a live input signal, and a
 * working SpeechRecognition round trip — and reports each one as a plain-language
 * verdict plus the fix. Built so a non-technical user can screenshot the result.
 */
(function () {
  "use strict";

  var LEVEL_MS = 6000;
  var SPEECH_MS = 8000;
  var SPEECH_LANG = "es-US";
  /* Peak amplitude as a percent of full scale. Normal speech peaks well above
     6%; a mic with the gain far too low lands in the 1–6% band; a dead or muted
     input never leaves the noise floor below 1%. */
  var PEAK_DEAD = 1;
  var PEAK_QUIET = 6;

  var STR = {
    es: {
      h1: "Prueba de micrófono y voz",
      intro:
        "Esta página revisa su micrófono y el reconocimiento de voz del navegador, y le dice en palabras simples qué está mal y cómo arreglarlo.",
      btn_run: "Probar micrófono",
      btn_running: "Probando…",
      btn_again: "Probar otra vez",
      btn_copy: "Copiar resultados",
      raw_toggle: "Ver el texto de los resultados",
      back_link: "← Volver al CRM (pestaña YouTube)",
      status_idle:
        "Presione el botón y hable en voz alta cuando se lo pida. La prueba dura unos 15 segundos.",
      status_asking: "Pidiendo permiso para usar el micrófono… presione «Permitir».",
      status_level: "Hable normal, en voz alta. Estamos midiendo el sonido… {sec} s",
      status_speech: "Ahora lea la frase de abajo en voz alta… {sec} s",
      status_done: "Prueba terminada. Revise los resultados y presione «Copiar resultados».",
      readaloud: "Lea esto en voz alta: «Hola, me llamo Julie y estoy probando el micrófono».",
      copied: "¡Copiado! Péguelo en un mensaje para Justin.",
      copy_fail: "No se pudo copiar solo. Abra «Ver el texto de los resultados», seleccione el texto y cópielo a mano.",
      copy_empty: "Primero presione «Probar micrófono».",

      /* Headline verdicts */
      head_ok: "Todo funciona. El micrófono se oye y el navegador entendió lo que dijo.",
      head_firefox: "El problema es el navegador. Firefox no puede reconocer voz. Abra el CRM en Google Chrome.",
      head_noapi: "Este navegador no tiene reconocimiento de voz. Use Google Chrome.",
      head_insecure: "La página no está en una conexión segura (https), y sin eso el navegador no deja usar el micrófono.",
      head_denied: "El micrófono está bloqueado. Hay que darle permiso a Chrome.",
      head_nodevice: "El navegador no encuentra ningún micrófono conectado.",
      head_dead: "No llega ningún sonido al navegador. Casi siempre es el micrófono equivocado seleccionado, o el micrófono está apagado o silenciado.",
      head_network:
        "Su micrófono SÍ funciona, pero el reconocimiento de voz está bloqueado en su red o internet. Chrome tiene que enviar su voz a los servidores de Google para convertirla en texto, y esa conexión no está pasando. Por eso el medidor se mueve pero las palabras no avanzan.",
      head_quiet: "Se oye algo, pero muy bajito. El reconocimiento de voz va a fallar casi siempre así.",
      head_speechfail: "El micrófono se oye, pero el reconocimiento de voz falló. Vea el detalle abajo.",
      head_nospeech: "El navegador escuchó, pero no reconoció ninguna palabra. Revise el detalle abajo.",
      head_noresult:
        "Su micrófono SÍ funciona, pero el reconocimiento de voz no devolvió absolutamente nada: ni palabras ni un error. Las dos causas de esto son (1) que no se habló lo bastante fuerte durante la prueba, o (2) que la red está bloqueando el servicio de voz de Google que Chrome necesita. Pruebe otra vez hablando fuerte; si sigue vacío, es la red.",
      head_warn: "Casi todo funciona, pero hay advertencias abajo que conviene revisar.",

      /* 1. Browser */
      row_browser: "Navegador",
      br_ok: "Este navegador sirve para el reconocimiento de voz.",
      br_firefox: "Firefox NO tiene reconocimiento de voz. Nunca va a funcionar el prompter aquí, aunque el micrófono esté perfecto.",
      br_firefox_fix:
        "Cierre Firefox y abra el CRM en <strong>Google Chrome</strong> (también sirve Microsoft Edge o Safari). Copie esta dirección en Chrome: <strong>{origin}/staff/mic-check.html</strong>",
      br_brave: "Brave sirve solo a veces: por privacidad, Brave apaga el servicio de voz de Google que Chrome usa.",
      br_brave_fix: "Si la prueba de voz de abajo falla con error de red, use <strong>Google Chrome</strong> en lugar de Brave.",
      br_unknown: "No reconocimos este navegador. El reconocimiento de voz solo es confiable en Chrome, Edge y Safari.",
      br_unknown_fix: "Para estar seguros, abra el CRM en <strong>Google Chrome</strong>.",

      /* 2. Secure context */
      row_secure: "Conexión segura",
      sec_ok: "La página está en una conexión segura. Correcto.",
      sec_local: "La página está en su propia computadora (localhost). El navegador lo acepta igual.",
      sec_fail: "La página NO está segura, así que el navegador va a bloquear el micrófono sin decirle por qué.",
      sec_fail_fix:
        "Abra la dirección con <strong>https://</strong> al principio, no <strong>http://</strong>. La correcta es: <strong>https://mejorvidainsurance.com/staff/mic-check.html</strong>",

      /* 3. Speech API */
      row_api: "Reconocimiento de voz del navegador",
      api_ok: "El navegador tiene reconocimiento de voz disponible.",
      api_fail: "Este navegador no tiene reconocimiento de voz. El prompter no puede seguir su voz aquí.",
      api_fail_fix: "Abra el CRM en <strong>Google Chrome</strong>.",

      /* 4. Permission */
      row_perm: "Permiso del micrófono",
      perm_granted: "Chrome ya tiene permiso para usar el micrófono.",
      perm_prompt: "Todavía no dio permiso. El navegador se lo va a preguntar cuando empiece la prueba.",
      perm_prompt_fix: "Cuando salga la ventanita arriba, presione <strong>Permitir</strong>.",
      perm_denied: "El micrófono está BLOQUEADO para este sitio. Esta es la causa más común.",
      perm_denied_fix:
        "Hágalo en este orden:<ol><li>En Chrome, arriba en la barra de direcciones, busque el ícono de <strong>micrófono</strong> o el candado, presiónelo y elija <strong>Permitir</strong>.</li><li>Abra <strong>Configuración del Sistema › Privacidad y seguridad › Micrófono</strong> y prenda el interruptor de <strong>Google Chrome</strong>.</li><li><strong>Salga de Chrome por completo</strong> (Chrome › Salir, no solo cerrar la ventana) y ábralo de nuevo.</li><li>Vuelva a esta página y presione «Probar micrófono».</li></ol>",
      perm_unsupported: "Este navegador no deja consultar el permiso de antemano. No es un problema.",
      perm_error: "No se pudo leer el estado del permiso. Seguimos con la prueba real.",

      /* 5. Devices */
      row_devices: "Micrófono que está usando",
      dev_ok: "El navegador está usando este micrófono: {active}",
      dev_ok_multi: "El navegador está usando este micrófono: {active}. Hay {count} entradas de audio en total (marcada con ▸ la que se usa).",
      dev_none: "El navegador no ve ningún micrófono conectado.",
      dev_none_fix:
        "Conecte o prenda el micrófono (o los audífonos), y revise <strong>Configuración del Sistema › Sonido › Entrada</strong> para ver que aparezca uno. Después presione «Probar otra vez».",
      dev_nolabels: "Los nombres de los micrófonos están ocultos porque todavía no hay permiso. Se van a mostrar cuando dé permiso.",
      dev_virtual:
        "Ojo: el micrófono que se está usando parece un dispositivo virtual o de programa (no un micrófono real). Esos casi siempre entregan silencio.",
      dev_virtual_fix:
        "Abra <strong>Configuración del Sistema › Sonido › Entrada</strong> y elija el micrófono de verdad (por ejemplo «Micrófono del MacBook Pro» o sus audífonos). Después cierre y abra Chrome y pruebe otra vez.",
      dev_unsupported: "Este navegador no deja ver la lista de micrófonos.",

      /* 6. Level */
      row_level: "¿Llega sonido al navegador?",
      lvl_ok: "Sí, lo oímos bien. El sonido está llegando al navegador. Nivel más alto: {peak}%.",
      lvl_quiet:
        "Apenas se oye: el sonido llega muy bajito (nivel más alto: {peak}%). El micrófono está vivo, pero con el volumen demasiado bajo para reconocer palabras.",
      lvl_quiet_fix:
        "Acérquese más al micrófono y suba la entrada en <strong>Configuración del Sistema › Sonido › Entrada</strong> (barra de «Volumen de entrada» hacia la derecha). Si usa audífonos con brazo de micrófono, acomódelo frente a su boca.",
      lvl_dead: "NO llega ningún sonido al navegador (nivel más alto: {peak}%). Para el navegador, su micrófono está en silencio total.",
      lvl_dead_fix:
        "Revise, en este orden:<ol><li>¿El micrófono o los audífonos tienen un botón o switch de <strong>silencio (mute)</strong> prendido? Apáguelo.</li><li><strong>Configuración del Sistema › Sonido › Entrada</strong>: elija el micrófono correcto y hable — la barrita de nivel de ahí se debe mover. Si tampoco se mueve ahí, el problema es de la computadora, no de Chrome.</li><li>Suba el <strong>«Volumen de entrada»</strong> en esa misma pantalla.</li><li>Cierre Zoom, Meet, Teams, OBS o cualquier grabadora que pueda tener agarrado el micrófono, y pruebe otra vez.</li></ol>",
      lvl_nomic: "No se pudo abrir el micrófono, así que no pudimos medir el sonido.",
      lvl_denied: "No se pudo medir: el navegador bloqueó el micrófono.",
      lvl_busy: "Otro programa tiene agarrado el micrófono, y el navegador no pudo abrirlo.",
      lvl_busy_fix: "Cierre Zoom, Google Meet, Teams, OBS, Loopback o su grabadora. Después presione «Probar otra vez».",
      lvl_notfound: "El navegador no encontró ningún micrófono para abrir.",
      lvl_error: "El micrófono no se pudo abrir. Error del navegador: {name}.",

      /* 7. Speech test */
      row_speech: "Prueba de voz en español",
      sp_ok: "El navegador entendió lo que dijo. El reconocimiento de voz funciona.",
      sp_heard: "Escuchamos: “{text}”",
      sp_skipped: "No se hizo la prueba porque este navegador no tiene reconocimiento de voz.",
      sp_skipped_insecure: "No se hizo la prueba porque la página no está en una conexión segura.",
      sp_network:
        "FALLÓ por RED. Su micrófono funciona, pero Chrome no pudo mandar su voz a los servidores de Google para convertirla en texto. El micrófono se ve perfecto y aun así las palabras no avanzan: este error es exactamente eso.",
      sp_network_fix:
        "Pruebe en este orden, y después de cada paso vuelva a presionar «Probar otra vez»:<ol><li><strong>Apague la VPN</strong> si tiene una prendida.</li><li>Apague el antivirus o el programa de «filtro web / control parental» que tenga instalado.</li><li>Conéctese a <strong>otra red</strong>: por ejemplo comparta internet desde su teléfono (hotspot). Si ahí funciona, el bloqueo es de su red o de su proveedor.</li><li>Si está en la red de una oficina, el filtro de contenido o el DNS de esa red está bloqueando el servicio de voz de Google.</li></ol>",
      sp_denied: "FALLÓ porque el micrófono está bloqueado para este sitio.",
      sp_denied_fix:
        "Es el mismo arreglo de «Permiso del micrófono» arriba: ícono de micrófono en la barra de direcciones de Chrome → <strong>Permitir</strong>; después <strong>Configuración del Sistema › Privacidad y seguridad › Micrófono</strong> → prenda <strong>Google Chrome</strong>; después salga de Chrome por completo y ábralo otra vez.",
      sp_nomic: "FALLÓ: el navegador no pudo capturar audio del micrófono.",
      sp_nomic_fix: "Revise la fila «¿Llega sonido al navegador?» de arriba: ese es el problema de fondo.",
      sp_lang: "FALLÓ: este navegador no reconoce español ({lang}).",
      sp_lang_fix: "Use <strong>Google Chrome</strong>, que sí reconoce español.",
      sp_nospeech:
        "El navegador escuchó pero no reconoció ninguna palabra. Si el medidor de arriba sí se movía, hable más fuerte y más cerca, y lea la frase completa.",
      sp_nospeech_fix: "Presione «Probar otra vez» y lea la frase completa, en voz alta y clara, hasta que se acabe el tiempo.",
      sp_noresult: "El navegador no devolvió nada en los {sec} segundos: ni palabras ni un error.",
      sp_noresult_fix:
        "Presione «Probar otra vez» y hable en voz alta desde el primer segundo. Si siempre queda vacío, es casi seguro el bloqueo de red que se explica en «Copiar resultados» — mándele el resultado a Justin.",
      sp_error: "FALLÓ con el error “{code}”.",
      sp_error_fix: "Presione «Copiar resultados» y mándeselos a Justin.",

      /* 8. AudioContext */
      row_audioctx: "Motor de audio del navegador",
      ac_ok: "El motor de audio está funcionando (running).",
      ac_resumed: "El motor de audio estaba dormido y se despertó al presionar el botón. Normal.",
      ac_suspended:
        "El motor de audio quedó dormido (suspended). Mientras esté así, el medidor de nivel se queda en cero aunque el micrófono funcione.",
      ac_suspended_fix: "Presione «Probar otra vez» — hace falta un clic suyo en la página para despertarlo.",
      ac_missing: "Este navegador no tiene el motor de audio que usa el medidor de nivel.",
      ac_skipped: "No se revisó porque el micrófono no se pudo abrir.",

      /* Copy summary labels */
      sum_title: "PRUEBA DE MICRÓFONO — MEJOR VIDA",
      sum_when: "Fecha",
      sum_page: "Página",
      sum_fix: "Arreglo",
      sum_detail: "Detalle",
      sum_devices: "Entradas de audio",
      sum_active: "(en uso)"
    },

    en: {
      h1: "Microphone & speech check",
      intro:
        "This page checks your microphone and the browser's speech recognition, and tells you in plain words what is wrong and how to fix it.",
      btn_run: "Test microphone",
      btn_running: "Testing…",
      btn_again: "Test again",
      btn_copy: "Copy results",
      raw_toggle: "Show the results as text",
      back_link: "← Back to the CRM (YouTube tab)",
      status_idle: "Press the button and speak out loud when asked. The test takes about 15 seconds.",
      status_asking: "Asking for microphone permission — press “Allow”.",
      status_level: "Speak normally, out loud. Measuring the sound… {sec}s",
      status_speech: "Now read the sentence below out loud… {sec}s",
      status_done: "Test finished. Review the results and press “Copy results”.",
      readaloud: "Read this out loud: “Hola, me llamo Julie y estoy probando el micrófono.”",
      copied: "Copied. Paste it into a message to Justin.",
      copy_fail: "Could not copy automatically. Open “Show the results as text”, select it, and copy by hand.",
      copy_empty: "Run “Test microphone” first.",

      head_ok: "Everything works. The mic is heard and the browser understood the speech.",
      head_firefox: "The browser is the problem. Firefox has no speech recognition. Open the CRM in Google Chrome.",
      head_noapi: "This browser has no speech recognition. Use Google Chrome.",
      head_insecure: "This page is not on a secure (https) connection, and without that the browser will not allow the microphone.",
      head_denied: "The microphone is blocked. Chrome needs permission.",
      head_nodevice: "The browser cannot find any microphone connected.",
      head_dead: "No sound is reaching the browser. Usually the wrong input device is selected, or the mic is off or muted.",
      head_network:
        "The microphone DOES work, but speech recognition is blocked on this network. Chrome has to send the audio to Google's servers to turn it into text, and that connection is not getting through. That is why the level meter moves but the words never advance.",
      head_quiet: "Something is heard, but far too quiet. Speech recognition will almost always fail like this.",
      head_speechfail: "The microphone is heard, but speech recognition failed. See the detail below.",
      head_nospeech: "The browser listened but recognized no words. See the detail below.",
      head_noresult:
        "The microphone DOES work, but speech recognition returned nothing at all: no words and no error. The two causes are (1) nobody spoke loudly enough during the test, or (2) the network is blocking the Google speech service Chrome needs. Try again speaking loudly; if it stays empty, it is the network.",
      head_warn: "Most things work, but there are warnings below worth checking.",

      row_browser: "Browser",
      br_ok: "This browser supports speech recognition.",
      br_firefox: "Firefox has NO speech recognition. The prompter will never work here, even with a perfect microphone.",
      br_firefox_fix:
        "Quit Firefox and open the CRM in <strong>Google Chrome</strong> (Microsoft Edge or Safari also work). Paste this into Chrome: <strong>{origin}/staff/mic-check.html</strong>",
      br_brave: "Brave only works sometimes: for privacy, Brave disables the Google speech service that Chrome relies on.",
      br_brave_fix: "If the speech test below fails with a network error, use <strong>Google Chrome</strong> instead of Brave.",
      br_unknown: "This browser was not recognized. Speech recognition is only reliable in Chrome, Edge, and Safari.",
      br_unknown_fix: "To be safe, open the CRM in <strong>Google Chrome</strong>.",

      row_secure: "Secure connection",
      sec_ok: "The page is on a secure connection. Correct.",
      sec_local: "The page is on your own computer (localhost). The browser accepts that too.",
      sec_fail: "The page is NOT secure, so the browser will block the microphone without telling you why.",
      sec_fail_fix:
        "Open the address starting with <strong>https://</strong>, not <strong>http://</strong>. The right one is <strong>https://mejorvidainsurance.com/staff/mic-check.html</strong>",

      row_api: "Browser speech recognition",
      api_ok: "Speech recognition is available in this browser.",
      api_fail: "This browser has no speech recognition. The prompter cannot follow your voice here.",
      api_fail_fix: "Open the CRM in <strong>Google Chrome</strong>.",

      row_perm: "Microphone permission",
      perm_granted: "Chrome already has permission to use the microphone.",
      perm_prompt: "Permission not given yet. The browser will ask when the test starts.",
      perm_prompt_fix: "When the small window appears at the top, press <strong>Allow</strong>.",
      perm_denied: "The microphone is BLOCKED for this site. This is the most common cause.",
      perm_denied_fix:
        "Do this in order:<ol><li>In Chrome's address bar, find the <strong>microphone</strong> icon or the padlock, click it, and choose <strong>Allow</strong>.</li><li>Open <strong>System Settings › Privacy &amp; Security › Microphone</strong> and turn on the switch for <strong>Google Chrome</strong>.</li><li><strong>Quit Chrome completely</strong> (Chrome › Quit, not just closing the window) and reopen it.</li><li>Come back to this page and press “Test microphone”.</li></ol>",
      perm_unsupported: "This browser cannot report the permission up front. Not a problem.",
      perm_error: "Could not read the permission state. Continuing with the real test.",

      row_devices: "Microphone in use",
      dev_ok: "The browser is using this microphone: {active}",
      dev_ok_multi: "The browser is using this microphone: {active}. There are {count} audio inputs in total (▸ marks the one in use).",
      dev_none: "The browser sees no microphone connected.",
      dev_none_fix:
        "Connect or switch on the microphone (or headset), and check <strong>System Settings › Sound › Input</strong> to confirm one appears. Then press “Test again”.",
      dev_nolabels: "Microphone names are hidden until permission is granted. They will appear once you allow it.",
      dev_virtual:
        "Careful: the microphone in use looks like a virtual or software device, not a real mic. Those almost always deliver silence.",
      dev_virtual_fix:
        "Open <strong>System Settings › Sound › Input</strong> and pick the real microphone (for example “MacBook Pro Microphone” or your headset). Then quit and reopen Chrome and test again.",
      dev_unsupported: "This browser will not list microphones.",

      row_level: "Is sound reaching the browser?",
      lvl_ok: "Yes, we can hear you clearly. Sound is reaching the browser. Peak level: {peak}%.",
      lvl_quiet:
        "Barely audible: the sound arrives very quiet (peak level: {peak}%). The mic is alive, but the volume is far too low to recognize words.",
      lvl_quiet_fix:
        "Move closer to the microphone and raise the input in <strong>System Settings › Sound › Input</strong> (drag “Input volume” to the right). If you use a headset boom mic, point it at your mouth.",
      lvl_dead: "NO sound is reaching the browser (peak level: {peak}%). As far as the browser is concerned, your mic is completely silent.",
      lvl_dead_fix:
        "Check, in this order:<ol><li>Does the mic or headset have a <strong>mute</strong> button or switch turned on? Turn it off.</li><li><strong>System Settings › Sound › Input</strong>: select the right microphone and speak — the level bar there should move. If it does not move there either, the problem is the computer, not Chrome.</li><li>Raise <strong>“Input volume”</strong> on that same screen.</li><li>Close Zoom, Meet, Teams, OBS, or any recorder that may be holding the mic, and test again.</li></ol>",
      lvl_nomic: "The microphone could not be opened, so the sound could not be measured.",
      lvl_denied: "Could not measure: the browser blocked the microphone.",
      lvl_busy: "Another program is holding the microphone, and the browser could not open it.",
      lvl_busy_fix: "Close Zoom, Google Meet, Teams, OBS, Loopback, or your recorder. Then press “Test again”.",
      lvl_notfound: "The browser found no microphone to open.",
      lvl_error: "The microphone could not be opened. Browser error: {name}.",

      row_speech: "Spanish speech test",
      sp_ok: "The browser understood the speech. Speech recognition works.",
      sp_heard: "We heard: “{text}”",
      sp_skipped: "Skipped because this browser has no speech recognition.",
      sp_skipped_insecure: "Skipped because the page is not on a secure connection.",
      sp_network:
        "FAILED on the NETWORK. Your microphone works, but Chrome could not send the audio to Google's servers to turn it into text. The mic looks perfect and the words still never advance: this error is exactly that.",
      sp_network_fix:
        "Try in this order, pressing “Test again” after each step:<ol><li><strong>Turn off the VPN</strong> if one is on.</li><li>Turn off the antivirus or “web filter / parental control” software.</li><li>Connect to a <strong>different network</strong> — for example your phone's hotspot. If it works there, the block is your network or provider.</li><li>On an office network, that network's content filter or DNS is blocking Google's speech service.</li></ol>",
      sp_denied: "FAILED because the microphone is blocked for this site.",
      sp_denied_fix:
        "Same fix as “Microphone permission” above: mic icon in Chrome's address bar → <strong>Allow</strong>; then <strong>System Settings › Privacy &amp; Security › Microphone</strong> → turn on <strong>Google Chrome</strong>; then quit Chrome completely and reopen it.",
      sp_nomic: "FAILED: the browser could not capture audio from the microphone.",
      sp_nomic_fix: "See the “Is sound reaching the browser?” row above — that is the underlying problem.",
      sp_lang: "FAILED: this browser does not recognize Spanish ({lang}).",
      sp_lang_fix: "Use <strong>Google Chrome</strong>, which does recognize Spanish.",
      sp_nospeech:
        "The browser listened but recognized no words. If the meter above did move, speak louder and closer, and read the whole sentence.",
      sp_nospeech_fix: "Press “Test again” and read the whole sentence, out loud and clearly, until the time runs out.",
      sp_noresult: "The browser returned nothing in {sec} seconds: no words and no error.",
      sp_noresult_fix:
        "Press “Test again” and speak from the first second. If it stays empty every time, it is almost certainly the network block — send the results to Justin.",
      sp_error: "FAILED with the error “{code}”.",
      sp_error_fix: "Press “Copy results” and send them to Justin.",

      row_audioctx: "Browser audio engine",
      ac_ok: "The audio engine is running.",
      ac_resumed: "The audio engine was asleep and woke up when you pressed the button. Normal.",
      ac_suspended:
        "The audio engine stayed asleep (suspended). While it is, the level meter reads zero even when the microphone works.",
      ac_suspended_fix: "Press “Test again” — it needs a click from you on the page to wake up.",
      ac_missing: "This browser lacks the audio engine the level meter uses.",
      ac_skipped: "Not checked because the microphone could not be opened.",

      sum_title: "MICROPHONE CHECK — MEJOR VIDA",
      sum_when: "Date",
      sum_page: "Page",
      sum_fix: "Fix",
      sum_detail: "Detail",
      sum_devices: "Audio inputs",
      sum_active: "(in use)"
    }
  };

  var ROWS = ["browser", "secure", "api", "perm", "devices", "level", "audioctx", "speech"];
  var ROW_LABEL = {
    browser: "row_browser",
    secure: "row_secure",
    api: "row_api",
    perm: "row_perm",
    devices: "row_devices",
    level: "row_level",
    audioctx: "row_audioctx",
    speech: "row_speech"
  };
  var ICON = { ok: "✓", warn: "!", fail: "✕", busy: "…", idle: "·" };

  var lang = "es";
  var results = {};
  var headline = null;
  var running = false;
  var hasRun = false;

  /* Live audio state, torn down by stopAudio(). */
  var stream = null;
  var audioCtx = null;
  var analyser = null;
  var levelData = null;
  var levelRaf = 0;
  var peakPct = 0;

  var els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fill(tpl, vars, escape) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) {
      if (!vars || vars[k] == null) return m;
      return escape ? esc(vars[k]) : String(vars[k]);
    });
  }

  function t(key, vars) {
    var dict = STR[lang] || STR.es;
    var tpl = dict[key] != null ? dict[key] : (STR.es[key] != null ? STR.es[key] : key);
    return fill(tpl, vars, false);
  }

  /* Dictionary strings may contain markup (the step-by-step fixes), so the
     template is trusted and only the interpolated values are escaped. */
  function tHtml(key, vars) {
    var dict = STR[lang] || STR.es;
    var tpl = dict[key] != null ? dict[key] : (STR.es[key] != null ? STR.es[key] : key);
    return fill(tpl, vars, true);
  }

  function toPlain(html) {
    return String(html)
      .replace(/<li>/gi, "\n  - ")
      .replace(/<\/li>/gi, "")
      .replace(/<\/?(ol|ul)>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n  ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/[ \t]+\n/g, "\n")
      .trim();
  }

  /* ---------------------------------------------------------------- render */

  function set(key, state, opts) {
    opts = opts || {};
    results[key] = {
      state: state,
      value: opts.value || "",
      verdictKey: opts.verdictKey || "",
      verdictVars: opts.verdictVars || null,
      fixKey: opts.fixKey || "",
      fixVars: opts.fixVars || null,
      detail: opts.detail || "",
      detailKey: opts.detailKey || "",
      detailVars: opts.detailVars || null,
      devices: opts.devices || null
    };
    renderRow(key);
  }

  function rowEl(key) {
    return els.rows.querySelector('[data-mc-row="' + key + '"]');
  }

  function buildRows() {
    els.rows.innerHTML = ROWS.map(function (key) {
      return (
        '<li class="mc-row is-idle" data-mc-row="' + key + '">' +
        '<span class="mc-icon" aria-hidden="true">' + ICON.idle + "</span>" +
        '<div class="mc-cell">' +
        '<p class="mc-name"></p>' +
        '<p class="mc-value" hidden></p>' +
        '<p class="mc-verdict"></p>' +
        '<ul class="mc-devices" hidden></ul>' +
        '<div class="mc-fix" hidden></div>' +
        '<p class="mc-detail" hidden></p>' +
        "</div></li>"
      );
    }).join("");
    ROWS.forEach(renderRow);
  }

  function renderRow(key) {
    var li = rowEl(key);
    if (!li) return;
    var r = results[key];
    var state = r ? r.state : "idle";
    li.className = "mc-row is-" + state;
    li.querySelector(".mc-icon").textContent = ICON[state] || ICON.idle;
    li.querySelector(".mc-name").textContent = t(ROW_LABEL[key]);

    var valEl = li.querySelector(".mc-value");
    valEl.textContent = r && r.value ? r.value : "";
    valEl.hidden = !(r && r.value);

    var verdictEl = li.querySelector(".mc-verdict");
    verdictEl.textContent = r && r.verdictKey ? toPlain(t(r.verdictKey, r.verdictVars)) : "";

    var devEl = li.querySelector(".mc-devices");
    if (r && r.devices && r.devices.length) {
      devEl.innerHTML = r.devices
        .map(function (d) {
          return (
            '<li class="' + (d.active ? "is-active" : "") + '">' +
            esc(d.label) +
            (d.active ? " " + esc(t("sum_active")) : "") +
            "</li>"
          );
        })
        .join("");
      devEl.hidden = false;
    } else {
      devEl.innerHTML = "";
      devEl.hidden = true;
    }

    var fixEl = li.querySelector(".mc-fix");
    if (r && r.fixKey) {
      fixEl.innerHTML = "<strong>" + esc(t("sum_fix")) + ":</strong> " + tHtml(r.fixKey, r.fixVars);
      fixEl.hidden = false;
    } else {
      fixEl.innerHTML = "";
      fixEl.hidden = true;
    }

    var detEl = li.querySelector(".mc-detail");
    var detail = r ? (r.detailKey ? toPlain(t(r.detailKey, r.detailVars)) : r.detail) : "";
    detEl.textContent = detail || "";
    detEl.hidden = !detail;
  }

  function renderHeadline() {
    if (!headline) {
      els.headlineCard.hidden = true;
      return;
    }
    els.headlineCard.hidden = false;
    els.headlineCard.className = "mc-card mc-verdict-card is-" + headline.state;
    els.headline.textContent = t(headline.key);
  }

  function renderStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-mc-t]").forEach(function (el) {
      var key = el.getAttribute("data-mc-t");
      if (key === "btn_run") {
        el.textContent = running ? t("btn_running") : hasRun ? t("btn_again") : t("btn_run");
      } else if (key === "status_idle") {
        if (!hasRun && !running) el.textContent = t("status_idle");
      } else {
        el.textContent = t(key);
      }
    });
    els.readaloud.textContent = t("readaloud");
    document.title = t("h1") + " — Mejor Vida";
    els.lang.forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-mc-lang") === lang);
    });
  }

  function renderAll() {
    renderStatic();
    renderHeadline();
    ROWS.forEach(renderRow);
    if (hasRun) els.raw.textContent = buildSummary();
  }

  function status(key, vars) {
    els.status.textContent = key ? t(key, vars) : "";
  }

  function paint(pct) {
    els.meterFill.style.width = Math.max(0, Math.min(100, pct)) + "%";
    els.meterNum.textContent = Math.round(peakPct) + "%";
  }

  /* ----------------------------------------------------------- environment */

  function detectBrowser() {
    var ua = navigator.userAgent || "";
    var m;
    if (/FxiOS\/|Firefox\//.test(ua)) {
      m = ua.match(/(?:FxiOS|Firefox)\/(\d+)/);
      return { name: "Firefox", version: m ? m[1] : "?", kind: "firefox" };
    }
    if (/Edg\//.test(ua)) {
      m = ua.match(/Edg\/(\d+)/);
      return { name: "Microsoft Edge", version: m ? m[1] : "?", kind: "supported" };
    }
    if (/OPR\//.test(ua)) {
      m = ua.match(/OPR\/(\d+)/);
      return { name: "Opera", version: m ? m[1] : "?", kind: "unknown" };
    }
    if (/Chrome\/|CriOS\//.test(ua)) {
      m = ua.match(/(?:CriOS|Chrome)\/(\d+)/);
      return { name: "Google Chrome", version: m ? m[1] : "?", kind: "supported" };
    }
    if (/Safari\//.test(ua) && /Version\//.test(ua)) {
      m = ua.match(/Version\/([\d.]+)/);
      return { name: "Safari", version: m ? m[1] : "?", kind: "supported" };
    }
    return { name: "Desconocido / Unknown", version: "", kind: "unknown" };
  }

  function speechCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function osLabel() {
    var p = navigator.userAgentData && navigator.userAgentData.platform;
    if (p) return p;
    var ua = navigator.userAgent || "";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Windows/.test(ua)) return "Windows";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    return navigator.platform || "?";
  }

  function isVirtualDevice(label) {
    return /loopback|blackhole|soundflower|virtual|obs|aggregate|vb-cable|voicemeeter|iShowU|krisp|ndi|zoomaudiodevice|teams audio|multi-?output/i.test(
      String(label || "")
    );
  }

  function sleep(ms) {
    return new Promise(function (res) {
      setTimeout(res, ms);
    });
  }

  /* ---------------------------------------------------------------- checks */

  function checkBrowser(browser, isBrave) {
    var value = browser.name + (browser.version ? " " + browser.version : "") + " · " + osLabel();
    if (browser.kind === "firefox") {
      set("browser", "fail", {
        value: value,
        verdictKey: "br_firefox",
        fixKey: "br_firefox_fix",
        fixVars: { origin: location.origin }
      });
      return;
    }
    if (isBrave) {
      set("browser", "warn", { value: "Brave · " + osLabel(), verdictKey: "br_brave", fixKey: "br_brave_fix" });
      return;
    }
    if (browser.kind === "unknown") {
      set("browser", "warn", { value: value, verdictKey: "br_unknown", fixKey: "br_unknown_fix" });
      return;
    }
    set("browser", "ok", { value: value, verdictKey: "br_ok" });
  }

  function checkSecure() {
    var host = location.hostname || "";
    var local = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    var value = location.protocol + "//" + host + (location.port ? ":" + location.port : "");
    if (window.isSecureContext && local) {
      set("secure", "ok", { value: value, verdictKey: "sec_local" });
    } else if (window.isSecureContext) {
      set("secure", "ok", { value: value, verdictKey: "sec_ok" });
    } else {
      set("secure", "fail", { value: value, verdictKey: "sec_fail", fixKey: "sec_fail_fix" });
    }
    return !!window.isSecureContext;
  }

  function checkApi() {
    var Ctor = speechCtor();
    if (!Ctor) {
      set("api", "fail", { value: "no", verdictKey: "api_fail", fixKey: "api_fail_fix" });
      return false;
    }
    set("api", "ok", {
      value: window.SpeechRecognition ? "SpeechRecognition" : "webkitSpeechRecognition",
      verdictKey: "api_ok"
    });
    return true;
  }

  function checkPermission() {
    if (!navigator.permissions || !navigator.permissions.query) {
      set("perm", "warn", { value: "—", verdictKey: "perm_unsupported" });
      return Promise.resolve("unsupported");
    }
    return navigator.permissions
      .query({ name: "microphone" })
      .then(function (st) {
        var s = st && st.state;
        if (s === "granted") set("perm", "ok", { value: "granted", verdictKey: "perm_granted" });
        else if (s === "denied")
          set("perm", "fail", { value: "denied", verdictKey: "perm_denied", fixKey: "perm_denied_fix" });
        else set("perm", "warn", { value: "prompt", verdictKey: "perm_prompt", fixKey: "perm_prompt_fix" });
        return s || "unknown";
      })
      .catch(function () {
        set("perm", "warn", { value: "—", verdictKey: "perm_error" });
        return "unsupported";
      });
  }

  /**
   * Device labels stay blank until mic permission is granted, so this runs twice:
   * once before getUserMedia (to show *something*) and again after, when the
   * labels and the actually-selected input are available.
   */
  function checkDevices(activeTrack) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      set("devices", "warn", { value: "—", verdictKey: "dev_unsupported" });
      return Promise.resolve();
    }
    return navigator.mediaDevices
      .enumerateDevices()
      .then(function (list) {
        var inputs = list.filter(function (d) {
          return d.kind === "audioinput";
        });
        if (!inputs.length) {
          set("devices", "fail", { value: "0", verdictKey: "dev_none", fixKey: "dev_none_fix" });
          return;
        }

        var settings = activeTrack && activeTrack.getSettings ? activeTrack.getSettings() : null;
        var activeId = settings && settings.deviceId ? settings.deviceId : "";
        var activeLabel = activeTrack && activeTrack.label ? activeTrack.label : "";
        var labelled = inputs.some(function (d) {
          return !!d.label;
        });

        var devices = inputs.map(function (d, i) {
          var isActive = activeTrack
            ? (activeId && d.deviceId === activeId) || (!!activeLabel && d.label === activeLabel)
            : d.deviceId === "default" || i === 0;
          return {
            label: d.label || "(" + (lang === "es" ? "nombre oculto" : "name hidden") + " · " + (d.deviceId || "?").slice(0, 8) + ")",
            active: !!isActive
          };
        });
        if (activeTrack && !devices.some(function (d) { return d.active; }) && activeLabel) {
          devices.unshift({ label: activeLabel, active: true });
        }

        var active = activeLabel || (devices.filter(function (d) { return d.active; })[0] || devices[0]).label;

        if (!labelled && !activeTrack) {
          set("devices", "warn", {
            value: String(inputs.length),
            verdictKey: "dev_nolabels",
            devices: devices
          });
          return;
        }
        if (activeTrack && isVirtualDevice(active)) {
          set("devices", "warn", {
            value: active,
            verdictKey: "dev_virtual",
            fixKey: "dev_virtual_fix",
            devices: devices
          });
          return;
        }
        set("devices", activeTrack ? "ok" : "warn", {
          value: active,
          verdictKey: inputs.length > 1 ? "dev_ok_multi" : "dev_ok",
          verdictVars: { active: active, count: inputs.length },
          devices: devices
        });
      })
      .catch(function () {
        set("devices", "warn", { value: "—", verdictKey: "dev_unsupported" });
      });
  }

  function tickLevel() {
    if (!analyser || !levelData) return;
    analyser.getByteTimeDomainData(levelData);
    var peak = 0;
    for (var i = 0; i < levelData.length; i++) {
      var dev = Math.abs(levelData[i] - 128);
      if (dev > peak) peak = dev;
    }
    var pct = (peak / 128) * 100;
    if (pct > peakPct) peakPct = pct;
    /* Boost the bar so ordinary speech fills it; the number stays the true peak. */
    paint(Math.min(100, pct * 3));
    levelRaf = requestAnimationFrame(tickLevel);
  }

  function stopAudio() {
    if (levelRaf) {
      cancelAnimationFrame(levelRaf);
      levelRaf = 0;
    }
    if (stream) {
      stream.getTracks().forEach(function (tr) {
        try {
          tr.stop();
        } catch (e) {}
      });
      stream = null;
    }
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch (e) {}
      audioCtx = null;
    }
    analyser = null;
    levelData = null;
  }

  function openMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.resolve({ ok: false, name: "unsupported" });
    }
    status("status_asking");
    return navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (s) {
        stream = s;
        return { ok: true };
      })
      .catch(function (err) {
        return { ok: false, name: (err && err.name) || "Error" };
      });
  }

  function startAnalyser() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      set("audioctx", "fail", { value: "—", verdictKey: "ac_missing" });
      return Promise.resolve();
    }
    audioCtx = new Ctx();
    var before = audioCtx.state;
    var resume = audioCtx.state === "suspended" && audioCtx.resume ? audioCtx.resume() : Promise.resolve();
    return resume
      .catch(function () {})
      .then(function () {
        var after = audioCtx.state;
        if (after === "running") {
          set("audioctx", "ok", {
            value: after,
            verdictKey: before === "suspended" ? "ac_resumed" : "ac_ok"
          });
        } else {
          set("audioctx", "warn", { value: after, verdictKey: "ac_suspended", fixKey: "ac_suspended_fix" });
        }
        var src = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        levelData = new Uint8Array(analyser.fftSize);
        src.connect(analyser);
        tickLevel();
      });
  }

  function finalizeLevel() {
    var peak = peakPct < 10 ? Math.round(peakPct * 10) / 10 : Math.round(peakPct);
    if (peakPct >= PEAK_QUIET) {
      set("level", "ok", { value: peak + "%", verdictKey: "lvl_ok", verdictVars: { peak: peak } });
    } else if (peakPct >= PEAK_DEAD) {
      set("level", "warn", {
        value: peak + "%",
        verdictKey: "lvl_quiet",
        verdictVars: { peak: peak },
        fixKey: "lvl_quiet_fix"
      });
    } else {
      set("level", "fail", {
        value: peak + "%",
        verdictKey: "lvl_dead",
        verdictVars: { peak: peak },
        fixKey: "lvl_dead_fix"
      });
    }
  }

  function micFailure(name) {
    if (name === "NotAllowedError" || name === "SecurityError") {
      set("level", "fail", { value: name, verdictKey: "lvl_denied", fixKey: "perm_denied_fix" });
      set("perm", "fail", { value: "denied", verdictKey: "perm_denied", fixKey: "perm_denied_fix" });
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      set("level", "fail", { value: name, verdictKey: "lvl_notfound", fixKey: "dev_none_fix" });
    } else if (name === "NotReadableError" || name === "AbortError") {
      set("level", "fail", { value: name, verdictKey: "lvl_busy", fixKey: "lvl_busy_fix" });
    } else {
      set("level", "fail", { value: name, verdictKey: "lvl_error", verdictVars: { name: name } });
    }
    set("audioctx", "warn", { value: "—", verdictKey: "ac_skipped" });
  }

  /**
   * ~8 second SpeechRecognition round trip in Spanish. Error codes are mapped to
   * causes rather than shown raw; `network` is called out because Chrome streams
   * audio to Google to transcribe it, so a VPN, DNS, or content filter kills
   * recognition while the microphone itself still looks perfect.
   */
  function runSpeech() {
    var Ctor = speechCtor();
    if (!Ctor) {
      set("speech", "fail", { value: "—", verdictKey: "sp_skipped", fixKey: "api_fail_fix" });
      return Promise.resolve();
    }
    if (!window.isSecureContext) {
      set("speech", "fail", { value: "—", verdictKey: "sp_skipped_insecure", fixKey: "sec_fail_fix" });
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      var rec = new Ctor();
      var transcript = "";
      var errCode = "";
      var done = false;
      var timer = 0;
      var tick = 0;

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearInterval(tick);
        try {
          rec.onresult = rec.onerror = rec.onend = null;
          rec.stop();
        } catch (e) {}

        var text = transcript.trim();
        if (text) {
          set("speech", "ok", {
            value: SPEECH_LANG,
            verdictKey: "sp_ok",
            detailKey: "sp_heard",
            detailVars: { text: text.slice(0, 160) }
          });
        } else if (errCode === "network") {
          set("speech", "fail", { value: "network", verdictKey: "sp_network", fixKey: "sp_network_fix" });
        } else if (errCode === "not-allowed" || errCode === "service-not-allowed") {
          set("speech", "fail", { value: errCode, verdictKey: "sp_denied", fixKey: "sp_denied_fix" });
        } else if (errCode === "audio-capture") {
          set("speech", "fail", { value: errCode, verdictKey: "sp_nomic", fixKey: "sp_nomic_fix" });
        } else if (errCode === "language-not-supported") {
          set("speech", "fail", {
            value: errCode,
            verdictKey: "sp_lang",
            verdictVars: { lang: SPEECH_LANG },
            fixKey: "sp_lang_fix"
          });
        } else if (errCode === "no-speech") {
          set("speech", "warn", { value: errCode, verdictKey: "sp_nospeech", fixKey: "sp_nospeech_fix" });
        } else if (errCode) {
          set("speech", "fail", {
            value: errCode,
            verdictKey: "sp_error",
            verdictVars: { code: errCode },
            fixKey: "sp_error_fix"
          });
        } else {
          set("speech", "warn", {
            value: "—",
            verdictKey: "sp_noresult",
            verdictVars: { sec: Math.round(SPEECH_MS / 1000) },
            fixKey: "sp_noresult_fix"
          });
        }
        resolve();
      }

      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = SPEECH_LANG;
      rec.onresult = function (ev) {
        var out = "";
        for (var i = 0; i < ev.results.length; i++) out += ev.results[i][0].transcript;
        if (out.trim()) transcript = out;
      };
      rec.onerror = function (ev) {
        var code = (ev && ev.error) || "";
        /* "aborted" is what our own stop() raises; never report it as the cause. */
        if (code === "aborted") return;
        if (!errCode || errCode === "no-speech") errCode = code;
        if (code !== "no-speech") finish();
      };
      rec.onend = function () {
        finish();
      };

      var left = Math.round(SPEECH_MS / 1000);
      els.readaloud.hidden = false;
      status("status_speech", { sec: left });
      tick = setInterval(function () {
        left--;
        status("status_speech", { sec: Math.max(0, left) });
      }, 1000);
      timer = setTimeout(finish, SPEECH_MS);

      try {
        rec.start();
      } catch (e) {
        errCode = "start-failed";
        finish();
      }
    });
  }

  /* --------------------------------------------------------------- verdict */

  function pickHeadline() {
    function st(k) {
      return results[k] ? results[k].state : "idle";
    }
    function val(k) {
      return results[k] ? results[k].value : "";
    }

    if (st("browser") === "fail") return { state: "fail", key: "head_firefox" };
    if (st("api") === "fail") return { state: "fail", key: "head_noapi" };
    if (st("secure") === "fail") return { state: "fail", key: "head_insecure" };
    if (st("perm") === "fail") return { state: "fail", key: "head_denied" };
    if (st("devices") === "fail") return { state: "fail", key: "head_nodevice" };
    if (st("level") === "fail") return { state: "fail", key: "head_dead" };
    if (val("speech") === "network") return { state: "fail", key: "head_network" };
    if (st("level") === "warn") return { state: "warn", key: "head_quiet" };
    if (st("speech") === "fail") return { state: "fail", key: "head_speechfail" };
    /* Nothing at all came back — no transcript and no error code. Point at both
       real causes instead of implying she simply spoke too softly. */
    if (st("speech") === "warn" && val("speech") === "—") return { state: "warn", key: "head_noresult" };
    if (st("speech") === "warn") return { state: "warn", key: "head_nospeech" };
    if (
      ROWS.some(function (k) {
        return st(k) === "warn";
      })
    )
      return { state: "warn", key: "head_warn" };
    return { state: "ok", key: "head_ok" };
  }

  function buildSummary() {
    var mark = { ok: "[OK]  ", warn: "[!]   ", fail: "[FALLA]", idle: "[--]  ", busy: "[..]  " };
    var lines = [];
    lines.push(t("sum_title"));
    lines.push("========================================");
    if (headline) lines.push(t(headline.key));
    lines.push("");
    lines.push(t("sum_when") + ": " + new Date().toString());
    lines.push(t("sum_page") + ": " + location.href);
    lines.push("");
    ROWS.forEach(function (key) {
      var r = results[key];
      if (!r) return;
      lines.push((mark[r.state] || "") + " " + t(ROW_LABEL[key]) + (r.value ? ": " + r.value : ""));
      if (r.verdictKey) lines.push("      " + toPlain(t(r.verdictKey, r.verdictVars)));
      if (r.detailKey || r.detail)
        lines.push("      " + t("sum_detail") + ": " + (r.detailKey ? toPlain(t(r.detailKey, r.detailVars)) : r.detail));
      if (r.devices && r.devices.length) {
        lines.push(
          "      " +
            t("sum_devices") +
            ": " +
            r.devices
              .map(function (d) {
                return d.label + (d.active ? " " + t("sum_active") : "");
              })
              .join(" | ")
        );
      }
      if (r.fixKey) lines.push("      " + t("sum_fix") + ": " + toPlain(t(r.fixKey, r.fixVars)).replace(/\n/g, "\n      "));
      lines.push("");
    });
    lines.push("UA: " + (navigator.userAgent || "?"));
    lines.push("isSecureContext: " + String(window.isSecureContext) + " | lang: " + SPEECH_LANG);
    return lines.join("\n");
  }

  /* ------------------------------------------------------------------- run */

  function run() {
    if (running) return;
    running = true;
    hasRun = true;
    results = {};
    headline = null;
    peakPct = 0;
    els.run.disabled = true;
    els.headlineCard.hidden = true;
    els.copyMsg.textContent = "";
    els.readaloud.hidden = true;
    els.meterWrap.hidden = false;
    paint(0);
    buildRows();
    renderStatic();

    var browser = detectBrowser();
    var bravePromise =
      navigator.brave && typeof navigator.brave.isBrave === "function"
        ? navigator.brave.isBrave().catch(function () {
            return false;
          })
        : Promise.resolve(false);

    bravePromise
      .then(function (isBrave) {
        checkBrowser(browser, isBrave);
        checkSecure();
        checkApi();
        return checkPermission();
      })
      .then(function () {
        return checkDevices(null);
      })
      .then(openMic)
      .then(function (res) {
        if (!res.ok) {
          micFailure(res.name);
          els.meterWrap.hidden = true;
          return null;
        }
        var track = stream.getAudioTracks()[0] || null;
        if (results.perm && results.perm.state !== "ok") {
          set("perm", "ok", { value: "granted", verdictKey: "perm_granted" });
        }
        return checkDevices(track)
          .then(startAnalyser)
          .then(function () {
            var left = Math.round(LEVEL_MS / 1000);
            status("status_level", { sec: left });
            var tick = setInterval(function () {
              left--;
              status("status_level", { sec: Math.max(0, left) });
            }, 1000);
            return sleep(LEVEL_MS).then(function () {
              clearInterval(tick);
              finalizeLevel();
            });
          });
      })
      .then(function () {
        return runSpeech();
      })
      .then(function () {
        /* The speech test keeps the meter alive, so re-score with the full peak. */
        if (analyser) finalizeLevel();
        stopAudio();
        headline = pickHeadline();
        renderHeadline();
        els.raw.textContent = buildSummary();
        status("status_done");
        els.readaloud.hidden = true;
        running = false;
        els.run.disabled = false;
        renderStatic();
      })
      .catch(function (err) {
        stopAudio();
        headline = pickHeadline();
        renderHeadline();
        els.raw.textContent = buildSummary() + "\n\nJS error: " + (err && err.message ? err.message : String(err));
        status("status_done");
        running = false;
        els.run.disabled = false;
        renderStatic();
      });
  }

  function copyResults() {
    var text = els.raw.textContent || "";
    if (!hasRun || !text) {
      els.copyMsg.textContent = t("copy_empty");
      return;
    }
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        els.copyMsg.textContent = ok ? t("copied") : t("copy_fail");
      } catch (e) {
        els.copyMsg.textContent = t("copy_fail");
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          els.copyMsg.textContent = t("copied");
        })
        .catch(fallback);
    } else {
      fallback();
    }
  }

  function init() {
    els = {
      run: $("mc-run"),
      status: $("mc-status"),
      meterWrap: $("mc-meter-wrap"),
      meterFill: $("mc-meter-fill"),
      meterNum: $("mc-meter-num"),
      readaloud: $("mc-readaloud"),
      headlineCard: $("mc-headline-card"),
      headline: $("mc-headline"),
      rows: $("mc-rows"),
      copy: $("mc-copy"),
      copyMsg: $("mc-copy-msg"),
      raw: $("mc-raw-text"),
      lang: Array.prototype.slice.call(document.querySelectorAll("[data-mc-lang]"))
    };

    var saved = "";
    try {
      saved = localStorage.getItem("mvi_mic_check_lang") || "";
    } catch (e) {}
    if (saved === "en" || saved === "es") lang = saved;

    buildRows();
    renderStatic();

    els.run.addEventListener("click", run);
    els.copy.addEventListener("click", copyResults);
    els.lang.forEach(function (btn) {
      btn.addEventListener("click", function () {
        lang = btn.getAttribute("data-mc-lang") === "en" ? "en" : "es";
        try {
          localStorage.setItem("mvi_mic_check_lang", lang);
        } catch (e) {}
        renderAll();
      });
    });
    window.addEventListener("beforeunload", stopAudio);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
