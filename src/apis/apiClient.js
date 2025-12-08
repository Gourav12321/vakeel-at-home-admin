import axios from "axios";
import axiosRetry from "axios-retry";

import { apiBaseUrl } from ".";
import { logger } from "@/utils/logger";
import { getAuthTokens } from "@/utils/storage";

const apiInstance = () => {
  const api = axios.create({
    baseURL: apiBaseUrl,
    // Don't set default Content-Type here - let requests set it based on data type
    headers: {
      // Content-Type will be set by request interceptor based on data type
    },
    // Add withCredentials if you need cookies
    withCredentials: false,
  });

  axiosRetry(api, { retries: 3 });

  api.interceptors.request.use(async (config) => {
    const tokens = getAuthTokens();
    const accessToken = tokens?.accessToken;

    // If access-token header is provided (e.g., from MSG91), use it
    // Otherwise, use the stored access token
    if (config.headers["access-token"]) {
      // access-token header is already set, keep it
    } else if (accessToken) {
      config.headers["authorization"] = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    // Only set JSON Content-Type for non-FormData requests
    if (!(config.data instanceof FormData) && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    logger.log("REQUEST", config);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      logger.log(response);
      console.log(response.data);
      // Handle token updates if needed
      if (response.data?.tokens?.accessToken) {
        // Token was refreshed, update storage
        const { setAuthTokens } = require("@/utils/storage");
        setAuthTokens(response.data.tokens);
      }
      return response;
    },
    (error) => {
      logger.log("ERROR", error.response?.data?.detail || error.message);
      throw error;
    }
  );

  return api;
};

const apiClient = apiInstance();

export default apiClient;
