import React, { useState, useEffect } from "react";
import { Lock, KeyRound } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Security = () => {
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Fetch user info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo(parsedUser);
    }
  }, []);

  // 🟢 Handle password update
  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill both fields!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-password/${
          userInfo.id
        }`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Password updated successfully! Please log in again.");
      // console.log("Response:", response.data);

      // 🧹 Clear localStorage & redirect to login
      localStorage.clear();
      setShowChangePasswordPopup(false);
      setOldPassword("");
      setNewPassword("");

      // Slight delay for user to see toast before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-newPrimary flex items-center gap-2">
          <Lock className="w-6 h-6" />
          Security Settings
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 max-w-3xl mx-auto transition-all duration-300 hover:shadow-xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Name
            </label>
            <input
              type="text"
              value={userInfo?.name || ""}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userInfo?.email || ""}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium cursor-not-allowed"
            />
          </div>
        </div>

        <button
          onClick={() => setShowChangePasswordPopup(true)}
          className="bg-newPrimary text-white font-medium px-5 py-1.5 mt-5 rounded-lg shadow-sm hover:shadow-md hover:bg-newPrimary/90 transition-all"
        >
          Change Password
        </button>
      </div>

      {/* 🔄 Change Password Modal */}
      {showChangePasswordPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <KeyRound className="text-newPrimary w-5 h-5" />
              <h2 className="text-lg font-semibold text-newPrimary">
                Change Password
              </h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-newPrimary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-newPrimary outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowChangePasswordPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-400"
                    : "bg-newPrimary hover:bg-newPrimary/90"
                } text-white px-5 py-2 rounded-md`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
