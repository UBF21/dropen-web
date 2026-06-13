CREATE TABLE admin_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text,
  role       text NOT NULL DEFAULT 'viewer'
             CHECK (role IN ('admin','editor','viewer')),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Cada admin puede leer su propio perfil
CREATE POLICY "admin_read_own_profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins autenticados pueden leer todos los perfiles
CREATE POLICY "admin_read_all_profiles" ON admin_profiles
  FOR SELECT USING (is_authenticated_admin());

-- Solo rol 'admin' puede modificar perfiles
CREATE POLICY "admin_manage_profiles" ON admin_profiles
  FOR ALL USING (is_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
