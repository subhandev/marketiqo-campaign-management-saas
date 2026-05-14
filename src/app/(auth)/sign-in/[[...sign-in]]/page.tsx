"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

type ClerkErrorShape = {
  errors?: Array<{
    longMessage?: string;
    message?: string;
  }>;
};

function getClerkErrorMessage(err: unknown, fallback: string) {
  if (typeof err !== "object" || err === null) return fallback;
  const maybe = err as ClerkErrorShape;
  const first = maybe.errors?.[0];
  return first?.longMessage || first?.message || fallback;
}

const GoogleIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
    />
  </svg>
);

export default function SignInPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!authLoaded) return;
    if (isSignedIn) router.replace("/dashboard");
  }, [authLoaded, isSignedIn, router]);

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isLoaded) {
      setErrors({ general: "Auth is still loading. Please wait 1–2 seconds and try again." });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = getClerkErrorMessage(err, "Invalid email or password");
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) {
      setErrors({ general: "Auth is still loading. Please wait 1–2 seconds and try again." });
      return;
    }
    try {
      setGoogleLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      setErrors({
        general: getClerkErrorMessage(err, "Google sign in failed. Please try again."),
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-7 space-y-1.5">
          <h2 className="text-[26px] font-bold tracking-tight text-zinc-900">
            Welcome back
          </h2>
          <p className="text-sm text-zinc-500">
            Log in to continue analyzing your campaigns
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* General error */}
          {errors.general && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-xs font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-medium text-zinc-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`h-11 w-full rounded-lg border pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all
                  ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-zinc-200 bg-zinc-50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-zinc-700"
              >
                Password
              </label>
              <a
                href="#"
                className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`h-11 w-full rounded-lg border pl-10 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all
                  ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-zinc-200 bg-zinc-50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isLoaded || loading}
            className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
            style={{
              background: loading
                ? "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
              boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.4)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging you in...
              </span>
            ) : (
              "Log in"
            )}
          </button>

          <p className="text-center text-xs text-zinc-400">
            Free plan available · No credit card required
          </p>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                or
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!isLoaded || googleLoading}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Sign up */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Trust note */}
      <div className="mt-5 flex justify-center">
        <div className="inline-flex max-w-xs items-start gap-1.5 text-left text-xs text-zinc-400">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span>Your data is secure. We never share your campaign data.</span>
        </div>
      </div>
    </div>
  );
}