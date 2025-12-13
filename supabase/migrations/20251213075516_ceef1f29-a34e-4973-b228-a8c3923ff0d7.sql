-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_transaksi_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;