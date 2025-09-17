import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/server";

async function updateProfile(formData: FormData) {
  "use server";
  const businessName = String(formData.get("businessName") ?? "");
  const gstin = String(formData.get("gstin") ?? "");
  const bank = String(formData.get("bank") ?? "");
  await api.settings.updateProfile({ businessName, gstin, bankInfo: bank });
}

export default async function SettingsPage() {
  const profile = await api.settings.getProfile();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" name="businessName" defaultValue={profile?.businessName ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" name="gstin" defaultValue={profile?.gstin ?? ""} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank">Bank / UPI info</Label>
              <Input id="bank" name="bank" defaultValue={profile?.bankInfo ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Update profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600">Free plan</p>
        </CardContent>
      </Card>
    </div>
  );
}


