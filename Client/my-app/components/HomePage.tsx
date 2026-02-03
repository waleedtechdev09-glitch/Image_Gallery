"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { removeToken } from "@/utils/auth";
import SideBar from "@/components/SideBar";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";
import { useHomeController } from "@/hooks/useHomeController";

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const {
    token,
    fileInputRef,
    folders,
    setFolders,
    images,
    setImages,
    selectedFolder,
    setSelectedFolder,
    breadcrumb,
    imagesLoading,
    uploading,
    setUploading,
    deletingImages,
    setDeletingImages,
    refreshImages,
    handleBreadcrumbClickController,
    handleUploadController,
    handleDeleteController,
  } = useHomeController(folderIdFromUrl);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SideBar
        folders={folders}
        setFolders={setFolders}
        fetchImages={refreshImages}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

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
                          setSelectedFolder,
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
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleUploadController(
              token!,
              e.dataTransfer.files,
              selectedFolder,
              setUploading,
              refreshImages,
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
                refreshImages,
              )
            }
            className="hidden"
          />
        </div>

        {/* Images */}
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
