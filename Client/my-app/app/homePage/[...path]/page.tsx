"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";

export default function DynamicFolderPage() {
  const params = useParams();
  const router = useRouter();

  const token = getToken();
  const API_URL = "http://localhost:5000";

  const [images, setImages] = useState<any[]>([]);
  const [breadcrumb, setBreadcrumb] = useState("");

  const pathArray = params.path as string[];

  useEffect(() => {
    const load = async () => {
      if (!pathArray || pathArray.length === 0) return;

      try {
        const res = await axios.post(
          `${API_URL}/api/folders/resolve-path`,
          { path: pathArray },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const folderId = res.data.folderId;

        const imgRes = await axios.get(
          `${API_URL}/api/images?folderId=${folderId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setImages(imgRes.data);
        setBreadcrumb(res.data.fullPath);
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, [params]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Path: /{breadcrumb}</h2>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <img key={img._id} src={img.url} width={200} />
        ))}
      </div>
    </div>
  );
}
