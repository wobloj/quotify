"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { z } from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";

const formSchema = z.object({
  text: z.string().min(1, { message: "Cytat jest wymagany" }),
  author: z.string().min(1, { message: "Autor jest wymagany" }),
  category: z.string().min(1, { message: "Kategoria jest wymagana" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<FormValues | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const params = useParams();
  const id = params?.slug as string;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      author: "",
      category: "",
    },
  });

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("jwt");

        const res = await axios.get(`https://localhost:7120/quotes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: FormValues = {
          text: res.data.text,
          author: res.data.author,
          category: res.data.category,
        };

        setInitialData(data);
        form.reset(data);
        setHasChanges(false);
      } catch (err) {
        console.error("Błąd podczas pobierania cytatu:", err);
        setError("Nie udało się pobrać danych cytatu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [id, form]);

  useEffect(() => {
    if (!initialData) return;

    const subscription = form.watch((values) => {
      const isDifferent =
        values.text !== initialData.text ||
        values.author !== initialData.author ||
        values.category !== initialData.category;

      setHasChanges(isDifferent);
    });

    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const getChangedFields = (original: FormValues, updated: FormValues) => {
    const changed: Partial<FormValues> = {};

    if (updated.text !== original.text) changed.text = updated.text;
    if (updated.author !== original.author) changed.author = updated.author;
    if (updated.category !== original.category)
      changed.category = updated.category;

    return changed;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!initialData) return;

      const changedFields = getChangedFields(initialData, values);

      if (Object.keys(changedFields).length === 0) {
        setSuccess(null);
        setError("Brak zmian do zapisania.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("jwt");

      await axios.patch(`https://localhost:7120/quotes/${id}`, changedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Cytat został pomyślnie zaktualizowany!");
      setInitialData(values);
      setHasChanges(false);
    } catch (err) {
      console.error("Błąd podczas edycji cytatu:", err);
      setError("Nie udało się zaktualizować cytatu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? <Spinner /> : "Edytuj"}
        </Button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-center text-sm text-green-600">{success}</p>
        )}
      </form>
    </Form>
  );
}
