"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  ChevronRight,
  Search,
  Check,
  Home,
  CheckSquare,
  Square,
  FileText,
  FileJson,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  loadFolders,
  loadImages,
  loadBreadcrumb,
  handleBreadcrumbClickController,
  handleUploadController,
  handleDeleteController,
} from "../controllers/homeController";
import { deleteImageAPI } from "@/services/apiService";

type SizeOption = "original" | "512px" | "256px";

interface PreviewImage {
  url: string;
  id: string;
  type: "image" | "video";
  thumbnail256?: string | null;
  thumbnail512?: string | null;
}

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const [folders, setFolders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(
    folderIdFromUrl,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [previewSize, setPreviewSize] = useState<SizeOption>("original");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getToken();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
    else setIsAuthorized(true);
  }, [router]);

  const fetchContent = useCallback(async () => {
    if (!token) return;
    try {
      await loadImages(token, selectedFolder, setImages, () => {});
    } catch (err) {
      console.error(err);
    }
  }, [token, selectedFolder]);

  useEffect(() => {
    const load = async () => {
      if (!token || !isAuthorized) return;
      setImagesLoading(true);
      try {
        await Promise.all([
          loadFolders(token, setFolders),
          fetchContent(),
          loadBreadcrumb(token, selectedFolder, setBreadcrumb),
        ]);
      } finally {
        setImagesLoading(false);
      }
    };
    load();
  }, [selectedFolder, token, isAuthorized, fetchContent]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesSearch = img._id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (selectedFolder === null)
        return matchesSearch && !img.folder && !img.folderId;
      return matchesSearch;
    });
  }, [images, searchQuery, selectedFolder]);

  // ─── Sign Out with Confirm ─────────────────────────────────────────────────
  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Sign Out?",
      text: "do you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "yes, Sign Out",
      cancelButtonText: "no, Stay",
    });

    if (result.isConfirmed) {
      removeToken();
      router.replace("/");
    }
  };

  // ─── Download ──────────────────────────────────────────────────────────────
  const handleDownloadImage = async (
    fileUrl: string,
    id: string,
    label: string,
  ) => {
    try {
      setGlobalLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = fileUrl.split("?")[0].split(".").pop() || "png";
      const fileName =
        label === "Original"
          ? `original-${id.slice(-6)}`
          : `resized-${label}-${id.slice(-6)}`;
      link.download = `${fileName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    } finally {
      setGlobalLoading(false);
    }
  };

  // ─── Single Delete with Confirm ────────────────────────────────────────────
  const handleSingleDelete = async (imgId: string) => {
    const result = await Swal.fire({
      title: "Delete karo?",
      text: "Are you sure you want to delete this asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setGlobalLoading(true);
      try {
        await deleteImageAPI(token!, imgId);
        await fetchContent();
        Swal.fire("Deleted!", "Asset deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete asset.", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  // ─── Bulk Delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `${selectedImages.length} assets will be deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setGlobalLoading(true);
      try {
        await Promise.all(
          selectedImages.map((id) => deleteImageAPI(token!, id)),
        );
        await fetchContent();
        setSelectedImages([]);
        setIsSelectionMode(false);
        Swal.fire("Deleted!", "Assets deleted successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete assets.", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  // ─── Preview ───────────────────────────────────────────────────────────────
  const getPreviewUrl = (img: PreviewImage, size: SizeOption): string => {
    if (size === "256px" && img.thumbnail256) return img.thumbnail256;
    if (size === "512px" && img.thumbnail512) return img.thumbnail512;
    return img.url;
  };

  const openPreview = (img: any) => {
    const isVideo =
      img.url?.toLowerCase().endsWith(".mp4") ||
      img.url?.toLowerCase().endsWith(".webm") ||
      img.url?.toLowerCase().endsWith(".mov");

    setPreviewImage({
      url: img.url,
      id: img._id,
      type: isVideo ? "video" : "image",
      thumbnail256: img.thumbnail256 || null,
      thumbnail512: img.thumbnail512 || null,
    });
    setPreviewSize("original");
  };

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative font-sans text-slate-900">
      {globalLoading && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
          <div className="p-8 rounded-2xl bg-white shadow-2xl flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <h3 className="font-semibold text-slate-800">Processing...</h3>
          </div>
        </div>
      )}

      <SideBar
        folders={folders}
        setFolders={setFolders}
        setGlobalLoading={setGlobalLoading}
        fetchImages={fetchContent}
        selectedFolder={selectedFolder}
        setSelectedFolder={(id) => {
          setSelectedFolderState(id);
          router.replace(id ? `/homePage?folderId=${id}` : `/homePage`);
        }}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <nav className="flex items-center text-sm font-medium overflow-hidden">
            <div
              onClick={() => setSelectedFolderState(null)}
              className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-indigo-600 shrink-0"
            >
              <Home size={18} />
            </div>
            <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap">
              {breadcrumb
                .split("/")
                .filter(Boolean)
                .map((name, idx, arr) => (
                  <div key={idx} className="flex items-center">
                    <ChevronRight
                      size={14}
                      className="mx-1 text-slate-300 shrink-0"
                    />
                    <span
                      className={`truncate max-w-[150px] px-2 py-1 rounded-md ${
                        idx === arr.length - 1
                          ? "text-slate-900 font-bold bg-slate-50"
                          : "text-slate-500 hover:text-indigo-600 cursor-pointer"
                      }`}
                      onClick={() =>
                        idx !== arr.length - 1 &&
                        handleBreadcrumbClickController(
                          token!,
                          arr.slice(0, idx + 1),
                          setSelectedFolderState,
                        )
                      }
                    >
                      {name}
                    </span>
                  </div>
                ))}
            </div>
          </nav>

          {/* ✅ Sign Out with confirmation */}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-slate-500 hover:text-red-600"
          >
            <LogOut size={18} className="lg:mr-2" />
            <span className="hidden lg:inline text-xs font-bold uppercase">
              Sign Out
            </span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          {/* Top Controls */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
              <div className="relative w-full flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* ✅ Mobile: Selection mode toggle */}
                <Button
                  variant={isSelectionMode ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 sm:flex-none h-11 px-4 rounded-xl ${isSelectionMode ? "bg-indigo-600 text-white" : ""}`}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedImages([]);
                  }}
                >
                  {isSelectionMode ? (
                    <CheckSquare size={16} className="mr-2" />
                  ) : (
                    <Square size={16} className="mr-2" />
                  )}
                  {isSelectionMode ? "Cancel" : "Select"}
                </Button>
                {selectedImages.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 bg-red-600 text-white sm:flex-none h-11 px-4 rounded-xl"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={16} className="mr-2" /> Delete (
                    {selectedImages.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-8 text-center transition-all cursor-pointer bg-white/50 hover:bg-white mb-10 shadow-sm"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2
                  className="animate-spin text-indigo-600 mb-2"
                  size={32}
                />
                <p className="font-bold text-indigo-600 text-sm">
                  Uploading...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FolderPlus size={24} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Add New Assets
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Images, Videos, JSON or PDF
                </p>
              </div>
            )}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              accept="image/*,video/*,application/json,application/pdf"
              className="hidden"
              onChange={(e) =>
                e.target.files &&
                handleUploadController(
                  token!,
                  e.target.files,
                  selectedFolder,
                  setUploading,
                  fetchContent,
                )
              }
            />
          </div>

          {/* Asset Grid */}
          {imagesLoading ? (
            <AssetSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredImages.map((img) => {
                const urlLower = img.url?.toLowerCase() || "";
                const isPdf = urlLower.endsWith(".pdf");
                const isJson = urlLower.endsWith(".json");
                const isVideo =
                  urlLower.endsWith(".mp4") ||
                  urlLower.endsWith(".webm") ||
                  urlLower.endsWith(".mov");
                const isSelected = selectedImages.includes(img._id);

                return (
                  <div
                    key={img._id}
                    className={`group bg-white rounded-2xl border ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-slate-200"
                    } transition-all duration-300 relative shadow-sm hover:shadow-lg overflow-hidden`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                      {/* Selection overlay */}
                      {isSelectionMode && (
                        <div
                          onClick={() =>
                            setSelectedImages((prev) =>
                              prev.includes(img._id)
                                ? prev.filter((i) => i !== img._id)
                                : [...prev, img._id],
                            )
                          }
                          className="absolute inset-0 z-30 bg-indigo-600/10 cursor-pointer flex p-3"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white/80 border-slate-300"
                            }`}
                          >
                            {isSelected && <Check size={14} strokeWidth={4} />}
                          </div>
                        </div>
                      )}

                      {isPdf ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() =>
                            !isSelectionMode && window.open(img.url, "_blank")
                          }
                        >
                          <FileText size={40} className="text-red-500 mb-1" />
                          <span className="text-[10px] font-bold text-red-600 uppercase">
                            PDF
                          </span>
                        </div>
                      ) : isJson ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() =>
                            !isSelectionMode && window.open(img.url, "_blank")
                          }
                        >
                          <FileJson size={40} className="text-amber-500 mb-1" />
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            JSON
                          </span>
                        </div>
                      ) : isVideo ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => !isSelectionMode && openPreview(img)}
                        >
                          <Video size={40} className="text-indigo-500 mb-1" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            Video
                          </span>
                        </div>
                      ) : (
                        <NextImage
                          src={img.url}
                          alt="asset"
                          fill
                          className="object-cover cursor-pointer group-hover:scale-105 transition-transform"
                          onClick={() => !isSelectionMode && openPreview(img)}
                        />
                      )}

                      {/* Desktop: hover delete button */}
                      {!isSelectionMode && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-20 hidden sm:flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleDelete(img._id);
                            }}
                            className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-slate-500">
                          ID: {img._id.slice(-6)}
                        </p>
                        <p className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                          {isPdf
                            ? "PDF"
                            : isJson
                              ? "JSON"
                              : isVideo
                                ? "VIDEO"
                                : "IMAGE"}
                        </p>
                      </div>

                      {/* ✅ Mobile: Delete button always visible */}
                      {!isSelectionMode && (
                        <button
                          onClick={() => handleSingleDelete(img._id)}
                          className="sm:hidden w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 active:bg-red-100"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={28} />
          </button>

          <div className="relative w-full max-w-5xl flex flex-col items-center gap-6">
            <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/20">
              {previewImage.type === "video" ? (
                <video
                  src={previewImage.url}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={getPreviewUrl(previewImage, previewSize)}
                  className="w-full h-full object-contain transition-opacity duration-200"
                  alt="preview"
                />
              )}
            </div>

            {previewImage.type === "image" && (
              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
                <div className="flex bg-white/10 rounded-2xl p-1 gap-1">
                  {(
                    [
                      { key: "original", label: "Original" },
                      {
                        key: "512px",
                        label: "512 px",
                        available: !!previewImage.thumbnail512,
                      },
                      {
                        key: "256px",
                        label: "256 px",
                        available: !!previewImage.thumbnail256,
                      },
                    ] as {
                      key: SizeOption;
                      label: string;
                      available?: boolean;
                    }[]
                  ).map(({ key, label, available }) => {
                    const isAvailable = key === "original" || available;
                    return (
                      <button
                        key={key}
                        disabled={!isAvailable}
                        onClick={() => setPreviewSize(key)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          previewSize === key
                            ? "bg-white text-slate-900 shadow-lg"
                            : isAvailable
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-white/20 cursor-not-allowed"
                        }`}
                      >
                        {label}
                        {!isAvailable && key !== "original" && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    handleDownloadImage(
                      getPreviewUrl(previewImage, previewSize),
                      previewImage.id,
                      previewSize === "original" ? "Original" : previewSize,
                    )
                  }
                  className="flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
                >
                  <Download size={18} />
                  Download{" "}
                  {previewSize === "original" ? "Original" : previewSize}
                </button>
              </div>
            )}

            {previewImage.type === "video" && (
              <button
                onClick={() =>
                  handleDownloadImage(
                    previewImage.url,
                    previewImage.id,
                    "Original",
                  )
                }
                className="flex items-center justify-center gap-3 bg-white text-slate-900 px-12 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
              >
                <Download size={20} /> Download Video
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
