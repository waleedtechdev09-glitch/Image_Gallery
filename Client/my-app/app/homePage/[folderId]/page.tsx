// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";
// import { getToken } from "@/utils/auth";
// import NextImage from "next/image";
// import SideBar from "@/components/SideBar";

// interface UploadedImage {
//   _id: string;
//   url: string;
// }

// interface Folder {
//   _id: string;
//   name: string;
//   parent?: string | null;
// }

// const HomePage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const folderIdFromUrl = searchParams.get("folderId");

//   const [images, setImages] = useState<UploadedImage[]>([]);
//   const [folders, setFolders] = useState<Folder[]>([]);
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(
//     folderIdFromUrl || null,
//   );
//   const [breadcrumb, setBreadcrumb] = useState<string>("");

//   const [imagesLoading, setImagesLoading] = useState(false);
//   // const fileInputRef = useRef<HTMLInputElement>(null);

//   // BASE URL
//   const API_URL = "http://localhost:5000";
//   const token = getToken();

//   // ---------------- Fetch folders ----------------
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

//   // ---------------- Fetch images ----------------
//   const fetchImages = async (folderId: string | null) => {
//     setImagesLoading(true);
//     try {
//       const res = await axios.get(
//         folderId
//           ? `${API_URL}/api/images/${folderId}`
//           : `${API_URL}/api/images`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       setImages(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch images");
//     } finally {
//       setImagesLoading(false);
//     }
//   };

//   // ---------------- Fetch breadcrumb path ----------------
//   const fetchBreadcrumb = async (folderId: string) => {
//     try {
//       const res = await axios.get(`${API_URL}/api/folders/${folderId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBreadcrumb(res.data.path);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ---------------- Load folders/images on folder change ----------------
//   useEffect(() => {
//     const loadData = async () => {
//       await fetchFolders();
//       if (selectedFolder) {
//         await fetchImages(selectedFolder);
//         await fetchBreadcrumb(selectedFolder);
//         router.replace(`/homePage/${selectedFolder}`);
//       } else {
//         await fetchImages(null);
//         setBreadcrumb("");
//         router.replace(`/homePage`);
//       }
//     };
//     loadData();
//   }, [selectedFolder]);

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50">
//       {/* Sidebar */}
//       <SideBar
//         folders={folders}
//         setFolders={setFolders}
//         setActiveView={() => {}}
//         fetchImages={fetchImages}
//         selectedFolder={selectedFolder}
//         setSelectedFolder={setSelectedFolder}
//       />

//       {/* Main content */}
//       <main className="flex-1 p-6 overflow-y-auto">
//         {/* Breadcrumb / Path */}
//         {breadcrumb && (
//           <div className="mb-4 text-lg font-semibold text-gray-700">
//             Path: <span className="text-orange-600">/{breadcrumb}</span>
//           </div>
//         )}

//         {/* Loading indicator */}
//         {imagesLoading && (
//           <div className="text-center py-20 text-gray-400 text-lg">
//             Loading images...
//           </div>
//         )}

//         {/* Images grid */}
//         {!imagesLoading && images.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {images.map((img) => (
//               <div
//                 key={img._id}
//                 className="relative w-full h-52 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
//               >
//                 <NextImage
//                   src={img.url}
//                   alt="img"
//                   fill
//                   className="object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//                 {/* Optional overlay on hover */}
//                 <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Empty state */}
//         {!imagesLoading && images.length === 0 && (
//           <div className="text-center py-20 text-gray-400">
//             No images in this folder
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default HomePage;
