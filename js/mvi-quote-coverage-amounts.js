/** Final expense face amounts ($) — matches editorial picker. */
(function (global) {
  var amounts = [];
  for (var a = 2000; a <= 50000; a += 1000) {
    amounts.push(a);
  }
  global.MVI_COVERAGE_AMOUNTS = amounts;
})(typeof window !== "undefined" ? window : global);
