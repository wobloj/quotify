import { EllipsisVertical, LogOut, KeyRound } from "lucide-react";
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

export default function UserLoggedIn() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("jwt");
    router.push("/login");
  };

  return (
    <div className="flex flex-row items-center justify-between fixed m-4 right-0 top-0 py-2 px-4 gap-4 border rounded-xl bg-background w-40 sm:w-52">
      <div>
        <p>username</p>
        <p className="text-sm text-black/70">Admin</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link className="flex flex-row items-center gap-2" href={"/auth"}>
              <KeyRound />
              Panel Administratora
            </Link>
          </DropdownMenuItem>
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
