-- Auto-generated from Integrity FE appointed harvest
-- as_of: 2026-08-12
-- Updates non-smoker quote_ranges for harvested ages; smokers unchanged.

DELETE FROM quote_ranges
WHERE smoker = false AND age IN (55, 60, 65, 70, 75, 80, 85);

INSERT INTO quote_ranges (age, sex, smoker, low, high, anchor) VALUES
  (55, 'female', false, 24.68, 35.61, 30.14),
  (55, 'male', false, 32.83, 44.99, 38.91),
  (60, 'female', false, 30.30, 42.15, 36.23),
  (60, 'male', false, 40.08, 56.51, 48.30),
  (65, 'female', false, 37.83, 49.57, 43.70),
  (65, 'male', false, 50.34, 68.09, 59.22),
  (70, 'female', false, 50.09, 63.51, 56.80),
  (70, 'male', false, 67.54, 86.33, 76.94),
  (75, 'female', false, 68.70, 88.11, 78.41),
  (75, 'male', false, 94.06, 112.85, 103.45),
  (80, 'female', false, 95.38, 125.31, 110.34),
  (80, 'male', false, 132.74, 156.46, 144.60),
  (85, 'female', false, 132.85, 209.82, 171.33),
  (85, 'male', false, 184.54, 275.92, 230.23);
