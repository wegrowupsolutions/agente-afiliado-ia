import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, Video, Check } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  onFilesUploaded: (urls: string[]) => void;
  nomeAgente: string;
  categoria: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  onFilesUploaded,
  nomeAgente,
  categoria
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['mp4', 'mov', 'webm', 'avi'].includes(extension || '')) {
      return <Video className="w-4 h-4" />;
    }
    
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    
    return <FileText className="w-4 h-4" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!nomeAgente.trim()) {
      toast({
        title: "⚠️ Nome necessário",
        description: "Por favor, preencha o nome do agente antes de fazer upload de arquivos.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${nomeAgente.toLowerCase().replace(/\s+/g, '-')}/${categoria}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('afiliados')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('afiliados')
          .getPublicUrl(data.path);

        return {
          name: file.name,
          url: publicUrl
        };
      });

      const results = await Promise.all(uploadPromises);
      const newUploadedFiles = [...uploadedFiles, ...results];
      
      setUploadedFiles(newUploadedFiles);
      onFilesUploaded(newUploadedFiles.map(file => file.url));

      toast({
        title: "✅ Upload concluído!",
        description: `${files.length} arquivo(s) enviado(s) com sucesso.`,
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "❌ Erro no upload",
        description: "Ocorreu um erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles.map(file => file.url));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="hover:bg-primary/10 hover:border-primary"
        >
          {uploading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {multiple ? 'Selecionar Arquivos' : 'Selecionar Arquivo'}
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {uploadedFiles.length} arquivo(s) enviado(s):
          </p>
          <div className="grid gap-2">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name)}
                    <span className="text-sm truncate">{file.name}</span>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {accept === 'video/*' && 'Formatos aceitos: MP4, MOV, WebM'}
        {accept === 'image/*' && 'Formatos aceitos: JPG, PNG, WebP'}
        {accept === '.pdf,.doc,.docx' && 'Formatos aceitos: PDF, DOC, DOCX'}
      </p>
    </div>
  );
};