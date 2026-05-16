import { CheckInStatus, EventStatus, ReservationStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  formatDateTime,
  getEventStatusLabel,
  getReservationStatusLabel,
} from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

function percent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export default async function AdminPage() {
  const user = await requireUser();

  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Acceso restringido
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Esta seccion es solo para administradores
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Tu rol actual es {user.role}. Puedes seguir usando el inicio, espacios,
          reservaciones y eventos.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const now = new Date();
  const [
    totalSpaces,
    totalReservations,
    totalEvents,
    totalAttendees,
    totalCheckIns,
    activeReservations,
    upcomingEvents,
    latestReservations,
    latestEvents,
    spacesWithCounts,
    reservationsByStatus,
    eventsByStatus,
  ] = await Promise.all([
    prisma.space.count(),
    prisma.reservation.count(),
    prisma.event.count(),
    prisma.eventAttendee.count(),
    prisma.checkIn.count({ where: { status: CheckInStatus.CHECKED_IN } }),
    prisma.reservation.count({
      where: {
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
    }),
    prisma.event.count({
      where: {
        startDateTime: { gte: now },
        status: { in: [EventStatus.DRAFT, EventStatus.PUBLISHED] },
      },
    }),
    prisma.reservation.findMany({
      include: { space: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.event.findMany({
      include: {
        space: true,
        _count: { select: { attendees: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.space.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            reservations: true,
            events: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.event.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const metrics = [
    { label: "Espacios", value: totalSpaces },
    { label: "Reservaciones", value: totalReservations },
    { label: "Eventos", value: totalEvents },
    { label: "Asistentes", value: totalAttendees },
    { label: "Check-ins", value: totalCheckIns },
    { label: "Reservas activas", value: activeReservations },
    { label: "Eventos proximos", value: upcomingEvents },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administracion
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Panel admin</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Resumen de actividad, ocupacion, eventos y validaciones de VenueFlow.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Ocupacion por espacio</h2>
          <div className="mt-5 space-y-4">
            {spacesWithCounts.map((space) => {
              const usage = space._count.reservations + space._count.events;
              const width = Math.min(usage * 20, 100);

              return (
                <div key={space.id} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{space.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {space._count.reservations} reservas - {space._count.events} eventos
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-700">{usage} usos</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Asistencia y check-ins</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Asistentes registrados</p>
              <p className="mt-2 text-3xl font-black">{totalAttendees}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Check-ins realizados</p>
              <p className="mt-2 text-3xl font-black">{totalCheckIns}</p>
            </div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-emerald-500"
              style={{ width: `${percent(totalCheckIns, totalAttendees)}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {percent(totalCheckIns, totalAttendees)}% de asistencia validada
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Reservaciones por estado</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.values(ReservationStatus).map((status) => {
              const count =
                reservationsByStatus.find((item) => item.status === status)?._count.status ?? 0;

              return (
                <div key={status} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {getReservationStatusLabel(status)}
                  </p>
                  <p className="mt-2 text-3xl font-black">{count}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Eventos por estado</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.values(EventStatus).map((status) => {
              const count = eventsByStatus.find((item) => item.status === status)?._count.status ?? 0;

              return (
                <div key={status} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {status === "DRAFT"
                      ? "Borrador"
                      : status === "PUBLISHED"
                        ? "Publicado"
                        : status === "CANCELLED"
                          ? "Cancelado"
                          : "Completado"}
                  </p>
                  <p className="mt-2 text-3xl font-black">{count}</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Ultimas reservaciones</h2>
            <Link href="/reservations" className="text-sm font-bold text-blue-700">
              Ver todas
            </Link>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {latestReservations.map((reservation) => (
              <div key={reservation.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black">{reservation.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {getReservationStatusLabel(reservation.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {reservation.space.name} - {reservation.user.name} -{" "}
                  {formatDateTime(reservation.startDateTime)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Ultimos eventos</h2>
            <Link href="/events" className="text-sm font-bold text-blue-700">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {latestEvents.map((event) => (
              <div key={event.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-black">{event.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {getEventStatusLabel(event.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {event.space.name} - {event._count.attendees} asistentes -{" "}
                  {formatDateTime(event.startDateTime)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
