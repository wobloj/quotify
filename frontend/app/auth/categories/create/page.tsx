"use client";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, { message: "Nazwa kategorii jest wymagana" }),
  description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddCategory() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post("https://localhost:7120/categories", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      toast.success("Kategoria została pomyślnie dodana.");
      form.reset({ name: "", description: "" });
    } catch (error) {
      toast.error("Nie udało się dodać kategorii.");
      console.error(error);
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa kategorii</FormLabel>
                <FormControl>
                  <Input autoComplete="off" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opis</FormLabel>
                <FormControl className="w-96">
                  <Input autoComplete="off" type="text" {...field} />
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
              <Link href="/auth/categories">Powrót</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
