-- Add professional fields to peritagem_analise_tecnica
ALTER TABLE peritagem_analise_tecnica 
ADD COLUMN IF NOT EXISTS criticidade TEXT,
ADD COLUMN IF NOT EXISTS parecer_item TEXT,
ADD COLUMN IF NOT EXISTS nao_aplicavel BOOLEAN DEFAULT FALSE;

-- Add internal tracking fields to peritagens
ALTER TABLE peritagens 
ADD COLUMN IF NOT EXISTS os_interna TEXT,
ADD COLUMN IF NOT EXISTS etapa_atual TEXT DEFAULT 'peritagem',
ADD COLUMN IF NOT EXISTS databook_pronto BOOLEAN DEFAULT FALSE;
