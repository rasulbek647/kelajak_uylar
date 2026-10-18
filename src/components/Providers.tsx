"use client";

import { SessionProvider } from "next-auth/react";
import { LangProvider } from "@/components/LangProvider";
import { Lang } from "@/lib/lang";

export default function Providers({
  children,
  initialLang = "uz",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  return (
    <SessionProvider>
      <LangProvider initialLang={initialLang}>
        {children}
      </LangProvider>
    </SessionProvider>
  );
}
