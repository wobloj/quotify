"use client";

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
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import EditForm from "@/components/forms/edit-category-form";
import DeleteForm from "@/components/forms/delete-form";
import { Spinner } from "@/components/ui/spinner";
import PaginationTable from "@/components/features/PaginationTable";

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface ApiResponse {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: Category[];
}

export default function EditQuote() {
  const [data, setData] = useState<Category[]>([]);
  const [id, setId] = useState<number>(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;
  const [totalPages, setTotalPages] = useState(1);

  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("jwt");

        if (!token) {
          setError("Brak autoryzacji — zaloguj się ponownie.");
          return;
        }

        // 🔹 Tworzenie URL z paginacją i filtrem kategorii
        let url = `https://localhost:7120/categories?page=${currentPage}&pageSize=${rowsPerPage}`;
        if (categoryId) {
          url += `&category_id=${categoryId}`;
        }

        const res = await axios.get<ApiResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        setIsError(true);
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

  const handleDeleteSuccess = (deletedId: number) => {
    setData((prev) => prev.filter((quote) => quote.id !== deletedId));
  };

  return (
    <>
      {isLoading ? (
        <Spinner className="size-6 flex-1" />
      ) : isError ? (
        <p className="text-red-600 text-lg">{error}</p>
      ) : (
        <div className="w-full px-40">
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Edycja kategorii"
          >
            <EditForm id={id} />
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title="Usuwanie kategorii"
          >
            <DeleteForm
              id={id}
              variant="category"
              onDeleteSuccess={handleDeleteSuccess}
              onClose={() => setIsDeleteOpen(false)}
            />
          </ResponsiveDialog>
          <div className="flex flex-row items-center justify-between md:items-start gap-2">
            <p className="text-3xl mb-10">Kategorie</p>
            <Link href="/auth/categories/create">
              <Button className="cursor-pointer">Dodaj nową kategorie</Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-lg">
                  <TableHead className="text-black/50">#</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-black/50">
                      {data.indexOf(category) + 1}
                    </TableCell>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      <Badge variant={"default"}>{category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {category.description === null
                        ? "Brak"
                        : category.description}
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString(
                        "pl-PL",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditOpen(true);
                              setId(category.id);
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
                              setId(category.id);
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
                    <TableCell colSpan={6} className="text-center py-6">
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
