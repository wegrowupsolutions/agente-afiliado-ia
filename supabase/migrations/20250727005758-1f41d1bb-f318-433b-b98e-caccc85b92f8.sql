-- Adicionar campo senha à tabela afiliados_perfis
ALTER TABLE public.afiliados_perfis 
ADD COLUMN senha TEXT NOT NULL DEFAULT '';