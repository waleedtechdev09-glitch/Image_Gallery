"use client";

import React from "react";

const AssetSkeleton = () => {
  return (
    <div className="space-y-10">
      {/* 📁 Folders Loading Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={`folder-skel-${i}`}
            className="h-24 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 animate-pulse"
          >
            {/* Folder Icon Circle */}
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            {/* Folder Name Line */}
            <div className="h-2 bg-slate-100 rounded-full w-2/3" />
          </div>
        ))}
      </div>

      {/* 🖼️ Assets/Images Loading Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={`asset-skel-${i}`}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse shadow-sm"
          >
            {/* Image Placeholder (Square) */}
            <div className="aspect-square bg-slate-200" />

            {/* Info Bar Placeholder */}
            <div className="p-3 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                {/* File Name Line */}
                <div className="h-2.5 bg-slate-200 rounded-full w-3/4" />
                {/* Meta Text Line */}
                <div className="h-2 bg-slate-100 rounded-full w-1/2" />
              </div>
              {/* Status Dot */}
              <div className="w-2 h-2 rounded-full bg-slate-200 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetSkeleton;
