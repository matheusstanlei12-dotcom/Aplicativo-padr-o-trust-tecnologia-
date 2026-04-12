-- ==========================================================
-- TRUST TECNOLOGIA - MULTI-TENANCY E ISOLAMENTO (RLS)
-- ==========================================================
-- Este script garante que cada empresa veja apenas os SEUS dados,
-- enquanto o Programador (matheus.stanley12@gmail.com) vê TUDO.

-- Função auxiliar para verificar se o usuário é o Programador
CREATE OR REPLACE FUNCTION check_is_programmer()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'matheus.stanley12@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. TABELA: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento de Perfis" ON profiles;
CREATE POLICY "Isolamento de Perfis" ON profiles 
FOR SELECT USING (
  check_is_programmer() 
  OR empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
  OR id = auth.uid()
);

DROP POLICY IF EXISTS "Atualização de Perfis" ON profiles;
CREATE POLICY "Atualização de Perfis" ON profiles 
FOR UPDATE USING (
  check_is_programmer() 
  OR id = auth.uid()
);

-- 2. TABELA: peritagens
ALTER TABLE peritagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento de Peritagens" ON peritagens;
CREATE POLICY "Isolamento de Peritagens" ON peritagens 
FOR ALL USING (
  check_is_programmer() 
  OR empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
);

-- 3. TABELA: empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento de Empresas" ON empresas;
CREATE POLICY "Isolamento de Empresas" ON empresas 
FOR SELECT USING (
  check_is_programmer() 
  OR id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
);

-- 4. TABELA: clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento de Clientes" ON clientes;
CREATE POLICY "Isolamento de Clientes" ON clientes 
FOR ALL USING (
  check_is_programmer() 
  OR empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
);

-- 5. TABELA: aguardando_peritagem
-- Caso exista essa tabela separada
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'aguardando_peritagem') THEN
    ALTER TABLE aguardando_peritagem ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Isolamento Aguardando" ON aguardando_peritagem';
    EXECUTE 'CREATE POLICY "Isolamento Aguardando" ON aguardando_peritagem FOR ALL USING (check_is_programmer() OR empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- NOTA: Rode este script no SQL Editor do Supabase.
-- Ele garante que a regra "vê apenas o da sua empresa" seja aplicada em nível de banco de dados.
