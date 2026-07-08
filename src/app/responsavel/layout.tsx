"use client";

import { Newspaper, BookOpen } from "lucide-react";
import { AppShellLayout, type NavItem } from "@/components/AppShellLayout";

const NAV_ITEMS: NavItem[] = [
  { href: "/responsavel", label: "Feed", icon: Newspaper },
  { href: "/responsavel/diario", label: "Diário", icon: BookOpen },
];

export default function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout navItems={NAV_ITEMS}>{children}</AppShellLayout>;
}
