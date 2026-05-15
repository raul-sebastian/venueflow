import Link from "next/link";
import { registerUser } from "./actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-2xl font-black text-white">
            V
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Regístrate como usuario para usar VenueFlow.
          </p>
        </div>

        {params?.error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {params.error}
          </div>
        ) : null}

        <form action={registerUser} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Nombre</span>
            <input
              name="name"
              required
              placeholder="Raúl Sebastián"
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Correo electrónico</span>
            <input
              name="email"
              required
              type="email"
              placeholder="usuario@correo.com"
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Contraseña</span>
            <input
              name="password"
              required
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="h-12 rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white transition hover:from-blue-700 hover:to-violet-700"
          >
            Crear usuario
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-bold text-blue-700 hover:text-blue-900">
            Inicia sesión
          </Link>
        </p>
      </section>
    </div>
  );
}
