import { useState } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  RotateCcw,
  Copy,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMessageTemplates, MessageTemplate } from '@/hooks/useMessageTemplates';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/data/mockData';

const PLACEHOLDERS = [
  { key: '{nama_toko}', label: 'Nama Toko', example: 'Toko Maju Jaya' },
  { key: '{id_transaksi}', label: 'ID Transaksi', example: 'TRX123456' },
  { key: '{sisa_piutang}', label: 'Sisa Piutang', example: formatRupiah(1500000) },
  { key: '{jatuh_tempo}', label: 'Tanggal Jatuh Tempo', example: '25 Des 2025' },
  { key: '{waktu}', label: 'Waktu (pagi/siang/sore/malam)', example: 'siang' },
];

export function MessageTemplateEditor() {
  const { 
    templates, 
    activeTemplateId, 
    setActiveTemplateId,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    resetToDefaults,
    formatMessage 
  } = useMessageTemplates();
  const { toast } = useToast();

  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormContent(template.content);
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormContent('');
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formContent.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Nama dan isi template harus diisi', 
        variant: 'destructive' 
      });
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name: formName, content: formContent });
      toast({ title: 'Sukses', description: 'Template berhasil diperbarui' });
    } else {
      addTemplate({ name: formName, content: formContent });
      toast({ title: 'Sukses', description: 'Template baru berhasil ditambahkan' });
    }

    setShowEditor(false);
  };

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      toast({ title: 'Sukses', description: 'Template berhasil dihapus' });
    }
    setTemplateToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleReset = () => {
    resetToDefaults();
    toast({ title: 'Sukses', description: 'Template berhasil direset ke default' });
    setShowResetConfirm(false);
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormContent(prev => prev + placeholder);
  };

  const copyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
    toast({ title: 'Tersalin', description: `${placeholder} berhasil disalin` });
  };

  const getPreviewMessage = (template: MessageTemplate) => {
    return formatMessage(template.id, {
      nama_toko: 'Toko Maju Jaya',
      id_transaksi: 'TRX123456',
      sisa_piutang: formatRupiah(1500000),
      jatuh_tempo: '25 Desember 2025',
    });
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Template Pesan WhatsApp
            </CardTitle>
            <CardDescription>
              Kelola template pesan untuk pengingat piutang
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(true)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleNew}>
              <Plus className="h-4 w-4 mr-1" />
              Buat Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Reference */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium mb-2">Placeholder yang tersedia:</p>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.map(p => (
              <Button
                key={p.key}
                variant="outline"
                size="sm"
                className="h-7 text-xs font-mono"
                onClick={() => copyPlaceholder(p.key)}
                title={`${p.label}: ${p.example}`}
              >
                <Copy className="h-3 w-3 mr-1" />
                {p.key}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <RadioGroup 
          value={activeTemplateId} 
          onValueChange={setActiveTemplateId}
          className="space-y-3"
        >
          {templates.map(template => (
            <div 
              key={template.id}
              className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor={template.id} className="font-medium cursor-pointer">
                    {template.name}
                  </Label>
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">Bawaan</Badge>
                  )}
                  {activeTemplateId === template.id && (
                    <Badge className="text-xs bg-green-600">Aktif</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.content.substring(0, 100)}...
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={() => {
                    setPreviewTemplate(template);
                    setShowPreview(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8"
                  onClick={() => handleEdit(template)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      setTemplateToDelete(template.id);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Buat Template Baru'}
            </DialogTitle>
            <DialogDescription>
              Gunakan placeholder untuk menyisipkan data dinamis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nama Template</Label>
              <Input
                id="template-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Template Ramah"
              />
            </div>

            <div>
              <Label>Sisipkan Placeholder</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLACEHOLDERS.map(p => (
                  <Button
                    key={p.key}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => insertPlaceholder(p.key)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="template-content">Isi Pesan</Label>
              <Textarea
                id="template-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Tulis pesan template di sini..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {formContent && (
              <div>
                <Label>Preview</Label>
                <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-green-900 dark:text-green-100">
                    {formatMessage(undefined, {
                      nama_toko: 'Toko Maju Jaya',
                      id_transaksi: 'TRX123456',
                      sisa_piutang: formatRupiah(1500000),
                      jatuh_tempo: '25 Desember 2025',
                    }).replace(formContent, formContent) || formContent
                      .replace(/{nama_toko}/g, 'Toko Maju Jaya')
                      .replace(/{id_transaksi}/g, 'TRX123456')
                      .replace(/{sisa_piutang}/g, formatRupiah(1500000))
                      .replace(/{jatuh_tempo}/g, '25 Desember 2025')
                      .replace(/{waktu}/g, 'siang')}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              <X className="h-4 w-4 mr-1" />
              Batal
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Contoh pesan dengan data dummy
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <pre className="text-sm whitespace-pre-wrap font-sans text-green-900 dark:text-green-100">
                {getPreviewMessage(previewTemplate)}
              </pre>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Template yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset ke Default?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua template custom akan dihapus dan dikembalikan ke template bawaan. Yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
