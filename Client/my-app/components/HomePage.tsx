"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { getToken, removeToken } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import UploadZone from "@/components/UploadZone";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
  const [breadcrumb, setBreadcrumb] = useState<string>(""); // e.g., system/files/subfiles
  const [imagesLoading, setImagesLoading] = useState(false);

  const API_URL = "http://localhost:5000";
  const token = getToken();

  // ---------------------- Fetch folders ----------------------
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

  // ---------------------- Fetch images ----------------------
  const fetchImages = async (folderId: string | null = null) => {
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

  // ---------------------- Fetch breadcrumb ----------------------
  const fetchBreadcrumb = async (folderId: string | null) => {
    if (!folderId) {
      setBreadcrumb("");
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/folders/path/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBreadcrumb(res.data.path); // e.g., system/files/subfiles
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- Sync selectedFolder ----------------------
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

  // ---------------------- Logout ----------------------
  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  // ---------------------- Handle breadcrumb click ----------------------
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

  // ---------------------- Render ----------------------
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

      {/* Main */}
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

        {/* Images */}
        {imagesLoading ? (
          <div className="text-center py-20 text-gray-400">
            Loading images...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div
                key={img._id}
                className="relative w-full h-52 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <NextImage
                  src={img.url}
                  alt="img"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* Upload */}
        <UploadZone
          folderId={selectedFolder}
          onUploaded={() => fetchImages(selectedFolder)}
        />
      </main>
    </div>
  );
};

export default HomePage;
