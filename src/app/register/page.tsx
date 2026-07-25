"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
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
          <p className="text-sm text-hive-400 mt-2">
            Join the hive and start managing your money! 🍯
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-card p-8 border border-cream-darker">
          <h2 className="text-xl font-bold text-hive-800 mb-6">
            Create Your Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-status-danger text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

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
              placeholder="Min. 6 characters"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Start Buzzing 🐝
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-hive-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-honey-600 font-semibold hover:text-honey-500 transition-honey"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
