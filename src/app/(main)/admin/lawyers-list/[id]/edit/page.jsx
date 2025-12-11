"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import UserEditForm from "@/components/UserEditForm/UserEditForm";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import { apiBaseUrl, apiUrls } from "@/apis";
import axios from "axios";

const EditLawyerPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lawyerId = params.id;

  const { getQuery, loading: fetchLoading } = useGetQuery();

  const { putQuery, loading: updateLoading } = usePutQuery();
  const [lawyerData, setLawyerData] = useState(null);
  const [lawyerServices, setLawyerServices] = useState([]);

  // Get page and limit from URL params to preserve navigation state
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  useEffect(() => {
    if (lawyerId) {
      fetchLawyerData();
      fetchLawyerServices();
    }
  }, [lawyerId]);

  const fetchLawyerData = () => {
    getQuery({
      url: `${apiUrls.lawyers.getLawyerById}/${lawyerId}`,

      onSuccess: (response) => {
        setLawyerData(response.data.lawyer);
      },
      onFail: (err) => {
        console.error("Failed to fetch lawyer data:", err);
        toast.error("Failed to load lawyer information");
        router.back();
      },
    });
  };

  const fetchLawyerServices = async () => {
    const url = `${apiBaseUrl}${apiUrls.service.getLawyerServices}/${lawyerId}`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setLawyerServices(response.data?.services || []);
    } catch (err) {
      console.error("Failed to fetch lawyer services:", err);
    }
  };

  const handleSave = (formData) => {
    putQuery({
      url: `${apiUrls.auth.updateUser}/${lawyerId}`,
      putData: formData,
      onSuccess: (response) => {
        toast.success("Lawyer information updated successfully");
        router.push(`/admin/lawyers-list?page=${page}&limit=${limit}`);
      },
      onFail: (err) => {
        console.error("Failed to update lawyer:", err);
        toast.error("Failed to update lawyer information");
      },
    });
  };

  const handleCancel = () => {
    router.push(`/admin/lawyers-list?page=${page}&limit=${limit}`);
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Title title="Edit Lawyer" />
      <div className="pt-4">
        {lawyerData ? (
          <UserEditForm
            userData={lawyerData}
            lawyerServices={lawyerServices}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={updateLoading}
            userType="Lawyer"
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No lawyer data found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default EditLawyerPage;
