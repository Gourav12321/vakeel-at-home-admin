"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import Loader from "@/components/Loader/Loader";
import EnhancedTable from "@/components/Table/EnhancedTable";
import FAQForm from "@/components/FAQForm/FAQForm";

import { Modal, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const FAQs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.faqs?.getAllFAQs}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.faqs) ? response?.faqs : [];
        setTotalDocuments(response.pagination?.totalFAQs || dataList.length);

        const mappedData = dataList.map((item) => ({
          question: item?.question || "N/A",
          answer: item?.answer || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  const handleDeleteClick = (faq) => {
    setFaqToDelete(faq);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!faqToDelete) return;

    deleteQuery({
      url: `${apiUrls.faqs.deleteFAQ.replace("/id", `/${faqToDelete._id}`)}`,
      onSuccess: (response) => {
        toast.success("FAQ deleted successfully");
        setTableData((prevData) =>
          prevData.filter((item) => item._id !== faqToDelete._id)
        );
        setTotalDocuments((prev) => prev - 1);
        setDeleteModalVisible(false);
        setFaqToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete FAQ");
        setDeleteModalVisible(false);
        setFaqToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setFaqToDelete(null);
  };

  const handleEditClick = (faq) => {
    setSelectedFAQ(faq);
    setFormVisible(true);
  };

  const handleCreateClick = () => {
    setSelectedFAQ(null);
    setFormVisible(true);
  };

  const columns = [
    {
      Header: "Question",
      accessor: "question",
      width: 300,
      Cell: (value) => (
        <div className="line-clamp-2 text-sm">{value || "N/A"}</div>
      ),
    },
    {
      Header: "Answer Preview",
      accessor: "answer",
      width: 300,
      Cell: (value) => (
        <div className="line-clamp-2 text-sm text-gray-600">
          {value ? value.substring(0, 80) + "..." : "N/A"}
        </div>
      ),
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
      <div className="flex justify-between items-center mb-6">
        <Title title={"FAQs Management"} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateClick}
          size="large"
        >
          Create FAQ
        </Button>
      </div>

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
              `/admin/faqs/${row._id}/?page=${page}&limit=${limit}`
            }
            onEdit={(row) => {
              handleEditClick(row);
            }}
            onDelete={handleDeleteClick}
            entryText={`Total FAQs: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      {/* FAQ Form Modal */}
      <FAQForm
        visible={formVisible}
        faq={selectedFAQ}
        onClose={() => setFormVisible(false)}
        onSuccess={() => fetchData()}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete FAQ"
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
            Are you sure you want to delete this FAQ? This action cannot be
            undone.
          </p>
          {faqToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">Question:</p>
              <p className="text-gray-600 line-clamp-2">
                {faqToDelete.question}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FAQs;
