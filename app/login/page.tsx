"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        fullName
        email
        role
      }
    }
  }
`;

const CHECK_RESET_EMAIL = `
  query DevCheckResetEmail($email: String!) {
    devCheckResetEmail(email: $email)
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation DevResetPassword($email: String!, $newPassword: String!) {
    devResetPassword(email: $email, newPassword: $newPassword)
  }
`;

type PortalType = "USER" | "ORGANIZER";

type LoginResponse = {
  login: {
    token: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: "USER" | "ORGANIZER" | "ADMIN";
    };
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [portal, setPortal] = useState<PortalType>("USER");
  const [showPassword, setShowPassword] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [resetStep, setResetStep] = useState<"email" | "password">("email");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtitle = useMemo(() => {
    return portal === "ORGANIZER"
      ? "Login to manage your events and organizer dashboard"
      : "Login to discover and book amazing events";
  }, [portal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await graphqlRequest<LoginResponse>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            email: form.email.trim(),
            password: form.password,
          },
        },
      });

      const { token, user } = data.login;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (form.rememberMe) {
        localStorage.setItem("remembered_email", form.email.trim());
      } else {
        localStorage.removeItem("remembered_email");
      }

      if (data.login.user.role === "ADMIN") {
        throw new Error(
          "Access denied: Admins must use the admin login portal.",
        );
      }

      if (user.role === "ORGANIZER") {
        router.push("/organizer/dashboard");
        return;
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetMessage("Please enter your email.");
      return;
    }

    setCheckingEmail(true);

    try {
      const data = await graphqlRequest<{
        devCheckResetEmail: boolean;
      }>({
        query: CHECK_RESET_EMAIL,
        variables: {
          email: resetEmail.trim().toLowerCase(),
        },
      });

      if (!data.devCheckResetEmail) {
        setResetMessage("User does not exist.");
        return;
      }

      setResetStep("password");
    } catch (error) {
      setResetMessage(
        error instanceof Error ? error.message : "Unable to check email.",
      );
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");

    if (newPassword !== confirmPassword) {
      setResetMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setResetMessage("Password must contain at least 8 characters.");
      return;
    }

    setResettingPassword(true);

    try {
      const data = await graphqlRequest<{ devResetPassword: string }>({
        query: RESET_PASSWORD_MUTATION,
        variables: {
          email: resetEmail.trim().toLowerCase(),
          newPassword,
        },
      });

      setResetMessage(data.devResetPassword);

      setTimeout(() => {
        setForgotPasswordOpen(false);
        setResetStep("email");
        setResetMessage("");
      }, 1500);

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setResetMessage(
        error instanceof Error ? error.message : "Password reset failed.",
      );
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f9fb] px-6 py-10">
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-100/40 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-100/30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="mb-10 flex justify-center">
          <Link
            href="/"
            className="text-3xl font-black tracking-tighter text-slate-900 transition-transform duration-300 hover:scale-105"
          >
            Concierge
          </Link>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)] md:p-12">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            {/* Shield icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <svg
                className="h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>

            {/* Text */}
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Secure & encrypted login
              </p>
              <p className="text-xs text-slate-400">
                Your data is protected with 256-bit SSL encryption
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Email
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-indigo-600">
                  <span className="text-[18px]">✉️</span>
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="alex@concierge.com"
                  className="w-full rounded-2xl bg-white py-4 pl-11 pr-4 text-slate-900 outline outline-2 outline-slate-200 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Password
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-indigo-600">
                  <span className="text-[18px]">🔒</span>
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl bg-white py-4 pl-11 pr-12 text-slate-900 outline outline-2 outline-slate-200 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:outline-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-300"
                />
                <span className="font-medium text-slate-500 transition-colors group-hover:text-slate-700">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(form.email);
                  setResetMessage("");
                  setResetStep("email");
                  setForgotPasswordOpen(true);
                }}
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:shadow-xl hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading
                  ? "Logging in..."
                  : portal === "ORGANIZER"
                    ? "Login to Organizer Portal"
                    : "Login"}
              </span>
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-white/10" />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span className="bg-white px-4">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-100 py-3.5 transition-all hover:bg-slate-200 active:scale-95"
            >
              <span className="text-base">G</span>
              <span className="text-sm font-bold text-slate-700">Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-100 py-3.5 transition-all hover:bg-slate-200 active:scale-95"
            >
              <span className="text-base"></span>
              <span className="text-sm font-bold text-slate-700">Apple</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Don’t have an account?
            <Link
              href={
                portal === "ORGANIZER"
                  ? "/register?role=organizer"
                  : "/register"
              }
              className="ml-1 font-bold text-indigo-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            © 2024 Concierge Digital. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="text-xs uppercase tracking-wide text-slate-400 transition-opacity hover:text-indigo-600">
              Privacy Policy
            </button>
            <button className="text-xs uppercase tracking-wide text-slate-400 transition-opacity hover:text-indigo-600">
              Terms of Service
            </button>
            <button className="text-xs uppercase tracking-wide text-slate-400 transition-opacity hover:text-indigo-600">
              Support
            </button>
          </div>
        </footer>
      </div>

      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="forgot-password-title"
                className="text-2xl font-extrabold text-slate-900"
              >
                {resetStep === "email"
                  ? "Forgot Password?"
                  : "Set New Password"}
              </h2>

              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="mb-6 text-sm text-slate-500">
              {resetStep === "email"
                ? "Enter your registered email address to start account recovery."
                : "Enter and confirm your new password."}
            </p>

            {resetStep === "email" && (
              <form onSubmit={handleCheckResetEmail} className="space-y-5">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {resetMessage && (
                  <p
                    role="status"
                    className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700"
                  >
                    {resetMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={checkingEmail}
                  className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-50"
                >
                  {checkingEmail ? "Checking..." : "Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full text-sm font-semibold text-slate-500 hover:text-indigo-600"
                >
                  Back to Login
                </button>
              </form>
            )}

            {resetStep === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showNewPassword}
                    onChange={(e) => setShowNewPassword(e.target.checked)}
                  />
                  Show passwords
                </label>

                {resetMessage && (
                  <p
                    role="status"
                    className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-700"
                  >
                    {resetMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={() => setResetStep("email")}
                  className="w-full text-sm font-semibold text-slate-500 hover:text-indigo-600"
                >
                  Back to Email
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
