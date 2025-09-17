import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Sticky top bar across breakpoints */}
      {/* @ts-expect-error Async Server Component */}
      <Topbar />
      <div className="mx-auto flex w-full max-w-screen-2xl gap-0 px-0 md:gap-6 md:px-6">
        <Sidebar />
        <main className="flex-1 p-4 md:py-6">{children}</main>
      </div>
    </div>
  );
}


