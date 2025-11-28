"use client";
import HomeButton from "@/components/features/HomeButton";
import UserLoggedIn from "@/components/features/UserLoggedIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SuggestedQuote {
  id: number;
  text: string;
  author: string;
  categoryId: number | null;
  categoryName: string | null;
  status: string;
  createdAt: string;
}

export default function Suggestions() {
  const [data, setData] = useState<SuggestedQuote[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const token = localStorage.getItem("jwt");

        if (!token) {
          return;
        }

        const url = `https://localhost:7120/api/SuggestedQuotes/user`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
        console.log(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            console.log("Brak autoryzacji — zaloguj się ponownie.");
          } else {
            console.log("Błąd pobierania cytatów z serwera.");
          }
        } else {
          console.log("Nieoczekiwany błąd.");
        }
      }
    };

    fetchQuotes();
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-screen">
      <h1 className="text-4xl my-10">Twoje sugestie</h1>
      <div className="flex flex-col items-center">
        <p>Dodaj nową propozycję</p>
        <Link href={"/suggestion/create"}>
          <Button className="mt-2 cursor-pointer">Dodaj sugestię</Button>
        </Link>
      </div>
      <div className="w-9/12 border rounded-md mt-10 justify-self-center">
        <Table>
          <TableHeader>
            <TableRow className="text-lg">
              <TableHead>#</TableHead>
              <TableHead>Cytat</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Data utworzenia</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{data.text}</TableCell>
                <TableCell>{data.author}</TableCell>
                <TableCell>{data.categoryName || "Brak kategorii"}</TableCell>
                <TableCell>
                  {new Date(data.createdAt).toLocaleDateString("pl-PL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      data.status === "Approved"
                        ? "default"
                        : data.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {data.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Nie zaproponowano jeszcze żadnych cytatów.
                  <Link
                    className="flex flex-col items-center mt-2"
                    href={"/suggestion/create"}
                  >
                    <Button className="cursor-pointer">Dodaj teraz!</Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <HomeButton />
      <UserLoggedIn />
    </div>
  );
}
