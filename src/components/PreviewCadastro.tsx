import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Package, 
  Link, 
  Instagram, 
  ShoppingCart,
  FileText,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';

interface PreviewCadastroProps {
  data: any;
  onVoltar: () => void;
}

export const PreviewCadastro: React.FC<PreviewCadastroProps> = ({ data, onVoltar }) => {
  const formatarWhatsApp = (numero: string) => {
    return numero.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const abrirLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm animate-fade-in-up">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-bounce-in">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              🎉 Cadastro Realizado com Sucesso!
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Seu agente afiliado foi cadastrado com sucesso. Confira os dados abaixo:
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Dados Pessoais */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Nome do Agente</p>
                  <p className="font-semibold">{data.nomeAgente}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp Business</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formatarWhatsApp(data.whatsapp)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Produto */}
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Package className="w-5 h-5" />
                  Informações do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Nome do Produto</p>
                    <p className="font-semibold">{data.nomeProduto}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Página de Vendas</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirLink(data.linkPaginaVendas)}
                      className="h-8"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Visualizar Página
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Descrição do Produto</p>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm">{data.descricaoProduto}</p>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Links de Checkout */}
            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  Links de Checkout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Checkout Principal</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => abrirLink(data.checkout01)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>
                
                {[data.checkout02, data.checkout03, data.checkout04, data.checkout05].map((checkout, index) => (
                  checkout && (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground">Checkout 0{index + 2}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => abrirLink(checkout)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  )
                ))}
                
                {data.linkInstagram && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirLink(data.linkInstagram)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Arquivos Enviados */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileText className="w-5 h-5" />
                  Arquivos Enviados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.videosDepoimento && data.videosDepoimento.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Vídeos de Depoimento</p>
                    <Badge variant="secondary">
                      {data.videosDepoimento.length} arquivo(s) enviado(s)
                    </Badge>
                  </div>
                )}
                
                {data.imagensProduto && data.imagensProduto.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Imagens do Produto</p>
                    <Badge variant="secondary">
                      {data.imagensProduto.length} arquivo(s) enviado(s)
                    </Badge>
                  </div>
                )}
                
                {data.imagensProvaSocial && data.imagensProvaSocial.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Imagens de Prova Social</p>
                    <Badge variant="secondary">
                      {data.imagensProvaSocial.length} arquivo(s) enviado(s)
                    </Badge>
                  </div>
                )}
                
                {data.documentosComplementares && data.documentosComplementares.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">Documentos Complementares</p>
                    <Badge variant="secondary">
                      {data.documentosComplementares.length} arquivo(s) enviado(s)
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Cadastro */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Cadastro ID: {data.id}
                    </p>
                    <p className="text-sm text-green-600">
                      Seus dados foram salvos com segurança em nossa plataforma
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                variant="outline" 
                onClick={onVoltar}
                className="px-8"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Fazer Novo Cadastro
              </Button>
              
              <Button 
                onClick={() => window.print()}
                className="px-8 bg-gradient-to-r from-secondary to-secondary/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Imprimir Resumo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};