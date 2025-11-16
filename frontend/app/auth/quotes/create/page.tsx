"use client";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import DropdownCategories from "@/components/features/DropdownCategories";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  text: z.string().min(1, { message: "Cytat jest wymagany" }),
  author: z.string().min(1, { message: "Autor jest wymagany" }),
  categoryId: z.number().min(1, { message: "Kategoria jest wymagana" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddQuote() {
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
      await axios.post("https://localhost:7120/quotes", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      form.reset({ text: "", author: "", categoryId: 0 });
      toast.success("Cytat został pomyślnie dodany.");
    } catch (error) {
      toast.error("Nie udało się dodać cytatu.");
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
          <div className="flex flex-1 flex-row gap-5">
            {/* Autor */}
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

            {/* Kategoria - Dropdown */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <FormControl>
                    <div className="w-52">
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
          </div>

          {/* Cytat */}
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
              <Link href="/auth/quotes">Powrót</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
