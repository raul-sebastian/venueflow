import { EventStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatDateTime,
  getEventStatusClass,
  getEventStatusLabel,
} from "@/lib/formatters";
import { cancelEvent, registerEventAttendee } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    registered?: string;
    cancelled?: string;
    error?: string;
  }>;
};

export default async function EventDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      space: true,
      organizer: true,
      attendees: {
        include: { checkIn: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const usedCapacity = event.attendees.length;
  const availableCapacity = Math.max(event.capacity - usedCapacity, 0);
  const pendingCheckIns = event.attendees.filter(
    (attendee) => attendee.checkIn?.status === "PENDING",
  ).length;
  const completedCheckIns = event.attendees.filter(
    (attendee) => attendee.checkIn?.status === "CHECKED_IN",
  ).length;
  const canRegister =
    event.status !== EventStatus.CANCELLED && event.status !== EventStatus.COMPLETED;
  const canCancel = event.status !== EventStatus.COMPLETED;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/events" className="text-sm font-bold text-blue-700">
              Volver a eventos
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">{event.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getEventStatusClass(
                  event.status,
                )}`}
              >
                {getEventStatusLabel(event.status)}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-slate-600">
              {event.description ?? "Sin descripción registrada."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/events/${event.id}/check-in`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Gestionar check-in
            </Link>
            {canCancel ? (
              <form action={cancelEvent}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                >
                  Cancelar evento
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      {query?.created ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Evento creado correctamente.
        </div>
      ) : null}

      {query?.registered ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Asistente registrado correctamente.
        </div>
      ) : null}

      {query?.cancelled ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Evento cancelado correctamente.
        </div>
      ) : null}

      {query?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {query.error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Información del evento</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Espacio</dt>
              <dd className="mt-1 font-black">{event.space.name}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Organizador</dt>
              <dd className="mt-1 font-black">{event.organizer.name}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Inicio</dt>
              <dd className="mt-1 font-black">{formatDateTime(event.startDateTime)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-500">Fin</dt>
              <dd className="mt-1 font-black">{formatDateTime(event.endDateTime)}</dd>
            </div>
          </dl>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Cupo</h2>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-black">{event.capacity}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">Usado</p>
              <p className="mt-1 text-2xl font-black">{usedCapacity}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">Libre</p>
              <p className="mt-1 text-2xl font-black">{availableCapacity}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Asistentes registrados", value: usedCapacity },
          { label: "Check-ins pendientes", value: pendingCheckIns },
          { label: "Check-ins realizados", value: completedCheckIns },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-black">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Asistentes registrados</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {event.attendees.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Todavía no hay asistentes registrados.
              </p>
            ) : (
              event.attendees.map((attendee) => (
                <div key={attendee.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">{attendee.fullName}</p>
                    <p className="text-sm text-slate-500">{attendee.email}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    {formatDateTime(attendee.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Registrar asistente</h2>
          {canRegister ? (
            <form action={registerEventAttendee} className="mt-5 grid gap-4">
              <input type="hidden" name="eventId" value={event.id} />
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Nombre completo</span>
                <input
                  name="fullName"
                  required
                  className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Correo</span>
                <input
                  name="email"
                  required
                  type="email"
                  className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Registrar
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              Este evento no acepta nuevos asistentes.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}
