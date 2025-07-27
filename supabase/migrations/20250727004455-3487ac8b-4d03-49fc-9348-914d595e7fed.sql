-- Criar enum para status do afiliado
CREATE TYPE public.afiliado_status AS ENUM ('ativo', 'inativo', 'pendente');

-- Criar tabela de perfis de afiliados
CREATE TABLE public.afiliados_perfis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_afiliado TEXT NOT NULL UNIQUE, -- Código único para identificar o afiliado
    email TEXT NOT NULL UNIQUE,
    nome_completo TEXT NOT NULL,
    telefone TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status afiliado_status NOT NULL DEFAULT 'ativo',
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    total_cadastros INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.afiliados_perfis ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna afiliado_id na tabela existente
ALTER TABLE public.cadastros_afiliados 
ADD COLUMN afiliado_id UUID REFERENCES public.afiliados_perfis(id);

-- Criar índices para melhor performance
CREATE INDEX idx_afiliados_perfis_codigo ON public.afiliados_perfis(codigo_afiliado);
CREATE INDEX idx_afiliados_perfis_email ON public.afiliados_perfis(email);
CREATE INDEX idx_cadastros_afiliados_afiliado_id ON public.cadastros_afiliados(afiliado_id);

-- Função para gerar código único do afiliado
CREATE OR REPLACE FUNCTION public.gerar_codigo_afiliado()
RETURNS TEXT AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gerar código alfanumérico de 8 caracteres
        codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM public.afiliados_perfis WHERE codigo_afiliado = codigo) INTO existe;
        
        EXIT WHEN NOT existe;
    END LOOP;
    
    RETURN codigo;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Função para atualizar contador de cadastros
CREATE OR REPLACE FUNCTION public.atualizar_contador_cadastros()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.afiliado_id IS NOT NULL THEN
        UPDATE public.afiliados_perfis 
        SET total_cadastros = total_cadastros + 1,
            updated_at = now()
        WHERE id = NEW.afiliado_id;
    ELSIF TG_OP = 'DELETE' AND OLD.afiliado_id IS NOT NULL THEN
        UPDATE public.afiliados_perfis 
        SET total_cadastros = GREATEST(total_cadastros - 1, 0),
            updated_at = now()
        WHERE id = OLD.afiliado_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Trigger para atualizar contador automaticamente
CREATE TRIGGER trigger_atualizar_contador_cadastros
    AFTER INSERT OR DELETE ON public.cadastros_afiliados
    FOR EACH ROW EXECUTE FUNCTION public.atualizar_contador_cadastros();

-- Trigger para updated_at na tabela de perfis
CREATE TRIGGER update_afiliados_perfis_updated_at
    BEFORE UPDATE ON public.afiliados_perfis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Políticas RLS para perfis de afiliados (acesso público para cadastro)
CREATE POLICY "Permitir inserção de novos perfis" 
ON public.afiliados_perfis 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir visualização de perfis" 
ON public.afiliados_perfis 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir atualização do próprio perfil" 
ON public.afiliados_perfis 
FOR UPDATE 
USING (true);

-- Atualizar política da tabela de cadastros para incluir afiliado_id
DROP POLICY IF EXISTS "Permitir inserção de cadastros" ON public.cadastros_afiliados;
DROP POLICY IF EXISTS "Permitir visualização de cadastros" ON public.cadastros_afiliados;

CREATE POLICY "Permitir inserção de cadastros" 
ON public.cadastros_afiliados 
FOR INSERT 
WITH CHECK (afiliado_id IS NOT NULL);

CREATE POLICY "Permitir visualização de cadastros" 
ON public.cadastros_afiliados 
FOR SELECT 
USING (true);