"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import EditForm from "@/components/forms/edit-quote-form";
import DeleteForm from "@/components/forms/delete-form";
import PaginationTable from "@/components/features/PaginationTable";
import DropdownCategories from "@/components/features/DropdownCategories";
import { useRouter, useSearchParams } from "next/navigation";

interface Quote {
  id: number;
  text: string;
  author: string;
  categoryName: string;
  createdAt: string;
}

interface ApiResponse {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: Quote[];
}

const rowsPerPage = 7;

export default function FetchQuote() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams?.get("page")) || 1;
  const initialCategory = Number(searchParams?.get("category_id")) || undefined;

  const [data, setData] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [id, setId] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialCategory
  );

  // 🔹 Pobieranie cytatów z backendu
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("jwt");

        if (!token) {
          setError("Brak autoryzacji — zaloguj się ponownie.");
          return;
        }

        let url = `https://localhost:7120/quotes?page=${currentPage}&pageSize=${rowsPerPage}`;
        if (categoryId) url += `&category_id=${categoryId}`;

        const res = await axios.get<ApiResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError("Brak autoryzacji — zaloguj się ponownie.");
          } else {
            setError("Błąd pobierania cytatów z serwera.");
          }
        } else {
          setError("Nieoczekiwany błąd.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [currentPage, categoryId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category_id", categoryId.toString());
    params.set("page", currentPage.toString());
    router.push(`?${params.toString()}`);
  }, [currentPage, categoryId, router]);

  const handleDeleteSuccess = (deletedId: number) => {
    setData((prev) => prev.filter((quote) => quote.id !== deletedId));
  };

  const handleCategoryChange = (newCategoryId: number) => {
    setCategoryId(newCategoryId);
    setCurrentPage(1);
  };

  return (
    <>
      {isLoading ? (
        <Spinner className="size-6 flex-1" />
      ) : !!error ? (
        <p className="text-red-600 text-lg">{error}</p>
      ) : (
        <div className="w-full px-40">
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Edycja cytat"
          >
            <EditForm id={id} onClose={() => setIsEditOpen(false)} />
          </ResponsiveDialog>

          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title="Usuwanie cytatu"
          >
            <DeleteForm
              id={id}
              onDeleteSuccess={handleDeleteSuccess}
              onClose={() => setIsDeleteOpen(false)}
              variant="quote"
            />
          </ResponsiveDialog>

          {/* 🔹 Nagłówek + filtr kategorii */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-3xl mb-2">Cytaty</p>
              <div className="w-64">
                <p className="text-sm">Filtrowanie: </p>
                <DropdownCategories
                  value={categoryId}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
            <Link href="/auth/quotes/create">
              <Button className="cursor-pointer">Dodaj nowy cytat</Button>
            </Link>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-lg">
                  <TableHead className="text-black/50">#</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Cytat</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((quote, index) => (
                  <TableRow key={quote.id}>
                    <TableCell className="text-black/50">
                      {(currentPage - 1) * rowsPerPage + (index + 1)}
                    </TableCell>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell>{quote.text}</TableCell>
                    <TableCell>{quote.author}</TableCell>
                    <TableCell>
                      <Badge variant={"default"}>{quote.categoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(quote.createdAt).toLocaleDateString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditOpen(true);
                              setId(quote.id);
                            }}
                            className="text-foreground"
                          >
                            <Pencil />
                            Edycja
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setIsDeleteOpen(true);
                              setId(quote.id);
                            }}
                            variant="destructive"
                          >
                            <Trash />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Brak cytatów do wyświetlenia
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationTable
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </>
  );
}
