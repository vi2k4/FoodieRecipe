import axios, { AxiosError } from "axios";
import { env } from "./env";

let accessToken: string | null = null;

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** Axios instance dùng chung cho toàn bộ frontend. */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const message = error.response?.data?.message;
    const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
    throw new ApiError(normalizedMessage || "Có lỗi xảy ra, vui lòng thử lại", error.response?.status);
  },
);



