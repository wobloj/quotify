"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import HomeButton from "@/components/features/HomeButton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FavouriteQuote {
  quoteId: number;
  likedAt: string;
  id: number;
  text: string;
  author: string;
  createdAt: string;
  categoryId: number;
  categoryName: string | null;
  imageUrl?: string | null;
}

export default function Favourite() {
  const [data, setData] = useState<FavouriteQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const fetchFavourites = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }

      const res = await axios.get(
        "https://localhost:7120/api/QuoteLikes/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Brak autoryzacji — zaloguj się ponownie.");
        } else {
          toast.error("Błąd pobierania ulubionych cytatów.");
        }
      } else {
        toast.error("Nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleUnlike = async (quoteId: number) => {
    if (processingIds.has(quoteId)) return;

    try {
      setProcessingIds((prev) => new Set(prev).add(quoteId));
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }

      await axios.delete(`https://localhost:7120/api/QuoteLikes/${quoteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Cytat usunięty z ulubionych.");
      await fetchFavourites();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Nie udało się usunąć cytatu z ulubionych.";
        toast.error(message);
      } else {
        toast.error("Nieoczekiwany błąd.");
      }
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(quoteId);
        return next;
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-10 py-10 px-20">
      {data.map((ele, index) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: index * 0.09 } }}
          key={index}
          className="relative border rounded-md mt-10 p-4 flex flex-col justify-between bg-background"
        >
          <p className="mb-4 px-4 text-xl">{ele.text}</p>
          <div className="flex flex-row justify-between text-sm">
            <p className=" italic">~{ele.author}</p>
            <Badge>{ele.categoryName}</Badge>
          </div>
          <Button
            onClick={() => handleUnlike(ele.quoteId)}
            variant={"link"}
            className="cursor-pointer absolute top-2 right-2 text-red-400 hover:bg-red-200"
          >
            <Trash size={20} className=" transition-colors " />
          </Button>
        </motion.div>
      ))}
      {data.length === 0 && (
        <p className="text-3xl col-span-full">Brak polubionych cytatów</p>
      )}
    </div>
  );
}
