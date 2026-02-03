import { loginUser } from "../services/authService";

export const loginController = async (
  formData: { email: string; password: string },
  onSuccess: (token: string) => void,
  onError: (msg: string) => void,
) => {
  try {
    const data = await loginUser(formData.email, formData.password);
    if (data.token) {
      onSuccess(data.token);
    } else {
      onError("Token not returned from backend");
    }
  } catch (err: any) {
    onError(err.response?.data?.message || "Login failed");
  }
};
