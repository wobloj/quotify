"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  createdAt: string;
}

export default function FetchQuote() {

  const [data, setData] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("jwt");

        if (!token) {
          setError("Brak autoryzacji — zaloguj się ponownie.");
          return;
        }

        const res = await axios.get("https://localhost:7120/quotes",{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).finally(() => {
          setIsLoading(false);
        });

        setData(res.data);
        console.log(res.data);
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
      }
    }
    fetchQuotes();
  }, []);

  return (
    <>
      {isLoading? <Spinner className="size-6 flex-1"/> 
      :isError ? <p className="text-red-600 text-lg">{error}</p> :
      <div className="w-full">
        <div className="flex flex-col justify-center items-center mb-10 gap-8">
          <p className="text-3xl text-center">Cytaty</p>
          <Button className="">
            <Link href="/auth/quotes/create">Dodaj nowy cytat</Link>
          </Button>
        </div>
        
        <div className="overflow-hidden rounded-md border">
          <Table>
              <TableHeader>
                <TableRow className="text-lg">
                  <TableHead>ID</TableHead>
                  <TableHead>Cytat</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>  
              <TableBody>
                {data.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell>{quote.text}</TableCell>
                    <TableCell>{quote.author}</TableCell>
                    <TableCell>
                      <Badge variant={"default"}>
                        {quote.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem className="text-foreground">
                            <Link className="flex flex-row items-center gap-2" href={`/auth/quotes/edit/${quote.id}`}>
                              <Pencil/>Edycja cytatu
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild><DropdownMenuItem variant="destructive"><Trash/>Usuwanie</DropdownMenuItem></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your account
                                  and remove your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
          </Table>
        </div>
        <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
      </div>}
    </>
  )
}
