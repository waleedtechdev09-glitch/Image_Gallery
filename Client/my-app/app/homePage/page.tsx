// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { getToken, removeToken } from "../../utils/auth";
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
//   public_id?: string;
//   folder?: string;
// }

// interface Folder {
//   _id: string;
//   name: string;
// }

// const HomePage = () => {
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [images, setImages] = useState<UploadedImage[]>([]);
//   const [folders, setFolders] = useState<Folder[]>([]);
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [imagesLoading, setImagesLoading] = useState(false);
//   const [loggingOut, setLoggingOut] = useState(false);
//   const [activeView, setActiveView] = useState<
//     "dashboard" | "images" | "settings"
//   >("dashboard");

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const API_URL = "http://localhost:5000";
//   const token = getToken();

//   // ---------------------- Fetch current user ----------------------
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

//       // If no folder selected, select the first one
//       if (!selectedFolder && res.data.length > 0) {
//         setSelectedFolder(res.data[0]._id);
//       }
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

//   // ---------------------- Watch selectedFolder and activeView ----------------------
//   useEffect(() => {
//     if (activeView === "images") {
//       fetchImages(selectedFolder);
//     }
//   }, [selectedFolder, activeView]);

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

//   // ---------------------- Upload image ----------------------
//   const handleUploadClick = () => fileInputRef.current?.click();
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     if (!token) return alert("Not authenticated");

//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append("image", file);
//     if (selectedFolder) formData.append("folderId", selectedFolder);

//     try {
//       setUploading(true);
//       await axios.post(`${API_URL}/api/images/upload`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Image uploaded successfully!");
//       fetchImages(selectedFolder);
//     } catch (err: any) {
//       console.error(err);
//       alert(err?.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ---------------------- Delete image ----------------------
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

//   // ---------------------- Loading state ----------------------
//   if (loading) return <p className="p-4">Loading...</p>;
//   if (!user) return null;

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <SideBar
//         setActiveView={setActiveView}
//         fetchImages={fetchImages}
//         selectedFolder={selectedFolder}
//         setSelectedFolder={setSelectedFolder}
//       />

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
//         <div className="flex justify-end mb-4 ">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleLogout}
//             disabled={loggingOut}
//             className={loggingOut ? "opacity-50 cursor-not-allowed" : ""}
//           >
//             <LogOut size={16} /> Logout
//           </Button>
//         </div>

//         {activeView === "dashboard" && (
//           <div className="text-center md:text-left">
//             <h1 className="text-3xl font-bold mb-3">Welcome, {user.name}!</h1>
//             <p className="text-gray-600">{user.email}</p>
//           </div>
//         )}

//         {activeView === "images" && (
//           <div>
//             <h2 className="text-2xl font-semibold mb-4">Your Images</h2>

//             {/* Folder selector */}
//             {folders.length > 0 && (
//               <div className="mb-4">
//                 <label className="mr-2 font-medium ">Folder:</label>
//                 <select
//                   value={selectedFolder || ""}
//                   onChange={async (e) => {
//                     const id = e.target.value || null;
//                     setSelectedFolder(id);
//                     await fetchImages(id); // instant update
//                   }}
//                   className="border p-2 rounded"
//                 >
//                   <option value="">No folder</option>
//                   {folders.map((f) => (
//                     <option key={f._id} value={f._id}>
//                       {f.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {imagesLoading && (
//               <p className="text-blue-600 mb-4 font-semibold">
//                 Loading images...
//               </p>
//             )}
//             {uploading && (
//               <p className="text-blue-600 mb-4 font-semibold">
//                 Uploading image...
//               </p>
//             )}
//             {!imagesLoading && images.length === 0 && (
//               <p>No images uploaded yet</p>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {images.map((img) => (
//                 <div
//                   key={img._id}
//                   className="bg-white p-2 rounded shadow relative"
//                 >
//                   <NextImage
//                     src={img.url}
//                     alt="uploaded"
//                     width={400}
//                     height={300}
//                     className="w-full h-48 object-cover rounded"
//                   />
//                   <button
//                     onClick={() => handleDeleteImage(img._id)}
//                     className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               ))}
//             </div>

//             <Button
//               onClick={handleUploadClick}
//               className="fixed bottom-6 right-6 bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6 py-3 shadow-lg"
//             >
//               Upload
//             </Button>
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//             />
//           </div>
//         )}

//         {activeView === "settings" && (
//           <div>
//             <h2 className="text-2xl font-semibold cursor-pointer">Settings</h2>
//             <p>Coming soon...</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default HomePage;
