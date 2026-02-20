// export const setToken = (token: string) => {
//   if (typeof window !== "undefined") localStorage.setItem("token", token);
// };

// export const getToken = (): string | null => {
//   if (typeof window !== "undefined") return localStorage.getItem("token");
//   return null;
// };

// export const removeToken = () => {
//   if (typeof window !== "undefined") localStorage.removeItem("token");
// };

// export const isLoggedIn = (): boolean => !!getToken();

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    // 1. LocalStorage mein save karein (For Controllers/Frontend)
    localStorage.setItem("token", token);

    // 2. Cookie mein save karein (For Middleware/Security)
    // 'path=/' ka matlab hai poori site par access ho
    // 'max-age' seconds mein hota hai (86400 = 24 hours)
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    // Dono jagah se saaf karein
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
};

export const isLoggedIn = (): boolean => !!getToken();
