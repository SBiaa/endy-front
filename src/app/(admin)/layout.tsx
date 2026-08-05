"use client";

import { LayoutDashboard, Newspaper, GraduationCap, Users, UserCog } from "lucide-react";
import { AppShellLayout, type NavItem } from "@/components/AppShellLayout";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/turmas", label: "Turmas", icon: GraduationCap },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/usuarios", label: "Usuários", icon: UserCog },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout navItems={NAV_ITEMS}>{children}</AppShellLayout>;
}
