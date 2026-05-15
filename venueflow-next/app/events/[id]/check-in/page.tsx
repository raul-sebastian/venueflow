import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureCheckInsForEvent } from "@/lib/check-in";
import {
  formatDateTime,
  getCheckInStatusClass,
  getCheckInStatusLabel,
} from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function shortToken(token: string) {
  return `${token.slice(0, 8)}...${token.slice(-8)}`;
}

export default async function EventCheckInPage({ params }: PageProps) {
  const { id } = await params;

  await ensureCheckInsForEvent(prisma, id);

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      space: true,
      attendees: {
        include: { checkIn: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href={`/events/${event.id}`} className="text-sm font-bold text-blue-700">
          Volver al evento
        </Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Check-in
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{event.name}</h1>
        <p className="mt-2 text-slate-600">
          {event.space.name} · {formatDateTime(event.startDateTime)}
        </p>
      </section>

      <section className="grid gap-5">
        {event.attendees.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black">No hay asistentes registrados</h2>
            <p className="mt-2 text-slate-600">
              Registra asistentes en el detalle del evento para generar enlaces de check-in.
            </p>
          </div>
        ) : (
          event.attendees.map((attendee) => {
            const checkIn = attendee.checkIn;
            const checkInUrl = checkIn ? `/check-in/${checkIn.token}` : "#";

            return (
              <article
                key={attendee.id}
                className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_280px]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">{attendee.fullName}</h2>
                    {checkIn ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getCheckInStatusClass(
                          checkIn.status,
                        )}`}
                      >
                        {getCheckInStatusLabel(checkIn.status)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{attendee.email}</p>

                  {checkIn ? (
                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-500">Código de acceso</p>
                        <p className="mt-1 font-mono font-black text-slate-950">
                          {shortToken(checkIn.token)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="font-semibold text-slate-500">Enlace funcional</p>
                        <Link href={checkInUrl} className="mt-1 block font-bold text-blue-700">
                          Abrir check-in
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                  <div className="mx-auto grid size-32 place-items-center rounded-lg bg-white font-mono text-xs font-black uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                    QR
                    <br />
                    Placeholder
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    QR real pendiente. El enlace/token ya valida asistencia.
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
