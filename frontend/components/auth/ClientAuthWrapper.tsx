"use client";

import TokenValidator from "./TokenValidator";

/**
 * Wrapper dla komponentów wymagających działania po stronie klienta.
 * Renderuje TokenValidator, który sprawdza ważność tokenu w tle.
 */
export default function ClientAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TokenValidator />
      {children}
    </>
  );
}


