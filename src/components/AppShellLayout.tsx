"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRound, LogOut, type LucideIcon } from "lucide-react";
import { fetchApi } from "@/lib/api";
import type { Usuario } from "@/types";
import styles from "./AppShellLayout.module.css";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface AppShellLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
}

export function AppShellLayout({ navItems, children }: AppShellLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  function isActive(href: string): boolean {
    if (pathname === href) return true;
    if (!pathname.startsWith(`${href}/`)) return false;

    const maisEspecifico = navItems.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(href) &&
        pathname.startsWith(item.href)
    );
    return !maisEspecifico;
  }

  useEffect(() => {
    fetchApi("/usuarios/me")
      .then(setUsuario)
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <div>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Agenda Digital</div>

        <nav className={styles.nav}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${
                isActive(href) ? styles.navLinkActive : ""
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          {usuario && <div className={styles.userName}>{usuario.nome}</div>}
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <nav className={styles.bottomNav}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.bottomNavLink} ${
              isActive(href) ? styles.bottomNavLinkActive : ""
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <button
          type="button"
          className={styles.bottomNavLink}
          onClick={() => setMenuAberto((v) => !v)}
        >
          <UserRound size={20} />
          Perfil
        </button>
      </nav>

      {menuAberto && (
        <div className={styles.profileMenu}>
          {usuario && (
            <div className={styles.profileMenuName}>{usuario.nome}</div>
          )}
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      )}

      <main className={styles.content}>{children}</main>
    </div>
  );
}
