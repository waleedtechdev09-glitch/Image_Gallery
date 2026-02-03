"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { getToken, removeToken } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";

interface UploadedImage {
  _id: string;
  url: string;
}

interface Folder {
  _id: string;
  name: string;
  parent?: string | null;
}

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    folderIdFromUrl,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Track images currently being deleted
  const [deletingImages, setDeletingImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = "http://localhost:5000";
  const token = getToken();

  const fetchFolders = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImages = async (folderId: string | null = selectedFolder) => {
    setImagesLoading(true);
    try {
      const url = folderId
        ? `${API_URL}/api/images?folderId=${folderId}`
        : `${API_URL}/api/images`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load images");
    } finally {
      setImagesLoading(false);
    }
  };

  const fetchBreadcrumb = async (folderId: string | null) => {
    if (!folderId) {
      setBreadcrumb("");
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/folders/path/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBreadcrumb(res.data.path);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchFolders();
      await fetchImages(selectedFolder);
      await fetchBreadcrumb(selectedFolder);
      router.replace(
        selectedFolder ? `/homePage?folderId=${selectedFolder}` : `/homePage`,
      );
    };
    load();
  }, [selectedFolder]);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  const handleUpload = async (files: FileList | File[]) => {
    if (!token) return alert("Not authenticated");
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const formData = new FormData();
    fileArray.forEach((file) => formData.append("images", file));
    if (selectedFolder) formData.append("folderId", selectedFolder);

    try {
      setUploading(true);
      await axios.post(`${API_URL}/api/images/upload-multiple`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages(selectedFolder);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- Delete image with loading ----------------
  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      setDeletingImages((prev) => [...prev, id]);
      await axios.delete(`${API_URL}/api/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    } finally {
      setDeletingImages((prev) => prev.filter((imgId) => imgId !== id));
    }
  };

  const handleBreadcrumbClick = async (pathArray: string[]) => {
    if (pathArray.length === 0) {
      setSelectedFolder(null);
      return;
    }
    try {
      const res = await axios.post(
        `${API_URL}/api/folders/resolve-path`,
        { path: pathArray },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedFolder(res.data.folderId);
    } catch (err) {
      console.error("Failed to navigate breadcrumb", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SideBar
        folders={folders}
        setFolders={setFolders}
        fetchImages={fetchImages}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="mb-4 flex items-center text-sm text-gray-600 space-x-2">
            {["home", "folders", ...breadcrumb.split("/")].map(
              (name, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const pathArray = arr.slice(2, idx + 1); // skip home/folders

                return (
                  <span key={idx} className="flex items-center">
                    {idx !== 0 && <span className="text-gray-300 mx-1">/</span>}
                    <span
                      className={`${
                        isLast
                          ? "text-orange-600 font-medium"
                          : "text-gray-500 hover:text-blue-600 cursor-pointer"
                      }`}
                      onClick={() =>
                        !isLast && handleBreadcrumbClick(pathArray)
                      }
                    >
                      {name}
                    </span>
                  </span>
                );
              },
            )}
          </nav>
        )}

        {/* Logout */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Drag & Drop / Click Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer mb-6"
        >
          {uploading
            ? "Uploading..."
            : "Drag & drop images here or click to upload"}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files!)}
            className="hidden"
          />
        </div>

        {/* Images Grid */}
        {imagesLoading ? (
          <div className="text-center py-20 text-gray-400">
            Loading images...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No images uploaded yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => {
              const isDeleting = deletingImages.includes(img._id);
              return (
                <div
                  key={img._id}
                  className="relative w-full h-52 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <NextImage
                    src={img.url}
                    alt="img"
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      !isDeleting && "group-hover:scale-105"
                    }`}
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteImage(img._id)}
                    disabled={isDeleting}
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-white transition-colors ${
                      isDeleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {isDeleting ? (
                      <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>

                  {/* Optional overlay when deleting */}
                  {isDeleting && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                      <span className="text-white text-sm font-medium">
                        Deleting...
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
