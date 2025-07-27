import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, LogIn, Users, Eye, EyeOff } from 'lucide-react';

const identificacaoSchema = z.object({
  email: z.string().email('Insira um email válido'),
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Insira um email válido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

type IdentificacaoData = z.infer<typeof identificacaoSchema>;
type LoginData = z.infer<typeof loginSchema>;

interface IdentificacaoAfiliadoProps {
  onAfiliadoIdentificado: (afiliado: any) => void;
}

export const IdentificacaoAfiliado: React.FC<IdentificacaoAfiliadoProps> = ({ onAfiliadoIdentificado }) => {
  const [modo, setModo] = useState<'novo' | 'existente'>('novo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { toast } = useToast();

  const formNovoAfiliado = useForm<IdentificacaoData>({
    resolver: zodResolver(identificacaoSchema),
    defaultValues: {
      email: '',
      nomeCompleto: '',
      telefone: '',
      senha: '',
    },
  });

  const formLoginAfiliado = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const criarNovoAfiliado = async (data: IdentificacaoData) => {
    setIsSubmitting(true);
    
    try {
      // Verificar se email já existe
      const { data: existeAfiliado } = await supabase
        .from('afiliados_perfis')
        .select('id, email')
        .eq('email', data.email)
        .single();

      if (existeAfiliado) {
        toast({
          title: "🔍 Afiliado já existe!",
          description: `Este email já está cadastrado. Use o login.`,
          variant: "destructive",
        });
        setModo('existente');
        formLoginAfiliado.setValue('email', data.email);
        return;
      }

      // Gerar código único
      const { data: codigoData, error: codigoError } = await supabase
        .rpc('gerar_codigo_afiliado');

      if (codigoError) {
        throw codigoError;
      }

      // Criar novo perfil de afiliado
      const { data: novoAfiliado, error } = await supabase
        .from('afiliados_perfis')
        .insert({
          email: data.email,
          nome_completo: data.nomeCompleto,
          telefone: data.telefone,
          senha: data.senha,
          codigo_afiliado: codigoData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Afiliado criado com sucesso!",
        description: `Perfil criado! Use seu email e senha para futuros acessos.`,
      });

      onAfiliadoIdentificado(novoAfiliado);

    } catch (error) {
      console.error('Erro ao criar afiliado:', error);
      toast({
        title: "❌ Erro no cadastro",
        description: "Ocorreu um erro ao criar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fazerLoginAfiliado = async (data: LoginData) => {
    setIsSubmitting(true);
    
    try {
      const { data: afiliado, error } = await supabase
        .from('afiliados_perfis')
        .select('*')
        .eq('email', data.email)
        .eq('senha', data.senha)
        .single();

      if (error || !afiliado) {
        toast({
          title: "❌ Login inválido",
          description: "Email ou senha incorretos. Verifique suas credenciais.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar último acesso
      await supabase
        .from('afiliados_perfis')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', afiliado.id);

      toast({
        title: "✅ Login realizado!",
        description: `Bem-vindo de volta, ${afiliado.nome_completo}!`,
      });

      onAfiliadoIdentificado(afiliado);

    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "❌ Erro no login",
        description: "Ocorreu um erro ao acessar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-full">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Identificação do Afiliado
            </CardTitle>
            <p className="text-muted-foreground">
              {modo === 'novo' 
                ? 'Crie seu perfil de afiliado para começar' 
                : 'Entre com seu email e senha'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Botões de alternância */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={modo === 'novo' ? 'default' : 'outline'}
                onClick={() => setModo('novo')}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Afiliado
              </Button>
              <Button
                variant={modo === 'existente' ? 'default' : 'outline'}
                onClick={() => setModo('existente')}
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Já sou Afiliado
              </Button>
            </div>

            {/* Formulário Novo Afiliado */}
            {modo === 'novo' && (
              <Form {...formNovoAfiliado}>
                <form onSubmit={formNovoAfiliado.handleSubmit(criarNovoAfiliado)} className="space-y-4">
                  <FormField
                    control={formNovoAfiliado.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formNovoAfiliado.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formNovoAfiliado.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   
                  <FormField
                    control={formNovoAfiliado.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={mostrarSenha ? "text" : "password"}
                              placeholder="Digite sua senha (mín. 6 caracteres)"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                            >
                              {mostrarSenha ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-glow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar Perfil de Afiliado
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Formulário Login Afiliado */}
            {modo === 'existente' && (
              <Form {...formLoginAfiliado}>
                <form onSubmit={formLoginAfiliado.handleSubmit(fazerLoginAfiliado)} className="space-y-4">
                  <FormField
                    control={formLoginAfiliado.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={formLoginAfiliado.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={mostrarSenha ? "text" : "password"}
                              placeholder="Digite sua senha"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                            >
                              {mostrarSenha ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-accent to-accent/80"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full mr-2" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar como Afiliado
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};