-- Criar bucket para uploads de arquivos dos afiliados
INSERT INTO storage.buckets (id, name, public) VALUES ('afiliados', 'afiliados', true);

-- Criar tabela para cadastros de afiliados
CREATE TABLE public.cadastros_afiliados (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_agente TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    nome_produto TEXT NOT NULL,
    link_pagina_vendas TEXT NOT NULL,
    descricao_produto TEXT NOT NULL,
    checkout_01 TEXT NOT NULL,
    checkout_02 TEXT,
    checkout_03 TEXT,
    checkout_04 TEXT,
    checkout_05 TEXT,
    link_instagram TEXT,
    videos_depoimento TEXT[], -- Array de URLs dos vídeos
    imagens_produto TEXT[], -- Array de URLs das imagens do produto
    imagens_prova_social TEXT[], -- Array de URLs das imagens de prova social
    documentos_complementares TEXT[], -- Array de URLs dos documentos
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.cadastros_afiliados ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção (cadastro público)
CREATE POLICY "Permitir inserção de cadastros" 
ON public.cadastros_afiliados 
FOR INSERT 
WITH CHECK (true);

-- Política para visualização (acesso público para fins de demonstração)
CREATE POLICY "Permitir visualização de cadastros" 
ON public.cadastros_afiliados 
FOR SELECT 
USING (true);

-- Políticas para storage bucket afiliados
CREATE POLICY "Permitir upload de arquivos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'afiliados');

CREATE POLICY "Permitir visualização de arquivos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'afiliados');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cadastros_afiliados_updated_at
BEFORE UPDATE ON public.cadastros_afiliados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();