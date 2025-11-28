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
import axios from "axios";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email jest wymagany" })
      .email({ message: "Format email-a musi być prawidłowy" }),
    password: z
      .string()
      .min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
    repeatPassword: z
      .string()
      .min(1, { message: "Powtórzenie hasła jest wymagane" }),
  })
  .superRefine(({ password, repeatPassword }, ctx) => {
    if (password !== repeatPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Hasła muszą być takie same",
        path: ["password"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Hasła muszą być takie same",
        path: ["repeatPassword"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      router.push("/");
    }
  }, [router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const passwordError = form.formState.errors.password;
  const repeatPasswordError = form.formState.errors.repeatPassword;

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(
        "https://localhost:7120/auth/register",
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, role } = res.data;

      localStorage.setItem("jwt", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Pomyślnie zarejestrowano!");

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
          "Nie udało się zarejestrować. Sprawdź swoje dane.";
        setError(msg);
        toast.error(msg);
      } else {
        setError("Wystąpił nieznany błąd.");
        toast.error("Wystąpił nieznany błąd.");
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
                  className={`w-72 ${
                    passwordError ? "border-red-500 border-2" : ""
                  }`}
                  type="password"
                  placeholder="Wpisz swoje hasło"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repeatPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Powtórz Hasło</FormLabel>
              <FormControl>
                <Input
                  className={`w-72 ${
                    repeatPasswordError ? "border-red-500 border-2" : ""
                  }`}
                  type="password"
                  placeholder="Powtórz swoje hasło"
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
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Zarejestruj"}
        </Button>

        {error && (
          <Alert variant={"destructive"}>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Błąd rejestracji</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                <li>{error}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <p className="text-center text-sm">
          Masz już konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </form>
    </Form>
  );
}
