"use client";

import { useLang } from "./LangProvider";
import { dict } from "@/lib/lang";

export function Translate({ id }: { id: keyof typeof dict.uz }) {
  const { t } = useLang();
  return <>{t[id] || id}</>;
}
