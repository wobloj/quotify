"use client"

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("jwt");
    router.push("/login");
  }

  return (
    <Button onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={logout} asChild>
        <div className="fixed m-4 right-0 top-0 cursor-pointer">
            {isHovering ? "Wyloguj" :""}
            <LogOut/>
        </div>
    </Button>
  )
}
