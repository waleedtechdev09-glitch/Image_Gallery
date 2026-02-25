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
  FileText,
  FileJson, // Added for JSON
  Video, // Added for Video
  Home,
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

  const [folders, setFolders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(
    folderIdFromUrl,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    id: string;
    label: string;
    type: "image" | "video" | "json" | "pdf";
  } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [userSelectedSizes, setUserSelectedSizes] = useState<{
    [key: string]: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getToken();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
    else setIsAuthorized(true);
  }, [router]);

  const fetchContent = async () => {
    if (!token) return;
    try {
      await loadImages(token, selectedFolder, setImages, () => {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!token || !isAuthorized) return;
      setImagesLoading(true);
      try {
        await loadFolders(token, setFolders);
        await fetchContent();
        await loadBreadcrumb(token, selectedFolder, setBreadcrumb);
      } finally {
        setImagesLoading(false);
      }
    };
    load();
  }, [selectedFolder, token, isAuthorized]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesSearch = img._id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (selectedFolder === null) {
        return matchesSearch && !img.folder && !img.folderId;
      }
      return matchesSearch;
    });
  }, [images, searchQuery, selectedFolder]);

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
      const extension = fileUrl.split(".").pop();
      const fileName =
        label === "Original"
          ? `original-${id.slice(-6)}`
          : `resized-${label}-${id.slice(-6)}`;
      link.download = `${fileName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(fileUrl, "_blank");
    } finally {
      setGlobalLoading(false);
    }
  };

  const onResizeClick = async (imgId: string) => {
    const { value: size } = await Swal.fire({
      title: "Resize Asset",
      input: "radio",
      inputOptions: {
        original: "Original Size",
        "256": "Low (256px)",
        "512": "High (512px)",
      },
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
    });
    if (size) {
      if (size === "original") {
        setUserSelectedSizes((prev) => ({ ...prev, [imgId]: "Original" }));
      } else {
        await handleResizeController(
          token!,
          imgId,
          parseInt(size),
          setGlobalLoading,
          async () => {
            await fetchContent();
            setUserSelectedSizes((prev) => ({ ...prev, [imgId]: `${size}px` }));
          },
        );
      }
    }
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
          <nav className="flex items-center text-sm font-medium">
            <div
              onClick={() => setSelectedFolderState(null)}
              className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Home size={18} />
            </div>
            {breadcrumb
              .split("/")
              .filter(Boolean)
              .map((name, idx, arr) => (
                <div key={idx} className="flex items-center">
                  <ChevronRight size={14} className="mx-1 text-slate-300" />
                  <span
                    className={`truncate px-2 py-1 rounded-md ${idx === arr.length - 1 ? "text-slate-900 font-bold bg-slate-50" : "text-slate-500 hover:text-indigo-600 cursor-pointer"}`}
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
          </nav>
          <Button
            variant="ghost"
            onClick={() => {
              removeToken();
              router.replace("/");
            }}
            className="text-slate-500 hover:text-red-600"
          >
            <LogOut size={18} className="lg:mr-2" />
            <span className="hidden lg:inline text-xs font-bold uppercase">
              Sign Out
            </span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
            <div className="relative w-full sm:flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Area Updated for Video/JSON */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-10 text-center transition-all cursor-pointer bg-white/50 hover:bg-white mb-12 shadow-sm"
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
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <FolderPlus size={28} />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
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
              className="hidden"
            />
          </div>

          {imagesLoading ? (
            <AssetSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filteredImages.map((img) => {
                const urlLower = img.url?.toLowerCase() || "";
                const isPdf = urlLower.endsWith(".pdf");
                const isJson = urlLower.endsWith(".json");
                const isVideo =
                  urlLower.endsWith(".mp4") ||
                  urlLower.endsWith(".webm") ||
                  urlLower.endsWith(".mov");

                let displayUrl = img.url;
                let displayLabel = "Original";
                const userSize = userSelectedSizes[img._id];

                if (!isPdf && !isJson && !isVideo) {
                  if (userSize === "256px" && img.thumbnail256) {
                    displayUrl = img.thumbnail256;
                    displayLabel = "256px";
                  } else if (userSize === "512px" && img.thumbnail512) {
                    displayUrl = img.thumbnail512;
                    displayLabel = "512px";
                  }
                }

                return (
                  <div
                    key={img._id}
                    className="group bg-white rounded-2xl border border-slate-200 transition-all duration-300 relative shadow-sm hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-50 flex items-center justify-center">
                      {isPdf ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => window.open(img.url, "_blank")}
                        >
                          <FileText size={44} className="text-red-500 mb-2" />
                          <span className="text-[10px] font-bold text-red-600 uppercase">
                            View PDF
                          </span>
                        </div>
                      ) : isJson ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() => window.open(img.url, "_blank")}
                        >
                          <FileJson size={44} className="text-amber-500 mb-2" />
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            JSON
                          </span>
                        </div>
                      ) : isVideo ? (
                        <div
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() =>
                            setPreviewImage({
                              url: img.url,
                              id: img._id,
                              label: "Original",
                              type: "video",
                            })
                          }
                        >
                          <Video size={44} className="text-indigo-500 mb-2" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            Play Video
                          </span>
                        </div>
                      ) : (
                        <NextImage
                          src={displayUrl}
                          alt="asset"
                          fill
                          className="object-cover cursor-pointer group-hover:scale-105 transition-transform"
                          onClick={() =>
                            setPreviewImage({
                              url: displayUrl,
                              id: img._id,
                              label: displayLabel,
                              type: "image",
                            })
                          }
                        />
                      )}

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
                          className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                        {!isPdf && !isJson && !isVideo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onResizeClick(img._id);
                            }}
                            className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white shadow-md"
                          >
                            <Scale size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        ID: {img._id.slice(-6)}
                      </p>
                      <p
                        className={`text-[9px] font-extrabold mt-1 uppercase tracking-wider ${displayLabel === "Original" ? "text-slate-400" : "text-indigo-600"}`}
                      >
                        {isPdf
                          ? "PDF"
                          : isJson
                            ? "JSON"
                            : isVideo
                              ? "Video"
                              : displayLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal for Images and Videos */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/20">
              {previewImage.type === "video" ? (
                <video
                  src={previewImage.url}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewImage.url}
                  className="w-full h-full object-contain"
                  alt="preview"
                />
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() =>
                  handleDownloadImage(
                    previewImage.url,
                    previewImage.id,
                    previewImage.label,
                  )
                }
                className="flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-2xl active:scale-95"
              >
                <Download size={20} /> Download {previewImage.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
