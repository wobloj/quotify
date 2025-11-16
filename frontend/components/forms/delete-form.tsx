import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "sonner";

export default function DeleteForm({
  id,
  onDeleteSuccess,
  onClose,
  variant,
}: {
  id: number;
  onDeleteSuccess: (id: number) => void;
  onClose: () => void;
  variant: "quote" | "category";
}) {
  const deleteQuote = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      if (variant === "quote") {
        await axios.delete(`https://localhost:7120/quotes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      if (variant === "category") {
        await axios.delete(`https://localhost:7120/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      toast.success("Cytat został pomyślnie usunięty.");
      onDeleteSuccess(id);
      onClose();
    } catch (error) {
      console.error("Error during delete:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-5 self-start">
        <p>
          Jesteś pewny że chcesz usunąć ten element o ID:{" "}
          <span className="text-destructive font-bold">{id}</span>?
        </p>
        <p>Akcja ta nie może zostać cofnięta.</p>
      </div>

      <Button
        onClick={deleteQuote}
        className="cursor-pointer w-full"
        variant="destructive"
      >
        Usuń
      </Button>
    </div>
  );
}
