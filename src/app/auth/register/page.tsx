import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-gray-600">
            Sign up to get started with our platform
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 