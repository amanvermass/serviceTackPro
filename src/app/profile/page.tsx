
"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CURRENT_USER } from "@/data/mock-user-data";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // or Authorization: Bearer token depending on API
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to change password");
      }

      toast.success(data.message || "Password updated successfully");

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowSecurity(false); // hide after success
    } catch (err: any) {
      const message = err.message || "Failed to change password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ================= USER INFO CARD ================= */}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border">
                <img
                  src={CURRENT_USER.avatarUrl}
                  alt={CURRENT_USER.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">
                  {CURRENT_USER.name}
                </h2>
                <p className="text-sm text-text-secondary">
                  {CURRENT_USER.email}
                </p>
                <p className="text-sm text-text-secondary">
                  {CURRENT_USER.role} • {CURRENT_USER.department}
                </p>
              </div>
            </div>

            {/* Change Password Link */}
            <div className="mt-4">
              <button
                onClick={() => setShowSecurity(!showSecurity)}
                className="text-primary text-sm font-medium hover:underline"
              >
                {showSecurity ? "Hide Change Password" : "Change Password"}
              </button>
            </div>
          </div>

          {/* ================= SECURITY CARD ================= */}
          {showSecurity && (
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Change Password</h3>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={form.oldPassword}
                    onChange={handleChange}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-2 rounded-lg font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
