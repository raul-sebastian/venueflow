import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatSpaceType } from "@/lib/formatters";

const coverClasses = [
  "bg-gradient-to-br from-blue-500 to-cyan-400",
  "bg-gradient-to-br from-violet-500 to-fuchsia-400",
  "bg-gradient-to-br from-emerald-500 to-teal-400",
  "bg-gradient-to-br from-amber-500 to-orange-400",
  "bg-gradient-to-br from-slate-700 to-blue-500",
  "bg-gradient-to-br from-rose-500 to-pink-400",
];

export default async function SpacesPage() {
  const spaces = await prisma.space.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Espacios</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Explora espacios disponibles para coworking, reuniones, talleres y eventos.
          </p>
        </div>
        <Link
          href="/reservations/new"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Reservar espacio
        </Link>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {spaces.map((space, index) => (
          <article
            key={space.id}
            className="flex min-h-80 flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className={`h-28 ${coverClasses[index % coverClasses.length]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{space.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {formatSpaceType(space.type)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    space.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {space.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600">
                {space.description ?? "Espacio disponible para actividades y reservas."}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 p-5 pt-0 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-500">Capacidad</dt>
                <dd className="mt-1 font-black text-slate-950">{space.capacity} personas</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-500">Precio</dt>
                <dd className="mt-1 font-black text-slate-950">
                  {formatCurrency(space.pricePerHour, "MXN/h")}
                </dd>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-500">Ubicación</dt>
                <dd className="mt-1 font-black text-slate-950">{space.location}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
