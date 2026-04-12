-- ==========================================================
-- TRUST TECNOLOGIA - PERMISSÃO TOTAL PARA ADMINISTRADOR (FINAL)
-- ==========================================================
-- Este script garante que o seu usuário tenha acesso total NO BANCO DE DADOS,
-- permitindo ver todos os usuários e receber notificações de cadastro.

-- 1. Garantir que o seu usuário seja GESTOR no banco de dados
UPDATE profiles 
SET role = 'gestor', status = 'APROVADO' 
WHERE email = 'matheus.stanley12@gmail.com';

-- 2. Recriar a função de verificação (caso não tenha rodado antes)
CREATE OR REPLACE FUNCTION check_is_gestor(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'gestor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Limpar políticas obsoletas
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Gestores podem atualizar perfis" ON profiles;
DROP POLICY IF EXISTS "Usuarios podem ver o proprio perfil" ON profiles;

-- 4. Criar Política Master de Visualização
-- Permite ver se:
--   a) For Gestor (via função)
--   b) For o seu e-mail de administrador (via token JWT)
--   c) For o próprio usuário
CREATE POLICY "Gestão total de perfis" ON profiles 
FOR SELECT USING (
  check_is_gestor(auth.uid()) 
  OR (auth.jwt() ->> 'email') = 'matheus.stanley12@gmail.com'
  OR auth.uid() = id
);

-- 5. Criar Política Master de Atualização
CREATE POLICY "Gestão total de atualização" ON profiles 
FOR UPDATE USING (
  check_is_gestor(auth.uid()) 
  OR (auth.jwt() ->> 'email') = 'matheus.stanley12@gmail.com'
  OR auth.uid() = id
);

-- 6. Garantir permissão de cadastro para novos usuários
DROP POLICY IF EXISTS "Qualquer um pode criar o próprio perfil" ON profiles;
CREATE POLICY "Qualquer um pode criar o próprio perfil" ON profiles 
FOR INSERT WITH CHECK (true);

-- NOTA: Rode este script no SQL Editor do Supabase e atualize a página Gestão de Usuários.
-- Agora todos os usuários pendentes deverão aparecer para você.
