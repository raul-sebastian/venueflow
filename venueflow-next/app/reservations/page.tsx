import { ReservationStatus } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateTime,
  getReservationStatusClass,
  getReservationStatusLabel,
} from "@/lib/formatters";
import { cancelReservation } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    created?: string;
    cancelled?: string;
    error?: string;
  }>;
};

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reservations = await prisma.reservation.findMany({
    include: {
      space: true,
      user: true,
    },
    orderBy: [{ startDateTime: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Reservaciones
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Agenda de espacios</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Consulta tus reservaciones y cancela aquellas que todavía no estén
            completadas.
          </p>
        </div>
        <Link
          href="/reservations/new"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Nueva reservación
        </Link>
      </section>

      {params?.created ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Reservación creada correctamente.
        </div>
      ) : null}

      {params?.cancelled ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Reservación cancelada correctamente.
        </div>
      ) : null}

      {params?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {params.error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {reservations.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-black">Todavía no hay reservaciones</h2>
            <p className="mt-2 text-slate-600">
              Crea la primera reservación para comenzar a medir ocupación.
            </p>
            <Link
              href="/reservations/new"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Crear reservación
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reservations.map((reservation) => {
              const canCancel = reservation.status !== ReservationStatus.COMPLETED;

              return (
                <article
                  key={reservation.id}
                  className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-950">
                        {reservation.title ?? "Reservación sin título"}
                      </h2>
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
                      Solicitada por {reservation.user.name}
                    </p>
                  </div>

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500">Inicio</dt>
                      <dd className="mt-1 font-bold text-slate-800">
                        {formatDateTime(reservation.startDateTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Fin</dt>
                      <dd className="mt-1 font-bold text-slate-800">
                        {formatDateTime(reservation.endDateTime)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Asistentes</dt>
                      <dd className="mt-1 font-bold text-slate-800">
                        {reservation.attendeesCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500">Total</dt>
                      <dd className="mt-1 font-bold text-slate-800">
                        {formatCurrency(reservation.totalPrice)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex justify-start lg:justify-end">
                    {canCancel ? (
                      <form action={cancelReservation}>
                        <input type="hidden" name="reservationId" value={reservation.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500">
                        Cerrada
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
