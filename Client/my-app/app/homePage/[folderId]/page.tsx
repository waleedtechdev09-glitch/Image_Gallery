"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { getToken, removeToken } from "@/utils/auth";
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

  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    folderIdFromUrl || null,
  );

  const [breadcrumb, setBreadcrumb] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = "http://localhost:5000";
  const token = getToken();

  //   if (!token) {
  //     router.push("/");
  //     return;
  //   }

  //   const fetchUser = async () => {
  //     try {
  //       const res = await axios.get(`${API_URL}/api/users/me`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setUser(res.data);
  //     } catch {
  //       removeToken();
  //       router.push("/");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/folders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFolders(res.data);

        // optional: select first folder if none selected
        if (!selectedFolder && res.data.length > 0) {
          setSelectedFolder(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const res = await axios.get(`${API_URL}/api/folders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFolders(res.data);
  };

  const fetchImages = async (folderId: string | null) => {
    setImagesLoading(true);

    const url = folderId
      ? `${API_URL}/api/images?folderId=${folderId}`
      : `${API_URL}/api/images`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setImages(res.data);
    setImagesLoading(false);
  };

  const fetchBreadcrumb = async (folderId: string) => {
    const res = await axios.get(`${API_URL}/api/folders/path/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setBreadcrumb(res.data.path);
  };

  useEffect(() => {
    const load = async () => {
      await fetchFolders();

      if (selectedFolder) {
        await fetchImages(selectedFolder);
        await fetchBreadcrumb(selectedFolder);
        router.replace(`/homePage?${selectedFolder}`);
      } else {
        await fetchImages(null);
        setBreadcrumb("");
        router.replace(`/homePage`);
      }
    };

    load();
  }, [selectedFolder]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex">
      <SideBar
        folders={folders}
        setFolders={setFolders}
        setActiveView={() => {}}
        fetchImages={fetchImages}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      <main className="p-6 flex-1">
        {breadcrumb && (
          <div className="mb-4 text-lg font-semibold">Path: /{breadcrumb}</div>
        )}

        {imagesLoading && <p>Loading images...</p>}

        <div className="grid grid-cols-3 gap-4">
          {images.map((img) => (
            <NextImage
              key={img._id}
              src={img.url}
              alt="img"
              width={200}
              height={200}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
