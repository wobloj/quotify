import HomeButton from "@/components/features/HomeButton";
import UserLoggedIn from "@/components/features/UserLoggedIn";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl pt-10 mb-2">Ulubione cytaty</h1>
      <p>Zanjdziesz tu wszystkie polubione przez ciebie cytaty</p>
      <div>{children}</div>
      <HomeButton />
      <UserLoggedIn />
    </div>
  );
}
