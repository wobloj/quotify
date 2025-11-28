import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-10 mt-20">
        <div className="flex flex-col items-center border rounded-md flex-1 p-8 bg-background">
          <p className="text-center text-2xl mb-4">Cytaty</p>
          <p className="mb-4">Przejdź do podstrony z cytatami by móc:</p>
          <ul className="self-start ml-6 list-disc mb-4">
            <li>Dodawć</li>
            <li>Edytować</li>
            <li>Usuwać</li>
            <li>Sortowanie cytatów po kategorii</li>
          </ul>
          <Link className="mt-4" href={"/auth/quotes"}>
            <Button>Przejdź do zarządzania cytatami</Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center border rounded-md flex-1 p-8 bg-background">
          <p className="text-center text-2xl mb-4">Kategorie</p>
          <p className="mb-4">Przejdź do podstrony z kategoriami by móc:</p>
          <ul className="self-start ml-6 list-disc mb-4">
            <li>Dodawć</li>
            <li>Edytować</li>
            <li>Usuwać</li>
          </ul>
          <Link className="mt-4" href={"/auth/categories"}>
            <Button>Przejdź do zarządzania kategoriami</Button>
          </Link>
        </div>
        <div className="flex flex-col items-center border rounded-md flex-1 p-8 bg-background">
          <p className="text-center text-2xl mb-4">Propozycje</p>
          <p className="mb-4">Przejdź do podstrony z propozycjami by móc:</p>
          <ul className="self-start ml-6 list-disc mb-4">
            <li>Przeglądać propozycje użytkowników</li>
            <li>Zatwierdzać cytaty</li>
            <li>Odrzucać nieodpowiednie propozycje</li>
          </ul>
          <Link className="mt-4" href={"/auth/suggestions"}>
            <Button>Przejdź do zarządzania propozycjami</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
