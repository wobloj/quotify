'use client';

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import LoginButton from "@/components/features/LoginButton";
import ToggleDarkMode from "@/components/features/ToggleDarkMode";
import { Badge } from "@/components/ui/badge";

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  imageUrl?: string;
}

export default function Home() {

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const getQuote = async () =>{
    try {
      setIsError(false);
      setIsLoading(true);
      const res = await axios.get("https://localhost:7120/quotes/random");
      setQuote(res.data);
      console.log(res.data);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching quote:", error);
    } finally{
      setIsLoading(false);
      setIsGenerating(true);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center gap-10 h-full">

      {isError?
      <div>
        <h1 className="text-3xl text-red-600">Error fetching quote. Please try again later.</h1>
      </div> 
      :
      <div>
        {isGenerating ? 
        <div className="w-96">
          <p className="text-center text-xl transition-opacity">#{quote?.id}</p>
          <p className="text-3xl mb-10 text-center">{quote?.text}</p>
          <div className="flex flex-row justify-between">
            <span className="italic">~ {quote?.author}</span>
            <Badge variant={"secondary"}>{quote?.category}</Badge>
          </div>
        </div>:
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-5xl font-semibold text-[#A2AF9B]">Hello Quotify</h1>
          <p className="">Generate your daily quote by pressing this button.</p>
        </div>}

      </div>}

      
      <Button
        onClick={getQuote}
        size={"lg"} 
        variant={"outline"}
        className="cursor-pointer">
          {isLoading? <Spinner/> :"Losuj cytat!"}
      </Button>

      <LoginButton/>
      <ToggleDarkMode />
    </main>
  );
}
