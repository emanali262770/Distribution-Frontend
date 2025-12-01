import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";
import { Loader } from "lucide-react";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    role: "user",
    password: "",
    confirm: "",
    agree: false,
  });
  const [eyeOpen, setEyeclose] = useState(false);
  const [ConfirmEyeOpen, setConfirmEyeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.role ||
      !form.password ||
      !form.confirm
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      toast.error("You must agree to the terms and privacy policy.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        {
          username: form.username,
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }
      );

      toast.success("Signup successful!");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="min-h-screen flex flex-col lg:flex-row">
    //   {/* Left: Signup Form */}
    //   <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-6 py-12">
    //     {/* Logo */}
    //     <div className="flex flex-col items-center mb-6">
    //       <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-2">
    //         Logo
    //       </div>
    //       <h2 className="text-2xl font-semibold mb-2">Sign Up</h2>
    //     </div>
    //     <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
    //         <input
    //           type="text"
    //           name="name"
    //           value={form.name}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           placeholder="Jiangyu"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Username</label>
    //         <input
    //           type="text"
    //           name="username"
    //           value={form.username}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           placeholder="johnkevine4362"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
    //         <input
    //           type="email"
    //           name="email"
    //           value={form.email}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           placeholder="example@gmail.com"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Role</label>
    //         <select
    //           name="role"
    //           value={form.role}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           required
    //         >
    //           <option value="user">User</option>
    //           <option value="admin">Admin</option>
    //         </select>
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Password</label>
    //         <input
    //           type="password"
    //           name="password"
    //           value={form.password}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           placeholder="Password"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
    //         <input
    //           type="password"
    //           name="confirm"
    //           value={form.confirm}
    //           onChange={handleChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           placeholder="Confirm Password"
    //           required
    //         />
    //       </div>
    //       <div className="flex items-center">
    //         <input
    //           type="checkbox"
    //           name="agree"
    //           checked={form.agree}
    //           onChange={handleChange}
    //           className="mr-2"
    //           required
    //         />
    //         <span className="text-xs text-gray-600">
    //           By creating an account you agree to the{" "}
    //           <a href="#" className="text-indigo-600 underline">terms of use</a> and our{" "}
    //           <a href="#" className="text-indigo-600 underline">privacy policy</a>.
    //         </span>
    //       </div>
    //       <button
    //         type="submit"
    //         disabled={loading}
    //         className="w-full bg-newPrimary hover:bg-secondary text-white py-2 rounded-md font-semibold transition-all"
    //       >
    //         {loading ? "Signing up..." : "Create account"}
    //       </button>
    //     </form>
    //     <div className="mt-4 text-center text-sm text-gray-700">
    //       Already have an account?{" "}
    //       <Link to="/" className="text-secondary hover:text-secondary/80 font-medium">
    //         Log in
    //       </Link>
    //     </div>
    //   </div>
    //   {/* Right: Illustration */}
    //   <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center">
    //     <img
    //       src="/images/login.avif"
    //       alt="Signup Illustration"
    //       className="max-w-[80%] h-auto"
    //     />
    //   </div>
    // </div>
    <div className="min-h-screen relative bg-[url('/images/erpImage.png')] bg-cover bg-center py-6 flex flex-col justify-center sm:py-12">
      {/* Overlay for opacity */}
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative py-3 px-4 sm:px-0 sm:max-w-xl sm:mx-auto">
        {/* Gradient background layer */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-newPrimary to-blue-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

        {/* Main card */}
        <div className="relative px-6 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Create Account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Username */}
              <div className="relative">
                <FiUserCheck className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Role */}
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400 text-lg" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500 bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />

                {/* Eye Icon */}
                <span
                  onClick={() => setEyeclose(!eyeOpen)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                >
                  {eyeOpen ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </span>

                <input
                  type={eyeOpen ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="peer pl-10 pr-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />

                {/* Eye Icon */}
                <span
                  onClick={() => setConfirmEyeOpen(!ConfirmEyeOpen)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                >
                  {ConfirmEyeOpen ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </span>

                <input
                  type={ConfirmEyeOpen ? "text" : "password"}
                  name="confirm"
                  placeholder="Confirm Password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="peer pl-10 pr-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  By creating an account you agree to the{" "}
                  <a href="#" className="text-cyan-600 hover:underline">
                    terms of use
                  </a>{" "}
                  and our{" "}
                  <a href="#" className="text-cyan-600 hover:underline">
                    privacy policy
                  </a>
                  .
                </span>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r flex justify-center from-newPrimary to-blue-400 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
              >
                {loading ? (
                  <span className="animate-spin">
                    <Loader size={18} />
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-cyan-600 font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
