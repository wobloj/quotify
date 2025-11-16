"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email jest wymagany" })
    .email({ message: "Nieprawidłowy email" }),
  password: z.string().min(1, { message: "Hasło jest wymagane" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      router.push("/auth");
    }
  }, [router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("https://localhost:7120/auth/login", data, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, role } = res.data;

      localStorage.setItem("jwt", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (role === "admin") {
        router.push("/auth");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          "Nie udało się zalogować. Sprawdź dane logowania.";
        setError(msg);
      } else {
        setError("Wystąpił nieznany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-96 flex flex-col items-center gap-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  className="w-72"
                  type="email"
                  placeholder="Wpisz swój email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input
                  className="w-72"
                  type="password"
                  placeholder="Wpisz swoje hasło"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-3/6 self-center cursor-pointer mt-10"
          type="submit"
        >
          {" "}
          {isLoading ? <Spinner /> : "Zaloguj"}
        </Button>
        {error && (
          <Alert variant={"destructive"}>
            <AlertCircleIcon />
            <AlertTitle>Błąd logowania</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                <li>Sprawdź swój email lub hasło,</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <p className="text-center text-sm text-green-600">{success}</p>
        )}
      </form>
    </Form>
  );
}
