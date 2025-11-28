"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "../ui/badge";

interface Quote {
  id: number;
  text: string;
  author: string;
  categoryName: string;
  imageUrl?: string;
  timestamp?: number;
}

export default function QuoteHistory() {
  const [storedQuotes, setStoredQuotes] = useState<Quote[]>([]);

  const loadQuotesFromStorage = () => {
    // Ładowanie historii z localStorage
    if (typeof window !== "undefined") {
      try {
        const quotes = JSON.parse(
          localStorage.getItem("storedQuotes") || "[]"
        ).sort(
          (a: Quote, b: Quote) => (b.timestamp || 0) - (a.timestamp || 0)
        ) as Quote[];
        setStoredQuotes(quotes);
      } catch (error) {
        console.error("Błąd podczas ładowania historii cytatów:", error);
        setStoredQuotes([]);
      }
    }
  };

  useEffect(() => {
    // Ładowanie historii przy pierwszym zamontowaniu komponentu
    loadQuotesFromStorage();
  }, []);

  const handleOpenChange = (open: boolean) => {
    // Odśwież historię za każdym razem gdy panel jest otwierany
    if (open) {
      loadQuotesFromStorage();
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="fixed top-0 left-0 m-4" variant="outline">
          Historia cytatów
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>Historia cytatów</SheetTitle>
            <SheetDescription>
              Historia ostatnich 15 wylosowanych cytatów
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-1">
            {storedQuotes.length < 1 ? (
              <p className="text-center opacity-55">Brak historii cytatów</p>
            ) : (
              storedQuotes.map((quote, index) => (
                <div key={index}>
                  <div className="flex flex-row items-center justify-between gap-4 mx-4 text-sm mb-4">
                    <h1 className="">{quote.text}</h1>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-foreground/70 text-right">
                        ~{quote.author}
                      </p>
                      <Badge>{quote.categoryName}</Badge>
                    </div>
                  </div>
                  <Separator className="my-4 mx-2" />
                </div>
              ))
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
