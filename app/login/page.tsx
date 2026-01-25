"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInInput } from "@/models/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(data.emailOrPhone, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img 
            src="/bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-6 bg-white rounded-full relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-black" />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif">Spin Storey</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6 font-serif">
            Your wardrobe,<br />reimagined.
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Effortlessly organize your clothes and generate new outfits instantly. The smartest way to dress is here.
          </p>
        </div>

        <div className="relative z-10 text-gray-500 text-sm">
          © 2026 Spin Storey Inc.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold font-serif">Spin Storey</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2 font-serif">Welcome back</h2>
            <p className="text-gray-600">Please enter your details to sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" className="text-sm font-medium">Email or Phone Number</Label>
              <Input
                id="emailOrPhone"
                placeholder="john@example.com or +1234567890"
                {...register("emailOrPhone")}
                disabled={isLoading}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-black focus:ring-black"
              />
              {errors.emailOrPhone && (
                <p className="text-sm text-red-500">{errors.emailOrPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                disabled={isLoading}
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-black focus:ring-black"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800 text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Sign up
              </Link>
            </p>
            <Link href="/bdr/login" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
              BDR Login Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}