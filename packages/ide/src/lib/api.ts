import axios from "axios";
import { getAuthToken } from "@/lib/auth-cookies";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
