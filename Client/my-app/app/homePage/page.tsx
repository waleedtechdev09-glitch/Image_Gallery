"use client";

import { Suspense } from "react";
import HomePageComponent from "@/components/HomePage";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    // ✨ Suspense boundary wrapping the component that uses useSearchParams
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-500 font-medium animate-pulse">
              Loading Library...
            </p>
          </div>
        </div>
      }
    >
      <HomePageComponent />
    </Suspense>
  );
}
