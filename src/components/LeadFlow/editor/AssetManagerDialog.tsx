import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AssetManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  bucket?: string; // default: 'flow-assets'
};

type Asset = {
  id: string;
  name: string;
  url: string;
  createdAt?: string;
};

const DEFAULT_BUCKET = 'flow-assets';
const FOLDER = 'images';

export default function AssetManagerDialog({ open, onOpenChange, onSelect, bucket = DEFAULT_BUCKET }: AssetManagerDialogProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const storage = useMemo(() => supabase.storage.from(bucket), [bucket]);

  const refresh = async () => {
    try {
      setLoading(true);
      const { data, error } = await storage.list(FOLDER, { sortBy: { column: 'created_at', order: 'desc' }, limit: 1000 });
      if (error) throw error;
      const mapped: Asset[] = (data || [])
        .filter((f: any) => !f.name.endsWith('/'))
        .map((f: any) => {
          const path = `${FOLDER}/${f.name}`;
          const url = storage.getPublicUrl(path).data.publicUrl;
          return { id: path, name: f.name, url, createdAt: (f as any).created_at };
        });
      setAssets(mapped);
    } catch (e: any) {
      console.error('List assets failed:', e);
      toast({ title: 'Storage error', description: e?.message || 'Could not load assets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bucket]);

  const handleUpload = async (file: File) => {
    const ext = file.name.split('.').pop() || 'png';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();
    const path = `${FOLDER}/${Date.now()}-${safeName}`;
    setUploading(true);
    try {
      const { error } = await storage.upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (error) throw error;
      const publicUrl = storage.getPublicUrl(path).data.publicUrl;
      toast({ title: 'Uploaded', description: file.name });
      setAssets(prev => [{ id: path, name: safeName, url: publicUrl }, ...prev]);
    } catch (e: any) {
      console.error('Upload error:', e);
      toast({ title: 'Upload failed', description: e?.message || 'Could not upload file', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleUpload(files[0]);
    e.currentTarget.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Asset Manager</DialogTitle>
          <DialogDescription>Upload or choose an image. Files are stored in Supabase Storage and served via public URLs.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-2">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
                <p className="text-xs text-gray-500">Recommended: JPG/PNG/WebP. Large images will affect load speed.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">{loading ? 'Loading…' : `${assets.length} file(s)`}</div>
              <Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>
            </div>

            {assets.length === 0 && !loading ? (
              <div className="text-sm text-gray-500">No assets yet. Upload an image to get started.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => onSelect(asset.url)}
                    className="group border rounded-lg overflow-hidden text-left hover:shadow-md transition-shadow"
                    title="Click to select"
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                    </div>
                    <div className="p-2 text-xs truncate">{asset.name}</div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


