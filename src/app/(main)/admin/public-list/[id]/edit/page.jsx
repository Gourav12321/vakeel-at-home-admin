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

const EditPublicUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id;

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const [userData, setUserData] = useState(null);

  // Get page and limit from URL params to preserve navigation state
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = () => {
    getQuery({
      url: `${apiUrls.auth.getById}/${userId}`,
      onSuccess: (response) => {
        setUserData(response.data.user);
      },
      onFail: (err) => {
        console.error("Failed to fetch user data:", err);
        toast.error("Failed to load user information");
        router.back();
      },
    });
  };

  const handleSave = (formData) => {
    putQuery({
      url: `${apiUrls.auth.updateUser}/${userId}`,
      putData: formData,
      onSuccess: (response) => {
        toast.success("Public user information updated successfully");
        router.push(`/admin/public-list?page=${page}&limit=${limit}`);
      },
      onFail: (err) => {
        console.error("Failed to update user:", err);
        toast.error("Failed to update user information");
      },
    });
  };

  const handleCancel = () => {
    router.push(`/admin/public-list?page=${page}&limit=${limit}`);
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
      <Title title="Edit Public User" />
      <div className="pt-4">
        {userData ? (
          <UserEditForm
            userData={userData}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={updateLoading}
            userType="Public User"
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No user data found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default EditPublicUserPage;
