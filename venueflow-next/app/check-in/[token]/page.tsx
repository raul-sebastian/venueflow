import { CheckInStatus } from "@prisma/client";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function CheckInTokenPage({ params }: PageProps) {
  const { token } = await params;
  const checkIn = await prisma.checkIn.findUnique({
    where: { token },
    include: {
      event: {
        include: { space: true },
      },
      eventAttendee: true,
    },
  });

  if (!checkIn || !checkIn.event || !checkIn.eventAttendee) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Código inválido
        </p>
        <h1 className="mt-3 text-3xl font-black">No encontramos este check-in</h1>
        <p className="mt-3 text-slate-600">
          Verifica que el enlace sea correcto o solicita un nuevo código al organizador.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Ir al dashboard
        </Link>
      </div>
    );
  }

  if (checkIn.status === CheckInStatus.CHECKED_IN) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-blue-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Check-in ya registrado
        </p>
        <h1 className="mt-3 text-3xl font-black">{checkIn.eventAttendee.fullName}</h1>
        <p className="mt-3 text-slate-600">
          Este código ya fue usado
          {checkIn.checkedInAt ? ` el ${formatDateTime(checkIn.checkedInAt)}` : ""}.
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {checkIn.event.name} · {checkIn.event.space.name}
        </p>
      </div>
    );
  }

  if (checkIn.status !== CheckInStatus.PENDING) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Código no disponible
        </p>
        <h1 className="mt-3 text-3xl font-black">Este check-in no está pendiente</h1>
        <p className="mt-3 text-slate-600">Estado actual: {checkIn.status}</p>
      </div>
    );
  }

  const updatedCheckIn = await prisma.checkIn.update({
    where: { id: checkIn.id },
    data: {
      status: CheckInStatus.CHECKED_IN,
      checkedInAt: new Date(),
    },
  });

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-700">
        OK
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Check-in confirmado
      </p>
      <h1 className="mt-3 text-3xl font-black">{checkIn.eventAttendee.fullName}</h1>
      <p className="mt-3 text-slate-600">
        Asistencia registrada para {checkIn.event.name}.
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        {checkIn.event.space.name} ·{" "}
        {updatedCheckIn.checkedInAt ? formatDateTime(updatedCheckIn.checkedInAt) : ""}
      </p>
    </div>
  );
}
