"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";

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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const firstNameRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    code?: string;
    general?: string;
  }>({});

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  const validate = () => {
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !validate()) return;

    try {
      setLoading(true);
      setErrors({});

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setErrors({});

      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Invalid verification code";
      setErrors({ code: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      setGoogleLoading(true);
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      setGoogleLoading(false);
      setErrors({ general: "Google sign up failed. Please try again." });
    }
  };

  // Verification screen
  if (pendingVerification) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-lg sm:p-8">
          <div className="mb-7 space-y-1.5">
            <h2 className="text-[26px] font-bold tracking-tight text-zinc-900">
              Check your email
            </h2>
            <p className="text-sm text-zinc-500">
              We sent a verification code to{" "}
              <span className="font-medium text-zinc-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerification} noValidate className="space-y-4">
            {errors.code && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <p className="text-xs font-medium text-red-600">{errors.code}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="code"
                className="text-[13px] font-medium text-zinc-700"
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 tracking-widest text-center font-mono text-lg"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify email"
              )}
            </button>

            <button
              type="button"
              onClick={() => setPendingVerification(false)}
              className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              ← Back to sign up
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-7 space-y-1.5">
          <h2 className="text-[26px] font-bold tracking-tight text-zinc-900">
            Create your account
          </h2>
          <p className="text-sm text-zinc-500">
            Start managing campaigns with AI-powered insights
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.general && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-xs font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="firstName"
                className="text-[13px] font-medium text-zinc-700"
              >
                First name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={firstNameRef}
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName)
                      setErrors((p) => ({ ...p, firstName: undefined }));
                  }}
                  className={`h-11 w-full rounded-lg border pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all
                    ${
                      errors.firstName
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-zinc-200 bg-zinc-50 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs font-medium text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lastName"
                className="text-[13px] font-medium text-zinc-700"
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-zinc-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
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
            disabled={loading}
            className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
              boxShadow: "0 4px 14px -2px rgba(99, 102, 241, 0.4)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>

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
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
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

        {/* Sign in */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>

      {/* Trust note */}
      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400">
        <Lock className="h-3 w-3 shrink-0" />
        Your data is secure. We never share your campaign data.
      </p>
    </div>
  );
}