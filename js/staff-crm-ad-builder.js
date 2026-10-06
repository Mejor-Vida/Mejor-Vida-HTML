/**
 * Creative testing — Ad Builder.
 * Stage 1: up to 20 images, 1 hook, 1 wording.
 * Stage 2: 1 image, up to 20 hooks, up to 20 wordings.
 * Stage 3: 1 image, 1 hook, up to 20 wordings.
 * Generate paints the hook and wording on the picture and saves a folder.
 */
(function () {
  "use strict";

  var KEY = "mvi-ad-builder-picks";

  // All 29 static-ad concepts stay in the list. "discuss" means we still
  // need to decide how that ecommerce idea shows up on a final-expense ad.
  var PICTURES = [
    { id: "open-background", en: "Open background", es: "Fondo abierto" },
    { id: "senior-couple", en: "Senior couple", es: "Pareja mayor" },
    { id: "senior-woman", en: "Senior woman", es: "Mujer mayor" },
    { id: "family", en: "Family", es: "Familia" },
    { id: "person-on-camera", en: "Person on camera", es: "Persona en cámara" },
    { id: "cemetery-or-funeral", en: "Cemetery or funeral", es: "Cementerio o funeral" },
    { id: "casket-or-urn", en: "Casket or urn", es: "Ataúd o urna" },
    { id: "price-or-age-card", en: "Price or age card", es: "Tarjeta de precio o edad" },
    { id: "text-graphic", en: "Text graphic", es: "Gráfico de texto" },
    { id: "logo", en: "Logo", es: "Logo" },
  ];

  var GROUPS = [
    { id: "hook", en: "Hook-first", es: "Primero el gancho" },
    { id: "proof", en: "Proof-first", es: "Primero la prueba" },
    { id: "offer", en: "Offer-first", es: "Primero la oferta" },
    { id: "education", en: "Education-first", es: "Primero enseñar" },
    { id: "social", en: "Social-first", es: "Primero lo social" },
    { id: "product", en: "Product-first", es: "Primero el producto" },
    { id: "demand", en: "Demand", es: "Demanda" },
  ];

  var CONCEPTS = [
    { id: "bold-claim", group: "hook", n: 1, fit: "use", en: "Bold claim", es: "Afirmación fuerte", build: { en: "One specific line, the largest text on the image.", es: "Una línea concreta, el texto más grande de la imagen." } },
    { id: "problem-callout", group: "hook", n: 2, fit: "use", en: "Problem callout", es: "El problema", build: { en: "Name the bill the family would face. The problem is the headline.", es: "Nombre la cuenta que enfrentaría la familia. El problema es el título." } },
    { id: "curiosity-gap", group: "hook", n: 3, fit: "use", en: "Curiosity gap", es: "Curiosidad", build: { en: "Give most of the story and leave the answer for the next line.", es: "Dé casi toda la historia y deje la respuesta para la línea siguiente." } },
    { id: "pattern-interrupt", group: "hook", n: 4, fit: "careful", en: "Pattern interrupt", es: "Interrupción", build: { en: "A warning or notice look. It still has to be a real insurance message, not fake government news.", es: "Apariencia de aviso. Tiene que ser un mensaje real de seguro, no una noticia falsa del gobierno." } },
    { id: "direct-question", group: "hook", n: 5, fit: "use", en: "Direct question", es: "Pregunta directa", build: { en: "The question is the headline. The right person answers it in their head.", es: "La pregunta es el título. La persona correcta la responde mentalmente." } },
    { id: "before-after", group: "proof", n: 6, fit: "discuss", en: "Before and after", es: "Antes y después", build: { en: "Possible use: the funeral bill with no plan beside the same bill with a policy. Not a health transformation.", es: "Posible uso: la cuenta del funeral sin plan, junto a la misma cuenta con una póliza. No es una transformación de salud." } },
    { id: "timeline", group: "proof", n: 7, fit: "careful", en: "Timeline proof", es: "Prueba de tiempo", build: { en: "Say how the application works in time. Do not promise a payout speed the policy does not state.", es: "Diga el tiempo del trámite. No prometa una velocidad de pago que la póliza no dice." } },
    { id: "testimonial", group: "proof", n: 8, fit: "careful", en: "Client sentence", es: "Frase del cliente", build: { en: "Only a real client sentence, in their words. Do not write a polished quote and call it a review.", es: "Solo una frase real del cliente, con sus palabras. No escriba una cita pulida y la llame reseña." } },
    { id: "ugc", group: "proof", n: 9, fit: "use", en: "Personal photo", es: "Foto personal", build: { en: "First person, a real photo, not a studio ad.", es: "Primera persona, una foto real, no un anuncio de estudio." } },
    { id: "guarantee", group: "proof", n: 10, fit: "discuss", en: "Guarantee", es: "Garantía", build: { en: "Possible use: no obligation to look at options. Not guaranteed approval and not a guaranteed price.", es: "Posible uso: sin compromiso para ver opciones. No es aprobación garantizada ni un precio garantizado." } },
    { id: "authority", group: "proof", n: 11, fit: "careful", en: "License line", es: "Línea de licencia", build: { en: "NPN and the licenses page only. No Medicare, AARP, or government seal.", es: "Solo el NPN y la página de licencias. Nada de Medicare, AARP ni un sello del gobierno." } },
    { id: "price-anchor", group: "offer", n: 12, fit: "careful", en: "Price comparison", es: "Comparación de precio", build: { en: "Compare the funeral bill with a premium only if the price is qualified. Do not put a dollar amount in the headline.", es: "Compare la cuenta del funeral con una prima solo si el precio está aclarado. No ponga un monto en el título." } },
    { id: "bundle", group: "offer", n: 13, fit: "use", en: "What the quote includes", es: "Qué incluye la cotización", build: { en: "Show what the conversation includes. Do not invent bonuses.", es: "Muestre lo que incluye la conversación. No invente bonos." } },
    { id: "urgency", group: "offer", n: 14, fit: "discuss", en: "Urgency", es: "Urgencia", build: { en: "Possible use: a real date only, such as a rate change the carrier actually published. Not “enrollment ends soon.”", es: "Posible uso: solo una fecha real, como un cambio de tarifa que la compañía publicó. No “la inscripción termina pronto”." } },
    { id: "free-gift", group: "offer", n: 15, fit: "discuss", en: "Free extra", es: "Extra gratis", build: { en: "Possible use: a real guide you already give, such as a funeral-cost sheet. Not a gift card.", es: "Posible uso: una guía real que ya entrega, como una hoja del costo del funeral. No una tarjeta de regalo." } },
    { id: "listicle", group: "education", n: 16, fit: "use", en: "Short list", es: "Lista corta", build: { en: "Three points is enough. The policy is the last line, not the first.", es: "Tres puntos bastan. La póliza es la última línea, no la primera." } },
    { id: "how-it-works", group: "education", n: 17, fit: "use", en: "How it works", es: "Cómo funciona", build: { en: "One sequence: age and state, amount, then a licensed agent compares plans.", es: "Una secuencia: edad y estado, monto, y un agente con licencia compara planes." } },
    { id: "hack", group: "education", n: 18, fit: "use", en: "Useful step", es: "Paso útil", build: { en: "Lead with the useful step. The quote is the tool, not the headline.", es: "Empiece por el paso útil. La cotización es la herramienta, no el título." } },
    { id: "ingredient", group: "education", n: 19, fit: "use", en: "One policy fact", es: "Un hecho de la póliza", build: { en: "One policy fact, such as a premium that stays the same.", es: "Un hecho de la póliza, como una prima que no cambia." } },
    { id: "us-them", group: "education", n: 20, fit: "use", en: "Two different bills", es: "Dos cuentas distintas", build: { en: "Compare the funeral-home bill with a life insurance policy. They are different bills.", es: "Compare la cuenta de la funeraria con una póliza de vida. Son cuentas distintas." } },
    { id: "myth-buster", group: "education", n: 21, fit: "use", en: "Myth", es: "Mito", build: { en: "Correct a belief you can support. Burial insurance is not a Medicare benefit.", es: "Corrija una creencia que pueda sostener. El seguro de sepelio no es un beneficio de Medicare." } },
    { id: "meme", group: "social", n: 22, fit: "discuss", en: "Familiar layout", es: "Formato conocido", build: { en: "Possible use: a simple comparison people already recognize, such as two circles. Not a joke about death.", es: "Posible uso: una comparación simple que la gente ya reconoce, como dos círculos. Ningún chiste sobre la muerte." } },
    { id: "native", group: "social", n: 23, fit: "use", en: "Plain note", es: "Nota simple", build: { en: "Looks like a note or a text, not a designed ad.", es: "Parece una nota o un mensaje, no un anuncio diseñado." } },
    { id: "editorial", group: "social", n: 24, fit: "use", en: "Calm caption", es: "Pie de foto", build: { en: "A calm photo and one caption, not a sale banner.", es: "Una foto tranquila y un pie de foto, no una bandera de oferta." } },
    { id: "handwritten", group: "social", n: 25, fit: "use", en: "Handwritten line", es: "Línea escrita a mano", build: { en: "The line sits on a note in the photo.", es: "La línea va en una nota dentro de la foto." } },
    { id: "ugly", group: "social", n: 26, fit: "use", en: "Plain type", es: "Letra simple", build: { en: "Plain type. The funeral figure, then the question. Clarity stays.", es: "Letra simple. La cifra del funeral, luego la pregunta. La claridad se queda." } },
    { id: "variant-grid", group: "product", n: 27, fit: "discuss", en: "Amount grid", es: "Cuadrícula de montos", build: { en: "Possible use: several coverage amounts on one image, the way a store shows colors. Those amounts are not that person’s price.", es: "Posible uso: varios montos de cobertura en una imagen, como una tienda muestra colores. Esos montos no son el precio de esa persona." } },
    { id: "sellout", group: "demand", n: 28, fit: "discuss", en: "Demand", es: "Demanda", build: { en: "Possible use: a true news line, such as a carrier that closed an old plan. A life policy does not sell out like a product.", es: "Posible uso: una noticia verdadera, como una compañía que cerró un plan viejo. Una póliza de vida no se agota como un producto." } },
    { id: "humble-brag", group: "demand", n: 29, fit: "discuss", en: "Soft demand line", es: "Línea suave de demanda", build: { en: "Possible use: a short, true note that appointments are full this week. The fact has to be real.", es: "Posible uso: una nota corta y verdadera de que las citas están llenas esta semana. El hecho tiene que ser real." } },
  ];

  var STARTERS = {
    "bold-claim": { en: "A small whole life policy can help with the funeral. The premium stays the same.", es: "Una póliza pequeña de vida entera puede ayudar con el funeral. La prima se queda igual." },
    "problem-callout": { en: "Your family should not have to pay for the funeral.", es: "Su familia no debería tener que pagar el funeral." },
    "curiosity-gap": { en: "Most families learn the funeral cost when it is already too late to plan it.", es: "La mayoría de las familias conoce el costo del funeral cuando ya es tarde para planearlo." },
    "pattern-interrupt": { en: "Read this before you assume every burial plan has a two-year wait.", es: "Lea esto antes de suponer que todo plan de sepelio tiene una espera de dos años." },
    "direct-question": { en: "If something happened this month, who would pay the funeral?", es: "Si algo pasara este mes, ¿quién pagaría el funeral?" },
    "before-after": { en: "The funeral bill with no plan, next to the same bill with a policy in place.", es: "La cuenta del funeral sin plan, junto a la misma cuenta con una póliza." },
    "timeline": { en: "The first step is a conversation about age, state, and the amount. The benefit is what the policy says.", es: "El primer paso es una conversación sobre edad, estado y monto. El beneficio es lo que dice la póliza." },
    "testimonial": { en: "Add a real client sentence here before this concept is tested.", es: "Agregue aquí una frase real de un cliente antes de probar este concepto." },
    "ugc": { en: "I priced a funeral in my town. It was more than I had planned for.", es: "Cotizé un funeral en mi ciudad. Fue más de lo que había pensado." },
    "guarantee": { en: "Look at the options with no obligation.", es: "Vea las opciones sin compromiso." },
    "authority": { en: "Talk with a licensed agent. The NPN and the licenses page are the proof.", es: "Hable con un agente con licencia. El NPN y la página de licencias son la prueba." },
    "price-anchor": { en: "Set the funeral cost next to a qualified monthly premium. Keep the dollar amount out of the headline.", es: "Ponga el costo del funeral junto a una prima mensual aclarada. Deje el monto fuera del título." },
    "bundle": { en: "The conversation covers the policy and what the funeral-home package does not include.", es: "La conversación cubre la póliza y lo que el paquete de la funeraria no incluye." },
    "urgency": { en: "Use this only when a carrier has published a real date.", es: "Use esto solo cuando una compañía haya publicado una fecha real." },
    "free-gift": { en: "Ask for the funeral-cost sheet with the quote.", es: "Pida la hoja del costo del funeral junto con la cotización." },
    "listicle": { en: "Three bills families mix together: the service, the cemetery, and the plot.", es: "Tres cuentas que las familias mezclan: el servicio, el cementerio y el lote." },
    "how-it-works": { en: "Age and state, then the amount, then a licensed agent compares plans.", es: "Edad y estado, luego el monto, y un agente con licencia compara planes." },
    "hack": { en: "Price the funeral first. Then see what a small whole life policy would cost.", es: "Primero el costo del funeral. Después vea qué costaría una póliza pequeña de vida entera." },
    "ingredient": { en: "Level premium means the price does not go up on the next birthday.", es: "Prima nivelada significa que el precio no sube en el siguiente cumpleaños." },
    "us-them": { en: "The funeral-home package and the life insurance policy are two different bills.", es: "El paquete de la funeraria y la póliza de vida son dos cuentas distintas." },
    "myth-buster": { en: "Burial insurance is not a Medicare benefit.", es: "El seguro de sepelio no es un beneficio de Medicare." },
    "meme": { en: "Two circles: what the family pays, and what a policy can pay.", es: "Dos círculos: lo que paga la familia y lo que puede pagar una póliza." },
    "native": { en: "A plain note: who pays for the funeral?", es: "Una nota simple: ¿quién paga el funeral?" },
    "editorial": { en: "One calm photo. One sentence about planning the funeral ahead of time.", es: "Una foto tranquila. Una frase sobre planear el funeral con tiempo." },
    "handwritten": { en: "A note in the photo: this is for the funeral.", es: "Una nota en la foto: esto es para el funeral." },
    "ugly": { en: "Plain type. The funeral figure, then the question of who pays it.", es: "Letra simple. La cifra del funeral, y luego la pregunta de quién la paga." },
    "variant-grid": { en: "Compare coverage amounts. Those amounts are not that person’s price.", es: "Compare montos de cobertura. Esos montos no son el precio de esa persona." },
    "sellout": { en: "A true update only, such as a plan the carrier actually closed.", es: "Solo una noticia verdadera, como un plan que la compañía realmente cerró." },
    "humble-brag": { en: "Appointments are booked this week. The next opening is on the calendar.", es: "Las citas están ocupadas esta semana. El siguiente espacio está en el calendario." },
  };

  function library() {
    return window.FE_AD_LIBRARY || { images: [], hooks: [], wordings: [], notes: {} };
  }

  function limits(stage) {
    if (stage === 2) return { images: 1, hooks: 20, wordings: 20 };
    if (stage === 3) return { images: 1, hooks: 1, wordings: 20 };
    return { images: 20, hooks: 1, wordings: 1 };
  }

  function emptyPicks() {
    return { images: [], hooks: [], wordings: [] };
  }

  function loadPicks() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "");
      if (!raw || typeof raw !== "object") return emptyPicks();
      return {
        images: Array.isArray(raw.images) ? raw.images.slice() : [],
        hooks: Array.isArray(raw.hooks) ? raw.hooks.slice() : [],
        wordings: Array.isArray(raw.wordings) ? raw.wordings.slice() : [],
      };
    } catch (e) {
      return emptyPicks();
    }
  }

  function savePicks(picks) {
    localStorage.setItem(KEY, JSON.stringify(picks));
  }

  function usableWording(text) {
    var t = String(text || "").trim();
    if (t.length < 12) return false;
    if (/^learn more\b/i.test(t)) return false;
    if (/^[⭐★\s().0-9/]+$/.test(t)) return false;
    return true;
  }

  function uiLang() {
    if (window.StaffCrmI18n && window.StaffCrmI18n.getLang) return window.StaffCrmI18n.getLang() === "es" ? "es" : "en";
    return "en";
  }

  function conceptIdFor(text) {
    var s = String(text || "").toLowerCase();
    if (/guaranteed acceptance|guaranteed approval|aprobaci[oó]n garant/.test(s)) return "guarantee";
    if (/ends soon|inscripci[oó]n|limited time|solo por hoy|agotad/.test(s)) return "urgency";
    if (/before and after|antes y despu/.test(s)) return "before-after";
    if (/search for|globe life|aarp|see search|búsqueda/.test(s)) return "native";
    if (/free guide|gu[ií]a gratis|regalo|gift|hoja del costo/.test(s)) return "free-gift";
    if (/1,?\s*2,?\s*3|how it works|c[oó]mo funciona|paso/.test(s)) return "how-it-works";
    if (/\$|\/mo|\/day|al mes|a month|from just|desde tan solo/.test(s)) return "price-anchor";
    if (/please read|por favor lea|attention|atenci[oó]n|aviso importante|important update|important news/.test(s)) return "pattern-interrupt";
    if (/\?|qui[eé]n|who will|who would|have you|worried|est[aá] tu|est[aá] proteg/.test(s)) return "direct-question";
    if (/no medical|sin examen|no exam|pre-existing|preexist|waiting period|espera de dos/.test(s)) return "bold-claim";
    if (/gofundme|burden|inherit|hijos|deuda|familia|family|loved ones/.test(s)) return "problem-callout";
    if (/nuevo programa|new program|recently approved|recientemente/.test(s)) return "curiosity-gap";
    return "problem-callout";
  }

  function items(kind) {
    var lib = library();
    if (kind === "images") return lib.images || [];
    if (kind === "hooks") {
      var hooks = (lib.hooks || []).slice();
      var seen = {};
      hooks.forEach(function (row) {
        seen[String(row.text || "").toLowerCase()] = true;
      });
      var L = uiLang();
      CONCEPTS.forEach(function (concept) {
        var starter = STARTERS[concept.id];
        if (!starter || seen[starter[L].toLowerCase()]) return;
        hooks.push({
          id: "diagram-" + concept.id,
          text: starter[L],
          source: L === "es" ? "Diagrama de anuncios estáticos" : "Static ad diagram",
          lang: L,
          concept: concept.id,
        });
      });
      return hooks;
    }
    return (lib.wordings || []).filter(function (row) {
      return usableWording(row.text);
    });
  }

  function byId(kind, id) {
    var list = items(kind);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function toggle(picks, kind, id, stage) {
    var next = {
      images: picks.images.slice(),
      hooks: picks.hooks.slice(),
      wordings: picks.wordings.slice(),
    };
    var list = next[kind];
    var at = list.indexOf(id);
    if (at >= 0) {
      list.splice(at, 1);
      return next;
    }
    var max = limits(stage)[kind];
    if (list.length >= max) {
      if (max === 1) list.splice(0, list.length, id);
      return next;
    }
    list.push(id);
    return next;
  }

  function ready(picks, stage) {
    var L = limits(stage);
    return (
      picks.images.length >= 1 &&
      picks.images.length <= L.images &&
      picks.hooks.length >= 1 &&
      picks.hooks.length <= L.hooks &&
      picks.wordings.length >= 1 &&
      picks.wordings.length <= L.wordings
    );
  }

  function combos(picks, stage) {
    var images = picks.images;
    var hooks = picks.hooks;
    var wordings = picks.wordings;
    var out = [];
    if (stage === 1) {
      images.forEach(function (imageId) {
        out.push({ imageId: imageId, hookId: hooks[0], wordingId: wordings[0] });
      });
    } else if (stage === 2) {
      hooks.forEach(function (hookId) {
        wordings.forEach(function (wordingId) {
          out.push({ imageId: images[0], hookId: hookId, wordingId: wordingId });
        });
      });
    } else {
      wordings.forEach(function (wordingId) {
        out.push({ imageId: images[0], hookId: hooks[0], wordingId: wordingId });
      });
    }
    return out;
  }

  function wrap(ctx, text, maxWidth) {
    var words = String(text || "").split(/\s+/);
    var lines = [];
    var cur = "";
    words.forEach(function (word) {
      var trial = cur ? cur + " " + word : word;
      if (ctx.measureText(trial).width > maxWidth && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = trial;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error(src));
      };
      img.src = src;
    });
  }

  function opaqueBox(image) {
    var c = document.createElement("canvas");
    c.width = image.width;
    c.height = image.height;
    var x = c.getContext("2d");
    x.drawImage(image, 0, 0);
    var data = x.getImageData(0, 0, c.width, c.height).data;
    var minX = c.width;
    var minY = c.height;
    var maxX = 0;
    var maxY = 0;
    var step = 2;
    for (var y = 0; y < c.height; y += step) {
      for (var i = 0; i < c.width; i += step) {
        if (data[(y * c.width + i) * 4 + 3] < 12) continue;
        if (i < minX) minX = i;
        if (y < minY) minY = y;
        if (i > maxX) maxX = i;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: image.width, h: image.height };
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function centerIsLight(ctx) {
    var sample = ctx.getImageData(360, 280, 360, 220).data;
    var sum = 0;
    var n = 0;
    for (var i = 0; i < sample.length; i += 16) {
      sum += 0.2126 * sample[i] + 0.7152 * sample[i + 1] + 0.0722 * sample[i + 2];
      n += 1;
    }
    return sum / n > 150;
  }

  function fitBlock(ctx, text, maxWidth, maxLines, startSize, minSize, weight) {
    var size = startSize;
    var lines = [text];
    while (size >= minSize) {
      ctx.font = weight + " " + size + "px Arial, Helvetica, sans-serif";
      lines = wrap(ctx, text, maxWidth);
      if (lines.length <= maxLines) return { size: size, lines: lines };
      size -= 4;
    }
    ctx.font = weight + " " + minSize + "px Arial, Helvetica, sans-serif";
    return { size: minSize, lines: wrap(ctx, text, maxWidth).slice(0, maxLines) };
  }

  function paint(img, hook, wording, logo, wa) {
    var canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    var ctx = canvas.getContext("2d");
    var scale = Math.max(1080 / img.width, 1080 / img.height);
    var w = img.width * scale;
    var h = img.height * scale;
    ctx.drawImage(img, (1080 - w) / 2, (1080 - h) / 2, w, h);
    var light = centerIsLight(ctx);
    var barH = 156;
    var hookTop = 72;
    var hookMaxH = 1080 - barH - hookTop - 36;
    var block = fitBlock(ctx, hook, 920, 3, 84, 48, "700");
    var lineH = block.size + 14;
    var blockH = block.lines.length * lineH;
    var y = hookTop + Math.max(0, (hookMaxH - blockH) / 2) + block.size;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = light ? "#1a2b4a" : "#ffffff";
    ctx.font = "700 " + block.size + "px Arial, Helvetica, sans-serif";
    block.lines.forEach(function (line) {
      ctx.fillText(line, 540, y);
      y += lineH;
    });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 1080 - barH, 1080, barH);
    ctx.fillStyle = "#e4ebf5";
    ctx.fillRect(0, 1080 - barH, 1080, 2);
    var logoBox = opaqueBox(logo);
    var logoH = 100;
    var logoW = logoBox.w * (logoH / logoBox.h);
    ctx.drawImage(
      logo,
      logoBox.x,
      logoBox.y,
      logoBox.w,
      logoBox.h,
      36,
      1080 - barH + (barH - logoH) / 2,
      logoW,
      logoH
    );
    var cta = fitBlock(ctx, wording, 430, 2, 32, 22, "700");
    var ctaH = cta.lines.length * (cta.size + 6);
    var mark = 58;
    var ctaW = 0;
    ctx.font = "700 " + cta.size + "px Arial, Helvetica, sans-serif";
    cta.lines.forEach(function (line) {
      ctaW = Math.max(ctaW, ctx.measureText(line).width);
    });
    var groupW = mark + 16 + ctaW;
    var groupX = 1080 - 40 - groupW;
    var markY = 1080 - barH + (barH - mark) / 2;
    ctx.drawImage(wa, groupX, markY, mark, mark);
    ctx.fillStyle = "#128C7E";
    ctx.textAlign = "left";
    var textY = 1080 - barH / 2 - ctaH / 2 + cta.size;
    cta.lines.forEach(function (line) {
      ctx.fillText(line, groupX + mark + 16, textY);
      textY += cta.size + 6;
    });
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, "image/jpeg", 0.9);
    });
  }

  function folderName(stage) {
    if (stage === 2) return "Stage 2 images";
    if (stage === 3) return "Stage 3 images";
    return "Stage 1 images";
  }

  function fileSlug(text, n) {
    var slug = String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    var num = String(n + 1);
    while (num.length < 2) num = "0" + num;
    return num + "-" + (slug || "ad") + ".jpg";
  }

  function generate(picks, stage, onStatus) {
    var rows = combos(picks, stage);
    if (!rows.length) return Promise.reject(new Error("empty"));
    if (!window.showDirectoryPicker) {
      return Promise.reject(new Error("picker"));
    }
    return window
      .showDirectoryPicker({ mode: "readwrite", startIn: "desktop" })
      .then(function (root) {
        return root.getDirectoryHandle(folderName(stage), { create: true });
      })
      .then(function (dir) {
        var chain = Promise.resolve();
        rows.forEach(function (row, index) {
          chain = chain.then(function () {
            var image = byId("images", row.imageId);
            var hook = byId("hooks", row.hookId);
            var wording = byId("wordings", row.wordingId);
            if (!image || !hook || !wording) return null;
            onStatus(index + 1, rows.length);
            var logoSrc = hook.lang === "es" ? "/img/opt/logo-spanish2.png" : "/img/opt/logo-english2.png";
            return Promise.all([
              loadImage(image.src),
              loadImage(logoSrc),
              loadImage("/img/ad-builder/whatsapp-mark.png"),
            ]).then(function (parts) {
              return paint(parts[0], hook.text, wording.text, parts[1], parts[2]);
            }).then(function (blob) {
              return dir.getFileHandle(fileSlug(hook.text, index), { create: true }).then(function (handle) {
                return handle.createWritable().then(function (writable) {
                  return writable.write(blob).then(function () {
                    return writable.close();
                  });
                });
              });
            });
          });
        });
        return chain.then(function () {
          return { count: rows.length, folder: folderName(stage) };
        });
      });
  }

  function render(opts) {
    var stage = opts.stage || 1;
    var picks = opts.picks || emptyPicks();
    var t = opts.t;
    var esc = opts.esc;
    var status = opts.status || "";
    var L = limits(stage);
    var primary = stage === 2 ? "hooks" : stage === 3 ? "wordings" : "images";

    function chip(kind) {
      var rows = picks[kind]
        .map(function (id) {
          var row = byId(kind, id);
          if (!row) return "";
          var label = kind === "images" ? row.from || row.kind : row.text;
          return (
            '<button type="button" class="crm-adbuild-chip" data-adbuild-toggle="' +
            kind +
            '" data-adbuild-id="' +
            esc(row.id) +
            '">' +
            esc(label) +
            " ×</button>"
          );
        })
        .join("");
      return (
        '<div class="crm-adbuild-picks"><span>' +
        esc(t("ad_builder_" + kind)) +
        " " +
        picks[kind].length +
        "/" +
        L[kind] +
        "</span>" +
        rows +
        "</div>"
      );
    }

    var list = "";
    if (primary === "images") {
      var pictureLang = uiLang();
      var pictureBuckets = {};
      items("images").forEach(function (row) {
        var pid = row.picture || "text-graphic";
        if (!pictureBuckets[pid]) pictureBuckets[pid] = [];
        pictureBuckets[pid].push(row);
      });
      list = PICTURES.filter(function (picture) {
        return (pictureBuckets[picture.id] || []).length;
      })
        .map(function (picture) {
          var cards = (pictureBuckets[picture.id] || [])
            .map(function (row) {
              var on = picks.images.indexOf(row.id) >= 0;
              return (
                '<article class="crm-adbuild-card' +
                (on ? " is-on" : "") +
                '">' +
                '<img src="' +
                esc(row.src) +
                '" alt="">' +
                "<p><strong>" +
                esc(row.source) +
                "</strong>" +
                (row.from && row.source !== "Your ad" ? " · " + esc(row.from) : "") +
                "</p>" +
                '<button type="button" data-adbuild-toggle="images" data-adbuild-id="' +
                esc(row.id) +
                '">' +
                esc(on ? t("ad_builder_selected") : t("ad_builder_select")) +
                "</button></article>"
              );
            })
            .join("");
          return (
            '<section class="crm-adbuild-group"><h2>' +
            esc(picture[pictureLang]) +
            " (" +
            pictureBuckets[picture.id].length +
            ')</h2><div class="crm-adbuild-grid">' +
            cards +
            "</div></section>"
          );
        })
        .join("");
    } else {
      var langCode = uiLang();
      var buckets = {};
      items(primary).forEach(function (row) {
        var cid = row.concept || conceptIdFor(row.text);
        if (!buckets[cid]) buckets[cid] = [];
        buckets[cid].push(row);
      });
      list = GROUPS.map(function (group) {
        var concepts = CONCEPTS.filter(function (concept) {
          return concept.group === group.id;
        });
        var body = concepts
          .map(function (concept) {
            var rows = buckets[concept.id] || [];
            if (!rows.length && primary !== "hooks") return "";
            var lines = rows
              .map(function (row) {
                var on = picks[primary].indexOf(row.id) >= 0;
                return (
                  '<li class="' +
                  (on ? "is-on" : "") +
                  '"><button type="button" data-adbuild-toggle="' +
                  primary +
                  '" data-adbuild-id="' +
                  esc(row.id) +
                  '"><strong>' +
                  esc(on ? t("ad_builder_selected") : t("ad_builder_select")) +
                  "</strong><span>" +
                  esc(row.text) +
                  "</span><em>" +
                  esc(row.source) +
                  "</em></button></li>"
                );
              })
              .join("");
            return (
              '<div class="crm-adbuild-concept is-' +
              concept.fit +
              '"><h3>' +
              concept.n +
              ". " +
              esc(concept[langCode]) +
              " <em>" +
              esc(t("ad_builder_fit_" + concept.fit)) +
              "</em></h3><p>" +
              esc(concept.build[langCode]) +
              "</p>" +
              (lines ? '<ul class="crm-adbuild-lines">' + lines + "</ul>" : "<p>" + esc(t("ad_builder_no_line")) + "</p>") +
              "</div>"
            );
          })
          .join("");
        return '<section class="crm-adbuild-group"><h2>' + esc(group[L]) + "</h2>" + body + "</section>";
      }).join("");
    }

    var conceptMap = GROUPS.map(function (group) {
      var names = CONCEPTS.filter(function (concept) {
        return concept.group === group.id;
      })
        .map(function (concept) {
          return '<span class="is-' + concept.fit + '">' + concept.n + ". " + esc(concept[uiLang()]) + "</span>";
        })
        .join("");
      return "<p><strong>" + esc(group[uiLang()]) + "</strong> " + names + "</p>";
    }).join("");

    return (
      '<div class="crm-adbuild">' +
      '<div class="crm-adbuild-stages">' +
      [1, 2, 3]
        .map(function (n) {
          return (
            '<button type="button" data-adbuild-stage="' +
            n +
            '"' +
            (n === stage ? ' class="is-on"' : "") +
            ">" +
            esc(t("ad_builder_stage" + n)) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="crm-creative-guide">' +
      esc(t("ad_builder_guide_" + stage)) +
      "</p>" +
      (stage === 1
        ? '<div class="crm-adbuild-map"><p class="crm-creative-guide">' +
          esc(t("ad_builder_diagram")) +
          "</p>" +
          conceptMap +
          "</div>"
        : "") +
      chip("images") +
      chip("hooks") +
      chip("wordings") +
      '<div class="crm-adbuild-generate">' +
      '<button type="button" data-adbuild-generate' +
      (ready(picks, stage) ? "" : " disabled") +
      ">" +
      esc(t("ad_builder_generate")) +
      "</button>" +
      (status ? "<p>" + esc(status) + "</p>" : "") +
      (ready(picks, stage) ? "" : "<p>" + esc(t("ad_builder_need_" + stage)) + "</p>") +
      "</div>" +
      list +
      "</div>"
    );
  }

  window.MviAdBuilder = {
    loadPicks: loadPicks,
    savePicks: savePicks,
    toggle: toggle,
    generate: generate,
    render: render,
    ready: ready,
  };
})();
