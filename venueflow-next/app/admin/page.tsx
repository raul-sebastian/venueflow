import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [spaces, reservations] = await Promise.all([
    prisma.space.count(),
    prisma.reservation.count(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Panel admin</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Placeholder visual para la futura gestión de espacios, eventos,
          reservaciones, QR y métricas avanzadas.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Espacios registrados</p>
          <p className="mt-3 text-3xl font-black">{spaces}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Reservaciones registradas</p>
          <p className="mt-3 text-3xl font-black">{reservations}</p>
        </article>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-xl font-black">Siguientes módulos</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["CRUD de espacios", "Gestión de eventos", "Check-in QR"].map((item) => (
            <div key={item} className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-700">
              {item}
            </div>
          ))}
        </div>
        <Link
          href="/reservations/new"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Crear reservación
        </Link>
      </section>
    </div>
  );
}
