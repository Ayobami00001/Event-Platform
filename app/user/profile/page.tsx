"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const GET_PROFILE = `
  query GetMyProfile {
    me { id fullName email phone avatar role status createdAt updatedAt country state city address }
  }
`;
const UPDATE_PROFILE = `
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      id fullName email phone avatar role status createdAt updatedAt country state city address
    }
  }
`;

const RESET_PASSWORD = `
  mutation DevResetPassword($email: String!, $newPassword: String!) {
    devResetPassword(email: $email, newPassword: $newPassword)
  }
`;

// Change the token lookup if your existing login stores authentication elsewhere.
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function graphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Please log in to access your profile.");
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const result: GraphQLResponse<T> = await response.json();
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(
      result.errors?.[0]?.message || "Request failed. Please try again.",
    );
  }
  return result.data;
}

type IconName =
  | "person"
  | "security"
  | "shield"
  | "lock_reset"
  | "camera"
  | "trash";

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    person: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    security: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    lock_reset: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="12" cy="15" r="1" />
      </>
    ),
    camera: (
      <>
        <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  );
}

function Avatar({
  profile,
  src,
  size = "large",
}: {
  profile: Profile;
  src?: string | null;
  size?: "large" | "small";
}) {
  const dimensions =
    size === "large"
      ? "h-32 w-32 rounded-[28px] text-4xl"
      : "h-11 w-11 rounded-2xl text-sm";
  const imageSrc = src === undefined ? profile.avatar : src;
  return imageSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={`${profile.fullName}'s avatar`}
      className={`${dimensions} object-cover border-4 border-white shadow-lg`}
    />
  ) : (
    <div
      className={`${dimensions} flex items-center justify-center border-4 border-white bg-indigo-100 font-extrabold text-indigo-700 shadow-lg`}
      aria-label="Profile initials"
    >
      {profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase())
        .join("") || "U"}
    </div>
  );
}

function dateJoined(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50";
const labelClass = "mb-2 block text-sm font-semibold text-slate-600";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<
    "personal" | "security" | "notifications" | "billing" | "danger"
  >("personal");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    avatar: "",
    country: "",
    state: "",
    city: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await graphql<{ me: Profile | null }>(GET_PROFILE);
      if (!data.me) throw new Error("No active session found. Please log in.");
      if (data.me.role !== "USER")
        throw new Error("This page is for attendee accounts only.");
      setProfile(data.me);
      setForm({
        fullName: data.me.fullName,
        phone: data.me.phone || "",
        avatar: data.me.avatar || "",
        country: data.me.country || "",
        state: data.me.state || "",
        city: data.me.city || "",
        address: data.me.address || "",
      });
      if (data.me.status === "BLOCKED")
        setNotice({
          kind: "error",
          text: "Your account is blocked. Contact support.",
        });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Could not load profile.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice({ kind: "error", text: "Choose a JPG, PNG or WebP image." });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setNotice({ kind: "error", text: "Your photo must be 3 MB or smaller." });
      return;
    }
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setNotice(null);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPreviewUrl(null);
    setForm((current) => ({ ...current, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadPhoto(file: File): Promise<string> {
    const token = getToken();
    if (!token) throw new Error("Please log in again.");
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const result: { url?: string; error?: string } = await response.json();
    if (!response.ok || !result.url) {
      throw new Error(result.error || "Photo upload failed.");
    }
    return result.url;
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || profile?.status === "BLOCKED") return;
    setNotice(null);
    setSaving(true);
    try {
      if (!form.fullName.trim()) throw new Error("Full name is required.");
      const avatarUrl = photoFile
        ? await uploadPhoto(photoFile)
        : form.avatar.trim();
      const data = await graphql<{ updateMyProfile: Profile }>(UPDATE_PROFILE, {
        input: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          avatar: avatarUrl,
          country: form.country.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
        },
      });
      setProfile(data.updateMyProfile);
      setPhotoFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setForm({
        fullName: data.updateMyProfile.fullName,
        phone: data.updateMyProfile.phone || "",
        avatar: data.updateMyProfile.avatar || "",
        country: data.updateMyProfile.country || "",
        state: data.updateMyProfile.state || "",
        city: data.updateMyProfile.city || "",
        address: data.updateMyProfile.address || "",
      });
      setNotice({
        kind: "success",
        text: "Your profile has been updated successfully.",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? error.message : "Unable to save changes.",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    setResettingPassword(true);

    try {
      const result = await graphql<{ devResetPassword: string }>(
        RESET_PASSWORD,
        {
          email: passwordForm.email.trim().toLowerCase(),
          newPassword: passwordForm.newPassword,
        },
      );

      setPasswordMessage(result.devResetPassword);

      setPasswordForm({
        email: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage(
        error instanceof Error ? error.message : "Password reset failed.",
      );
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f9fb] font-sans text-[#191c1e]">
      <Navbar />
      {/* Icons are inline SVGs, so no extra font is required. */}

      <main className="w-full flex-1 px-4 pb-12 pt-28 sm:px-7">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500">
              Loading your profile...
            </div>
          ) : (
            <>
              <section className="relative mb-9">
                <div
                  className="h-40 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#392cc1] to-[#534ad9] sm:h-48"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, #ffffff28 1px, transparent 0),linear-gradient(to right,#392cc1,#534ad9)",
                    backgroundSize: "24px 24px,auto",
                  }}
                />
                <div className="relative -mt-14 flex flex-col gap-4 px-5 sm:flex-row sm:items-end sm:px-8">
                  {profile && (
                    <div className="relative w-fit">
                      <Avatar
                        profile={profile}
                        src={previewUrl || form.avatar || null}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        aria-label="Choose profile picture"
                        onChange={(e) => choosePhoto(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        title="Choose a profile picture"
                        aria-label="Choose a profile picture"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving || profile.status === "BLOCKED"}
                        className="absolute -bottom-2 -right-2 rounded-full bg-indigo-700 p-3 text-white shadow-lg hover:bg-indigo-800 disabled:opacity-50"
                      >
                        <Icon name="camera" />
                      </button>
                    </div>
                  )}
                  <div className="pb-2 sm:pb-3">
                    <h1
                      className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {profile?.fullName || "Your Profile"}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        {profile?.status || "ACCOUNT"} ·{" "}
                        {profile?.role || "USER"}
                      </span>
                      {profile?.createdAt && (
                        <span className="text-slate-500">
                          Joined {dateJoined(profile.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {notice && (
                <div
                  role="status"
                  className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${notice.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}
                >
                  {notice.text}
                </div>
              )}
              {!profile ? (
                <div className="rounded-3xl bg-white p-8">
                  <p className="mb-4 text-slate-600">
                    Sign in to manage your account.
                  </p>
                  <Link
                    href="/login"
                    className="rounded-2xl bg-indigo-700 px-6 py-3 font-bold text-white"
                  >
                    Go to login
                  </Link>
                </div>
              ) : (
                <div className="grid gap-7 lg:grid-cols-3">
                  <div className="space-y-6">
                    <div className="rounded-[28px] bg-[#f2f4f6] p-6">
                      <h2 className="mb-4 text-lg font-extrabold">
                        Account Settings
                      </h2>
                      <div className="space-y-2 text-sm font-semibold">
                        <div className="space-y-2 text-sm font-semibold">
                          {[
                            {
                              id: "personal",
                              label: "Personal Info",
                              icon: "👤",
                            },
                            { id: "security", label: "Security", icon: "🔒" },
                            {
                              id: "notifications",
                              label: "Notifications",
                              icon: "🔔",
                            },
                            {
                              id: "billing",
                              label: "Billing & Plan",
                              icon: "💳",
                            },
                            { id: "danger", label: "Danger Zone", icon: "⚠️" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setActiveTab(item.id as typeof activeTab)
                              }
                              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                                activeTab === item.id
                                  ? "bg-white font-bold text-indigo-700 shadow-sm"
                                  : "text-slate-600 hover:bg-white/60"
                              }`}
                            >
                              <span>{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-indigo-100 bg-indigo-50 p-6">
                      <div className="flex gap-3">
                        <Icon name="shield" className="text-indigo-700" />
                        <div>
                          <h3 className="font-bold text-indigo-900">
                            Account security
                          </h3>
                          <p className="mt-1 text-sm text-indigo-800/75">
                            Use a strong, unique password to protect your
                            bookings and account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-7 lg:col-span-2">
                    {activeTab === "personal" && (
                      <section
                        id="personal"
                        className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8"
                      >
                        <div className="mb-7">
                          <h2 className="text-2xl font-extrabold">
                            Personal Information
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Manage your profile and contact details.
                          </p>
                        </div>
                        <form onSubmit={saveProfile} className="space-y-5">
                          <div>
                            <label htmlFor="fullName" className={labelClass}>
                              Full Name
                            </label>
                            <input
                              id="fullName"
                              required
                              className={inputClass}
                              value={form.fullName}
                              onChange={(e) =>
                                setForm((x) => ({
                                  ...x,
                                  fullName: e.target.value,
                                }))
                              }
                              disabled={saving || profile.status === "BLOCKED"}
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className={labelClass}>
                              Email Address
                            </label>
                            <input
                              id="email"
                              type="email"
                              className={inputClass}
                              value={profile.email}
                              disabled
                            />
                            <p className="mt-1 text-xs text-slate-400">
                              Email changes are not available from this form.
                            </p>
                          </div>
                          <div>
                            <label htmlFor="phone" className={labelClass}>
                              Phone Number
                            </label>
                            <input
                              id="phone"
                              type="tel"
                              className={inputClass}
                              placeholder="Enter your phone number"
                              value={form.phone}
                              onChange={(e) =>
                                setForm((x) => ({
                                  ...x,
                                  phone: e.target.value,
                                }))
                              }
                              disabled={saving || profile.status === "BLOCKED"}
                            />
                          </div>

                          {/* Location Information */}
                          <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-lg font-bold text-slate-900">
                              Location Information
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Help us recommend events near you. All fields are
                              optional.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {(["country", "state", "city"] as const).map(
                              (field) => (
                                <div key={field}>
                                  <label htmlFor={field} className={labelClass}>
                                    {field.charAt(0).toUpperCase() +
                                      field.slice(1)}
                                  </label>

                                  <input
                                    id={field}
                                    type="text"
                                    className={inputClass}
                                    placeholder={`Enter your ${field}`}
                                    value={form[field]}
                                    onChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        [field]: e.target.value,
                                      }))
                                    }
                                    disabled={
                                      saving || profile.status === "BLOCKED"
                                    }
                                  />
                                </div>
                              ),
                            )}
                          </div>

                          <div>
                            <label htmlFor="address" className={labelClass}>
                              Full Address (Optional)
                            </label>

                            <textarea
                              id="address"
                              rows={3}
                              className={inputClass}
                              placeholder="Street address, building, or landmark"
                              value={form.address}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  address: e.target.value,
                                }))
                              }
                              disabled={saving || profile.status === "BLOCKED"}
                            />
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className={labelClass}>
                              Profile Picture (optional)
                            </p>
                            <p className="mb-3 text-xs text-slate-500">
                              Click the camera icon or choose a JPG, PNG or WebP
                              image (max 3 MB). Save Changes to upload it.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={
                                  saving || profile.status === "BLOCKED"
                                }
                                className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                              >
                                Choose Photo
                              </button>
                              {(photoFile || form.avatar) && (
                                <button
                                  type="button"
                                  onClick={removePhoto}
                                  disabled={
                                    saving || profile.status === "BLOCKED"
                                  }
                                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <Icon name="trash" /> Remove Photo
                                </button>
                              )}
                            </div>
                            {photoFile && (
                              <p className="mt-2 text-xs text-indigo-700">
                                Selected: {photoFile.name}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end pt-3">
                            <button
                              disabled={saving || profile.status === "BLOCKED"}
                              className="rounded-2xl bg-[#392cc1] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </form>
                      </section>
                    )}

                    {activeTab === "security" && (
                      <section
                        id="security"
                        className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8"
                      >
                        <div className="mb-7 flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-2xl font-extrabold">
                              Security &amp; Password
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              Update your password to protect your account.
                            </p>
                          </div>
                          <span className="rounded-full bg-red-50 p-3 text-red-700">
                            <Icon name="lock_reset" />
                          </span>
                        </div>
                        <form
                          onSubmit={handleResetPassword}
                          className="space-y-5"
                        >
                          <div>
                            <label className={labelClass}>
                              Registered Email
                            </label>
                            <input
                              type="email"
                              required
                              className={inputClass}
                              placeholder="Enter your registered email"
                              value={passwordForm.email}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <label className={labelClass}>New Password</label>
                            <input
                              type="password"
                              required
                              minLength={8}
                              className={inputClass}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              required
                              minLength={8}
                              className={inputClass}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {passwordMessage && (
                            <p
                              role="status"
                              className="text-sm text-indigo-700"
                            >
                              {passwordMessage}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={resettingPassword}
                            className="rounded-2xl bg-indigo-600 px-8 py-3 font-bold text-white disabled:opacity-50"
                          >
                            {resettingPassword
                              ? "Resetting..."
                              : "Reset Password"}
                          </button>
                        </form>
                      </section>
                    )}

                    {/* Notifications */}

                    {activeTab === "notifications" && (
                      <section
                        id="notifications"
                        className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8"
                      >
                        <h2 className="text-2xl font-extrabold">
                          Notification Preferences
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Manage how you receive event updates and reminders.
                        </p>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                          <p className="font-semibold text-slate-800">
                            Notification settings
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            Email notifications and event reminders will be
                            available soon.
                          </p>
                        </div>
                      </section>
                    )}

                    {/* Billing & Plan */}

                    {activeTab === "billing" && (
                      <section
                        id="billing"
                        className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8"
                      >
                        <h2 className="text-2xl font-extrabold">
                          Billing & Plan
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          View your account plan and billing information.
                        </p>

                        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                          <h3 className="font-bold text-indigo-900">
                            Account Billing
                          </h3>

                          <p className="mt-2 text-sm text-indigo-700">
                            Your billing details and payment history will appear
                            here when billing management becomes available.
                          </p>
                        </div>
                      </section>
                    )}

                    {/* Danger Zone */}

                    {activeTab === "danger" && (
                      <section className="rounded-[28px] border border-red-100 bg-red-50/50 p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h2 className="text-xl font-extrabold text-red-600">
                              Danger Zone
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                              Permanently delete your account and associated
                              data. This action cannot be undone.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled
                            title="Account deletion is not available yet"
                            className="rounded-2xl border border-red-300 px-6 py-3 font-bold text-red-500 opacity-60 cursor-not-allowed"
                          >
                            Delete Account
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
