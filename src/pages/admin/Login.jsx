import React, { useEffect, useState } from "react";
import gsap from "gsap";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../context/authSlice";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loding, setLoding] = useState(false);

  const [password, setPassword] = useState("");
  const [eyeOpen, setEyeclose] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    gsap.from(".login-box", { opacity: 0, y: 50, duration: 1 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoding(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;

      // ✅ Merge token with user and save as userInfo
      const userInfo = { ...user, token };

      // ✅ Store in Redux (will also store in localStorage via authSlice)
      dispatch(loginSuccess(userInfo));

      // ✅ Toast and redirect
      toast.success("Logged in successfully 🎉");

      if (user.isAdmin === true || user.isAdmin === false) {
        navigate("/admin");
      } else {
        navigate("/");
      }

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoding(false);
    }
  };

  return (
    <div className="min-h-screen relative  py-6 flex flex-col justify-center sm:py-12">
      {/* Overlay for opacity */}
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative py-3 px-4 sm:px-0 sm:max-w-xl sm:mx-auto">
        {/* Gradient background layer */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-newPrimary to-blue-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

        {/* Main card */}
        <div className="relative px-8 py-14 bg-white shadow-lg sm:rounded-3xl sm:p-16 max-w-[26rem] w-full">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl leading-relaxed font-bold text-gray-800 mb-8 text-center">
              Welcome to Infinity Distribution System
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  type="email"
                  placeholder="Enter E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                {/* Password Icon */}
                <FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />

                {/* Eye toggle */}
                <span
                  onClick={() => setEyeclose(!eyeOpen)}
                  className="absolute right-3 top-4 text-gray-500 cursor-pointer"
                >
                  {eyeOpen ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </span>

                <input
                  type={eyeOpen ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer pl-10 pr-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r flex justify-center from-newPrimary to-blue-400 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
              >
                {loding ? (
                  <span className="animate-spin">
                    <Loader size={18} />
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Signup link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-cyan-600 font-medium hover:underline"
              >
                Create
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
