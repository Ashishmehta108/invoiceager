import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/server/auth";
import { auth } from "@/server/auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function signInWithCredentials(formData: FormData) {
  "use server";
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  console.log(parsed.success);
  if (!parsed.success) return;
  const signindata = await signIn("credentials", parsed.data);
  console.log(signindata);
}

async function signInWithGoogle() {
  "use server";
  await signIn("google");
}

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 text-zinc-900">
      <Card className="w-full max-w-sm border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signInWithCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="focus-visible:ring-indigo-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <form action={signInWithGoogle}>
            <Button
              variant="outline"
              className="w-full border-zinc-300 text-zinc-800 hover:bg-zinc-100"
            >
              Sign in with Google
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-zinc-500">
            Don't have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </p>
          <p className="text-center text-xs text-zinc-500">
            By signing in you agree to our Terms and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
