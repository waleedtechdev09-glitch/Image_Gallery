// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";
// import { getToken, removeToken } from "@/utils/auth";
// import { Button } from "@/components/ui/button";
// import { LogOut, Trash2 } from "lucide-react";
// import NextImage from "next/image";
// import SideBar from "@/components/SideBar";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
// }

// interface UploadedImage {
//   _id: string;
//   url: string;
// }

// interface Folder {
//   _id: string;
//   name: string;
// }

// const HomePage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const folderIdFromUrl = searchParams.get("folderId");

//   const [user, setUser] = useState<User | null>(null);
//   const [images, setImages] = useState<UploadedImage[]>([]);
//   const [folders, setFolders] = useState<Folder[]>([]);
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(
//     folderIdFromUrl || null,
//   );

//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [imagesLoading, setImagesLoading] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const API_URL = "http://localhost:5000";
//   const token = getToken();

//   // ---------------------- Fetch user ----------------------
//   useEffect(() => {
//     if (!token) {
//       router.push("/");
//       return;
//     }

//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/users/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(res.data);
//       } catch (err) {
//         removeToken();
//         router.push("/");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [router, token]);

//   // ---------------------- Fetch folders ----------------------
//   const fetchFolders = async () => {
//     if (!token) return;

//     try {
//       const res = await axios.get(`${API_URL}/api/folders`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFolders(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchFolders();
//   }, []);

//   // ---------------------- Fetch images ----------------------
//   const fetchImages = async (folderId: string | null = selectedFolder) => {
//     if (!token) return;

//     setImagesLoading(true);

//     try {
//       const url = folderId
//         ? `${API_URL}/api/images?folderId=${folderId}`
//         : `${API_URL}/api/images`;

//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setImages(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load images");
//     } finally {
//       setImagesLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchImages(selectedFolder);
//   }, [selectedFolder]);

//   // ---------------------- Logout ----------------------
//   const handleLogout = () => {
//     if (!window.confirm("Are you sure you want to logout?")) return;

//     setLoggingOut(true);

//     setTimeout(() => {
//       removeToken();
//       router.push("/");
//       setLoggingOut(false);
//     }, 800);
//   };

//   // ---------------------- Open File Picker ----------------------
//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   // ---------------------- Upload Multiple Images ----------------------
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;

//     if (!token) return alert("Not authenticated");

//     const files = Array.from(e.target.files);

//     const formData = new FormData();

//     files.forEach((file) => {
//       formData.append("images", file);
//     });

//     if (selectedFolder) {
//       formData.append("folderId", selectedFolder);
//     }

//     try {
//       setUploading(true);

//       await axios.post(`${API_URL}/api/images/upload-multiple`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       alert("Images uploaded successfully!");

//       fetchImages(selectedFolder);
//     } catch (err: any) {
//       console.error(err);
//       alert(err?.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ---------------------- Delete Image ----------------------
//   const handleDeleteImage = async (id: string) => {
//     if (!window.confirm("Delete this image?")) return;

//     try {
//       setImagesLoading(true);

//       await axios.delete(`${API_URL}/api/images/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setImages((prev) => prev.filter((img) => img._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete image");
//     } finally {
//       setImagesLoading(false);
//     }
//   };

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (!user) return null;

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <SideBar
//         folders={folders}
//         setFolders={setFolders}
//         setActiveView={() => {}}
//         fetchImages={fetchImages}
//         selectedFolder={selectedFolder}
//         setSelectedFolder={setSelectedFolder}
//       />

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10">
//         <div className="flex justify-end mb-4">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleLogout}
//             disabled={loggingOut}
//           >
//             <LogOut size={16} /> Logout
//           </Button>
//         </div>

//         <h2 className="text-2xl font-semibold mb-4">Your Images</h2>

//         {imagesLoading && (
//           <p className="text-blue-600 mb-4 font-semibold">Loading images...</p>
//         )}

//         {uploading && (
//           <p className="text-green-600 mb-4 font-semibold">
//             Uploading images...
//           </p>
//         )}

//         {!imagesLoading && images.length === 0 && <p>No images uploaded yet</p>}

//         {/* Image Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {images.map((img) => (
//             <div key={img._id} className="bg-white p-2 rounded shadow relative">
//               <NextImage
//                 src={img.url}
//                 alt="uploaded"
//                 width={400}
//                 height={300}
//                 className="w-full h-48 object-cover rounded"
//               />

//               <button
//                 onClick={() => handleDeleteImage(img._id)}
//                 className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//               >
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Upload Button */}
//         <Button
//           onClick={handleUploadClick}
//           className="fixed bottom-6 right-6 bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6 py-3 shadow-lg"
//         >
//           Upload Images
//         </Button>

//         {/* Hidden Input */}
//         <input
//           type="file"
//           multiple
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           className="hidden"
//         />
//       </main>
//     </div>
//   );
// };

// export default HomePage;

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
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);

  const API_URL = "http://localhost:5000";
  const token = getToken();

  // Fetch folders
  const fetchFolders = async () => {
    if (!token) return;
    const res = await axios.get(`${API_URL}/api/folders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFolders(res.data);
  };

  // Fetch images
  const fetchImages = async (folderId: string | null = null) => {
    setImagesLoading(true);
    try {
      const res = await axios.get(
        folderId
          ? `${API_URL}/api/images?folderId=${folderId}`
          : `${API_URL}/api/images`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setImages(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load images");
    }
    setImagesLoading(false);
  };

  // Fetch breadcrumb
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

  // Sync selectedFolder → URL, fetch images & breadcrumb
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SideBar
        folders={folders}
        setFolders={setFolders}
        fetchImages={fetchImages}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        {breadcrumb && (
          <div className="mb-4 font-semibold text-lg">
            Path:{" "}
            <span className="text-orange-600">
              ${API_URL}/api/folders/path/{breadcrumb}
            </span>
          </div>
        )}
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {imagesLoading && (
          <div className="text-center py-20 text-gray-400">
            Loading images...
          </div>
        )}

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

        <UploadZone
          folderId={selectedFolder}
          onUploaded={() => fetchImages(selectedFolder)}
        />
      </main>
    </div>
  );
};

export default HomePage;
