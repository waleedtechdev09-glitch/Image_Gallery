import { useState } from "react";
import { signUpController } from "../controllers/signUpController";

export const useSignUpController = (onSuccessRedirect: () => void) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    signUpController(
      formData,
      () => {
        setLoading(false);
        onSuccessRedirect();
      },
      (msg) => {
        setLoading(false);
        setError(msg);
      },
    );
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
};
