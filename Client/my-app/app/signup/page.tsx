"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { useSignUpController } from "../../hooks/useSignUpController";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Swal from "sweetalert2";

const SignUpPage = () => {
  const router = useRouter();

  const { formData, loading, error, handleChange, handleSubmit } =
    useSignUpController(async () => {
      await Swal.fire({
        title: "Account Created!",
        text: "Registration successful. Welcome to PixelVault!",
        icon: "success",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        timerProgressBar: true,
        background: "#ffffff",
      });

      router.push("/");
    });

  useEffect(() => {
    if (isLoggedIn()) router.push("/homePage");
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#05070a] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      {/* 🌌 Atmospheric Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[1100px] grid lg:grid-cols-2 bg-[#0f1115] border border-white/5 shadow-2xl sm:rounded-[2rem] overflow-hidden min-h-[100vh] sm:min-h-[750px]">
        {/* 🎨 LEFT SECTION: Branding & Visuals (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-tr from-indigo-600/20 to-transparent border-r border-white/5 relative">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Sparkles className="text-white fill-current" size={20} />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                PixelVault
              </span>
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Start your journey <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                in seconds.
              </span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-sm font-medium">
              Join thousands of creators managing their high-performance digital
              libraries.
            </p>

            <div className="mt-12 space-y-5">
              {[
                "Unlimited smart resizing",
                "Cloud-native image optimization",
                "Advanced folder organization",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="z-10 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-yellow-500 text-xs">
                  ★
                </span>
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "Setting up was incredibly smooth. The best UI for an image
              management tool I've seen."
            </p>
          </div>

          {/* Abstract Grid Background Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* 📝 RIGHT SECTION: SignUp Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-20 bg-white">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white fill-current" size={16} />
            </div>
            <span className="text-slate-900 font-bold text-lg">PixelVault</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              Join PixelVault today and optimize your workflow.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-xl">
              <p className="text-red-600 text-sm font-bold flex items-center gap-2 italic">
                {error}
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 pl-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 pl-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 pl-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl p-4 mt-6 hover:bg-blue-600 active:scale-[0.98] transition-all font-bold shadow-xl shadow-slate-200 hover:shadow-blue-200 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <span className="flex items-center gap-2">
                  Create My Account{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-8">
            <p className="text-slate-500 text-sm font-medium">
              Already a member?{" "}
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
