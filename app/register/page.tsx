"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

type RegisterRole = "USER" | "ORGANIZER";

type RegisterResponse = {
  register: {
    token: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: "USER" | "ORGANIZER" | "ADMIN";
    };
  };
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole =
    searchParams.get("role") === "organizer" ? "ORGANIZER" : "USER";

  const [selectedRole, setSelectedRole] = useState<RegisterRole>(
    initialRole as RegisterRole
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtitle = useMemo(() => {
    return selectedRole === "ORGANIZER"
      ? "Create your organizer account and start hosting memorable events"
      : "Join Concierge and start discovering amazing events worldwide";
  }, [selectedRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password.trim()) return "Password is required.";
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!form.agreedToTerms) {
      return "You must agree to the Terms & Conditions.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = await graphqlRequest<RegisterResponse>({
        query: REGISTER_MUTATION,
        variables: {
          input: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
            role: selectedRole,
          },
        },
      });

      const { token, user } = data.register;

      localStorage.setItem("token", token);

      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
        return;
      }

      if (user.role === "ORGANIZER") {
        router.push("/organizer/dashboard");
        return;
      }

      router.push("/events");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-10">
      <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-100/40 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-100/30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-10 flex justify-center">
          <Link
            href="/"
            className="text-3xl font-black tracking-tighter text-indigo-700 transition-transform duration-300 hover:scale-105"
          >
            Concierge
          </Link>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)] md:p-12">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Create an Account
            </h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>

          <div className="mb-8">
            <p className="mb-3 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Choose Account Type
            </p>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setSelectedRole("USER")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  selectedRole === "USER"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Join as User
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("ORGANIZER")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  selectedRole === "ORGANIZER"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Join as Organizer
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {selectedRole === "ORGANIZER"
                ? "Create, manage, and promote your own events."
                : "Browse events, save favorites, and book tickets."}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-100 px-6 py-3.5 text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
            >
              <span className="text-base">G</span>
              <span className="text-sm font-semibold">Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-100 px-6 py-3.5 text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
            >
              <span className="text-base"></span>
              <span className="text-sm font-semibold">Apple</span>
            </button>
          </div>

          <div className="relative mb-8 flex items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              or register with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Alex Rivers"
                className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-slate-900 outline-none ring-0 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alex@concierge.com"
                className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-slate-900 outline-none ring-0 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-4 pr-12 text-slate-900 outline-none ring-0 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-4 pr-12 text-slate-900 outline-none ring-0 transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">
                    Register as Organizer
                  </span>
                  <span className="text-[11px] text-slate-500">
                    I want to host and manage events
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRole((prev) =>
                      prev === "ORGANIZER" ? "USER" : "ORGANIZER"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedRole === "ORGANIZER"
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedRole === "ORGANIZER"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1 py-2">
              <input
                id="terms"
                type="checkbox"
                name="agreedToTerms"
                checked={form.agreedToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              />
              <label
                htmlFor="terms"
                className="text-xs leading-relaxed text-slate-500"
              >
                I agree to the{" "}
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Terms & Conditions
                </button>{" "}
                and understand the{" "}
                <button
                  type="button"
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : selectedRole === "ORGANIZER"
                ? "Create Organizer Account"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?
              <Link
                href="/login"
                className="ml-1 font-bold text-indigo-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        <footer className="mx-auto mt-8 flex max-w-4xl flex-col items-center justify-between gap-4 opacity-70 md:flex-row">
          <p className="text-sm text-slate-500">
            © 2024 Concierge Event Platform. All rights reserved.
          </p>
          <div className="flex gap-8">
            <button
              type="button"
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              Help Center
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}