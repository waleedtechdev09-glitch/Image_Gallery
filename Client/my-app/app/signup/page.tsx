"use client";

import Image from "next/image";
import { User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setToken, isLoggedIn } from "../../utils/auth";

const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to home
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
      await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
      });

      alert("User registered successfully! Please login.");

      router.push("/"); // always go to login page
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
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
            <div className="text-white text-xl font-semibold">
              Signing up...
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 ${
          loading ? "blur-sm" : ""
        }`}
      >
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <div className="bg-white w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full flex justify-center items-center mx-auto md:mx-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-cover"
            />
          </div>

          <div className="mt-6 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Create your account
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Let's get started with your account creation.
            </p>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <form className="flex flex-col mt-4" onSubmit={handleSubmit}>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 cursor-pointer text-white rounded-md p-3 my-4 hover:bg-blue-600 transition duration-300 font-semibold text-sm sm:text-base flex justify-center items-center disabled:opacity-70"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-3 mb-4 text-center md:text-left">
            <p className="text-gray-400 text-sm sm:text-base">
              Already have an account?{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-6">
          <Image
            src="/illustration.jpg"
            alt="Sign Up Image"
            width={500}
            height={500}
            className="hidden md:block object-cover rounded-lg mx-auto my-4 md:my-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
