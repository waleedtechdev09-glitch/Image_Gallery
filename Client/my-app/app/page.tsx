"use client";

import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setToken, isLoggedIn } from "../utils/auth";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/homePage");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.token) {
        setToken(res.data.token);
        router.push("/homePage");
      } else {
        setError("Token not returned from backend");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black px-4 sm:px-6 md:px-12 lg:px-24 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"></div>
          <div className="z-10 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-xl font-semibold animate-pulse">
              Logging in...
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ${
          loading ? "blur-sm" : ""
        }`}
      >
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <div className="bg-white w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full flex justify-center items-center mx-auto lg:mx-0">
            <Image src="/logo.png" alt="Logo" width={80} height={80} />
          </div>

          <div className="mt-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Login to your account
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Let's get started.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <form className="flex flex-col mt-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 text-black"
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 cursor-pointer text-white rounded-md p-3 my-4 hover:bg-blue-600 transition font-semibold disabled:opacity-70"
            >
              Login
            </button>
          </form>

          <div className="mt-3 mb-4 text-center lg:text-left">
            <p className="text-gray-400 text-sm">
              Haven&apos;t an account?{" "}
              <Link href="/signup" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <Image
            src="/Login.jpg"
            alt="Login Image"
            width={400}
            height={400}
            className="hidden md:block rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
