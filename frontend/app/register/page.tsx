import HomeButton from "@/components/features/HomeButton";
import RegisterForm from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-6xl text-center font-semibold mb-20">
          Rejestracja
        </h2>
        <RegisterForm />
      </div>
      <HomeButton />
    </div>
  );
}
