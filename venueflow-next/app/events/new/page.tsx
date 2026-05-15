import { EventStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters";
import { createEvent } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewEventPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const spaces = await prisma.space.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Eventos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Nuevo evento</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Crea eventos asociados a espacios reales con validación de cupo y
            disponibilidad.
          </p>
        </div>

        {params?.error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        <form action={createEvent} className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Nombre</span>
            <input
              name="name"
              required
              placeholder="Conferencia de innovación"
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Descripción</span>
            <textarea
              name="description"
              rows={4}
              placeholder="Descripción breve del evento."
              className="resize-none rounded-lg border border-slate-300 px-3 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Espacio</span>
            <select
              name="spaceId"
              required
              className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Selecciona un espacio</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} - {space.capacity} personas -{" "}
                  {formatCurrency(space.pricePerHour, "MXN/h")}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Inicio</span>
              <input
                name="startDateTime"
                required
                type="datetime-local"
                className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Fin</span>
              <input
                name="endDateTime"
                required
                type="datetime-local"
                className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Capacidad</span>
              <input
                name="capacity"
                required
                min={1}
                type="number"
                placeholder="40"
                className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Estado inicial</span>
              <select
                name="status"
                defaultValue={EventStatus.PUBLISHED}
                className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value={EventStatus.PUBLISHED}>Publicado</option>
                <option value={EventStatus.DRAFT}>Borrador</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/events"
              className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Ver eventos
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Crear evento
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Validaciones activas</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-lg bg-slate-50 p-3">Cupo menor o igual al espacio.</li>
            <li className="rounded-lg bg-slate-50 p-3">Fin posterior al inicio.</li>
            <li className="rounded-lg bg-slate-50 p-3">
              Sin traslape contra eventos o reservaciones activas.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="text-lg font-black text-blue-950">Organizador demo</h2>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            Mientras Auth.js llega después, los eventos se asocian a
            demo@venueflow.local.
          </p>
        </section>
      </aside>
    </div>
  );
}
