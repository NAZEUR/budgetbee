"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 honeycomb-bg">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-5xl mb-3 animate-float">🐝</div>
            <h1 className="text-3xl font-extrabold text-hive-800">
              Budget<span className="text-honey-500">Bee</span>
            </h1>
          </Link>
          <p className="text-sm text-hive-400 mt-2">Welcome back! Let&apos;s check on your hive.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-card p-8 border border-cream-darker">
          <h2 className="text-xl font-bold text-hive-800 mb-6">Log In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-status-danger text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Log In
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-hive-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-honey-600 font-semibold hover:text-honey-500 transition-honey"
          >
            Create one — it&apos;s free!
          </Link>
        </p>
      </div>
    </div>
  );
}
