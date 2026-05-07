"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import {
  AtSign,
  Lock,
  Eye,
  Shield,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        role
        fullName
        email
      }
    }
  }
`;

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = (await graphqlRequest({
        query: LOGIN_MUTATION,
        variables: {
          email,
          password,
        },
      })) as {
        data: {
          login: {
            token: string;
            user: {
              role: string;
            };
          };
        };
      };

      const { token, user } = data.login;

      if (user.role !== "ADMIN") {
        alert("Access denied: Admins only");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/admin/approvals");
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-background font-body min-h-screen flex flex-col items-center">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)]">
        <div className="flex justify-between items-center w-full px-8 h-20 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-slate-900 tracking-tighter font-headline">
            EventAdmin
          </div>
          <div className="flex items-center gap-6">
            <a
              className="text-slate-500 font-medium font-headline hover:text-indigo-500 transition-colors"
              href="#"
            >
              Support
            </a>
            <a
              className="text-indigo-600 font-semibold border-b-2 border-indigo-600 font-headline transition-colors"
              href="#"
            >
              System Status
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full px-4 pt-20">
        {/* Login Card */}
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl p-10 md:p-16 shadow-[0_32px_64px_-12px_rgba(57,44,193,0.08)] relative overflow-hidden">
          {/* Aesthetic Accent Top Gradient */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

          <div className="space-y-10">
            {/* Branding & Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary-container mb-2 text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
                Admin Portal Access
              </h1>
              <p className="text-on-secondary-container text-lg font-medium leading-relaxed max-w-xs mx-auto">
                Secure entry for platform administrators and system controllers.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Admin Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant font-label tracking-wide uppercase">
                  Admin Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                    <AtSign className="w-5 h-5" />
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-md focus:bg-surface-container-high focus:border-primary focus:ring-0 transition-all text-on-surface font-body outline-none placeholder:text-outline/40"
                    placeholder="admin@concierge.system"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
              </div>

              {/* Secure Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-on-surface-variant font-label tracking-wide uppercase">
                    Secure Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-md focus:bg-surface-container-high focus:border-primary focus:ring-0 transition-all text-on-surface font-body outline-none placeholder:text-outline/40"
                    placeholder="••••••••••••"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-primary hover:bg-primary-container text-on-primary font-bold rounded-lg shadow-lg transition-all duration-200 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Authorizing..." : "Authorize & Enter"}
                </button>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                  <a
                    className="text-sm font-bold text-primary hover:text-primary-container transition-colors font-headline"
                    href="#"
                  >
                    Forgot Admin Credentials?
                  </a>
                  <a
                    className="flex items-center gap-2 text-sm font-medium text-on-secondary-container hover:text-on-surface transition-colors font-headline"
                    href="#"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Public Site
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-12 mt-auto border-t border-slate-200/20 bg-slate-50/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto space-y-4 md:space-y-0 font-['Inter'] text-sm">
          <div className="font-['Manrope'] font-bold text-slate-400">
            © 2024 EventPlatform Concierge. Secure Admin Portal.
          </div>
          <div className="flex gap-8 text-slate-400 font-medium">
            <a className="hover:text-slate-900 transition-opacity" href="#">
              Privacy Policy
            </a>
            <a
              className="hover:text-slate-900 transition-opacity text-indigo-600 underline"
              href="#"
            >
              Terms of Service
            </a>
            <a className="hover:text-slate-900 transition-opacity" href="#">
              Security Audit
            </a>
          </div>
          <div className="text-slate-400 font-medium tracking-wide">
            Protected by Concierge Security. Authorized Personnel Only.
          </div>
        </div>
      </footer>

      {/* Background Decoration Image */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.20]">
        <img
          className="w-full h-full object-cover grayscale"
          alt="Futuristic secure environment"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwQuWLgiVrVehgsRpQlUcoMdOfHpjfiKZIq7mzdLKIPEfFKGyMMvdfiGI9pZ1XV5EPq_erDXmAurkqw6zCfA_NWKxl1uOJrftt5IHitJUDwLEIfx415imhX7zT28AQhCHImj9HXahtex0tuTwvUWc8lNjg29Xgnrsd0BH__RztV_eGhI_xIxjRV2IpP0zN-N_rLrhSwCsw6f_V-0k4tmmCKs5B5MxC7ZpgK6bjLvPq03n-I8lOncCvqs7Fpx9qkzYouhP964CaoPs"
        />
      </div>
    </div>
  );
}
