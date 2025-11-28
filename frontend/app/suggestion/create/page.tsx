"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast, Toaster } from "sonner";
import axios from "axios";
import DropdownCategories from "@/components/features/DropdownCategories";
import HomeButton from "@/components/features/HomeButton";
import UserLoggedIn from "@/components/features/UserLoggedIn";

const formSchema = z.object({
  text: z.string().min(1, { message: "Cytat jest wymagany" }),
  author: z.string().min(1, { message: "Autor jest wymagane" }),
  categoryId: z.number().min(1, { message: "Kategoria jest wymagana" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateQuote() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      author: "",
      categoryId: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post("https://localhost:7120/api/SuggestedQuotes", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      form.reset({ text: "", author: "", categoryId: 0 });
      toast.success("Twoja propozycja został wysłana administratorowi.");
    } catch (error) {
      toast.error("Nie udało się wysłać propozycji.");
      console.error(error);
    }
  };
  return (
    <div className="w-full h-screen flex gap-10 flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl mb-4">Dodaj cytat</h1>
        <p className="text-sm">Masz ochotę wspomóc rozwój naszej platformy?</p>
        <p className="text-sm">
          Dodaj cytat a my po przeanalizowaniu dodamy go!
        </p>
      </div>
      <div className="flex flex-col justify-start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-96 flex flex-col items-center gap-5"
          >
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cytat</FormLabel>
                  <FormControl>
                    <Input
                      className="w-72"
                      type="text"
                      placeholder="Wpisz swój cytat"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input
                      className="w-72"
                      type="text"
                      placeholder="Wpisz autora"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <FormControl>
                    <div className="w-72">
                      <DropdownCategories
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center gap-7">
              <Button
                className="w-2/6 mt-4 self-center cursor-pointer"
                type="submit"
              >
                Dodaj
              </Button>
              <Button
                asChild
                className="w-2/6 mt-4 self-center cursor-pointer"
                type="button"
                variant={"outline"}
              >
                <Link href="/">Powrót</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <Toaster richColors position="bottom-center" />
      <HomeButton />
      <UserLoggedIn />
    </div>
  );
}
