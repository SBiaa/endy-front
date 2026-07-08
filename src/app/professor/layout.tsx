"use client";

import { GraduationCap } from "lucide-react";
import { AppShellLayout, type NavItem } from "@/components/AppShellLayout";

const NAV_ITEMS: NavItem[] = [
  { href: "/professor", label: "Minhas Turmas", icon: GraduationCap },
];

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout navItems={NAV_ITEMS}>{children}</AppShellLayout>;
}
