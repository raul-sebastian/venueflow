import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/auth/logout/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VenueFlow",
  description: "Sistema de reservaciones de espacios y eventos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const navigation = currentUser
    ? [
        {
          href: currentUser.role === UserRole.ADMIN ? "/admin" : "/portal",
          label: currentUser.role === UserRole.ADMIN ? "Dashboard" : "Inicio",
        },
        { href: "/spaces", label: "Espacios" },
        { href: "/reservations", label: "Reservaciones" },
        { href: "/events", label: "Eventos" },
        { href: "/recommendations", label: "Recomendador" },
        ...(currentUser.role === UserRole.ADMIN ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-100 text-slate-950">
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-blue-600 text-lg font-black text-white">
                  V
                </span>
                <span>
                  <span className="block text-xl font-black tracking-tight text-slate-950">
                    VenueFlow
                  </span>
                  <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Reservas inteligentes
                  </span>
                </span>
              </Link>

              {currentUser ? (
                <nav className="flex flex-wrap gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                {currentUser ? (
                  <>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-bold text-slate-900">{currentUser.name}</span>
                      <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">
                        {currentUser.role}
                      </span>
                    </div>
                    <form action={logoutUser}>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Salir
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
