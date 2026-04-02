"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, removeToken, isLoggedIn } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import AssetSkeleton from "@/components/AssetSkeleton";
import NextImage from "next/image";
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
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  AlignLeft,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  loadFolders,
  loadImages,
  loadBreadcrumb,
  handleBreadcrumbClickController,
  handleUploadController,
} from "../controllers/homeController";
import { deleteImageAPI } from "@/services/apiService";

type SizeOption = "original" | "512px" | "256px";

interface PreviewImage {
  url: string;
  id: string;
  type: "image" | "video" | "audio";
  thumbnail256?: string | null;
  thumbnail512?: string | null;
}

const showUnavailableIndicator = "!available";

const getFileType = (url: string) => {
  const u = url?.toLowerCase().split("?")[0] || "";
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov"))
    return "video";
  if (
    u.endsWith(".mp3") ||
    u.endsWith(".wav") ||
    u.endsWith(".ogg") ||
    u.endsWith(".aac")
  )
    return "audio";
  if (u.endsWith(".pdf")) return "pdf";
  if (u.endsWith(".json")) return "json";
  if (u.endsWith(".docx") || u.endsWith(".doc")) return "word";
  if (u.endsWith(".xlsx") || u.endsWith(".xls") || u.endsWith(".csv"))
    return "excel";
  if (u.endsWith(".pptx") || u.endsWith(".ppt")) return "ppt";
  if (u.endsWith(".zip") || u.endsWith(".rar") || u.endsWith(".7z"))
    return "archive";
  if (u.endsWith(".txt")) return "text";
  return "image";
};

const FILE_META: Record<
  string,
  { icon: any; gradient: string; label: string; glow: string }
> = {
  pdf: {
    icon: FileText,
    gradient: "from-red-500 to-rose-600",
    label: "PDF",
    glow: "rgba(239,68,68,0.3)",
  },
  json: {
    icon: FileJson,
    gradient: "from-amber-400 to-orange-500",
    label: "JSON",
    glow: "rgba(245,158,11,0.3)",
  },
  video: {
    icon: Video,
    gradient: "from-indigo-500 to-violet-600",
    label: "VIDEO",
    glow: "rgba(99,102,241,0.3)",
  },
  audio: {
    icon: Music,
    gradient: "from-purple-500 to-fuchsia-600",
    label: "AUDIO",
    glow: "rgba(168,85,247,0.3)",
  },
  word: {
    icon: FileText,
    gradient: "from-blue-500 to-cyan-600",
    label: "DOCX",
    glow: "rgba(59,130,246,0.3)",
  },
  excel: {
    icon: FileSpreadsheet,
    gradient: "from-emerald-500 to-green-600",
    label: "XLSX",
    glow: "rgba(16,185,129,0.3)",
  },
  ppt: {
    icon: Presentation,
    gradient: "from-orange-500 to-red-500",
    label: "PPTX",
    glow: "rgba(249,115,22,0.3)",
  },
  archive: {
    icon: Archive,
    gradient: "from-slate-500 to-slate-600",
    label: "ZIP",
    glow: "rgba(100,116,139,0.3)",
  },
  text: {
    icon: AlignLeft,
    gradient: "from-slate-400 to-slate-500",
    label: "TXT",
    glow: "rgba(148,163,184,0.3)",
  },
};

const FileIcon = ({ type }: { type: string }) => {
  const cfg = FILE_META[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#0f0c1a]">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center mb-2 shadow-lg`}
        style={{ boxShadow: `0 8px 24px ${cfg.glow}` }}
      >
        <Icon size={26} className="text-white" />
      </div>
      <span className="text-[10px] font-black tracking-widest uppercase text-white/50">
        {cfg.label}
      </span>
    </div>
  );
};

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

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Sign Out?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#374151",
      confirmButtonText: "Yes, Sign Out",
      background: "#1e1b2e",
      color: "#e2e8f0",
    });
    if (result.isConfirmed) {
      removeToken();
      router.replace("/");
    }
  };

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
      const extension = fileUrl.split("?")[0].split(".").pop() || "bin";
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

  const handleSingleDelete = async (imgId: string) => {
    const result = await Swal.fire({
      title: "Delete Asset?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: "#1e1b2e",
      color: "#e2e8f0",
      confirmButtonText: "Yes, Delete",
    });
    if (result.isConfirmed) {
      setGlobalLoading(true);
      try {
        await deleteImageAPI(token!, imgId);
        await fetchContent();
      } catch {
        Swal.fire("Error", "Failed to delete asset.", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Deleting ${selectedImages.length} assets!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: "#1e1b2e",
      color: "#e2e8f0",
      confirmButtonText: "Yes, Delete All",
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
      } catch {
        Swal.fire("Error", "Failed to delete assets.", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const getPreviewUrl = (img: PreviewImage, size: SizeOption): string => {
    if (size === "256px" && img.thumbnail256) return img.thumbnail256;
    if (size === "512px" && img.thumbnail512) return img.thumbnail512;
    return img.url;
  };

  const openPreview = (img: any) => {
    const type = getFileType(img.url);
    if (type === "video" || type === "audio" || type === "image") {
      setPreviewImage({
        url: img.url,
        id: img._id,
        type: type as any,
        thumbnail256: img.thumbnail256 || null,
        thumbnail512: img.thumbnail512 || null,
      });
      setPreviewSize("original");
    } else {
      window.open(img.url, "_blank");
    }
  };

  if (!isAuthorized) return null;

  return (
    <div
      className="flex h-screen overflow-hidden relative font-sans"
      style={{
        background:
          "linear-gradient(135deg, #0f0c1a 0%, #12101f 50%, #0a0f1e 100%)",
      }}
    >
      {/* Global loading */}
      {globalLoading && (
        <div
          className="absolute inset-0 z-[200] flex items-center justify-center"
          style={{
            background: "rgba(10,8,20,0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="p-8 rounded-3xl flex flex-col items-center gap-3"
            style={{
              background: "rgba(30,27,46,0.95)",
              border: "1px solid rgba(99,102,241,0.3)",
              boxShadow: "0 24px 60px rgba(99,102,241,0.2)",
            }}
          >
            <Loader2 className="animate-spin text-indigo-400" size={40} />
            <h3 className="font-bold text-white text-sm tracking-wide">
              Processing...
            </h3>
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
        {/* Header */}
        <header
          className="h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40"
          style={{
            background: "rgba(15,12,26,0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <nav className="flex items-center text-sm font-medium overflow-hidden">
            <div
              onClick={() => setSelectedFolderState(null)}
              className="p-2 rounded-lg cursor-pointer shrink-0 transition-all"
              style={{ color: "rgba(148,163,184,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a5b4fc")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(148,163,184,0.6)")
              }
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
                      className="mx-1 shrink-0"
                      style={{ color: "rgba(99,102,241,0.4)" }}
                    />
                    <span
                      className="truncate max-w-[150px] px-2 py-1 rounded-md text-sm cursor-pointer transition-all"
                      style={
                        idx === arr.length - 1
                          ? {
                              color: "#e2e8f0",
                              fontWeight: 700,
                              background: "rgba(99,102,241,0.15)",
                            }
                          : { color: "rgba(148,163,184,0.7)" }
                      }
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
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
            style={{
              color: "rgba(148,163,184,0.7)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
              e.currentTarget.style.background = "rgba(248,113,113,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(148,163,184,0.7)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={15} />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {/* Controls */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
              <div className="relative w-full flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: "rgba(99,102,241,0.6)" }}
                />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(30,27,46,0.8)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(99,102,241,0.6)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(99,102,241,0.2)")
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-bold transition-all"
                  style={
                    isSelectionMode
                      ? {
                          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                        }
                      : {
                          background: "rgba(30,27,46,0.8)",
                          color: "rgba(148,163,184,0.8)",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }
                  }
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedImages([]);
                  }}
                >
                  {isSelectionMode ? (
                    <CheckSquare size={15} />
                  ) : (
                    <Square size={15} />
                  )}
                  {isSelectionMode ? "Cancel" : "Select"}
                </button>
                {selectedImages.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg,#ef4444,#dc2626)",
                      color: "white",
                      boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
                    }}
                  >
                    <Trash2 size={14} /> Delete ({selectedImages.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group rounded-3xl p-8 text-center transition-all cursor-pointer mb-10"
            style={{
              border: "2px dashed rgba(99,102,241,0.25)",
              background: "rgba(99,102,241,0.04)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(99,102,241,0.5)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(99,102,241,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(99,102,241,0.25)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(99,102,241,0.04)";
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
                <p className="font-bold text-indigo-400 text-sm">
                  Uploading & Processing...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                  }}
                >
                  <FolderPlus size={24} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Drop files or click to upload
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  Images • Videos • Audio • PDF • Word • Excel • PowerPoint •
                  ZIP • JSON • TXT
                </p>
              </div>
            )}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,audio/*,application/json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-zip-compressed,text/plain"
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

          {/* Asset count */}
          {!imagesLoading && filteredImages.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgba(148,163,184,0.4)" }}
              >
                Assets
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(99,102,241,0.1)" }}
              />
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#a5b4fc",
                }}
              >
                {filteredImages.length}
              </span>
            </div>
          )}

          {/* Grid */}
          {imagesLoading ? (
            <AssetSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredImages.map((img) => {
                const fileType = getFileType(img.url);
                const isImage = fileType === "image";
                const isSelected = selectedImages.includes(img._id);
                const meta = FILE_META[fileType];

                return (
                  <div
                    key={img._id}
                    className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                    style={{
                      background: "rgba(22,19,36,0.9)",
                      border: isSelected
                        ? "1px solid rgba(99,102,241,0.7)"
                        : "1px solid rgba(99,102,241,0.1)",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(99,102,241,0.2)"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(99,102,241,0.35)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(99,102,241,0.1)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ background: "#0f0c1a" }}
                    >
                      {isSelectionMode && (
                        <div
                          onClick={() =>
                            setSelectedImages((prev) =>
                              prev.includes(img._id)
                                ? prev.filter((i) => i !== img._id)
                                : [...prev, img._id],
                            )
                          }
                          className="absolute inset-0 z-30 cursor-pointer flex p-3"
                          style={{
                            background: isSelected
                              ? "rgba(99,102,241,0.15)"
                              : "transparent",
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={
                              isSelected
                                ? {
                                    background: "#6366f1",
                                    borderColor: "#6366f1",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.1)",
                                    borderColor: "rgba(255,255,255,0.3)",
                                  }
                            }
                          >
                            {isSelected && (
                              <Check
                                size={13}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {isImage ? (
                        <NextImage
                          src={img.url}
                          alt="asset"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onClick={() => !isSelectionMode && openPreview(img)}
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          onClick={() => !isSelectionMode && openPreview(img)}
                        >
                          <FileIcon type={fileType} />
                        </div>
                      )}

                      {/* Type badge */}
                      {!isSelectionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={
                              meta
                                ? {
                                    background: "rgba(0,0,0,0.6)",
                                    color: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(4px)",
                                  }
                                : {
                                    background: "rgba(99,102,241,0.3)",
                                    color: "#a5b4fc",
                                  }
                            }
                          >
                            {meta?.label ?? "IMG"}
                          </span>
                        </div>
                      )}

                      {/* Desktop delete */}
                      {!isSelectionMode && (
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleDelete(img._id);
                            }}
                            className="p-2 rounded-xl transition-all"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.3)",
                              backdropFilter: "blur(8px)",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(239,68,68,0.8)";
                              (e.currentTarget as HTMLElement).style.color =
                                "white";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(239,68,68,0.15)";
                              (e.currentTarget as HTMLElement).style.color =
                                "#f87171";
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div
                      className="p-3"
                      style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}
                    >
                      <p
                        className="text-[10px] font-bold mb-2"
                        style={{ color: "rgba(148,163,184,0.4)" }}
                      >
                        #{img._id.slice(-6).toUpperCase()}
                      </p>
                      {/* Mobile delete */}
                      {!isSelectionMode && (
                        <button
                          onClick={() => handleSingleDelete(img._id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold sm:hidden transition-all"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!imagesLoading && filteredImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <FolderPlus
                  size={36}
                  style={{ color: "rgba(99,102,241,0.5)" }}
                />
              </div>
              <p className="font-bold text-white/30 text-sm">No assets yet</p>
              <p className="text-xs text-white/20">
                Upload files using the area above
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            background: "rgba(5,3,12,0.97)",
            backdropFilter: "blur(24px)",
          }}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full transition-all"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.6)";
            }}
          >
            <X size={22} />
          </button>

          <div className="relative w-full max-w-5xl flex flex-col items-center gap-6">
            {/* Media container */}
            <div
              className="relative w-full h-[65vh] rounded-3xl overflow-hidden"
              style={{
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              {previewImage.type === "video" ? (
                <video
                  src={previewImage.url}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                />
              ) : previewImage.type === "audio" ? (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-6"
                  style={{
                    background: "linear-gradient(135deg,#1a1530,#0f0c1a)",
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
                      boxShadow: "0 16px 40px rgba(168,85,247,0.4)",
                    }}
                  >
                    <Music size={44} className="text-white" />
                  </div>
                  <audio
                    src={previewImage.url}
                    controls
                    className="w-3/4"
                    autoPlay
                    style={{ filter: "invert(1) hue-rotate(180deg)" }}
                  />
                </div>
              ) : (
                <img
                  src={getPreviewUrl(previewImage, previewSize)}
                  className="w-full h-full object-contain"
                  alt="preview"
                />
              )}
            </div>

            {/* Image size tabs + download */}
            {previewImage.type === "image" && (
              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
                <div
                  className="flex rounded-2xl p-1 gap-1"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
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
                        className="relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={
                          previewSize === key
                            ? {
                                background:
                                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                color: "white",
                                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                              }
                            : isAvailable
                              ? { color: "rgba(255,255,255,0.5)" }
                              : {
                                  color: "rgba(255,255,255,0.15)",
                                  cursor: "not-allowed",
                                }
                        }
                      >
                        {label}
                        {showUnavailableIndicator && (
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
                  className="flex items-center justify-center gap-2 px-10 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: "white",
                    color: "#1e1b2e",
                    boxShadow: "0 8px 24px rgba(255,255,255,0.15)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#eef2ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <Download size={16} /> Download{" "}
                  {previewSize === "original" ? "Original" : previewSize}
                </button>
              </div>
            )}

            {(previewImage.type === "video" ||
              previewImage.type === "audio") && (
              <button
                onClick={() =>
                  handleDownloadImage(
                    previewImage.url,
                    previewImage.id,
                    "Original",
                  )
                }
                className="flex items-center justify-center gap-2 px-12 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: "white",
                  color: "#1e1b2e",
                  boxShadow: "0 8px 24px rgba(255,255,255,0.15)",
                }}
              >
                <Download size={16} /> Download File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
