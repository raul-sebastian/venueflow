import { EventStatus, ReservationStatus } from "@prisma/client";

export function formatCurrency(value: unknown, suffix = "MXN") {
  if (value === null || value === undefined) {
    return "Sin total";
  }

  return `$${Number(value).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${suffix}`;
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatSpaceType(type: string) {
  const labels: Record<string, string> = {
    COWORKING: "Coworking",
    MEETING_ROOM: "Sala de reuniones",
    EVENT_HALL: "Salón de eventos",
    CLASSROOM: "Aula",
    AUDITORIUM: "Auditorio",
    OTHER: "Otro",
  };

  return labels[type] ?? type;
}

export function getReservationStatusLabel(status: ReservationStatus) {
  const labels: Record<ReservationStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
  };

  return labels[status];
}

export function getReservationStatusClass(status: ReservationStatus) {
  const classes: Record<ReservationStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
    COMPLETED: "bg-blue-50 text-blue-700 ring-blue-200",
  };

  return classes[status];
}

export function getEventStatusLabel(status: EventStatus) {
  const labels: Record<EventStatus, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    CANCELLED: "Cancelado",
    COMPLETED: "Completado",
  };

  return labels[status];
}

export function getEventStatusClass(status: EventStatus) {
  const classes: Record<EventStatus, string> = {
    DRAFT: "bg-amber-50 text-amber-700 ring-amber-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
    COMPLETED: "bg-blue-50 text-blue-700 ring-blue-200",
  };

  return classes[status];
}
