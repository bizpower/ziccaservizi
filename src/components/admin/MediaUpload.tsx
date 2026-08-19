import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function MediaUpload({
  value,
  onChange,
  folder = "uploads",
  accept = "image/*",
  label = "Immagine",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("File caricato");
    } catch (e: any) {
      toast.error(e?.message ?? "Errore upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2">
        {value ? (
          <div className="relative inline-block">
            {accept.includes("image") ? (
              <img src={value} alt="" className="h-32 w-48 object-cover rounded-md border border-border" />
            ) : (
              <a href={value} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-md border border-border text-sm hover:bg-muted">
                Apri file caricato →
              </a>
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground grid place-items-center"
              title="Rimuovi"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-border cursor-pointer hover:bg-muted text-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? "Caricamento…" : "Carica file"}
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
