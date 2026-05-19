"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const maxImageSize = 5 * 1024 * 1024;

export function ImageAssetField({
  name,
  label,
  help,
  value,
  folder
}: {
  name: string;
  label: string;
  help: string;
  value?: string | null;
  folder: string;
}) {
  const inputId = useId();
  const [url, setUrl] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Seleccioná un archivo de imagen.");
      return;
    }

    if (file.size > maxImageSize) {
      setError("La imagen no puede superar los 5MB.");
      return;
    }

    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, file, {
        cacheControl: "31536000",
        upsert: false
      });

      if (uploadError) {
        console.error("Image upload failed", uploadError);
        setError("No pudimos subir la imagen. Verificá permisos de Storage.");
        return;
      }

      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (uploadError) {
      console.error("Image upload failed", uploadError);
      setError("No pudimos subir la imagen. Intentá nuevamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-black/8 bg-white p-4 lg:p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-black/8 bg-field-50 sm:w-40">
          {url ? (
            <Image src={url} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full place-items-center text-sm font-semibold text-ink/45">Sin imagen</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">{label}</span>
            <input
              name={name}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="admin-input"
              placeholder="https://..."
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-ink/50">{help}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor={inputId}
          className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-field-50 lg:py-2"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <ImageUp size={16} />}
          {uploading ? "Subiendo..." : "Subir imagen"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadFile(file);
            event.target.value = "";
          }}
        />
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
