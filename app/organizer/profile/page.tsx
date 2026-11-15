"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

type Organizer = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  organizationName: string | null;
  organizationDescription: string | null;
  organizationLogo: string | null;
  organizationWebsite: string | null;
  organizerBio: string | null;
  createdAt: string;
};

type OrganizerForm = {
  fullName: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  organizationName: string;
  organizationDescription: string;
  organizationWebsite: string;
  organizerBio: string;
};

type Tab = "personal" | "organization" | "followers" | "security";
type Notice = { type: "success" | "error"; text: string } | null;

const ME = `
  query OrganizerProfile {
    me {
      id fullName email phone avatar role status
      country state city address
      organizationName organizationDescription organizationLogo
      organizationWebsite organizerBio createdAt
    }
  }
`;

const UPDATE = `
  mutation UpdateOrganizerProfile($input: UpdateOrganizerProfileInput!) {
    updateOrganizerProfile(input: $input) {
      id fullName email phone avatar role status
      country state city address
      organizationName organizationDescription organizationLogo
      organizationWebsite organizerBio createdAt
    }
  }
`;

const MY_EVENTS = `
  query OrganizerProfileEvents {
    getMyEvents { id status bookedSeats }
  }
`;

type EventStats = { id: string; status: string; bookedSeats: number };
type Follower = { id: string; fullName: string; avatar: string | null; createdAt: string };

const FOLLOWERS = `
  query MyOrganizerFollowers {
    myOrganizerFollowers { id fullName avatar createdAt }
  }
`;

const CHANGE_PASSWORD = `
  mutation ChangeMyPassword($currentPassword: String!, $newPassword: String!) {
    changeMyPassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

async function requestGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please log in to access your organizer profile.");
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const result: { data?: T; errors?: Array<{ message: string }> } = await response.json();
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.[0]?.message || "Something went wrong. Please try again.");
  }
  return result.data;
}

async function uploadImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP picture.");
  }
  if (file.size > 3 * 1024 * 1024) throw new Error("Pictures must be 3 MB or smaller.");
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please log in to upload a picture.");
  const data = new FormData();
  data.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  const result: { url?: string; error?: string } = await response.json();
  if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed.");
  return result.url;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "O";
}

const emptyForm: OrganizerForm = {
  fullName: "", phone: "", country: "", state: "", city: "", address: "",
  organizationName: "", organizationDescription: "", organizationWebsite: "", organizerBio: "",
};

function makeForm(user: Organizer): OrganizerForm {
  return {
    fullName: user.fullName, phone: user.phone ?? "",
    country: user.country ?? "", state: user.state ?? "", city: user.city ?? "", address: user.address ?? "",
    organizationName: user.organizationName ?? "", organizationDescription: user.organizationDescription ?? "",
    organizationWebsite: user.organizationWebsite ?? "", organizerBio: user.organizerBio ?? "",
  };
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function OrganizerProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("personal");
  const [profile, setProfile] = useState<Organizer | null>(null);
  const [form, setForm] = useState<OrganizerForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [events, setEvents] = useState<EventStats[] | null>(null);
  const [followers, setFollowers] = useState<Follower[] | null>(null);
  const [followerError, setFollowerError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const data = await requestGraphQL<{ me: Organizer | null }>(ME);
      if (!data.me) throw new Error("Your session has expired. Please log in.");
      if (data.me.role !== "ORGANIZER") throw new Error("This page is available to organizers only.");
      setProfile(data.me);
      setForm(makeForm(data.me));
      try {
        const followerData = await requestGraphQL<{ myOrganizerFollowers: Follower[] }>(FOLLOWERS);
        setFollowers(followerData.myOrganizerFollowers);
        setFollowerError("");
      } catch (error) {
        setFollowers(null);
        setFollowerError(error instanceof Error ? error.message : "Could not load followers.");
      }
      // Event stats are optional; a failure shouldn't hide the organizer's profile.
      try {
        const result = await requestGraphQL<{ getMyEvents: EventStats[] }>(MY_EVENTS);
        setEvents(result.getMyEvents);
      } catch {
        setEvents(null);
      }
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [avatarPreview, logoPreview]);

  function selectImage(file: File | undefined, kind: "avatar" | "logo") {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setNotice({ type: "error", text: "Select a JPG, PNG, or WebP image up to 3 MB." });
      return;
    }
    const url = URL.createObjectURL(file);
    if (kind === "avatar") { setAvatarFile(file); setAvatarPreview(url); }
    else { setLogoFile(file); setLogoPreview(url); }
    setNotice(null);
  }

  function edit(field: keyof OrganizerForm, value: string) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || saving || profile.status === "BLOCKED") return;
    setNotice(null);
    setSaving(true);
    try {
      if (!form.fullName.trim()) throw new Error("Full name is required.");
      if (tab === "organization" && !form.organizationName.trim()) throw new Error("Organization name is required.");
      const website = form.organizationWebsite.trim();
      if (website && !["https:", "http:"].includes(new URL(website).protocol)) {
        throw new Error("Organization website must be an HTTP or HTTPS URL.");
      }
      // Upload only if a new file was selected; otherwise retain existing URLs.
      const avatar = avatarFile ? await uploadImage(avatarFile) : profile.avatar;
      const organizationLogo = logoFile ? await uploadImage(logoFile) : profile.organizationLogo;
      const input = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()]),
      );
      const data = await requestGraphQL<{ updateOrganizerProfile: Organizer }>(UPDATE, {
        input: { ...input, avatar, organizationLogo },
      });
      setProfile(data.updateOrganizerProfile);
      setForm(makeForm(data.updateOrganizerProfile));
      setAvatarFile(null); setLogoFile(null);
      setAvatarPreview(null); setLogoPreview(null);
      setNotice({ type: "success", text: "Organizer profile updated successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);
    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setNotice({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (currentPassword === newPassword) {
      setNotice({ type: "error", text: "Choose a password different from your current password." });
      return;
    }
    setChangingPassword(true);
    try {
      const result = await requestGraphQL<{ changeMyPassword: string }>(CHANGE_PASSWORD, {
        currentPassword, newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", text: result.changeMyPassword });
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Could not change password." });
    } finally {
      setChangingPassword(false);
    }
  }

  const blocked = saving || profile?.status !== "ACTIVE";
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");
  const joined = profile?.createdAt && !Number.isNaN(new Date(profile.createdAt).getTime())
    ? new Date(profile.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : null;
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "organization", label: "Organization Details", icon: "🏢" },
    { id: "followers", label: "Followers", icon: "👥" },
    { id: "security", label: "Security & Settings", icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <Sidebar role="organizer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar title="Organizer Profile" onToggleSidebar={() => setSidebarOpen((value) => !value)} />
      <main className="px-4 py-7 sm:px-7 lg:ml-64 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {loading ? <div className="rounded-3xl bg-white p-10 text-center text-slate-500">Loading organizer profile...</div> : (
            <>
              <section className="relative mb-8">
                <div className="relative h-48 overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-800 via-indigo-600 to-violet-500 sm:h-64">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                  <div className="absolute bottom-6 left-7 text-sm font-bold tracking-wide text-white/85">CONCIERGE · ORGANIZER</div>
                </div>
                <div className="relative -mt-14 mx-3 flex flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-5 shadow-lg sm:mx-6 sm:flex-row sm:items-end sm:p-7">
                  <div className="relative shrink-0">
                    {(avatarPreview || profile?.avatar) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview || profile?.avatar || ""} alt="Organizer" className="h-28 w-28 rounded-full border-4 border-white bg-indigo-100 object-cover shadow-md" />
                    ) : <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-3xl font-extrabold text-indigo-700 shadow-md">{initials(profile?.fullName || "Organizer")}</div>}
                    <button type="button" onClick={() => avatarInput.current?.click()} disabled={blocked} aria-label="Choose profile picture" className="absolute bottom-0 right-0 rounded-full bg-indigo-700 px-3 py-2 text-sm text-white shadow disabled:opacity-50">📷</button>
                    <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { selectImage(e.target.files?.[0], "avatar"); e.target.value = ""; }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="break-words text-2xl font-extrabold sm:text-3xl">{profile?.fullName || "Organizer Profile"}</h1>
                    <p className="mt-1 font-semibold text-indigo-700">{profile?.organizationName || "Add your organization name"}</p>
                    <p className="mt-1 text-sm text-slate-500">{location || "Add your location"}{joined ? ` · Joined ${joined}` : ""}</p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${profile?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{profile?.status || "Account"} · ORGANIZER</span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:pb-2">
                    <Link href="/organizer/my-events" className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200">My Events</Link>
                    <button type="button" onClick={() => setTab("organization")} className="rounded-full bg-indigo-700 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-800">Edit Organization</button>
                  </div>
                </div>
              </section>

              {notice && <div role="status" className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.text}</div>}

              {!profile ? (
                <div className="rounded-3xl bg-white p-8"><p className="mb-4 text-slate-600">Unable to display this organizer profile.</p><Link href="/login" className="font-bold text-indigo-700">Go to login</Link></div>
              ) : (
                <>
                  <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Events hosted</p><p className="mt-2 text-3xl font-extrabold">{events ? events.length : "—"}</p></div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Booked seats</p><p className="mt-2 text-3xl font-extrabold">{events ? events.reduce((sum, event) => sum + (event.bookedSeats || 0), 0) : "—"}</p></div>
                    <div className="rounded-3xl bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Followers</p><p className="mt-2 text-3xl font-extrabold">{followers ? followers.length : "—"}</p></div>
                  </div>

                  <div className="grid gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
                    <aside className="self-start rounded-[28px] bg-[#f2f4f6] p-5">
                      <h2 className="mb-4 px-2 text-lg font-extrabold">Profile Settings</h2>
                      <div className="space-y-2">
                        {tabs.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setNotice(null); }} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${tab === item.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:bg-white/75"}`}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
                      </div>
                      <p className="mt-6 rounded-2xl bg-indigo-50 p-4 text-xs leading-relaxed text-indigo-800">A complete organizer profile helps attendees learn more about your events.</p>
                    </aside>

                    <div className="min-w-0">
                      {(tab === "personal" || tab === "organization") && (
                        <form onSubmit={save} className="space-y-6">
                          {tab === "personal" ? (
                            <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
                              <h2 className="text-2xl font-extrabold">Personal Information</h2>
                              <p className="mb-7 mt-1 text-sm text-slate-500">Manage your personal and contact information.</p>
                              <div className="grid gap-5 sm:grid-cols-2">
                                <div><label className={labelClass} htmlFor="organizer-fullName">Full Name</label><input id="organizer-fullName" required maxLength={120} className={inputClass} value={form.fullName} onChange={(e) => edit("fullName", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizer-email">Email</label><input id="organizer-email" className={inputClass} value={profile.email} disabled /></div>
                                <div><label className={labelClass} htmlFor="organizer-phone">Phone</label><input id="organizer-phone" type="tel" className={inputClass} value={form.phone} onChange={(e) => edit("phone", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizer-country">Country</label><input id="organizer-country" className={inputClass} value={form.country} onChange={(e) => edit("country", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizer-state">State</label><input id="organizer-state" className={inputClass} value={form.state} onChange={(e) => edit("state", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizer-city">City</label><input id="organizer-city" className={inputClass} value={form.city} onChange={(e) => edit("city", e.target.value)} disabled={blocked} /></div>
                              </div>
                              <div className="mt-5"><label className={labelClass} htmlFor="organizer-address">Address (optional)</label><textarea id="organizer-address" rows={3} className={inputClass} value={form.address} onChange={(e) => edit("address", e.target.value)} disabled={blocked} /></div>
                            </section>
                          ) : (
                            <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
                              <h2 className="text-2xl font-extrabold">Organization Details</h2>
                              <p className="mb-7 mt-1 text-sm text-slate-500">Details that will appear on your public host profile.</p>
                              <div className="mb-6 flex flex-wrap items-center gap-4">
                                {(logoPreview || profile.organizationLogo) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={logoPreview || profile.organizationLogo || ""} alt="Organization logo" className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
                                ) : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700">{initials(form.organizationName)}</div>}
                                <div><button type="button" onClick={() => logoInput.current?.click()} disabled={blocked} className="rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-700 disabled:opacity-50">Choose Logo</button><p className="mt-1 text-xs text-slate-500">Optional · JPG, PNG, WebP · Max 3 MB</p></div>
                                <input ref={logoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { selectImage(e.target.files?.[0], "logo"); e.target.value = ""; }} />
                              </div>
                              <div className="space-y-5">
                                <div><label className={labelClass} htmlFor="organizationName">Organization Name</label><input id="organizationName" required maxLength={160} className={inputClass} value={form.organizationName} onChange={(e) => edit("organizationName", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizationWebsite">Website (optional)</label><input id="organizationWebsite" type="url" placeholder="https://example.com" className={inputClass} value={form.organizationWebsite} onChange={(e) => edit("organizationWebsite", e.target.value)} disabled={blocked} /></div>
                                <div><label className={labelClass} htmlFor="organizerBio">Organizer Bio</label><textarea id="organizerBio" rows={4} maxLength={1000} className={inputClass} value={form.organizerBio} onChange={(e) => edit("organizerBio", e.target.value)} disabled={blocked} placeholder="Tell attendees about your experience..." /></div>
                                <div><label className={labelClass} htmlFor="organizationDescription">Organization Description</label><textarea id="organizationDescription" rows={5} maxLength={2000} className={inputClass} value={form.organizationDescription} onChange={(e) => edit("organizationDescription", e.target.value)} disabled={blocked} placeholder="What does your organization do?" /></div>
                              </div>
                            </section>
                          )}
                          <div className="flex justify-end"><button type="submit" disabled={blocked} className="rounded-2xl bg-indigo-700 px-8 py-3 font-bold text-white shadow-sm hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button></div>
                        </form>
                      )}
                      {tab === "followers" && (
                        <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
                          <h2 className="text-2xl font-extrabold">Followers</h2>
                          <p className="mt-2 text-sm text-slate-600">Users who follow your public organizer profile.</p>
                          {followerError ? (
                            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{followerError}</p>
                          ) : !followers ? (
                            <p className="mt-5 text-sm text-slate-500">Loading followers...</p>
                          ) : followers.length === 0 ? (
                            <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">You have no followers yet. They will appear here when users follow your public profile.</div>
                          ) : (
                            <div className="mt-6 divide-y divide-slate-100">
                              {followers.map((follower) => (
                                <div key={follower.id} className="flex items-center gap-4 py-4">
                                  {follower.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={follower.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                                  ) : (
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">{initials(follower.fullName)}</span>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900">{follower.fullName}</p>
                                    <p className="text-xs text-slate-500">Follower</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      )}
                      {tab === "security" && (
                        <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
                          <h2 className="text-2xl font-extrabold">Change Password</h2>
                          <p className="mb-6 mt-2 text-sm text-slate-600">Confirm your current password before setting a new one.</p>
                          <form onSubmit={handleChangePassword} className="max-w-lg space-y-5">
                            <div><label htmlFor="currentPassword" className={labelClass}>Current Password</label><input id="currentPassword" type="password" autoComplete="current-password" required className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={changingPassword || blocked} /></div>
                            <div><label htmlFor="newPassword" className={labelClass}>New Password</label><input id="newPassword" type="password" autoComplete="new-password" required minLength={8} className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={changingPassword || blocked} /></div>
                            <div><label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label><input id="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={changingPassword || blocked} /></div>
                            <button type="submit" disabled={changingPassword || blocked} className="rounded-2xl bg-indigo-700 px-7 py-3 text-sm font-bold text-white hover:bg-indigo-800 disabled:opacity-50">{changingPassword ? "Updating password..." : "Update Password"}</button>
                          </form>
                        </section>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
