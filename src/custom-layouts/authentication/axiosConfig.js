import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "http://LAPTOP-VEGD3CL5:8080", // Change this to your backend URL
});

// Function to check token expiration
const isTokenExpired = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true; // If decoding fails, treat it as expired
  }
};

// Axios request interceptor
axios.interceptors.request.use(
  (config) => {
    if (config.url.includes("/users/signin")) {
      return config; // Don't check token
    }

    if (isTokenExpired()) {
      logout();
      toast.error("Session expired, please login");
      return Promise.reject(new Error("Token expired"));
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Logout function
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("role");
  window.location.href = "/sign-in"; // Redirect to login
};

export default API;
