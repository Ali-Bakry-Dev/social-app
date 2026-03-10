import { useState } from "react";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import { changePasswordApi } from "../../api/users.js";
import { Key } from "lucide-react";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await changePasswordApi({
        password: currentPassword,
        newPassword,
      });

      alert("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-700">
              <Key size={18} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Change Password
              </h2>
              <p className="text-xs text-slate-500">
                Keep your account secure by using a strong password.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Current password
              </label>

              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                New password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                required
              />

              <p className="text-xs text-slate-500 mt-1">
                At least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Confirm new password
              </label>

              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

          </form>
        </div>
      </div>
    </AppLayout>
  );
}