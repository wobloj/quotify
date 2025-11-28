"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import HomeButton from "@/components/features/HomeButton";
import clsx from "clsx";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import UserLoggedIn from "@/components/features/UserLoggedIn";
import { Toaster } from "sonner";

interface DecodedToken extends Record<string, unknown> {
  exp: number;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  role?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  const navItems = [
    { href: "/auth/quotes", label: "Cytaty" },
    { href: "/auth/categories", label: "Kategorie" },
    { href: "/auth/suggestions", label: "Propozycje" },
  ];

  // 🧠 Funkcja sprawdzająca ważność tokena JWT i rolę administratora
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("jwt");

      if (!token) {
        setIsTokenValid(false);
        setIsAdmin(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // sekundy
        
        if (decoded.exp && decoded.exp > currentTime) {
          // Sprawdź rolę - może być w różnych miejscach w tokenie
          const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
          const isAdminRole = role === "admin" || role === "Admin";
          
          setIsTokenValid(true);
          setIsAdmin(isAdminRole);
          
          // Jeśli użytkownik nie jest administratorem, przekieruj na stronę główną
          if (!isAdminRole) {
            router.push("/");
          }
        } else {
          setIsTokenValid(false);
          setIsAdmin(false);
          localStorage.removeItem("jwt");
        }
      } catch (error) {
        console.error("Błąd podczas dekodowania tokena:", error);
        setIsTokenValid(false);
        setIsAdmin(false);
        localStorage.removeItem("jwt");
      }
    };

    // 🔄 Sprawdź token po załadowaniu strony
    const timer = setTimeout(() => {
      checkToken();
    }, 0);

    // 🕐 Okresowe sprawdzanie co minutę
    const interval = setInterval(() => checkToken(), 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  if (isTokenValid === false || isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-center">
        <h1 className="text-3xl font-semibold text-red-600">
          {isTokenValid === false 
            ? "Sesja wygasła lub nie jesteś zalogowany."
            : "Brak dostępu do panelu administratora."}
        </h1>
        <p className="text-lg text-gray-700">
          {isTokenValid === false
            ? "Zaloguj się ponownie, aby uzyskać dostęp do panelu administratora."
            : "Tylko administratorzy mają dostęp do tej sekcji."}
        </p>
        {isTokenValid === false ? (
          <Link
            href="/login"
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Zaloguj ponownie
          </Link>
        ) : (
          <Link
            href="/"
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Powrót do strony głównej
          </Link>
        )}
      </div>
    );
  }

  if (isTokenValid === null || isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Sprawdzanie autoryzacji...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <header className="w-full pt-8 pb-10 flex flex-col items-center">
        <h1 className="text-4xl font-semibold mb-4">Panel Administratora</h1>
        <nav>
          <ul className="flex flex-row text-lg gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "cursor-pointer transition-colors duration-200",
                    pathname === item.href
                      ? "text-primary font-semibold decoration-wavy"
                      : "text-gray-700 hover:text-green-600"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Tutaj renderuje się zawartość stron */}
      <main className="flex flex-col items-center justify-center w-full">
        {children}
        <Toaster richColors position="bottom-center" />
      </main>

      <div>
        <HomeButton />
        <UserLoggedIn />
      </div>
    </div>
  );
}
