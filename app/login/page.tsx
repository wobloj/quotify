import HomeButton from "@/components/features/HomeButton";
import LoginForm from "@/components/forms/login-form";

export default function Login(){
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
      <h2 className="text-6xl text-center font-semibold mb-20">Login</h2>
        <LoginForm/>
      </div>
      <HomeButton/>
    </div>
  )
}
