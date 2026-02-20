import axios from "axios";

const API_URL =
  "http://a8e4f52fd8989452b84e82a64e3bb256-254123936.ap-south-1.elb.amazonaws.com/api/auth";
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
