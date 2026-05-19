"use client";

import { useState } from "react";
import { ChevronDown, Edit3, LayoutDashboard, Plus } from "lucide-react";
import { saveCourt } from "@/actions/admin";
import { EmptyState } from "@/components/EmptyState";
import { ImageAssetField } from "@/components/admin/ImageAssetField";
import { SubmitButton } from "@/components/SubmitButton";
import type { Court } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

export function AdminCourtsSection({ courts }: { courts: Court[] }) {
  const [newOpen, setNewOpen] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);

  return (
    <section id="canchas" className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft scroll-mt-24 lg:p-4">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between lg:mb-4">
        <div>
          <p className="font-semibold text-field-700">Canchas</p>
          <h2 className="text-2xl font-bold text-ink lg:text-xl">Gestión de canchas</h2>
          <p className="mt-1 text-sm leading-6 text-ink/58">Agregá canchas nuevas o editá datos, precios y estado de publicación.</p>
        </div>
        <span className="rounded-full bg-field-50 px-3 py-1.5 text-sm font-semibold text-field-700">{courts.length} canchas</span>
      </div>

      <article className="mb-5 rounded-2xl border border-field-100 bg-field-50 p-4 lg:mb-4 lg:p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink lg:text-base">Agregar nueva cancha</h3>
            <p className="mt-1 text-sm text-ink/58">Cargá una cancha cuando ya esté lista para recibir reservas.</p>
          </div>
          <button
            type="button"
            onClick={() => setNewOpen((value) => !value)}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-field-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-field-700 lg:py-2"
          >
            <Plus size={16} />
            {newOpen ? "Ocultar formulario" : "Agregar cancha"}
          </button>
        </div>
        {newOpen ? (
          <div className="mt-4 rounded-2xl border border-field-100 bg-white p-4 lg:p-3.5">
            <CourtForm />
          </div>
        ) : null}
      </article>

      {courts.length ? (
        <div className="grid gap-4">
          {courts.map((court) => {
            const isEditing = editingCourtId === court.id;
            return (
              <article className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-4" key={court.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between lg:gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-ink lg:text-base">{court.name}</h3>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", court.is_active ? "bg-field-50 text-field-700" : "bg-stone-100 text-stone-600")}>
                        {court.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink/58">
                      {court.sport_type} · {currency(court.price_per_hour)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCourtId(isEditing ? null : court.id)}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-field-50 lg:py-2"
                  >
                    <Edit3 size={16} />
                    Editar
                    <ChevronDown className={cn("transition", isEditing ? "rotate-180" : "")} size={16} />
                  </button>
                </div>
                {isEditing ? (
                  <div className="mt-4 border-t border-black/5 pt-4 lg:pt-3">
                    <CourtForm court={court} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={LayoutDashboard} title="Sin canchas cargadas" text="Cuando cargues canchas en Supabase aparecerán en esta sección." />
      )}
    </section>
  );
}

function CourtForm({ court }: { court?: Court }) {
  const isEditing = Boolean(court);

  return (
    <form action={saveCourt} className="grid gap-4 lg:gap-3.5">
      {court ? <input type="hidden" name="id" value={court.id} /> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <AdminField label="Nombre">
          <input name="name" defaultValue={court?.name ?? ""} className="admin-input" required />
        </AdminField>
        <AdminField label="Slug" help="Texto usado en la URL. Ejemplo: cancha-norte">
          <input name="slug" defaultValue={court?.slug ?? ""} className="admin-input" placeholder="cancha-norte" required />
        </AdminField>
        <AdminField label="Deporte">
          <input name="sport_type" defaultValue={court?.sport_type ?? ""} className="admin-input" placeholder="Fútbol 5" required />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Descripción">
          <textarea name="description" defaultValue={court?.description ?? ""} className="admin-input min-h-24" />
        </AdminField>
        <ImageAssetField
          name="image_url"
          label="Imagen"
          value={court?.image_url}
          folder="courts"
          help="Se usa en la card pública de la cancha. Pegá una URL o subí una imagen local."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminField label="Superficie">
          <input name="surface" defaultValue={court?.surface ?? ""} className="admin-input" />
        </AdminField>
        <AdminField label="Ubicación">
          <input name="location" defaultValue={court?.location ?? ""} className="admin-input" />
        </AdminField>
        <AdminField label="Precio por hora">
          <input name="price_per_hour" type="number" min="0" defaultValue={court?.price_per_hour ?? 0} className="admin-input" required />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
        <AdminField label="Cantidad de jugadores">
          <input name="player_count" type="number" min="0" defaultValue={court?.player_count ?? ""} className="admin-input" />
        </AdminField>
        <AdminField label="Duración del turno" help="En minutos. Ejemplo: 60">
          <input name="slot_duration_minutes" type="number" min="1" defaultValue={court?.slot_duration_minutes ?? 60} className="admin-input" required />
        </AdminField>
        <label className="flex items-center gap-2 rounded-xl border border-black/8 bg-white px-3 py-3 text-sm font-semibold text-ink">
          <input name="is_active" type="checkbox" defaultChecked={court?.is_active ?? true} className="size-4 accent-field-600" />
          Activa
        </label>
        <SubmitButton pendingText="Guardando..." className="bg-field-600 px-4 py-3 text-white hover:bg-field-700 lg:py-2.5">
          {isEditing ? "Guardar cancha" : "Crear cancha"}
        </SubmitButton>
      </div>
    </form>
  );
}

function AdminField({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {help ? <span className="block text-xs leading-5 text-ink/50">{help}</span> : null}
    </label>
  );
}
