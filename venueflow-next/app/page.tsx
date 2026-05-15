import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatMoney(value: unknown) {
  return `$${Number(value).toLocaleString("es-MX")} MXN/h`;
}

export default async function DashboardPage() {
  const [totalSpaces, activeSpaces, capacityAggregate, totalReservations, recentSpaces] =
    await Promise.all([
      prisma.space.count(),
      prisma.space.count({ where: { isActive: true } }),
      prisma.space.aggregate({ _sum: { capacity: true } }),
      prisma.reservation.count(),
      prisma.space.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const stats = [
    { label: "Total de espacios", value: totalSpaces },
    { label: "Espacios activos", value: activeSpaces },
    { label: "Capacidad total", value: capacityAggregate._sum.capacity ?? 0 },
    { label: "Reservaciones", value: totalReservations },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm lg:grid-cols-[1.5fr_1fr] lg:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Panel principal
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Control de espacios y reservaciones
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Primera versión conectada a PostgreSQL para consultar espacios, revisar
            capacidad instalada y registrar nuevas reservaciones con validación de
            horarios.
          </p>
        </div>
        <div className="flex items-end justify-start lg:justify-end">
          <Link
            href="/reservations/new"
            className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            Nueva reservación
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight">Espacios recientes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Datos cargados desde PostgreSQL mediante Prisma.
            </p>
          </div>
          <Link href="/spaces" className="text-sm font-bold text-blue-700 hover:text-blue-900">
            Ver todos
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {recentSpaces.map((space) => (
            <article key={space.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{space.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{space.location}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {space.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-md bg-slate-100 px-2.5 py-1">{space.type}</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1">
                  {space.capacity} personas
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1">
                  {formatMoney(space.pricePerHour)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
