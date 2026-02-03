"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, removeToken } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";

import {
  loadFolders,
  loadImages,
  loadBreadcrumb,
  handleBreadcrumbClickController,
  handleUploadController,
  handleDeleteController,
} from "../controllers/homeController";

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
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(
    folderIdFromUrl,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getToken();

  // Handle folder selection
  const handleSelectFolder = (id: string | null) => {
    setSelectedFolderState(id);
    router.replace(id ? `/homePage?folderId=${id}` : `/homePage`);
  };

  // Load folders, images, breadcrumb
  useEffect(() => {
    const load = async () => {
      if (!token) return;
      await loadFolders(token, setFolders);
      await loadImages(token, selectedFolder, setImages, setImagesLoading);
      await loadBreadcrumb(token, selectedFolder, setBreadcrumb);
    };
    load();
  }, [selectedFolder, token]);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SideBar
        folders={folders}
        setFolders={setFolders}
        fetchImages={() =>
          loadImages(token!, selectedFolder, setImages, setImagesLoading)
        }
        selectedFolder={selectedFolder}
        setSelectedFolder={handleSelectFolder}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="mb-4 flex items-center text-sm text-gray-600 space-x-2">
            {["home", "folders", ...breadcrumb.split("/")].map(
              (name, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const pathArray = arr.slice(2, idx + 1);
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
                        !isLast &&
                        handleBreadcrumbClickController(
                          token!,
                          pathArray,
                          handleSelectFolder,
                        )
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
          <Button
            variant="outline"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleUploadController(
              token!,
              e.dataTransfer.files,
              selectedFolder,
              setUploading,
              () =>
                loadImages(token!, selectedFolder, setImages, setImagesLoading),
            );
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
            onChange={(e) =>
              handleUploadController(
                token!,
                e.target.files!,
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

        {/* SUBFOLDER AND IMAGES */}
        {imagesLoading ? (
          <div className="text-center py-20 text-gray-400">
            Loading content...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* SUBFOLDER */}
            {folders
              .filter((f) => f.parent === selectedFolder)
              .map((subfolder) => (
                <div
                  key={subfolder._id}
                  onClick={() => handleSelectFolder(subfolder._id)}
                  className="relative w-full h-52 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <div className="text-orange-600 font-bold text-lg">
                    📁 {subfolder.name}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Folder</div>
                </div>
              ))}

            {/* Images */}
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

                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDeleteController(
                        token!,
                        img._id,
                        setDeletingImages,
                        setImages,
                      )
                    }
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
