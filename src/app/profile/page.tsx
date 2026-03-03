
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, Lock, Edit2, Upload } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    avatar: null as File | null,
  });

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/users/me`, {
          headers: { "x-auth-token": token },
        });

        const userData = res.data.data || res.data.user;
        setUser(userData);
        setEditForm({
          name: userData.name,
          phone: userData.phone || "",
          avatar: null,
        });
        setPreview(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("phone", editForm.phone);
      if (editForm.avatar) {
        formData.append("avatar", editForm.avatar);
      }

      const res = await axios.put(`${API_BASE}/api/users/me`, formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Profile updated");

      const updatedUser = res.data.data || res.data.user;
      setUser(updatedUser);
      setIsEditing(false);
      setPreview(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

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

      setShowSecurity(false);
    } catch (err: unknown) {
      let message = "Failed to change password";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message || err.response?.data?.error || message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow w-full px-6 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ================= USER INFO CARD ================= */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-primary bg-gray-100 shadow-lg flex-shrink-0">
                <img
                  src={
                    user?.avatar
                      ? `${API_BASE}/${user.avatar}`
                      : "/default-avatar.png"
                  }
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {user?.name}
                </h1>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{user?.phone}</span>
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold inline-block">
                  {user?.role?.name || "User"}
                </span>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 cursor-pointer bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {/* Change Password Link */}
            <div className="mt-4">
              <button
                onClick={() => setShowSecurity(!showSecurity)}
                className="text-primary cursor-pointer text-sm font-medium hover:underline"
              >
                {showSecurity ? "Hide Change Password" : "Change Password"}
              </button>
            </div>
          </div>

          {/* ================= EDIT PROFILE FORM ================= */}
          {isEditing && (
            <div className="bg-surface border border-border rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Edit2 className="w-6 h-6" />
                Edit Your Profile
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Image Upload - Better UI */}
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-4">
                    Profile Picture
                  </label>

                  {/* Preview */}
                  {preview && (
                    <div className="mb-6 flex flex-col items-center gap-3">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary bg-gray-100 shadow-lg">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-text-secondary">Preview</p>
                    </div>
                  )}

                  {/* Upload Area */}
                  <label className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary-50 transition cursor-pointer group">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition mb-3">
                        <Upload className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 cursor-pointer bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPreview(null);
                    }}
                    className="px-6 cursor-pointer py-3 border border-border text-text-primary rounded-lg font-semibold hover:bg-background transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

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
                  className="w-full bg-primary cursor-pointer text-white py-2 rounded-lg font-medium
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
