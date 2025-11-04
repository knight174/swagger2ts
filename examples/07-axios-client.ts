/**
 * Axios Client Example
 *
 * This example shows how to generate and use Axios-based API clients
 * instead of the default Fetch clients.
 *
 * Prerequisites:
 * - Install axios: pnpm add axios
 * - Use axios-client.config.ts template
 */

import axios from "axios";
import { getUsersIdClient } from "./api/clients/axios";

// Configure Axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error("Unauthorized! Redirecting to login...");
    }
    return Promise.reject(error);
  }
);

async function axiosExample() {
  try {
    // Use the Axios client
    const response = await getUsersIdClient({
      params: { id: "123" }
    });

    console.log("User data:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data);
    } else {
      console.error("Error:", error);
    }
  }
}

axiosExample();
