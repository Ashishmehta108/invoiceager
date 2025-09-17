import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

async function signup(formData: FormData) {
  "use server";
  const parsed = schema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return;
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    await db.insert(users).values({
      name: parsed.data.name || null,
      email: parsed.data.email,
      passwordHash,
    });
  } catch {
    return;
  }
  redirect("/login");
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 text-zinc-900">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-xl font-semibold">Create account</h1>
        <form action={signup} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">Name</label>
            <input id="name" name="name" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Sign up</button>
        </form>
        <p className="mt-3 text-center text-xs text-zinc-500">Already have an account? <a className="text-indigo-600 hover:underline" href="/login">Sign in</a></p>
      </div>
    </main>
  );
}


