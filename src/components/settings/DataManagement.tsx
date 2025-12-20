import { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Cloud, 
  AlertTriangle,
  FileJson,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useDataManagement } from '@/hooks/useDataManagement';
import { Spinner } from '@/components/ui/spinner';

interface DataManagementProps {
  refetchToko: () => Promise<void>;
  refetchTransaksi: () => Promise<void>;
}

export function DataManagement({ refetchToko, refetchTransaksi }: DataManagementProps) {
  const { isLoading, downloadBackup, importData, syncFromCloud, pushToCloud } = useDataManagement();
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Harap pilih file JSON');
        return;
      }
      setSelectedFile(file);
      setShowImportConfirm(true);
    }
  };

  const handleImportConfirm = async () => {
    if (selectedFile) {
      const success = await importData(selectedFile);
      if (success) {
        await Promise.all([refetchToko(), refetchTransaksi()]);
      }
    }
    setSelectedFile(null);
    setShowImportConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSync = () => syncFromCloud(refetchToko, refetchTransaksi);
  const handlePush = () => pushToCloud(refetchToko, refetchTransaksi);

  return (
    <div className="space-y-6">
      {/* Backup & Import Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Backup & Restore Data
          </CardTitle>
          <CardDescription>
            Ekspor semua data ke file JSON atau impor dari backup sebelumnya
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Backup Button */}
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={downloadBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <Download className="h-6 w-6 text-primary" />
              )}
              <div className="text-center">
                <p className="font-medium">Backup Data</p>
                <p className="text-xs text-muted-foreground">Unduh semua data ke file JSON</p>
              </div>
            </Button>

            {/* Import Button */}
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-500/5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <Upload className="h-6 w-6 text-orange-500" />
              )}
              <div className="text-center">
                <p className="font-medium">Import Data</p>
                <p className="text-xs text-muted-foreground">Restore dari file backup</p>
              </div>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Import akan menghapus semua data yang ada dan menggantinya dengan data dari backup. 
              Pastikan untuk membuat backup terlebih dahulu.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Sync Section */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Sinkronisasi Cloud
          </CardTitle>
          <CardDescription>
            Sinkronkan data secara manual dengan server cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Refresh from Cloud */}
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-500/5"
              onClick={handleSync}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <RefreshCw className="h-6 w-6 text-blue-500" />
              )}
              <div className="text-center">
                <p className="font-medium">Refresh dari Cloud</p>
                <p className="text-xs text-muted-foreground">Ambil data terbaru dari server</p>
              </div>
            </Button>

            {/* Push to Cloud */}
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 hover:border-green-500 hover:bg-green-500/5"
              onClick={handlePush}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-6 w-6" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <div className="text-center">
                <p className="font-medium">Kirim ke Cloud</p>
                <p className="text-xs text-muted-foreground">Pastikan data tersimpan di server</p>
              </div>
            </Button>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Cloud className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Data Anda otomatis tersinkronisasi dengan cloud setiap kali ada perubahan. 
              Gunakan tombol di atas untuk sinkronisasi manual jika diperlukan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Konfirmasi Import Data
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Anda akan mengimpor data dari file: <strong>{selectedFile?.name}</strong>
              </p>
              <p className="text-destructive font-medium">
                Peringatan: Semua data yang ada saat ini akan dihapus dan diganti dengan data dari backup!
              </p>
              <p>Apakah Anda yakin ingin melanjutkan?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleImportConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Import Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
