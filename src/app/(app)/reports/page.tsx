import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-600">Export</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <input type="month" className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <Button variant="outline" className="border-zinc-300">CSV</Button>
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700">PDF</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-600">Total (period)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">₹0.00</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


