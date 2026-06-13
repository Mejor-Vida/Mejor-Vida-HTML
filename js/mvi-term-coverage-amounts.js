/** Term life face amounts ($) — public quoter picker. */
(function (global) {
  /** Below $1M: common quote steps; at/above $1M: whole millions (MOO TLA jumbo band). */
  global.MVI_TERM_COVERAGE_AMOUNTS = [
    100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000, 2000000,
    3000000, 4000000, 5000000,
  ];
  global.MVI_TERM_COVERAGE_MIN = 100000;
  global.MVI_TERM_COVERAGE_MAX = 5000000;
  global.MVI_TERM_LENGTHS = [10, 15, 20, 25, 30];

  global.mviSnapTermCoverage = function (n) {
    var amounts = global.MVI_TERM_COVERAGE_AMOUNTS;
    var v = parseInt(String(n), 10);
    if (!Number.isFinite(v)) return amounts[0];
    if (v <= amounts[0]) return amounts[0];
    var max = amounts[amounts.length - 1];
    if (v >= max) return max;
    var best = amounts[0];
    var bestDiff = Infinity;
    for (var i = 0; i < amounts.length; i++) {
      var diff = Math.abs(amounts[i] - v);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = amounts[i];
      }
    }
    return best;
  };

  global.mviTermCoverageIndex = function (amount) {
    var amounts = global.MVI_TERM_COVERAGE_AMOUNTS;
    var snapped = global.mviSnapTermCoverage(amount);
    var idx = amounts.indexOf(snapped);
    return idx >= 0 ? idx : 0;
  };

  global.mviTermCoverageFromIndex = function (index, mode, age) {
    var amounts = global.mviTermCoverageAmountsForMode(mode, age);
    var i = parseInt(String(index), 10);
    if (!Number.isFinite(i) || i < 0) return amounts[0];
    if (i >= amounts.length) return amounts[amounts.length - 1];
    return amounts[i];
  };

  global.mviTermCoverageAmountsForMode = function (mode, age) {
    var max =
      mode === "simplified"
        ? (parseInt(age, 10) <= 45 ? 500000 : 300000)
        : global.MVI_TERM_COVERAGE_MAX;
    return global.MVI_TERM_COVERAGE_AMOUNTS.filter(function (a) {
      return a <= max;
    });
  };

  global.mviSnapTermCoverageForMode = function (n, mode, age) {
    var amounts = global.mviTermCoverageAmountsForMode(mode, age);
    var v = parseInt(String(n), 10);
    if (!Number.isFinite(v)) return amounts[0];
    if (v <= amounts[0]) return amounts[0];
    var max = amounts[amounts.length - 1];
    if (v >= max) return max;
    var best = amounts[0];
    var bestDiff = Infinity;
    for (var i = 0; i < amounts.length; i++) {
      var diff = Math.abs(amounts[i] - v);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = amounts[i];
      }
    }
    return best;
  };

  global.mviTermCoverageIndexForMode = function (amount, mode, age) {
    var amounts = global.mviTermCoverageAmountsForMode(mode, age);
    var snapped = global.mviSnapTermCoverageForMode(amount, mode, age);
    var idx = amounts.indexOf(snapped);
    return idx >= 0 ? idx : 0;
  };
})(typeof window !== "undefined" ? window : global);
