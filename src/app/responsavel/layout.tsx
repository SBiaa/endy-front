"use client";

import { Newspaper, BookOpen, CalendarCheck } from "lucide-react";
import { AppShellLayout, type NavItem } from "@/components/AppShellLayout";

const NAV_ITEMS: NavItem[] = [
  { href: "/responsavel", label: "Feed", icon: Newspaper },
  { href: "/responsavel/diario", label: "Diário", icon: BookOpen },
  { href: "/responsavel/presenca", label: "Presença", icon: CalendarCheck },
];

export default function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout navItems={NAV_ITEMS}>{children}</AppShellLayout>;
}
