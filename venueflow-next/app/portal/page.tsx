import { EventStatus } from "@prisma/client";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDateTime, formatSpaceType } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function PortalPage() {
  const user = await requireUser();
  const now = new Date();
  const [reservations, events, spaces] = await Promise.all([
    prisma.reservation.findMany({
      where: { userId: user.id },
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
    prisma.space.findMany({
      where: { isActive: true },
      orderBy: [{ capacity: "asc" }, { name: "asc" }],
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm lg:grid-cols-[1.4fr_0.8fr] lg:p-8">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Inicio
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Hola, {user.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Explora espacios disponibles, revisa tus reservaciones y encuentra el
            lugar ideal para tu siguiente actividad.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3 lg:justify-end">
          <Link
            href="/recommendations"
            className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            Encontrar espacio ideal
          </Link>
          <Link
            href="/reservations/new"
            className="rounded-lg bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Reservar
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Mis próximas reservaciones</h2>
            <Link href="/reservations" className="text-sm font-bold text-blue-700">
              Ver agenda
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {reservations.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Todavía no tienes reservaciones.
              </p>
            ) : (
              reservations.map((reservation) => (
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
            <h2 className="text-xl font-black">Eventos disponibles</h2>
            <Link href="/events" className="text-sm font-bold text-blue-700">
              Ver eventos
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {events.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No hay eventos próximos disponibles.
              </p>
            ) : (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <h3 className="font-black">{event.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {event.space.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDateTime(event.startDateTime)} · {event._count.attendees} inscritos
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Espacios destacados</h2>
          <Link href="/spaces" className="text-sm font-bold text-blue-700">
            Explorar espacios
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space, index) => (
            <article key={space.id} className="overflow-hidden rounded-xl border border-slate-200">
              <div
                className={`h-28 ${
                  [
                    "bg-gradient-to-br from-blue-500 to-cyan-400",
                    "bg-gradient-to-br from-violet-500 to-fuchsia-400",
                    "bg-gradient-to-br from-emerald-500 to-teal-400",
                    "bg-gradient-to-br from-amber-500 to-orange-400",
                    "bg-gradient-to-br from-slate-700 to-blue-500",
                    "bg-gradient-to-br from-rose-500 to-pink-400",
                  ][index % 6]
                }`}
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-blue-700">
                  {formatSpaceType(space.type)}
                </p>
                <h3 className="mt-1 font-black">{space.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {space.capacity} personas · {formatCurrency(space.pricePerHour, "MXN/h")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
