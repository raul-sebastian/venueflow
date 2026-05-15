import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatMoney(value: unknown) {
  return `$${Number(value).toLocaleString("es-MX")} MXN/h`;
}

function formatSpaceType(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

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
            Consulta los espacios disponibles registrados en PostgreSQL para
            coworking, reuniones y eventos.
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
        {spaces.map((space) => (
          <article
            key={space.id}
            className="flex min-h-72 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
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
                {space.description ?? "Sin descripción registrada."}
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-500">Capacidad</dt>
                <dd className="mt-1 font-black text-slate-950">{space.capacity} personas</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-500">Precio</dt>
                <dd className="mt-1 font-black text-slate-950">
                  {formatMoney(space.pricePerHour)}
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
