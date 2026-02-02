"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getToken, removeToken } from "../../utils/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Trash2 } from "lucide-react";
import NextImage from "next/image";
import SideBar from "@/components/SideBar";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UploadedImage {
  _id: string;
  url: string;
  public_id?: string;
}

const HomePage = () => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [activeView, setActiveView] = useState<
    "dashboard" | "images" | "settings"
  >("dashboard");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = "http://localhost:5000";
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        removeToken();
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, token]);

  const fetchImages = async () => {
    if (!token) return;

    setImagesLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setImages(res.data);
    } catch (err) {
      console.error("Failed to fetch images", err);
      alert("Failed to load images");
    } finally {
      setImagesLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setLoggingOut(true);

    setTimeout(() => {
      removeToken();
      router.push("/");
      setLoggingOut(false);
    }, 800);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (!token) {
      alert("Not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      await axios.post(`${API_URL}/api/images/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Image uploaded successfully!");
      fetchImages();
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) return;

    try {
      setImagesLoading(true);

      await axios.delete(`${API_URL}/api/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setImages((prev) => prev.filter((img) => img._id !== id));

      alert("Image deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    } finally {
      setImagesLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar setActiveView={setActiveView} fetchImages={fetchImages} />

      {/* Main content */}
      <main className="flex-1 relative p-4 sm:p-6 md:p-10 overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-end mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`flex items-center gap-2 cursor-pointer ${
              loggingOut ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loggingOut}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600 break-all">Email: {user.email}</p>
          </div>
        )}

        {/* Images View */}
        {activeView === "images" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Your Images
            </h2>

            {imagesLoading && (
              <p className="text-blue-600 mb-4 font-semibold">
                Loading images...
              </p>
            )}

            {uploading && (
              <p className="text-blue-600 mb-4 font-semibold">
                Uploading image...
              </p>
            )}

            {!imagesLoading && images.length === 0 && (
              <p>No images uploaded yet</p>
            )}

            {!imagesLoading && images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div
                    key={img._id}
                    className="bg-white p-2 rounded shadow overflow-hidden relative"
                  >
                    <NextImage
                      src={img.url}
                      alt="uploaded"
                      width={400}
                      height={300}
                      className="w-full h-40 sm:h-48 object-cover rounded"
                    />

                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button - responsive floating */}
            <Button
              onClick={handleUploadClick}
              className="
                fixed bottom-6 right-6 sm:bottom-8 sm:right-8
                bg-blue-500 text-white hover:bg-blue-600
                shadow-lg rounded-full px-5 sm:px-6 py-3 text-base sm:text-lg cursor-pointer
              "
            >
              Upload
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Settings View */}
        {activeView === "settings" && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">Settings</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
