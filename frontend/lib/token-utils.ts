import jwtDecode from "jwt-decode";

interface DecodedToken extends Record<string, unknown> {
  exp?: number;
}

/**
 * Sprawdza czy token JWT jest ważny (nie wygasł)
 * @param token - Token JWT jako string
 * @returns true jeśli token jest ważny, false jeśli wygasł lub jest nieprawidłowy
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // sekundy

    // Sprawdź czy token ma exp (expiration time) i czy nie wygasł
    if (decoded.exp && decoded.exp > currentTime) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Błąd podczas dekodowania tokena:", error);
    return false;
  }
}

/**
 * Sprawdza czy token wygasa w ciągu określonej liczby sekund
 * @param token - Token JWT jako string
 * @param secondsBeforeExpiry - Liczba sekund przed wygaśnięciem (domyślnie 60)
 * @returns true jeśli token wygaśnie w ciągu określonego czasu
 */
export function isTokenExpiringSoon(
  token: string | null,
  secondsBeforeExpiry: number = 60
): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // sekundy

    if (decoded.exp) {
      const timeUntilExpiry = decoded.exp - currentTime;
      return timeUntilExpiry > 0 && timeUntilExpiry <= secondsBeforeExpiry;
    }

    return false;
  } catch (error) {
    console.error("Błąd podczas dekodowania tokena:", error);
    return false;
  }
}


