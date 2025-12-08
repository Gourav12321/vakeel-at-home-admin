import { useState } from "react";
import { logger } from "../utils/logger";

import toast from "react-hot-toast";
import apiClient from "../apis/apiClient";

const headers = {
  "Content-Type": "application/json",
};

const formDataHeaders = {
  // Don't set Content-Type for FormData - let browser set it with boundary
};

const usePostQuery = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();

  const postQuery = async (params) => {
    const {
      url,
      onSuccess = () => {
        logger.log("onSuccess function");
      },
      onFail = () => {
        logger.log("onFail function");
      },
      postData,
      headers: headerFromParams,
    } = params;
    setLoading(true);
    try {
      // Check if postData is FormData to use appropriate headers
      const isFormData = postData instanceof FormData;
      const requestHeaders = headerFromParams
        ? headerFromParams
        : isFormData
        ? formDataHeaders
        : headers;

      console.log("Making request to:", url);
      console.log("Request headers:", requestHeaders);
      console.log("PostData type:", typeof postData);
      console.log("Is FormData:", postData instanceof FormData);

      const config = {
        headers: requestHeaders,
      };

      // For FormData, explicitly delete Content-Type to let browser set it
      if (isFormData && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }

      const { data: apiData = {} } = await apiClient.post(
        url,
        postData,
        config
      );
      setData(apiData);
      await onSuccess(apiData);
      logger.log(apiData, "postQuery-success");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          err?.data?.message ||
          err?.data?.data?.message ||
          "Something went wrong"
      );
      onFail(err);
      logger.log(err, "postQuery-fail");
      setError(err);
      setData();
    } finally {
      setLoading(false);
    }
  };

  return {
    postQuery,
    loading,
    setLoading,
    data,
    setData,
    error,
    setError,
  };
};

export default usePostQuery;
