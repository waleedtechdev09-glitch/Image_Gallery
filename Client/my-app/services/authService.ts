import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
// USER REGISTER
export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
  });
  return res.data;
};
// USER LOGIN
export const loginUser = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};
