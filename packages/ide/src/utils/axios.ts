import axios from "axios";

export const api = axios.create({
  baseURL: process.env.VERCEL_URL
    ? process.env.VERCEL_URL + "/api"
    : process.env.NEXT_PUBLIC_API_BASE_URL,
});
