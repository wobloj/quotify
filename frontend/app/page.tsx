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
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenPresent, setIsTokenPresent] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [animationKey, setAnimationKey] = useState<number>(0); // klucz animacji (wymusza zmianę elementu)

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
      setIsLoading(true);
      let url = "https://localhost:7120/quotes/random";
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
      setAnimationKey((prev) => prev + 1); // zmiana klucza → animacja
    } catch (error) {
      console.error("Error fetching quote:", error);
      setError("Wystąpił błąd podczas pobierania cytatu.");
    } finally {
      setIsLoading(false);
      setIsGenerating(true);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  // warianty animacji dla cytatów
  const quoteVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
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
        <div className="relative w-full flex justify-center items-center min-h-[250px]">
          <AnimatePresence mode="wait">
            {!isGenerating ? (
              <motion.div
                key="welcome"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute flex flex-col items-center gap-5"
              >
                <h1 className="text-4xl sm:text-5xl font-semibold text-[#A2AF9B]">
                  Hello Quotify
                </h1>
                <p className="text-sm sm:text-base">
                  Generate your daily quote by pressing this button.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={animationKey}
                variants={quoteVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-4/6 md:w-3/6 sm:w-2/6 text-center"
              >
                <p className="text-center text-xl mb-10">#{quote?.id}</p>
                <p className="text-xl sm:text-3xl mb-10 text-center">
                  {quote?.text}
                </p>
                <div className="flex flex-row justify-between">
                  <span className="italic text-sm sm:text-base">
                    ~ {quote?.author}
                  </span>
                  <Badge variant={"secondary"}>{quote?.categoryName}</Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, transition: { delay: 0.3 } }}
        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10"
      >
        <Button
          onClick={() =>
            getQuote(selectedCategoryId > 0 ? selectedCategoryId : undefined)
          }
          size={"lg"}
          variant={"outline"}
          className="cursor-pointer w-40 h-9"
        >
          {isLoading ? <Spinner /> : "Losuj cytat!"}
        </Button>

        <div className="w-52">
          <DropdownCategories
            value={selectedCategoryId}
            onChange={handleCategoryChange}
          />
        </div>
      </motion.div>

      {isTokenPresent ? <UserLoggedIn /> : <LoginButton />}
      <QuoteHistory />
      <ToggleDarkMode />
    </main>
  );
}
