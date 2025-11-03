"use client";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  text: z.string().min(1, { message: "Cytat jest wymagany" }),
  author: z.string().min(1, { message: "Autor jest wymagany" }),
  category: z.string().min(1, { message: "Kategoria jest wymagana" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddQuote() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      author: "",
      category: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post("https://localhost:7120/quotes", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      console.log("Cytat dodany pomyślnie:", res.data);
    } catch (error) {
      console.log("Błąd podczas dodawania cytatu:", error);
    }
  };

  return (
    <div>
      <p className="text-center text-3xl mb-20">Dodaj Cytat</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-5"
        >
          <div className="flex flex-row gap-5">
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cytat</FormLabel>
                <FormControl>
                  <Input autoComplete="off" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-2/6 mt-4 self-center cursor-pointer"
            type="submit"
          >
            Dodaj
          </Button>
        </form>
      </Form>
    </div>
  );
}
