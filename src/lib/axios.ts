import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const localApi = axios.create({});

localApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (!token) return config;

  const value = `Bearer ${token}`;

  if (config.headers && typeof (config.headers as any).set === "function") {
    // AxiosHeaders 케이스
    (config.headers as any).set("Authorization", value);
  } else {
    // plain object 케이스
    config.headers = {
      ...(config.headers ?? {}),
      Authorization: value,
    } as any;
  }

  return config;
});

export default localApi;
