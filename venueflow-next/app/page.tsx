import { CheckInStatus, EventStatus, ReservationStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatDateTime,
  getEventStatusClass,
  getEventStatusLabel,
} from "@/lib/formatters";

export default async function DashboardPage() {
  const now = new Date();
  const [
    totalSpaces,
    totalReservations,
    totalEvents,
    totalAttendees,
    totalCheckedIn,
    upcomingReservations,
    upcomingEvents,
    eventsForRanking,
    reservationsBySpace,
    spaces,
  ] = await Promise.all([
    prisma.space.count(),
    prisma.reservation.count(),
    prisma.event.count(),
    prisma.eventAttendee.count(),
    prisma.checkIn.count({ where: { status: CheckInStatus.CHECKED_IN } }),
    prisma.reservation.findMany({
      where: {
        startDateTime: { gte: now },
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
      include: { space: true },
      orderBy: { startDateTime: "asc" },
      take: 4,
    }),
    prisma.event.findMany({
      where: {
        startDateTime: { gte: now },
        status: { in: [EventStatus.DRAFT, EventStatus.PUBLISHED] },
      },
      include: {
        space: true,
        _count: { select: { attendees: true } },
      },
      orderBy: { startDateTime: "asc" },
      take: 4,
    }),
    prisma.event.findMany({
      include: {
        space: true,
        _count: { select: { attendees: true } },
      },
      take: 20,
    }),
    prisma.reservation.groupBy({
      by: ["spaceId"],
      _count: { spaceId: true },
      orderBy: { _count: { spaceId: "desc" } },
      take: 5,
    }),
    prisma.space.findMany({
      select: { id: true, name: true, capacity: true },
    }),
  ]);

  const spaceNameById = new Map(spaces.map((space) => [space.id, space.name]));
  const topEvents = eventsForRanking
    .sort((a, b) => b._count.attendees - a._count.attendees)
    .slice(0, 4);

  const stats = [
    { label: "Espacios", value: totalSpaces },
    { label: "Reservaciones", value: totalReservations },
    { label: "Eventos", value: totalEvents },
    { label: "Asistentes", value: totalAttendees },
    { label: "Check-ins", value: totalCheckedIn },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm lg:grid-cols-[1.5fr_1fr] lg:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Panel principal
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Operación completa de VenueFlow
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Métricas reales de espacios, reservaciones, eventos, asistentes y check-ins
            conectadas a PostgreSQL.
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-start gap-3 lg:justify-end">
          <Link
            href="/reservations/new"
            className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            Nueva reservación
          </Link>
          <Link
            href="/events/new"
            className="rounded-lg bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Nuevo evento
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight">Próximas reservaciones</h2>
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
                  <h3 className="font-black">{reservation.title}</h3>
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

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight">Próximos eventos</h2>
            <Link href="/events" className="text-sm font-bold text-blue-700">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No hay próximos eventos activos.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-black">{event.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getEventStatusClass(
                        event.status,
                      )}`}
                    >
                      {getEventStatusLabel(event.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {event.space.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDateTime(event.startDateTime)} · {event._count.attendees} asistentes
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Espacios más usados</h2>
          <div className="mt-5 space-y-3">
            {reservationsBySpace.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Aún no hay uso registrado por espacio.
              </p>
            ) : (
              reservationsBySpace.map((item) => (
                <div key={item.spaceId} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{spaceNameById.get(item.spaceId)}</p>
                    <p className="text-sm font-black text-blue-700">
                      {item._count.spaceId} reservas
                    </p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.min(item._count.spaceId * 20, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Eventos con más asistentes</h2>
          <div className="mt-5 space-y-3">
            {topEvents.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Aún no hay eventos registrados.
              </p>
            ) : (
              topEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{event.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{event.space.name}</p>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black">
                      {event._count.attendees}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
