"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  organization: string;
  avatarUrl: string;
}

export default function EditUserProfilePage() {
  const [formData, setFormData] = useState<UserProfileData>({
    fullName: "Julian Montgomery",
    email: "julian.m@concierge.io",
    phone: "+1 (555) 012-3456",
    role: "organizer",
    status: "active",
    organization: "Horizon Creative Agency",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBaH_sMlIoG5mlYV0lBCaWkFwqsYfmd3_npEYA4pye_xNuw62mY7X2xY7mtBA8bF59cyK0DvY-11sThE3Gn-MvzBAuJsWU6HE9-lboximEBZuT8dPeDogtugLlIDkcZLPRuSs_67b2CWqX3K-_JX_P2DMVB5AHZ2_tA62OqPL9PAf462H3ahHgPZCxwwYoMnKOQUCZ_mGNDTcSOO0fQKVVbcVgY8Z3QIlGFxLtVdU76_i8BZIoZ6DnV",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload preview
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate async API saving action
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);

      // Hide toast automatically after 4 seconds
      setTimeout(() => setShowToast(false), 4000);
    }, 1200);
  };

  return (
    <DashboardLayout title="users" role="admin">
      <div className="text-[#191c1e] py-6 px-4 sm:px-8">
        {/* Toast Notification */}
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${
            showToast
              ? "translate-y-0 opacity-100"
              : "translate-y-24 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-[#2d3133] text-[#eff1f3] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="material-symbols-outlined text-[#6ffbbe]">
              check_circle
            </span>
            <span className="font-medium">User profile updated successfully</span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 hover:opacity-70 transition-opacity"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Breadcrumbs & Title Header */}
        <div className="mb-10 max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-[#505f76] mb-4">
            <a href="#" className="hover:text-[#392cc1] transition-colors">
              Users
            </a>
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
            <span className="text-[#191c1e] font-medium">Edit User</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => window.history.back()}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#392cc1] shadow-sm hover:shadow-md active:scale-95 transition-all"
                type="button"
              >
                <span className="material-symbols-outlined">⮨</span>
              </button>
              <h1 className="font-bold text-4xl tracking-tight text-[#191c1e]">
                Edit User Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006e4b]/10 text-[#005338] font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#005338] animate-pulse"></span>
                Account Active
              </span>
            </div>
          </div>
        </div>

        {/* Form Card Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(25,28,30,0.06)] p-8 sm:p-12 relative overflow-hidden">
            {/* Subtle background glow accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#392cc1]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 pb-8 border-b border-[#f2f4f6]">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl bg-[#e0e3e5] overflow-hidden border-4 border-[#f7f9fb] shadow-inner relative">
                    <img
                      src={formData.avatarUrl || "https://via.placeholder.com/150"}
                      alt="User avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#392cc1] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#191c1e] mb-2">
                    Profile Photo
                  </h3>
                  <p className="text-[#505f76] text-sm leading-relaxed max-w-sm">
                    Upload a professional headshot. Recommended size is
                    400x400px. Max file size: 2MB.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <label className="text-[#392cc1] font-bold text-sm hover:underline cursor-pointer">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, avatarUrl: "" }))
                      }
                      className="text-[#ba1a1a] font-bold text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium"
                  />
                </div>

                {/* User Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    User Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent appearance-none focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                      <option value="attendee">Attendee</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#777587]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent appearance-none focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#777587]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#464555] ml-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-lg bg-[#f2f4f6] border-transparent focus:bg-white focus:ring-2 focus:ring-[#392cc1] transition-all outline-none font-medium"
                  />
                </div>
              </div>

              {/* Account Metadata */}
              <div className="p-6 rounded-lg bg-[#f2f4f6]/50 flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <p className="text-xs text-[#505f76] uppercase tracking-widest font-bold mb-1">
                    Created On
                  </p>
                  <p className="text-sm font-medium text-[#191c1e]">
                    October 24, 2023
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#505f76] uppercase tracking-widest font-bold mb-1">
                    Last Login
                  </p>
                  <p className="text-sm font-medium text-[#191c1e]">
                    2 hours ago (San Francisco, CA)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#505f76] uppercase tracking-widest font-bold mb-1">
                    Total Events
                  </p>
                  <p className="text-sm font-medium text-[#191c1e]">42 Hosted</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#f2f4f6]">
                <button
                  type="button"
                  className="text-[#ba1a1a] font-bold text-sm hover:bg-[#ba1a1a]/5 px-4 py-2 rounded-lg transition-all w-full sm:w-auto text-center"
                >
                  Delete User Profile
                </button>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-8 py-4 rounded-full text-[#392cc1] font-bold border-2 border-[#392cc1]/20 hover:bg-[#392cc1]/5 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-4 rounded-full bg-[#392cc1] text-white font-bold shadow-lg shadow-[#392cc1]/20 hover:shadow-xl hover:shadow-[#392cc1]/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          refresh
                        </span>
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}