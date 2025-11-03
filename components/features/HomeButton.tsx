"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { House } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HomeButton({
  text = "Strona główna",
  href = "/",
  direction = "right",
}: {
  text?: string;
  href?: string;
  direction?: "left" | "right";
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`fixed m-4 top-0 ${
        direction === "right" ? "left-0" : "right-0"
      }`}
    >
      <Button
        asChild
        className="flex items-center overflow-hidden whitespace-nowrap transition-all duration-300"
      >
        <Link
          href={href}
          className="flex items-center"
        >
          {/* Ikona */}
          <House className="mr-0" />

          {/* Animowany tekst */}
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={
              isHovering
                ? { width: "auto", opacity: 1, marginLeft: direction === "right" ? 8 : 0, marginRight: direction === "left" ? 8 : 0 }
                : { width: 0, opacity: 0, marginLeft: 0, marginRight: 0 }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {text}
          </motion.span>
        </Link>
      </Button>
    </motion.div>
  );
}