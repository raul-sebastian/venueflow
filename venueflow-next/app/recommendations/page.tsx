import Link from "next/link";
import { formatCurrency, formatSpaceType } from "@/lib/formatters";
import {
  getAssistantSummary,
  recommendSpaces,
  type RecommendationInput,
  type UseCase,
} from "@/lib/recommendations";

type PageProps = {
  searchParams?: Promise<{
    attendees?: string;
    startDateTime?: string;
    endDateTime?: string;
    useCase?: UseCase;
    maxPricePerHour?: string;
    notes?: string;
  }>;
};

const useCases: Array<{ value: UseCase; label: string }> = [
  { value: "reunion", label: "Reunión" },
  { value: "coworking", label: "Coworking" },
  { value: "conferencia", label: "Conferencia" },
  { value: "taller", label: "Taller" },
  { value: "presentacion", label: "Presentación" },
  { value: "otro", label: "Otro" },
];

function getInput(params: Awaited<PageProps["searchParams"]>) {
  const attendees = Number(params?.attendees ?? 0);
  const maxPrice = params?.maxPricePerHour ? Number(params.maxPricePerHour) : undefined;

  return {
    attendees,
    startDateTime: new Date(params?.startDateTime ?? ""),
    endDateTime: new Date(params?.endDateTime ?? ""),
    useCase: params?.useCase ?? "reunion",
    maxPricePerHour: Number.isFinite(maxPrice) ? maxPrice : undefined,
    notes: params?.notes?.trim() ?? "",
  } satisfies RecommendationInput;
}

function hasSearch(params: Awaited<PageProps["searchParams"]>) {
  return Boolean(params?.attendees || params?.startDateTime || params?.endDateTime);
}

export default async function RecommendationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const input = getInput(params);
  const shouldRecommend = hasSearch(params);
  const result = shouldRecommend
    ? await recommendSpaces(input)
    : { error: null, recommendations: [] };
  const assistantSummary = shouldRecommend
    ? getAssistantSummary(input, result.recommendations)
    : "Cuéntame cuántas personas asistirán, cuándo necesitas el espacio y qué tipo de actividad realizarás. Analizaré capacidad, disponibilidad, precio y tipo de actividad para sugerirte las mejores opciones.";

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Recomendador
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Asistente VenueFlow</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Encuentra el espacio ideal para tu actividad según personas, horario,
          presupuesto y necesidades.
        </p>

        <form className="mt-6 grid gap-4" method="GET">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Número de personas</span>
            <input
              name="attendees"
              required
              min={1}
              type="number"
              defaultValue={params?.attendees ?? ""}
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Inicio</span>
              <input
                name="startDateTime"
                required
                type="datetime-local"
                defaultValue={params?.startDateTime ?? ""}
                className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Fin</span>
              <input
                name="endDateTime"
                required
                type="datetime-local"
                defaultValue={params?.endDateTime ?? ""}
                className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Tipo de actividad</span>
            <select
              name="useCase"
              defaultValue={params?.useCase ?? "reunion"}
              className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {useCases.map((useCase) => (
                <option key={useCase.value} value={useCase.value}>
                  {useCase.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">
              Presupuesto máximo por hora
            </span>
            <input
              name="maxPricePerHour"
              min={1}
              type="number"
              defaultValue={params?.maxPricePerHour ?? ""}
              placeholder="Opcional"
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Equipo requerido o notas</span>
            <textarea
              name="notes"
              rows={4}
              defaultValue={params?.notes ?? ""}
              placeholder="Proyector, audio, distribución, etc."
              className="resize-none rounded-lg border border-slate-300 px-3 py-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Recomendar espacios
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <article className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Asistente VenueFlow
          </p>
          <h2 className="mt-2 text-2xl font-black text-blue-950">
            Encuentra el espacio ideal
          </h2>
          <p className="mt-3 leading-7 text-blue-950">{assistantSummary}</p>
        </article>

        {result.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {result.error}
          </div>
        ) : null}

        {shouldRecommend && !result.error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight">Espacios recomendados</h2>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                {result.recommendations.length} resultado(s)
              </span>
            </div>

            {result.recommendations.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <h3 className="text-xl font-black">Sin espacios compatibles</h3>
                <p className="mt-2 text-slate-600">
                  Intenta otro horario, un presupuesto mayor o menos asistentes.
                </p>
              </div>
            ) : (
              result.recommendations.map((recommendation, index) => (
                <article
                  key={recommendation.space.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div
                    className={`h-24 ${
                      [
                        "bg-gradient-to-br from-blue-500 to-cyan-400",
                        "bg-gradient-to-br from-violet-500 to-fuchsia-400",
                        "bg-gradient-to-br from-emerald-500 to-teal-400",
                      ][index % 3]
                    }`}
                  />
                  <div className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-700">
                          {formatSpaceType(recommendation.space.type)}
                        </p>
                        <h3 className="mt-1 text-2xl font-black">
                          {recommendation.space.name}
                        </h3>
                        <p className="mt-2 text-slate-600">
                          {recommendation.space.description ?? "Espacio disponible."}
                        </p>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                        Disponible
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="font-semibold text-slate-500">Capacidad</dt>
                        <dd className="mt-1 font-black">
                          {recommendation.space.capacity} personas
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="font-semibold text-slate-500">Precio</dt>
                        <dd className="mt-1 font-black">
                          {formatCurrency(recommendation.space.pricePerHour, "MXN/h")}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="font-semibold text-slate-500">Ubicación</dt>
                        <dd className="mt-1 font-black">{recommendation.space.location}</dd>
                      </div>
                    </dl>

                    <ul className="mt-5 grid gap-2 text-sm text-slate-600">
                      {recommendation.reasons.map((reason) => (
                        <li key={reason} className="rounded-lg bg-slate-50 px-3 py-2">
                          {reason}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/reservations/new?spaceId=${recommendation.space.id}`}
                      className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Reservar este espacio
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
