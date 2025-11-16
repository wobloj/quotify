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
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, { message: "Nazwa kategorii jest wymagana" }),
  description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditForm({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<FormValues | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("jwt");
        const res = await axios.get(`https://localhost:7120/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: FormValues = {
          name: res.data.name,
          description: res.data.description,
        };

        setInitialData(data);
        form.reset(data);
        setHasChanges(false);
      } catch (err) {
        console.error("Błąd podczas pobierania cytatu:", err);
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
        values.name !== initialData.name ||
        values.description !== initialData.description;

      setHasChanges(isDifferent);
    });

    return () => subscription.unsubscribe();
  }, [form, initialData]);

  const getChangedFields = (original: FormValues, updated: FormValues) => {
    const changed: Partial<FormValues> = {};
    if (updated.name !== original.name) changed.name = updated.name;
    if (updated.description !== original.description)
      changed.description = updated.description;
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
      await axios.patch(
        `https://localhost:7120/categories/${id}`,
        changedFields,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Pomyślnie wyedytowano kategorię.");
      setInitialData(values);
      setHasChanges(false);
    } catch (err) {
      console.error("Błąd podczas edycji cytatu:", err);
      toast.error("Nie udało się zaktualizować kategorii.");
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
