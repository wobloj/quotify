"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import LoginButton from "@/components/features/LoginButton";
import ToggleDarkMode from "@/components/features/ToggleDarkMode";
import { Badge } from "@/components/ui/badge";
import UserLoggedIn from "@/components/features/UserLoggedIn";
import { AnimatePresence, motion } from "framer-motion";
import DropdownCategories from "@/components/features/DropdownCategories";
import QuoteHistory from "@/components/features/QuoteHistory";
import QuoteDisplay from "@/components/features/QuoteDisplay";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const MAX_STORED_QUOTES = 15;

interface Quote {
  id: number;
  text: string;
  author: string;
  categoryName: string;
  imageUrl?: string;
  timestamp?: number;
}

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenPresent, setIsTokenPresent] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useOwnSuggestions, setUseOwnSuggestions] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("jwt");
        setIsTokenPresent(!!token);
      }
    };

    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  const saveQuoteToStorage = (newQuote: Quote) => {
    if (typeof window === "undefined") return;

    const storedQuotes = JSON.parse(
      localStorage.getItem("storedQuotes") || "[]"
    ) as Quote[];

    const quoteWithTimestamp = { ...newQuote, timestamp: Date.now() };

    let updatedQuotes: Quote[];
    if (storedQuotes.length >= MAX_STORED_QUOTES) {
      updatedQuotes = storedQuotes
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, MAX_STORED_QUOTES - 1);
      updatedQuotes.push(quoteWithTimestamp);
    } else {
      updatedQuotes = [...storedQuotes, quoteWithTimestamp];
    }

    localStorage.setItem("storedQuotes", JSON.stringify(updatedQuotes));
  };

  const getQuote = async (categoryId?: number) => {
    try {
      setError(null);
      setIsLoading(true);

      let url: string;
      const token = localStorage.getItem("jwt");

      // Jeśli użytkownik chce losować ze swoich propozycji
      if (useOwnSuggestions && token) {
        url = "https://localhost:7120/api/SuggestedQuotes/user/random";
        if (categoryId && categoryId > 0) {
          url += `?category_id=${categoryId}`;
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 204) {
          setError("Nie masz jeszcze żadnych propozycji w wybranej kategorii.");
          setQuote(null);
          return;
        }

        const newQuote = res.data;
        setQuote(newQuote);
        saveQuoteToStorage(newQuote);
        setAnimationKey((prev) => prev + 1);
      } else {
        // Standardowe losowanie cytatów
        url = "https://localhost:7120/quotes/random";
        if (categoryId && categoryId > 0) {
          url += `?category_id=${categoryId}`;
        }

        const res = await axios.get(url);
        if (res.status === 204) {
          setError("Nie istnieją cytaty w wybranej kategorii.");
          setQuote(null);
          return;
        }

        const newQuote = res.data;
        setQuote(newQuote);
        saveQuoteToStorage(newQuote);
        setAnimationKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError("Musisz być zalogowany, aby losować własne propozycje.");
      } else {
        setError("Wystąpił błąd podczas pobierania cytatu.");
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(true);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <main className="flex flex-col items-center justify-center gap-10 h-full overflow-hidden">
      {!!error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-xl text-center sm:text-3xl text-red-600">
            {error}
          </h1>
        </motion.div>
      ) : (
        <QuoteDisplay
          isGenerating={isGenerating}
          animationKey={animationKey}
          data={quote}
        />
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, transition: { delay: 0.3 } }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
          <Button
            onClick={() =>
              getQuote(selectedCategoryId > 0 ? selectedCategoryId : undefined)
            }
            size={"lg"}
            variant={"outline"}
            className="cursor-pointer w-40 h-9 hover:bg-secondary"
          >
            {isLoading ? <Spinner /> : "Losuj cytat!"}
          </Button>

          <div className="w-52">
            <DropdownCategories
              value={selectedCategoryId}
              onChange={handleCategoryChange}
            />
          </div>
        </div>

        {isTokenPresent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2"
          >
            <Switch
              id="use-suggestions"
              checked={useOwnSuggestions}
              onCheckedChange={setUseOwnSuggestions}
            />
            <Label htmlFor="use-suggestions" className="cursor-pointer">
              Losuj z moich propozycji
            </Label>
          </motion.div>
        )}
      </motion.div>

      {isTokenPresent ? <UserLoggedIn /> : <LoginButton />}
      <QuoteHistory />
      <ToggleDarkMode />
    </main>
  );
}
