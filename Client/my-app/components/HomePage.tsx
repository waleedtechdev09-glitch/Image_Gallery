"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, removeToken, isLoggedIn } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import AssetSkeleton from "@/components/AssetSkeleton";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Trash2,
  Loader2,
  FolderPlus,
  X,
  Download,
  Scale,
  ChevronRight,
  Search,
  Check,
  MousePointer2,
  Inbox,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  loadFolders,
  loadImages,
  loadBreadcrumb,
  handleBreadcrumbClickController,
  handleUploadController,
  handleDeleteController,
  handleResizeController,
} from "../controllers/homeController";

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  // --- Core States ---
  const [folders, setFolders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(
    folderIdFromUrl,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");

  // --- UI States ---
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- Search & Bulk Features ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getToken();

  // --- Auth Guard ---
  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
    else setIsAuthorized(true);
  }, [router]);

  // --- Data Loading Logic ---
  useEffect(() => {
    const load = async () => {
      if (!token || !isAuthorized) return;
      setImagesLoading(true);
      try {
        await loadFolders(token, setFolders);
        await loadImages(token, selectedFolder, setImages, () => {});
        await loadBreadcrumb(token, selectedFolder, setBreadcrumb);
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setImagesLoading(false);
      }
    };
    load();
  }, [selectedFolder, token, isAuthorized]);

  const filteredImages = useMemo(() => {
    return images.filter((img) =>
      img._id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [images, searchQuery]);

  const toggleSelection = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${selectedImages.length} assets?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete all",
    });

    if (result.isConfirmed) {
      setGlobalLoading(true);
      try {
        for (const id of selectedImages) {
          await handleDeleteController(token!, id, () => {}, setImages);
        }
        setSelectedImages([]);
        setIsSelectionMode(false);
        Swal.fire("Success", "Selected assets deleted", "success");
      } catch (err) {
        Swal.fire("Error", "Bulk delete failed", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Sign Out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
    });
    if (result.isConfirmed) {
      setGlobalLoading(true);
      setTimeout(() => {
        removeToken();
        router.replace("/");
      }, 800);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative font-sans text-slate-900">
      {/* 🚀 Premium Loading Overlay */}
      {globalLoading && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm transition-all">
          <div className="p-8 rounded-2xl bg-white shadow-2xl flex flex-col items-center border border-slate-100">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <h3 className="font-semibold text-slate-800">Processing...</h3>
          </div>
        </div>
      )}

      <SideBar
        folders={folders}
        setFolders={setFolders}
        setGlobalLoading={setGlobalLoading}
        fetchImages={() =>
          loadImages(token!, selectedFolder, setImages, setImagesLoading)
        }
        selectedFolder={selectedFolder}
        setSelectedFolder={(id) => {
          setSelectedFolderState(id);
          router.replace(id ? `/homePage?folderId=${id}` : `/homePage`);
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* 🏛️ Glassmorphism Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <nav className="flex items-center text-sm font-medium overflow-hidden">
            <span
              onClick={() => setSelectedFolderState(null)}
              className="text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors shrink-0"
            >
              All Files
            </span>
            {breadcrumb
              .split("/")
              .filter(Boolean)
              .map((name, idx, arr) => (
                <div key={idx} className="flex items-center min-w-0">
                  <ChevronRight
                    size={14}
                    className="mx-2 text-slate-300 shrink-0"
                  />
                  <span
                    className={`truncate ${idx === arr.length - 1 ? "text-slate-900 font-bold" : "text-slate-500 hover:text-indigo-600 cursor-pointer"}`}
                    onClick={() =>
                      idx !== arr.length - 1 &&
                      handleBreadcrumbClickController(
                        token!,
                        arr.slice(0, idx + 1),
                        (id) => setSelectedFolderState(id),
                      )
                    }
                  >
                    {name}
                  </span>
                </div>
              ))}
          </nav>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={18} className="lg:mr-2" />
            <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">
              Sign Out
            </span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          {/* 🔍 Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
            <div className="relative w-full sm:flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {isSelectionMode ? (
                <>
                  <Button
                    onClick={handleBulkDelete}
                    disabled={selectedImages.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex-1 px-6 shadow-lg shadow-red-100"
                  >
                    <Trash2 size={18} className="mr-2" /> Delete (
                    {selectedImages.length})
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSelectionMode(false);
                      setSelectedImages([]);
                    }}
                    variant="outline"
                    className="rounded-xl border-slate-200 bg-white"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsSelectionMode(true)}
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-500 w-full px-6 shadow-sm"
                >
                  <MousePointer2 size={18} className="mr-2" /> Select Multiple
                </Button>
              )}
            </div>
          </div>

          {/* 📤 Clean Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-10 text-center transition-all cursor-pointer bg-white/50 hover:bg-white mb-12 shadow-sm"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2
                  className="animate-spin text-indigo-600 mb-2"
                  size={32}
                />
                <p className="font-bold text-indigo-600 animate-pulse text-sm">
                  Uploading...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FolderPlus size={28} />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  Click or drag files to upload
                </h3>
                <p className="text-slate-400 text-xs mt-1 font-medium">
                  PNG, JPG, WEBP up to 50MB
                </p>
              </div>
            )}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files &&
                handleUploadController(
                  token!,
                  e.target.files,
                  selectedFolder,
                  setUploading,
                  () =>
                    loadImages(
                      token!,
                      selectedFolder,
                      setImages,
                      setImagesLoading,
                    ),
                )
              }
              className="hidden"
            />
          </div>

          {imagesLoading ? (
            <AssetSkeleton />
          ) : (
            <div className="space-y-12">
              {/* 📂 Folders Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders
                  .filter((f) => f.parent === selectedFolder)
                  .map((folder) => (
                    <div
                      key={folder._id}
                      onClick={() => {
                        setSelectedFolderState(folder._id);
                        router.replace(`/homePage?folderId=${folder._id}`);
                      }}
                      className="group p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-3xl mb-2 filter grayscale group-hover:grayscale-0 transition-all">
                        📁
                      </div>
                      <span className="font-semibold text-slate-700 text-xs truncate w-full text-center">
                        {folder.name}
                      </span>
                    </div>
                  ))}
              </div>

              {/* 🖼️ Assets Grid */}
              {filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <Inbox size={48} className="mb-4 text-slate-400" />
                  <p className="text-slate-800 font-semibold text-lg">
                    Empty Workspace
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {filteredImages.map((img) => {
                    const isChecked = selectedImages.includes(img._id);
                    return (
                      <div
                        key={img._id}
                        onClick={() =>
                          isSelectionMode && toggleSelection(img._id)
                        }
                        className={`group bg-white rounded-2xl border transition-all duration-300 relative ${isChecked ? "ring-2 ring-indigo-500 border-transparent shadow-xl" : "border-slate-200 shadow-sm hover:shadow-lg"}`}
                      >
                        {isSelectionMode && (
                          <div
                            className={`absolute top-3 left-3 z-30 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? "bg-indigo-600 border-indigo-600" : "bg-white/80 border-slate-300"}`}
                          >
                            {isChecked && (
                              <Check
                                size={14}
                                className="text-white"
                                strokeWidth={4}
                              />
                            )}
                          </div>
                        )}

                        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-50">
                          <NextImage
                            src={
                              img.thumbnail512 || img.thumbnail256 || img.url
                            }
                            alt="asset"
                            fill
                            className="object-cover cursor-pointer group-hover:scale-105 transition-transform duration-700"
                            onClick={() =>
                              !isSelectionMode && setPreviewImage(img.url)
                            }
                          />

                          {!isSelectionMode && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteController(
                                    token!,
                                    img._id,
                                    () => {},
                                    setImages,
                                  );
                                }}
                                className="p-2.5 bg-white/95 text-red-600 rounded-xl hover:bg-red-600 hover:text-white shadow-lg"
                              >
                                <Trash2 size={15} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { value: size } = await Swal.fire({
                                    title: "Resize Asset",
                                    input: "radio",
                                    inputOptions: {
                                      "256": "Low (256px)",
                                      "512": "High (512px)",
                                    },
                                    inputValidator: (v) =>
                                      !v && "Choose a size!",
                                    showCancelButton: true,
                                    confirmButtonColor: "#4f46e5",
                                  });
                                  if (size)
                                    handleResizeController(
                                      token!,
                                      img._id,
                                      parseInt(size),
                                      setGlobalLoading,
                                      () =>
                                        loadImages(
                                          token!,
                                          selectedFolder,
                                          setImages,
                                          () => {},
                                        ),
                                    );
                                }}
                                className="p-2.5 bg-white/95 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white shadow-lg"
                              >
                                <Scale size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white rounded-b-2xl flex items-center justify-between border-t border-slate-50">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">
                              ID: {img._id.slice(-6)}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                              Cloud Native
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 🖼️ Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full z-[210] transition-all"
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/20">
              <img
                src={previewImage}
                className="w-full h-full object-contain"
                alt="preview"
              />
            </div>
            <div className="mt-6">
              <a
                href={previewImage}
                download
                target="_blank"
                className="flex items-center gap-3 bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl"
              >
                <Download size={20} /> Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
