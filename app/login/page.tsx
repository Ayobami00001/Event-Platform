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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      if (form.rememberMe) {
        localStorage.setItem("remembered_email", form.email.trim());
      } else {
        localStorage.removeItem("remembered_email");
      }

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
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
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

          <div className="mb-8">
            <p className="mb-3 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Choose Portal
            </p>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setPortal("USER")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  portal === "USER"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Continue as User
              </button>

              <button
                type="button"
                onClick={() => setPortal("ORGANIZER")}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  portal === "ORGANIZER"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Continue as Organizer
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {portal === "ORGANIZER"
                ? "For hosts, event managers, and admins."
                : "For attendees exploring and booking events."}
            </p>
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
              href={portal === "ORGANIZER" ? "/register?role=organizer" : "/register"}
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
    </main>
  );
}