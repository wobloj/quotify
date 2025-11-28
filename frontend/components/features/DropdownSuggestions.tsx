"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "Pending" | "Approved" | "Rejected";

interface Props {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

export default function DropdownSuggestions({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as StatusFilter)}
    >
      <SelectTrigger className="w-full cursor-pointer hover:bg-secondary">
        <SelectValue placeholder="Filtruj po statusie" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">Wszystkie propozycje</SelectItem>
        <SelectItem value="Pending">Oczekujące</SelectItem>
        <SelectItem value="Approved">Zatwierdzone</SelectItem>
        <SelectItem value="Rejected">Odrzucone</SelectItem>
      </SelectContent>
    </Select>
  );
}


