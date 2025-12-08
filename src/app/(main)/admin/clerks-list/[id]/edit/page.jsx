"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import UserEditForm from "@/components/UserEditForm/UserEditForm";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import { apiUrls } from "@/apis";

const EditClerkPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clerkId = params.id;

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const [clerkData, setClerkData] = useState(null);

  // Get page and limit from URL params to preserve navigation state
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  useEffect(() => {
    if (clerkId) {
      fetchClerkData();
    }
  }, [clerkId]);

  const fetchClerkData = () => {
    getQuery({
      url: `${apiUrls.auth.getById}/${clerkId}`,
      onSuccess: (response) => {
        setClerkData(response.data.user);
      },
      onFail: (err) => {
        console.error("Failed to fetch clerk data:", err);
        toast.error("Failed to load clerk information");
        router.back();
      },
    });
  };

  const handleSave = (formData) => {
    putQuery({
      url: `${apiUrls.auth.updateUser}/${clerkId}`,
      putData: formData,
      onSuccess: (response) => {
        toast.success("Clerk information updated successfully");
        router.push(`/admin/clerks-list?page=${page}&limit=${limit}`);
      },
      onFail: (err) => {
        console.error("Failed to update clerk:", err);
        toast.error("Failed to update clerk information");
      },
    });
  };

  const handleCancel = () => {
    router.push(`/admin/clerks-list?page=${page}&limit=${limit}`);
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
      <Title title="Edit Clerk" />
      <div className="pt-4">
        {clerkData ? (
          <UserEditForm
            userData={clerkData}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={updateLoading}
            userType="Clerk"
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No clerk data found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default EditClerkPage;
