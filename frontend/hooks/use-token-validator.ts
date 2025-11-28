import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/token-utils";
import axios from "axios";

interface UseTokenValidatorOptions {
  /**
   * Interwał sprawdzania tokenu w milisekundach (domyślnie 60000 = 1 minuta)
   */
  checkInterval?: number;
  /**
   * Czy sprawdzać token przy każdym załadowaniu strony (domyślnie true)
   */
  checkOnMount?: boolean;
  /**
   * Callback wywoływany przed wylogowaniem (może być użyty do pokazania notyfikacji)
   */
  onTokenExpired?: () => void;
}

/**
 * Hook sprawdzający ważność tokenu JWT i automatycznie wylogowujący użytkownika
 * gdy token wygaśnie. Działa globalnie w całej aplikacji.
 */
export function useTokenValidator(options: UseTokenValidatorOptions = {}) {
  const {
    checkInterval = 60000, // 1 minuta
    checkOnMount = true,
    onTokenExpired,
  } = options;
  const router = useRouter();

  useEffect(() => {
    const checkTokenAndLogout = () => {
      const token = localStorage.getItem("jwt");

      if (token && !isTokenValid(token)) {
        // Token wygasł - wyloguj użytkownika
        localStorage.removeItem("jwt");
        
        // Usuń token z domyślnych nagłówków axios
        delete axios.defaults.headers.common["Authorization"];

        // Wywołaj callback jeśli został podany
        if (onTokenExpired) {
          onTokenExpired();
        }

        // Przekieruj na stronę logowania
        router.push("/login");
      }
    };

    // Sprawdź token przy montowaniu komponentu
    if (checkOnMount) {
      checkTokenAndLogout();
    }

    // Ustaw interwał sprawdzania tokenu
    const interval = setInterval(checkTokenAndLogout, checkInterval);

    // Sprawdź token również przy zmianie fokusu okna (gdy użytkownik wraca do zakładki)
    const handleFocus = () => {
      checkTokenAndLogout();
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkInterval, checkOnMount, router, onTokenExpired]);
}

