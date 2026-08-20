-- Auto-generated from Integrity FE appointed harvest (incl. Accendo 86–89)
-- as_of: 2026-08-20
-- Updates non-smoker quote_ranges for harvested ages; smokers unchanged.
-- Ages 86–89 are Aetna Accendo Preferred (low) / Standard (high) at $10,000.

DELETE FROM quote_ranges
WHERE smoker = false AND age IN (55, 60, 65, 70, 75, 80, 85, 86, 87, 88, 89);

INSERT INTO quote_ranges (age, sex, smoker, low, high, anchor) VALUES
  (55, 'female', false, 27.57, 36.49, 32.03),
  (55, 'male', false, 35.72, 45.35, 40.53),
  (60, 'female', false, 32.67, 42.51, 37.59),
  (60, 'male', false, 43.12, 56.87, 49.99),
  (65, 'female', false, 40.73, 49.93, 45.33),
  (65, 'male', false, 53.91, 68.44, 61.17),
  (70, 'female', false, 52.82, 63.87, 58.34),
  (70, 'male', false, 69.70, 86.69, 78.19),
  (75, 'female', false, 70.86, 88.47, 79.66),
  (75, 'male', false, 97.10, 113.21, 105.16),
  (80, 'female', false, 98.42, 125.67, 112.05),
  (80, 'male', false, 135.78, 156.82, 146.30),
  (85, 'female', false, 135.89, 210.70, 173.29),
  (85, 'male', false, 187.58, 277.51, 232.55),
  (86, 'female', false, 171.32, 262.41, 216.87),
  (86, 'male', false, 236.25, 360.94, 298.60),
  (87, 'female', false, 205.98, 304.85, 255.42),
  (87, 'male', false, 276.68, 409.68, 343.18),
  (88, 'female', false, 240.62, 347.29, 293.96),
  (88, 'male', false, 317.10, 458.41, 387.75),
  (89, 'female', false, 275.28, 389.72, 332.50),
  (89, 'male', false, 357.52, 507.15, 432.33);
