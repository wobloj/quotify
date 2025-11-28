"use client";

import { useTokenValidator } from "@/hooks/use-token-validator";
import { toast } from "sonner";

/**
 * Komponent sprawdzający ważność tokenu JWT w tle.
 * Automatycznie wylogowuje użytkownika gdy token wygaśnie.
 * Powinien być umieszczony w głównym layoutcie aplikacji.
 */
export default function TokenValidator() {
  useTokenValidator({
    checkInterval: 60000, // Sprawdzaj co minutę
    checkOnMount: true,
    onTokenExpired: () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
    },
  });

  // Komponent nie renderuje niczego - działa tylko w tle
  return null;
}


