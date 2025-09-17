import Link from "next/link";
import { auth, signOut } from "@/server/auth";
import { Button } from "@/components/ui/button";

async function SignOutButton() {
  "use server";
  await signOut();
}

export async function Topbar() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3 md:hidden">
          <span className="font-semibold text-zinc-900">Invoiceager</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          <Link href="/dashboard" className="hover:text-zinc-900">Dashboard</Link>
          <Link href="/invoices" className="hover:text-zinc-900">Invoices</Link>
          <Link href="/clients" className="hover:text-zinc-900">Clients</Link>
          <Link href="/reports" className="hover:text-zinc-900">Reports</Link>
          <Link href="/settings" className="hover:text-zinc-900">Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <form action={SignOutButton}>
              <Button variant="outline" className="border-zinc-300">Sign out</Button>
            </form>
          ) : (
            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}


