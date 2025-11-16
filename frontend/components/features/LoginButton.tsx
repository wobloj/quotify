import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function LoginButton() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} asChild >
        <Link className={`fixed m-4 right-0 top-0 transition-[width] ${isHovering?"w-fit":"w-10"}`} href="/login">
            {isHovering ? "Zaloguj" :""}
            <KeyRound/>
        </Link>
    </Button>
  )
}
