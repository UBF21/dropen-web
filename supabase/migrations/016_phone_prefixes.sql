CREATE TABLE IF NOT EXISTS phone_prefixes (
  code        TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO phone_prefixes (code, label, sort_order) VALUES
  ('+51',  '+51 · Perú',             1),
  ('+1',   '+1 · EE.UU. / Canadá',  2),
  ('+52',  '+52 · México',           3),
  ('+54',  '+54 · Argentina',        4),
  ('+55',  '+55 · Brasil',           5),
  ('+56',  '+56 · Chile',            6),
  ('+57',  '+57 · Colombia',         7),
  ('+58',  '+58 · Venezuela',        8),
  ('+34',  '+34 · España',           9),
  ('+591', '+591 · Bolivia',         10),
  ('+593', '+593 · Ecuador',         11),
  ('+595', '+595 · Paraguay',        12),
  ('+598', '+598 · Uruguay',         13),
  ('+44',  '+44 · Reino Unido',      14)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE phone_prefixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "phone_prefixes_public_read"
  ON phone_prefixes FOR SELECT
  USING (active = true);
