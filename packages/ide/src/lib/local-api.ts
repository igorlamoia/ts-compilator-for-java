import axios from "axios";

export const localApi = axios.create({ baseURL: "/api" });
