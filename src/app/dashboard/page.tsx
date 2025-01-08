import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {session?.user?.name || "User"}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button variant="outline">Sign out</Button>
          </form>
        </div>
        <div className="grid gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {session?.user?.name || "Not provided"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {session?.user?.email || "Not provided"}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                {session?.user?.role || "USER"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 