"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { useSignUpController } from "../../hooks/useSignUpController";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock } from "lucide-react";

const SignUpPage = () => {
  const router = useRouter();
  const { formData, loading, error, handleChange, handleSubmit } =
    useSignUpController(() => {
      alert("Registered successfully!");
      router.push("/");
    });

  useEffect(() => {
    if (isLoggedIn()) router.push("/homePage");
  }, [router]);

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-24">
      <div
        className={`flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden ${
          loading ? "blur-sm" : ""
        }`}
      >
        {/* LEFT SIDE - FORM */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
          <div className="bg-white w-24 h-24 rounded-full flex justify-center items-center mx-auto md:mx-0">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-md p-3 pl-10 my-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white rounded-md p-3 my-4 hover:bg-blue-600 transition disabled:opacity-70"
            >
              Sign Up
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-3 text-center md:text-left">
            Already have an account?{" "}
            <Link href="/" className="text-blue-500 hover:underline">
              Log In
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-6">
          <Image
            src="/Signup.jpg"
            alt="Sign Up"
            width={500}
            height={500}
            className="hidden md:block object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
