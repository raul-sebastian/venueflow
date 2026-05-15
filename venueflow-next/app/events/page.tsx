import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatDateTime,
  getEventStatusClass,
  getEventStatusLabel,
} from "@/lib/formatters";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const events = await prisma.event.findMany({
    include: {
      space: true,
      _count: {
        select: { attendees: true },
      },
    },
    orderBy: [{ startDateTime: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Eventos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Agenda de eventos</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Administra eventos reales, asistentes y cupos conectados a PostgreSQL.
          </p>
        </div>
        <Link
          href="/events/new"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Nuevo evento
        </Link>
      </section>

      {params?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {params.error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-black">Todavía no hay eventos</h2>
            <p className="mt-2 text-slate-600">
              Crea el primer evento para comenzar a registrar asistentes.
            </p>
            <Link
              href="/events/new"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Crear evento
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((event) => (
              <article
                key={event.id}
                className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-950">{event.name}</h2>
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
                    {event.description ?? "Sin descripción registrada."}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">Inicio</dt>
                    <dd className="mt-1 font-bold text-slate-800">
                      {formatDateTime(event.startDateTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Fin</dt>
                    <dd className="mt-1 font-bold text-slate-800">
                      {formatDateTime(event.endDateTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Capacidad</dt>
                    <dd className="mt-1 font-bold text-slate-800">{event.capacity}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Asistentes</dt>
                    <dd className="mt-1 font-bold text-slate-800">
                      {event._count.attendees}
                    </dd>
                  </div>
                </dl>

                <div className="flex justify-start lg:justify-end">
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
