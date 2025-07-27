import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { PreviewCadastro } from './PreviewCadastro';
import { IdentificacaoAfiliado } from './IdentificacaoAfiliado';
import { 
  User, 
  Phone, 
  Package, 
  Link, 
  FileText, 
  Instagram, 
  ShoppingCart,
  Sparkles,
  CheckCircle,
  Upload,
  PartyPopper,
  Trophy,
  LogOut,
  UserCheck,
  Edit
} from 'lucide-react';

const formSchema = z.object({
  nomeAgente: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  whatsapp: z.string().min(10, 'WhatsApp deve ter pelo menos 10 dígitos'),
  nomeProduto: z.string().min(2, 'Nome do produto é obrigatório'),
  linkPaginaVendas: z.string().url('Insira uma URL válida'),
  descricaoProduto: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  checkout01: z.string().url('Insira uma URL válida'),
  checkout02: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
  checkout03: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
  checkout04: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
  checkout05: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
  linkInstagram: z.string().url('Insira uma URL válida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export const FormularioAfiliado = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [afiliadoAtual, setAfiliadoAtual] = useState<any>(null);
  const [cadastroExistente, setCadastroExistente] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    videosDepoimento: [] as string[],
    imagensProduto: [] as string[],
    imagensProvaSocial: [] as string[],
    documentosComplementares: [] as string[]
  });
  
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAgente: '',
      whatsapp: '',
      nomeProduto: '',
      linkPaginaVendas: '',
      descricaoProduto: '',
      checkout01: '',
      checkout02: '',
      checkout03: '',
      checkout04: '',
      checkout05: '',
      linkInstagram: '',
    },
  });

  // Verificar se há cadastro existente quando o afiliado for identificado
  useEffect(() => {
    const verificarCadastroExistente = async () => {
      if (!afiliadoAtual) return;
      
      try {
        const { data, error } = await supabase
          .from('cadastros_afiliados')
          .select('*')
          .eq('afiliado_id', afiliadoAtual.id)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const cadastro = data[0];
          setCadastroExistente(cadastro);
          setIsEditMode(true);
          
          // Preencher o formulário com os dados existentes
          form.reset({
            nomeAgente: cadastro.nome_agente || '',
            whatsapp: cadastro.whatsapp || '',
            nomeProduto: cadastro.nome_produto || '',
            linkPaginaVendas: cadastro.link_pagina_vendas || '',
            descricaoProduto: cadastro.descricao_produto || '',
            checkout01: cadastro.checkout_01 || '',
            checkout02: cadastro.checkout_02 || '',
            checkout03: cadastro.checkout_03 || '',
            checkout04: cadastro.checkout_04 || '',
            checkout05: cadastro.checkout_05 || '',
            linkInstagram: cadastro.link_instagram || '',
          });

          // Preencher arquivos existentes
          setUploadedFiles({
            videosDepoimento: cadastro.videos_depoimento || [],
            imagensProduto: cadastro.imagens_produto || [],
            imagensProvaSocial: cadastro.imagens_prova_social || [],
            documentosComplementares: cadastro.documentos_complementares || []
          });
        }
      } catch (error) {
        console.error('Erro ao verificar cadastro existente:', error);
      }
    };

    verificarCadastroExistente();
  }, [afiliadoAtual, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode && cadastroExistente) {
        // Modo de edição: detectar campos alterados e fazer update
        const camposAlterados: any = {};
        
        // Verificar mudanças nos campos do formulário
        if (data.nomeAgente !== cadastroExistente.nome_agente) camposAlterados.nome_agente = data.nomeAgente;
        if (data.whatsapp !== cadastroExistente.whatsapp) camposAlterados.whatsapp = data.whatsapp;
        if (data.nomeProduto !== cadastroExistente.nome_produto) camposAlterados.nome_produto = data.nomeProduto;
        if (data.linkPaginaVendas !== cadastroExistente.link_pagina_vendas) camposAlterados.link_pagina_vendas = data.linkPaginaVendas;
        if (data.descricaoProduto !== cadastroExistente.descricao_produto) camposAlterados.descricao_produto = data.descricaoProduto;
        if (data.checkout01 !== cadastroExistente.checkout_01) camposAlterados.checkout_01 = data.checkout01;
        if (data.checkout02 !== cadastroExistente.checkout_02) camposAlterados.checkout_02 = data.checkout02 || null;
        if (data.checkout03 !== cadastroExistente.checkout_03) camposAlterados.checkout_03 = data.checkout03 || null;
        if (data.checkout04 !== cadastroExistente.checkout_04) camposAlterados.checkout_04 = data.checkout04 || null;
        if (data.checkout05 !== cadastroExistente.checkout_05) camposAlterados.checkout_05 = data.checkout05 || null;
        if (data.linkInstagram !== cadastroExistente.link_instagram) camposAlterados.link_instagram = data.linkInstagram || null;
        
        // Verificar mudanças nos arquivos
        const videosAtuais = JSON.stringify(uploadedFiles.videosDepoimento.sort());
        const videosExistentes = JSON.stringify((cadastroExistente.videos_depoimento || []).sort());
        if (videosAtuais !== videosExistentes) camposAlterados.videos_depoimento = uploadedFiles.videosDepoimento;
        
        const imagensProdutoAtuais = JSON.stringify(uploadedFiles.imagensProduto.sort());
        const imagensProdutoExistentes = JSON.stringify((cadastroExistente.imagens_produto || []).sort());
        if (imagensProdutoAtuais !== imagensProdutoExistentes) camposAlterados.imagens_produto = uploadedFiles.imagensProduto;
        
        const imagensProvaSocialAtuais = JSON.stringify(uploadedFiles.imagensProvaSocial.sort());
        const imagensProvaSocialExistentes = JSON.stringify((cadastroExistente.imagens_prova_social || []).sort());
        if (imagensProvaSocialAtuais !== imagensProvaSocialExistentes) camposAlterados.imagens_prova_social = uploadedFiles.imagensProvaSocial;
        
        const documentosAtuais = JSON.stringify(uploadedFiles.documentosComplementares.sort());
        const documentosExistentes = JSON.stringify((cadastroExistente.documentos_complementares || []).sort());
        if (documentosAtuais !== documentosExistentes) camposAlterados.documentos_complementares = uploadedFiles.documentosComplementares;

        // Se há campos alterados, fazer update
        if (Object.keys(camposAlterados).length > 0) {
          camposAlterados.updated_at = new Date().toISOString();
          
          const { data: updatedData, error } = await supabase
            .from('cadastros_afiliados')
            .update(camposAlterados)
            .eq('id', cadastroExistente.id)
            .select()
            .single();

          if (error) throw error;

          toast({
            title: "✅ Dados atualizados com sucesso!",
            description: `${Object.keys(camposAlterados).length} campo(s) foram atualizados.`,
          });

          setSubmittedData({ ...data, ...uploadedFiles, id: updatedData.id });
        } else {
          toast({
            title: "ℹ️ Nenhuma alteração detectada",
            description: "Os dados permanecem iguais ao cadastro existente.",
          });
          return;
        }
      } else {
        // Modo de inserção: cadastro novo
        const { data: insertedData, error } = await supabase
          .from('cadastros_afiliados')
          .insert({
            afiliado_id: afiliadoAtual.id,
            nome_agente: data.nomeAgente,
            whatsapp: data.whatsapp,
            nome_produto: data.nomeProduto,
            link_pagina_vendas: data.linkPaginaVendas,
            descricao_produto: data.descricaoProduto,
            checkout_01: data.checkout01,
            checkout_02: data.checkout02 || null,
            checkout_03: data.checkout03 || null,
            checkout_04: data.checkout04 || null,
            checkout_05: data.checkout05 || null,
            link_instagram: data.linkInstagram || null,
            videos_depoimento: uploadedFiles.videosDepoimento,
            imagens_produto: uploadedFiles.imagensProduto,
            imagens_prova_social: uploadedFiles.imagensProvaSocial,
            documentos_complementares: uploadedFiles.documentosComplementares,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "✅ Cadastro realizado com sucesso!",
          description: "Seu agente afiliado foi cadastrado na nossa plataforma.",
        });

        setSubmittedData({ ...data, ...uploadedFiles, id: insertedData.id });
      }
      
      // Mostrar pop-up de sucesso
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se não há afiliado identificado, mostrar tela de identificação
  if (!afiliadoAtual) {
    return <IdentificacaoAfiliado onAfiliadoIdentificado={setAfiliadoAtual} />;
  }

  if (submitSuccess && submittedData) {
    return <PreviewCadastro data={submittedData} onVoltar={() => setSubmitSuccess(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com informações do afiliado */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-full">
                  <UserCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    {afiliadoAtual.nome_completo}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Código: {afiliadoAtual.codigo_afiliado}</span>
                    <Badge variant="secondary">
                      {afiliadoAtual.total_cadastros} produto(s) cadastrado(s)
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAfiliadoAtual(null)}
                className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-full animate-glow-pulse">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isEditMode ? (
                <>
                  <Edit className="w-8 h-8 inline mr-3 text-primary" />
                  Editar Cadastro de Afiliado
                </>
              ) : (
                'Cadastro de Agente Afiliado IA'
              )}
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              {isEditMode 
                ? 'Altere os dados desejados e clique em salvar. Apenas os campos modificados serão atualizados.'
                : 'Preencha os dados abaixo para criar seu perfil de afiliado inteligente'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Seção: Dados Pessoais */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <User className="w-5 h-5" />
                      Dados Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nomeAgente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nome do Agente
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            WhatsApp Business
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seção: Informações do Produto */}
                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <Package className="w-5 h-5" />
                      Informações do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nomeProduto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Nome do Produto
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do produto que você afilia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="linkPaginaVendas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Link className="w-4 h-4" />
                              Link da Página de Vendas
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="descricaoProduto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Descrição do Produto
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explique um pouco sobre o produto ou copie o texto da página de vendas e cole aqui..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seção: Links de Checkout */}
                <Card className="border-secondary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                      <ShoppingCart className="w-5 h-5" />
                      Links de Checkout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="checkout01"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Checkout 01 (Obrigatório)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {[2, 3, 4, 5].map(num => (
                      <FormField
                        key={num}
                        control={form.control}
                        name={`checkout0${num}` as keyof FormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Checkout 0{num} (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    
                    <FormField
                      control={form.control}
                      name="linkInstagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            Link do Instagram (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seção: Upload de Arquivos */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Upload className="w-5 h-5" />
                      Upload de Arquivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FileUpload
                      label="Vídeos de Depoimento e Prova Social"
                      accept="video/*"
                      multiple
                      onFilesUploaded={(urls) => setUploadedFiles(prev => ({ ...prev, videosDepoimento: urls }))}
                      nomeAgente={form.watch('nomeAgente')}
                      categoria="videos"
                    />
                    
                    <FileUpload
                      label="Imagens do Produto"
                      accept="image/*"
                      multiple
                      onFilesUploaded={(urls) => setUploadedFiles(prev => ({ ...prev, imagensProduto: urls }))}
                      nomeAgente={form.watch('nomeAgente')}
                      categoria="imagens-produto"
                    />
                    
                    <FileUpload
                      label="Imagens de Prova Social"
                      accept="image/*"
                      multiple
                      onFilesUploaded={(urls) => setUploadedFiles(prev => ({ ...prev, imagensProvaSocial: urls }))}
                      nomeAgente={form.watch('nomeAgente')}
                      categoria="imagens-prova"
                    />
                    
                    <FileUpload
                      label="Documentos Complementares"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onFilesUploaded={(urls) => setUploadedFiles(prev => ({ ...prev, documentosComplementares: urls }))}
                      nomeAgente={form.watch('nomeAgente')}
                      categoria="documentos"
                    />
                  </CardContent>
                </Card>

                {/* Botão de Envio */}
                <div className="flex justify-center pt-8">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-105 transition-all duration-300 animate-glow-pulse"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        {isEditMode ? (
                          <>
                            <Edit className="w-5 h-5 mr-2" />
                            Salvar Alterações
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Finalizar Cadastro
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Pop-up de Sucesso */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-bounce-in">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
                🎉 Parabéns!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <PartyPopper className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Cadastro realizado com sucesso!
              </p>
              <p className="text-muted-foreground">
                Todos os seus dados e arquivos foram salvos com segurança na memoria. 
                Seu agente afiliado está agora cadastrado na nossa plataforma!
              </p>
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSubmitSuccess(true);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ver Resumo do Cadastro
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSuccessModal(false);
                    form.reset();
                    setUploadedFiles({
                      videosDepoimento: [],
                      imagensProduto: [],
                      imagensProvaSocial: [],
                      documentosComplementares: []
                    });
                  }}
                  className="w-full"
                >
                  Fazer Novo Cadastro
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};