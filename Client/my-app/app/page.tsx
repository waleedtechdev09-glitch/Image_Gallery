"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken, isLoggedIn } from "../utils/auth";
import { useLoginController } from "../hooks/useLoginController";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";

const LoginPage = () => {
  const router = useRouter();

  const { formData, loading, error, handleChange, handleSubmit } =
    useLoginController(async (token: string) => {
      setToken(token);
      await Swal.fire({
        title: "Welcome Back!",
        text: "Accessing your secure vault...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#ffffff",
        iconColor: "#2563eb",
      });
      router.push("/homePage");
    });

  useEffect(() => {
    if (isLoggedIn()) router.push("/homePage");
  }, [router]);

  return (
    <div className="relative min-h-screen bg-[#05070a] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      {/* 🌌 Atmospheric Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[1100px] grid lg:grid-cols-2 bg-[#0f1115] border border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-[2rem] overflow-hidden min-h-[100vh] sm:min-h-[700px]">
        {/* 🎨 Left Section: Product Branding (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-blue-600/20 to-transparent border-r border-white/5 relative">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Zap className="text-white fill-current" size={20} />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                PixelVault
              </span>
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              The smartest way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                manage your assets.
              </span>
            </h2>

            <div className="mt-12 space-y-6">
              {[
                { icon: ShieldCheck, text: "Enterprise-grade security" },
                { icon: Zap, text: "Real-time AI resizing engine" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <item.icon size={14} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="z-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "We've reduced our asset processing time by 80% using PixelVault's
              automated workflows."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50" />
              <div>
                <p className="text-white text-xs font-bold">Alex Rivera</p>
                <p className="text-slate-500 text-[10px]">CTO, DesignFlow</p>
              </div>
            </div>
          </div>

          {/* Decorative Grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* 📝 Right Section: Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-20 bg-white">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white fill-current" size={16} />
            </div>
            <span className="text-slate-900 font-bold text-lg">PixelVault</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Sign In
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your details to manage your library.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-xl animate-shake">
              <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                {error}
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
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
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 pl-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {/* <Link
                  href="#"
                  className="text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot?
                </Link> */}
              </div>
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
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 pl-12 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl p-4 mt-4 hover:bg-blue-600 active:scale-[0.98] transition-all font-bold shadow-xl shadow-slate-200 hover:shadow-blue-200 flex items-center justify-center group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  Sign into Dashboard{" "}
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
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Join our community
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
