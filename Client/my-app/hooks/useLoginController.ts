"use client";

import { useState } from "react";
import { loginController } from "../controllers/loginController";

export const useLoginController = (onSuccess: (token: string) => void) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    loginController(
      formData,
      (token) => {
        setLoading(false);
        onSuccess(token);
      },
      (msg) => {
        setLoading(false);
        setError(msg);
      },
    );
  };

  return { formData, loading, error, handleChange, handleSubmit };
};
