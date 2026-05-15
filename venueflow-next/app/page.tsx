import { ReservationStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateTime,
  getReservationStatusClass,
  getReservationStatusLabel,
} from "@/lib/formatters";

export default async function DashboardPage() {
  const now = new Date();
  const [
    totalSpaces,
    activeSpaces,
    capacityAggregate,
    totalReservations,
    recentSpaces,
    recentReservations,
    upcomingReservations,
    reservationsByStatus,
  ] = await Promise.all([
    prisma.space.count(),
    prisma.space.count({ where: { isActive: true } }),
    prisma.space.aggregate({ _sum: { capacity: true } }),
    prisma.reservation.count(),
    prisma.space.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.reservation.findMany({
      include: { space: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.reservation.findMany({
      where: {
        startDateTime: { gte: now },
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
      include: { space: true },
      orderBy: { startDateTime: "asc" },
      take: 4,
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusCount = new Map(
    reservationsByStatus.map((item) => [item.status, item._count.status]),
  );

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
            Dashboard conectado a PostgreSQL para consultar ocupación, próximas
            reservas y actividad reciente de VenueFlow.
          </p>
        </div>
        <div className="flex items-end justify-start gap-3 lg:justify-end">
          <Link
            href="/reservations"
            className="rounded-lg bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Ver agenda
          </Link>
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

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Reservaciones por estado</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.values(ReservationStatus).map((status) => (
              <div key={status} className="rounded-lg bg-slate-50 p-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getReservationStatusClass(
                    status,
                  )}`}
                >
                  {getReservationStatusLabel(status)}
                </span>
                <p className="mt-3 text-3xl font-black">{statusCount.get(status) ?? 0}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">Próximas reservaciones</h2>
              <p className="mt-1 text-sm text-slate-500">
                Pendientes o confirmadas desde este momento.
              </p>
            </div>
            <Link href="/reservations" className="text-sm font-bold text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcomingReservations.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No hay próximas reservaciones activas.
              </p>
            ) : (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black">{reservation.title}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getReservationStatusClass(
                        reservation.status,
                      )}`}
                    >
                      {getReservationStatusLabel(reservation.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {reservation.space.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDateTime(reservation.startDateTime)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Reservaciones recientes</h2>
          <div className="mt-5 space-y-3">
            {recentReservations.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Aún no hay reservaciones registradas.
              </p>
            ) : (
              recentReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black">{reservation.title}</h3>
                    <span className="text-sm font-bold text-slate-600">
                      {formatCurrency(reservation.totalPrice)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {reservation.space.name} · {formatDateTime(reservation.startDateTime)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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

          <div className="mt-5 space-y-3">
            {recentSpaces.map((space) => (
              <article key={space.id} className="rounded-lg border border-slate-100 p-4">
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
                    {formatCurrency(space.pricePerHour, "MXN/h")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
