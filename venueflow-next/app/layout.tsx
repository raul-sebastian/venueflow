import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/spaces", label: "Espacios" },
  { href: "/reservations/new", label: "Reservaciones" },
  { href: "/admin", label: "Admin" },
];

export const metadata: Metadata = {
  title: "VenueFlow",
  description: "Sistema de reservaciones de espacios y eventos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

              <nav className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
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
