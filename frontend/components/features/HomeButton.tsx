"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { House } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HomeButton({
  text = "Strona główna",
  href = "/",
}: {
  text?: string;
  href?: string;
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`fixed m-4 top-0 left-0`}
    >
      <Button
        asChild
        className="flex items-center gap-0 overflow-hidden whitespace-nowrap transition-all duration-300"
      >
        <Link href={href} className="flex items-center">
          <House className="mr-0" />

          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={
              isHovering
                ? {
                    width: "auto",
                    opacity: 1,
                    marginLeft: 8,
                  }
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
