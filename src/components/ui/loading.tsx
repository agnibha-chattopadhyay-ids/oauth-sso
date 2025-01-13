import { Icons } from "@/components/ui/icons";

export function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Icons.spinner className="h-6 w-6 animate-spin" />
    </div>
  );
} 