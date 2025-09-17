"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
  { href: "/clients", label: "Clients" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:sticky md:top-0 md:block md:h-[100dvh] md:w-64 md:shrink-0 border-r border-zinc-200 bg-white">
      <div className="h-14 px-4 flex items-center border-b border-zinc-200">
        <span className="font-semibold text-zinc-900">Invoiceager</span>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  "text-zinc-700 hover:bg-zinc-100",
                  pathname.startsWith(item.href) && "bg-zinc-100 text-zinc-900"
                )}
              >
                {item.label}
              </Link>
            </li>)
          )}
        </ul>
      </nav>
    </aside>
  );
}


