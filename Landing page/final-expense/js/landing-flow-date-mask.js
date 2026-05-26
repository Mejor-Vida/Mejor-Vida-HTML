/**
 * Ethos-style birthdate mask (vanilla port of react-text-mask + text-mask-addons).
 * Enforces mm/dd/yyyy and auto-corrects invalid month/day/year as you type.
 */
(function (global) {
  var DAYS_IN_MONTH = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var DATE_FORMAT = "mm/dd/yyyy";

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 8);
  }

  function maskFromDigits(digits) {
    var d = digitsOnly(digits);
    if (!d) return "";
    var out = d.slice(0, 2);
    if (d.length > 2) out += "/" + d.slice(2, 4);
    if (d.length > 4) out += "/" + d.slice(4, 8);
    return out;
  }

  /** Port of text-mask-addons createAutoCorrectedDatePipe('mm/dd/yyyy'). Returns null to reject. */
  function autoCorrectDate(value, minYear, maxYear) {
    if (!value) return "";

    var indexesOfPipedChars = [];
    var chars = value.split("");
    var month = 0;

    // Month: first digit cannot exceed 1
    if (chars[0] && parseInt(chars[0], 10) > 1) {
      chars[1] = chars[0];
      chars[0] = "0";
      indexesOfPipedChars.push(0);
    }

    if (chars[0] && chars[1]) {
      month = parseInt(chars[0] + chars[1], 10);
      if (month === 0) return null;
      if (month > 12) {
        chars[0] = "1";
        chars[1] = "2";
        month = 12;
      }
    }

    var maxDay = month ? DAYS_IN_MONTH[month] || 31 : 31;
    var dayFirstMax = maxDay >= 30 ? 3 : 2;

    // Day: first digit cannot exceed dayFirstMax
    if (chars[3] && parseInt(chars[3], 10) > dayFirstMax) {
      chars[4] = chars[3];
      chars[3] = "0";
      indexesOfPipedChars.push(3);
    }

    if (chars[3] && chars[4]) {
      var day = parseInt(chars[3] + chars[4], 10);
      if (day === 0) return null;
      if (day > maxDay) {
        var clamped = String(maxDay).padStart(2, "0");
        chars[3] = clamped[0];
        chars[4] = clamped[1];
      }
    }

    // Year bounds when 4 year digits present
    if (value.length >= 10) {
      var yearStr = value.slice(6, 10);
      if (yearStr.length === 4) {
        var year = parseInt(yearStr, 10);
        if (year < minYear || year > maxYear) return null;
      }
    } else if (value.length >= 8) {
      // Partial year: reject if already out of range for typed prefix
      var partial = value.slice(6).replace(/\D/g, "");
      if (partial.length) {
        var minPrefix = String(minYear).slice(0, partial.length);
        var maxPrefix = String(maxYear).slice(0, partial.length);
        if (partial < minPrefix || partial > maxPrefix) return null;
      }
    }

    return chars.join("");
  }

  function parseBirthdate(value) {
    var match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    var month = Number(match[1]);
    var day = Number(match[2]);
    var year = Number(match[3]);
    var date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return { month: month, day: day, year: year };
  }

  function isCompleteValidBirthdate(value, minAge, maxAge) {
    minAge = minAge == null ? 18 : minAge;
    maxAge = maxAge == null ? 100 : maxAge;
    var parsed = parseBirthdate(value);
    if (!parsed) return false;
    var today = new Date();
    var age = today.getFullYear() - parsed.year;
    var monthDiff = today.getMonth() - (parsed.month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.day)) age -= 1;
    return age >= minAge && age <= maxAge;
  }

  function attachBirthdateMask(input, options) {
    if (!input) return;
    options = options || {};
    var minYear = options.minYear != null ? options.minYear : new Date().getFullYear() - 100;
    var maxYear = options.maxYear != null ? options.maxYear : new Date().getFullYear();
    var lastGood = "";

    input.setAttribute("type", "tel");
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "bday");
    input.setAttribute("placeholder", "mm/dd/yyyy");
    input.setAttribute("maxlength", "10");

    function applyFromRaw(raw, showIncompleteHint) {
      var masked = maskFromDigits(raw);
      var corrected = autoCorrectDate(masked, minYear, maxYear);
      if (corrected === null) {
        input.value = lastGood;
        if (options.onChange) options.onChange(lastGood, showIncompleteHint);
        return;
      }
      lastGood = corrected;
      input.value = corrected;
      if (options.onChange) options.onChange(corrected, showIncompleteHint);
    }

    input.addEventListener("input", function () {
      applyFromRaw(input.value, false);
    });

    input.addEventListener("blur", function () {
      applyFromRaw(input.value, true);
    });

    input.addEventListener("paste", function (ev) {
      ev.preventDefault();
      var text = (ev.clipboardData || window.clipboardData).getData("text");
      applyFromRaw(text, false);
    });

    if (input.value) {
      applyFromRaw(input.value, false);
    }
  }

  global.MVILandingDateMask = {
    attachBirthdateMask: attachBirthdateMask,
    maskFromDigits: maskFromDigits,
    autoCorrectDate: autoCorrectDate,
    parseBirthdate: parseBirthdate,
    isCompleteValidBirthdate: isCompleteValidBirthdate,
    DATE_FORMAT: DATE_FORMAT,
  };
})(window);
