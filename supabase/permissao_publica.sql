-- ==========================================================
-- TRUST TECNOLOGIA - PERMISSÃO DE ACESSO PÚBLICO (QR CODE)
-- ==========================================================
-- Instruções: Copie este código e cole no SQL EDITOR do seu painel do Supabase.
-- Isso permitirá que clientes sem login visualizem os laudos pelo QR Code.

-- 1. Ativar as políticas de acesso para a tabela de Peritagens
DROP POLICY IF EXISTS "Acesso público por ID" ON peritagens;
CREATE POLICY "Acesso público por ID" ON peritagens FOR SELECT USING (true);

-- 2. Ativar as políticas de acesso para a tabela de Análise Técnica (Itens)
DROP POLICY IF EXISTS "Acesso público análise" ON peritagem_analise_tecnica;
CREATE POLICY "Acesso público análise" ON peritagem_analise_tecnica FOR SELECT USING (true);

-- 3. (Opcional) Se houver uma tabela de fotos/itens vinculada:
DROP POLICY IF EXISTS "Acesso público fotos" ON photo_items;
CREATE POLICY "Acesso público fotos" ON photo_items FOR SELECT USING (true);

-- NOTA: O campo 'databook_pronto' já servirá como filtro no código da aplicação.
