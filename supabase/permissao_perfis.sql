-- ==========================================================
-- TRUST TECNOLOGIA - PERMISSÃO DE GESTÃO DE USUÁRIOS (RLS)
-- ==========================================================
-- Instruções: Copie este código e cole no SQL EDITOR do seu painel do Supabase.
-- Isso permitirá que usuários GESTORES selecionem e gerenciem perfis de outros usuários.

-- 1. Permitir que GESTORES vejam todos os perfis
DROP POLICY IF EXISTS "Gestores podem ver todos os perfis" ON profiles;
CREATE POLICY "Gestores podem ver todos os perfis" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gestor'
  )
);

-- 2. Permitir que GESTORES atualizem perfis (para aprovação e troca de cargo)
DROP POLICY IF EXISTS "Gestores podem atualizar perfis" ON profiles;
CREATE POLICY "Gestores podem atualizar perfis" ON profiles 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'gestor'
  )
);

-- 3. Permitir que novos usuários (anon) criem seus próprios perfis durante o Register
DROP POLICY IF EXISTS "Qualquer um pode criar o próprio perfil" ON profiles;
CREATE POLICY "Qualquer um pode criar o próprio perfil" ON profiles 
FOR INSERT WITH CHECK (true);

-- 4. Permitir que o próprio usuário veja e edite seu perfil
DROP POLICY IF EXISTS "Usuarios podem ver o proprio perfil" ON profiles;
CREATE POLICY "Usuarios podem ver o proprio perfil" ON profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios podem atualizar o proprio perfil" ON profiles;
CREATE POLICY "Usuarios podem atualizar o proprio perfil" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- NOTA: Após rodar este comando, os usuários cadastrados aparecerão imediatamente no seu painel.
