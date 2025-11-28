"use client";

import {
  EllipsisVertical,
  LogOut,
  KeyRound,
  Plus,
  NotebookPen,
  Star,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import jwtDecode from "jwt-decode";

interface DecodedToken extends Record<string, unknown> {
  email?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  role?: string;
}

interface UserState {
  email: string;
  role: string;
  isAdmin: boolean;
}

export default function UserLoggedIn() {
  const router = useRouter();

  // Użyj useMemo zamiast useEffect + useState
  const userState = useMemo<UserState>(() => {
    if (typeof window === "undefined") {
      return {
        email: "user",
        role: "User",
        isAdmin: false,
      };
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      return {
        email: "user",
        role: "User",
        isAdmin: false,
      };
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const email = (decoded.email as string) || "user";
      const role =
        (decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as string) ||
        (decoded.role as string) ||
        "User";
      const isAdmin = role === "admin" || role === "Admin";

      return {
        email,
        role,
        isAdmin,
      };
    } catch (error) {
      console.error("Błąd podczas dekodowania tokena:", error);
      return {
        email: "user",
        role: "User",
        isAdmin: false,
      };
    }
  }, []);

  const formatEmail = (email: string) => {
    const atIndex = email.indexOf("@");
    if (atIndex === -1) return email;
    return email.substring(0, atIndex);
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    router.push("/login");
  };

  return (
    <div className="flex flex-row items-center justify-between fixed m-4 right-0 top-0 py-2 px-4 gap-4 border rounded-xl bg-background min-w-40">
      <div>
        <p className="text-sm text-start truncate">
          {formatEmail(userState.email)}
        </p>
        <p className="text-sm text-start text-black/70">{userState.role}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40" align="end">
          {userState.isAdmin && (
            <>
              <Link className="flex flex-row items-center gap-2" href={"/auth"}>
                <DropdownMenuItem className="cursor-pointer w-full">
                  <KeyRound />
                  Panel Administratora
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
            </>
          )}
          <Link
            className="flex flex-row items-center gap-2"
            href={"/suggestion/create"}
          >
            <DropdownMenuItem className="cursor-pointer w-full">
              <Plus />
              Dodaj cytat
            </DropdownMenuItem>
          </Link>
          <Link
            className="flex flex-row items-center gap-2"
            href={"/suggestion"}
          >
            <DropdownMenuItem className="cursor-pointer w-full">
              <NotebookPen />
              Moje propozycje
            </DropdownMenuItem>
          </Link>
          <Link
            className="flex flex-row items-center gap-2"
            href={"/favourite"}
          >
            <DropdownMenuItem className="cursor-pointer w-full">
              <Star />
              Ulubione cytaty
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={logout}
          >
            <LogOut />
            Wyloguj
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
