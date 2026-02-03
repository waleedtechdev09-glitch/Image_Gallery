import { registerUser } from "../services/authService";

export const signUpController = async (
  formData: { username: string; email: string; password: string },
  onSuccess: () => void,
  onError: (msg: string) => void,
) => {
  try {
    await registerUser(formData.username, formData.email, formData.password);
    onSuccess();
  } catch (err: any) {
    onError(err.response?.data?.message || "Registration failed");
  }
};
