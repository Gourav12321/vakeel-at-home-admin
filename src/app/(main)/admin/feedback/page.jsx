"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Modal, Rate, Tag, Select, Spin } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Feedback = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.feedback?.getAllFeedback}?page=${page}&limit=${limit}`,

      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.feedback)
          ? response?.data?.feedback
          : [];
        setTotalDocuments(response.data.pagination.totalFeedback);

        const mappedData = dataList.map((item) => ({
          title: item?.title || "N/A",
          description: item?.description || "N/A",
          rating: item?.rating || "N/A",
          isRealAndClient: item?.isRealAndClient || false,
          authorName: item?.author?.fullName || "N/A",
          email: item?.author?.email || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          createdAt: item?.createdAt,
          updatedAt:
            moment(item?.updatedAt).format("DD-MM-YYYY HH:mm") || "N/A",
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch feedback");
      },
    });
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!feedbackToDelete) return;

    deleteQuery({
      url: `${apiUrls.feedback.deleteFeedback.replace(
        "/id",
        `/${feedbackToDelete._id}`
      )}`,
      onSuccess: (response) => {
        toast.success("Feedback deleted successfully");
        setTableData((prevData) =>
          prevData.filter((item) => item._id !== feedbackToDelete._id)
        );
        setTotalDocuments((prev) => prev - 1);
        setDeleteModalVisible(false);
        setFeedbackToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete feedback");
        setDeleteModalVisible(false);
        setFeedbackToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setFeedbackToDelete(null);
  };

  const handleRealClientChange = (feedbackId, value) => {
    setUpdatingId(feedbackId);
    putQuery({
      url: `/feedback/mark-realclient/${feedbackId}`,
      body: {
        isRealAndClient: value,
      },
      onSuccess: (response) => {
        toast.success("Status updated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === feedbackId ? { ...item, isRealAndClient: value } : item
          )
        );
        setUpdatingId(null);
      },
      onFail: (err) => {
        console.log("Update failed:", err);
        toast.error("Failed to update status");
        setUpdatingId(null);
      },
    });
  };

  const columns = [
    {
      Header: "Title",
      accessor: "title",
      width: 150,
    },
    {
      Header: "Description",
      accessor: "description",
      width: 250,
    },
    {
      Header: "Rating",
      accessor: "rating",
      width: 80,
      render: (value) => (
        <div className="whitespace-nowrap">
          <Rate disabled defaultValue={value} />
        </div>
      ),
    },
    {
      Header: "Real Client",
      accessor: "isRealAndClient",
      width: 150,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {updatingId === row._id ? (
            <Spin size="small" />
          ) : (
            <Select
              value={value ? "true" : "false"}
              onChange={(val) =>
                handleRealClientChange(row._id, val === "true")
              }
              disabled={updatingId !== null}
              style={{ width: "100%" }}
              size="small"
            >
              <Select.Option value="true">Yes</Select.Option>
              <Select.Option value="false">No</Select.Option>
            </Select>
          )}
        </div>
      ),
    },
    {
      Header: "Author Name",
      accessor: "authorName",
      width: 150,
    },
    {
      Header: "Email",
      accessor: "email",
      width: 200,
    },
    {
      Header: "Created",
      accessor: "date",
      width: 120,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit);
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <Title title={"Feedback List"} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showDate={true}
            showActions={true}
            onView={(row) =>
              `/admin/feedback/${row._id}/?page=${page}&limit=${limit}`
            }
            onDelete={handleDeleteClick}
            entryText={`Total Feedback: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Feedback"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
        }}
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this feedback? This action cannot be
            undone.
          </p>
          {feedbackToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">Feedback Title:</p>
              <p className="text-gray-600">{feedbackToDelete.title}</p>
              <p className="font-medium text-gray-800 mt-2">Author:</p>
              <p className="text-gray-600">{feedbackToDelete.authorName}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Feedback;
