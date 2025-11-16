"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface Props {
  value?: number | undefined;
  onChange: (value: number) => void;
  // opcjonalnie możesz dodać placeholder jako prop, ale zostawiam prosty tekst
}

export default function DropdownCategories({ value, onChange }: Props) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://localhost:7120/categories");

        // Jeśli backend zwraca paginację: { data: [...], totalItems: ..., ... }
        // to użyj res.data.data, w przeciwnym razie zakładaj, że res.data jest tablicą.
        const payload =
          res.data && Array.isArray(res.data)
            ? res.data
            : res.data && Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        if (!cancelled) {
          setCategories(payload);
        }
      } catch (err) {
        console.error("Błąd pobierania kategorii:", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Wartości Select muszą być stringami, używamy "0" jako "Wszystkie"
  const selectedValue = value && value > 0 ? value.toString() : "0";

  return (
    <Select
      value={selectedValue}
      onValueChange={(v) => {
        const num = Number(v);
        onChange(num); // zwracamy liczbę; komponent rodzic powinien traktować 0 jako "wszystkie"
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={loading ? "Ładowanie..." : "Wybierz kategorię"}
        />
      </SelectTrigger>

      <SelectContent>
        {/* opcja 'Wszystkie' */}
        <SelectItem value={"0"}>Wszystkie kategorie</SelectItem>

        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id.toString()}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
