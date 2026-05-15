import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "./config";

console.log("🌐 API Base URL:", API_CONFIG.baseURL);

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    console.log("📤 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("📤 Request Error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error("❌ Response Error:", error.response?.status);
    console.error("❌ Error Data:", error.response?.data);

    if (error.response?.data) {
      const errorData = error.response.data as any;
      if (errorData.detail) {
        error.message = errorData.detail;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
