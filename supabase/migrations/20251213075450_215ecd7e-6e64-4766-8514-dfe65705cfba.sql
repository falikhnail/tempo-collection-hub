-- Create toko (store/customer) table
CREATE TABLE public.toko (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT NOT NULL,
  telepon TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaksi table
CREATE TABLE public.transaksi (
  id TEXT NOT NULL PRIMARY KEY,
  toko_id UUID NOT NULL REFERENCES public.toko(id) ON DELETE CASCADE,
  tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_harga NUMERIC NOT NULL DEFAULT 0,
  tipe_pembayaran TEXT NOT NULL CHECK (tipe_pembayaran IN ('cash', 'tempo')),
  jatuh_tempo TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status IN ('lunas', 'belum_lunas', 'jatuh_tempo', 'terlambat')),
  sisa_piutang NUMERIC NOT NULL DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create item_transaksi table
CREATE TABLE public.item_transaksi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaksi_id TEXT NOT NULL REFERENCES public.transaksi(id) ON DELETE CASCADE,
  nama_barang TEXT NOT NULL,
  jumlah INTEGER NOT NULL DEFAULT 1,
  harga_satuan NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pembayaran table
CREATE TABLE public.pembayaran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaksi_id TEXT NOT NULL REFERENCES public.transaksi(id) ON DELETE CASCADE,
  tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  jumlah NUMERIC NOT NULL DEFAULT 0,
  metode TEXT NOT NULL DEFAULT 'cash' CHECK (metode IN ('transfer', 'cash', 'lainnya')),
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.toko ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for now, since no auth yet)
-- These allow full CRUD for everyone - will be updated when auth is added
CREATE POLICY "Allow public read toko" ON public.toko FOR SELECT USING (true);
CREATE POLICY "Allow public insert toko" ON public.toko FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update toko" ON public.toko FOR UPDATE USING (true);
CREATE POLICY "Allow public delete toko" ON public.toko FOR DELETE USING (true);

CREATE POLICY "Allow public read transaksi" ON public.transaksi FOR SELECT USING (true);
CREATE POLICY "Allow public insert transaksi" ON public.transaksi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update transaksi" ON public.transaksi FOR UPDATE USING (true);
CREATE POLICY "Allow public delete transaksi" ON public.transaksi FOR DELETE USING (true);

CREATE POLICY "Allow public read item_transaksi" ON public.item_transaksi FOR SELECT USING (true);
CREATE POLICY "Allow public insert item_transaksi" ON public.item_transaksi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update item_transaksi" ON public.item_transaksi FOR UPDATE USING (true);
CREATE POLICY "Allow public delete item_transaksi" ON public.item_transaksi FOR DELETE USING (true);

CREATE POLICY "Allow public read pembayaran" ON public.pembayaran FOR SELECT USING (true);
CREATE POLICY "Allow public insert pembayaran" ON public.pembayaran FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pembayaran" ON public.pembayaran FOR UPDATE USING (true);
CREATE POLICY "Allow public delete pembayaran" ON public.pembayaran FOR DELETE USING (true);

-- Create function to update transaksi status based on jatuh_tempo
CREATE OR REPLACE FUNCTION public.update_transaksi_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sisa_piutang = 0 THEN
    NEW.status := 'lunas';
  ELSIF NEW.jatuh_tempo IS NOT NULL AND NEW.jatuh_tempo < now() THEN
    NEW.status := 'terlambat';
  ELSIF NEW.jatuh_tempo IS NOT NULL AND NEW.jatuh_tempo <= now() + interval '3 days' THEN
    NEW.status := 'jatuh_tempo';
  ELSE
    NEW.status := 'belum_lunas';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update status
CREATE TRIGGER update_transaksi_status_trigger
BEFORE INSERT OR UPDATE ON public.transaksi
FOR EACH ROW
EXECUTE FUNCTION public.update_transaksi_status();