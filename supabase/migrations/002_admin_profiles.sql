-- Funciones helper para RLS (requieren admin_profiles, se definen antes de usarse en policies)
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true
  )
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true AND role IN ('admin','editor')
  )
$$;

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

-- Función para liberar stock de reservas vencidas (requiere is_authenticated_admin)
CREATE OR REPLACE FUNCTION release_reservation_stock(p_variant_id uuid, p_quantity integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_authenticated_admin() THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
  UPDATE product_variants
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
END;
$$;
