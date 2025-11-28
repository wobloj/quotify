"use client";

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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DropdownSuggestions from "@/components/features/DropdownSuggestions";

type StatusFilter = "all" | "Pending" | "Approved" | "Rejected";

interface SuggestedQuoteAdmin {
  id: number;
  text: string;
  author: string;
  categoryId: number | null;
  categoryName: string | null;
  status: string;
  createdAt: string;
  userEmail: string;
  userId: number;
}

export default function AdminSuggestionsPage() {
  const [data, setData] = useState<SuggestedQuoteAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }

      const url = `https://localhost:7120/api/SuggestedQuotes/admin/all`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Brak autoryzacji — zaloguj się ponownie.");
        } else {
          toast.error("Błąd pobierania propozycji z serwera.");
        }
      } else {
        toast.error("Nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleApprove = async (id: number) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }

      const url = `https://localhost:7120/api/SuggestedQuotes/${id}/approve`;

      await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Propozycja zatwierdzona i cytat dodany!");
      await fetchSuggestions();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Nie udało się zatwierdzić propozycji.";
        toast.error(message);
      } else {
        toast.error("Nieoczekiwany błąd.");
      }
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = async (id: number) => {
    if (processingIds.has(id)) return;

    if (!confirm("Czy na pewno chcesz odrzucić tę propozycję?")) {
      return;
    }

    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }

      const url = `https://localhost:7120/api/SuggestedQuotes/${id}/reject`;

      await axios.patch(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Propozycja odrzucona.");
      await fetchSuggestions();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Nie udało się odrzucić propozycji.";
        toast.error(message);
      } else {
        toast.error("Nieoczekiwany błąd.");
      }
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredSuggestions = data.filter(
    (s) => statusFilter === "all" || s.status === statusFilter
  );

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-10">
      <h1 className="text-4xl mb-6">Zarządzanie propozycjami cytatów</h1>
      <div className="w-11/12 mb-4 flex justify-end">
        <div className="w-64">
          <DropdownSuggestions
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>
      <div className="w-11/12 border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow className="text-lg">
              <TableHead>#</TableHead>
              <TableHead>Cytat</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Data utworzenia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Ładowanie...
                </TableCell>
              </TableRow>
            ) : filteredSuggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Brak propozycji do wyświetlenia.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuggestions.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-md">{item.text}</TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{item.categoryName || "Brak kategorii"}</TableCell>
                  <TableCell>{item.userEmail}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center justify-center">
                    {item.status === "Pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(item.id)}
                          disabled={processingIds.has(item.id)}
                          className="cursor-pointer bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          className="cursor-pointer"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(item.id)}
                          disabled={processingIds.has(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Brak akcji
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
