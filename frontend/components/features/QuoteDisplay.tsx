import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";

export default function QuoteDisplay({
  isGenerating,
  animationKey,
  data,
}: {
  isGenerating: boolean;
  animationKey: number;
  data: {
    id: number;
    text: string;
    author: string;
    categoryName: string;
    imageUrl?: string | undefined;
    timestamp?: number | undefined;
  } | null;
}) {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState<boolean>(false);

  const quoteVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!data?.id) {
        setIsFavorite(false);
        return;
      }

      const token = localStorage.getItem("jwt");
      if (!token) {
        setIsFavorite(false);
        return;
      }

      setIsCheckingFavorite(true);
      try {
        const response = await axios.get(
          `https://localhost:7120/api/QuoteLikes/user/${data.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFavorite(response.data.isLiked);
      } catch (error) {
        console.error("Błąd sprawdzania statusu polubienia:", error);
        setIsFavorite(false);
      } finally {
        setIsCheckingFavorite(false);
      }
    };

    checkIfFavorite();
  }, [data?.id]);

  // Zapisywanie cytatu do historii w localStorage
  useEffect(() => {
    if (data && typeof window !== "undefined") {
      try {
        const storedQuotes = JSON.parse(
          localStorage.getItem("storedQuotes") || "[]"
        );

        // Dodaj timestamp jeśli go nie ma
        const quoteWithTimestamp = {
          ...data,
          timestamp: data.timestamp || Date.now(),
        };

        // Sprawdź czy cytat już istnieje w historii (po id)
        const quoteExists = storedQuotes.some(
          (q: { id: number }) => q.id === data.id
        );

        if (!quoteExists) {
          // Dodaj nowy cytat na początek tablicy
          const updatedQuotes = [quoteWithTimestamp, ...storedQuotes];

          // Ogranicz historię do 15 ostatnich cytatów
          const limitedQuotes = updatedQuotes.slice(0, 15);

          localStorage.setItem("storedQuotes", JSON.stringify(limitedQuotes));
        }
      } catch (error) {
        console.error("Błąd podczas zapisywania cytatu do historii:", error);
      }
    }
  }, [data]);

  const toggleFavorite = async () => {
    if (!data?.id) return;

    const token = localStorage.getItem("jwt");
    if (!token) {
      toast.error("Musisz być zalogowany, aby polubić cytat.");
      return;
    }

    try {
      if (isFavorite) {
        // Odlub cytat
        await axios.delete(`https://localhost:7120/api/QuoteLikes/${data.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Cytat usunięty z ulubionych!");
        setIsFavorite(false);
      } else {
        // Polub cytat
        await axios.post(
          "https://localhost:7120/api/QuoteLikes",
          {
            quoteId: data.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Cytat dodany do ulubionych!");
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Błąd podczas zmiany statusu polubienia:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Sesja wygasła. Zaloguj się ponownie.");
        } else if (error.response?.status === 400) {
          toast.error(error.response.data.message || "Cytat już polubiony.");
        } else {
          toast.error("Wystąpił błąd. Spróbuj ponownie.");
        }
      } else {
        toast.error("Wystąpił błąd. Spróbuj ponownie.");
      }
    }
  };

  return (
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
            <div className="flex flex-row justify-between">
              <div></div>
              <p className="text-center text-xl mb-10">#{data?.id}</p>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Star
                      onClick={toggleFavorite}
                      className={`transition-colors cursor-pointer hover:text-yellow-500 ${
                        isFavorite && "fill-yellow-500 text-yellow-600"
                      } ${isCheckingFavorite && "opacity-50"}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            </div>
            <p className="text-xl sm:text-3xl mb-10 text-center">
              {data?.text}
            </p>
            <div className="flex flex-row justify-between">
              <span className="italic text-sm sm:text-base">
                ~ {data?.author}
              </span>
              <Badge variant={"secondary"}>{data?.categoryName}</Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
