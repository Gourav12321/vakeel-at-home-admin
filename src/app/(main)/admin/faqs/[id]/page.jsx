"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import Loader from "@/components/Loader/Loader";
import FAQForm from "@/components/FAQForm/FAQForm";

import {
  Card,
  Button,
  Space,
  Typography,
  Divider,
  Modal,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader/BackHeader";

const { Text, Paragraph, Title: AntTitle } = Typography;

const FAQDetail = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [faqData, setFaqData] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const faqId = params.id;

  const fetchFAQData = () => {
    getQuery({
      url: `${apiUrls?.faqs?.getFAQById.replace("/id", `/${faqId}`)}`,
      onSuccess: (response) => {
        setFaqData(response.faq);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch FAQ details");
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteQuery({
      url: `${apiUrls.faqs.deleteFAQ.replace("/id", `/${faqId}`)}`,
      onSuccess: (response) => {
        toast.success("FAQ deleted successfully");
        setDeleteModalVisible(false);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "10";
        router.push(`/admin/faqs?page=${page}&limit=${limit}`);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete FAQ");
        setDeleteModalVisible(false);
      },
    });
  };

  useEffect(() => {
    if (faqId) {
      fetchFAQData();
    }
  }, [faqId]);

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    router.push(`/admin/faqs?page=${page}&limit=${limit}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!faqData) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">FAQ not found</Text>
      </div>
    );
  }

  return (
    <>
      <BackHeader label={"Back to FAQs"} />

      <Title title={`FAQ Details`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <AntTitle level={3} className="mb-4">
                Question
              </AntTitle>
              <Paragraph className="text-base leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                {faqData.question}
              </Paragraph>
            </div>

            <Divider />

            <div className="mb-6">
              <AntTitle level={3} className="mb-4">
                Answer
              </AntTitle>
              <Paragraph className="text-base leading-relaxed whitespace-pre-wrap">
                {faqData.answer}
              </Paragraph>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card title="FAQ Information" className="mb-6">
            <div className="space-y-4">
              <div>
                <Text strong>Created</Text>
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {moment(faqData.createdAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Last Updated</Text>
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {moment(faqData.updatedAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setFormVisible(true)}
                block
              >
                Edit FAQ
              </Button>

              <Popconfirm
                title="Delete FAQ"
                description="Are you sure you want to delete this FAQ? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => {}}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: deleteLoading }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  block
                  loading={deleteLoading}
                >
                  Delete FAQ
                </Button>
              </Popconfirm>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Form Modal */}
      <FAQForm
        visible={formVisible}
        faq={faqData}
        onClose={() => setFormVisible(false)}
        onSuccess={() => {
          fetchFAQData();
          setFormVisible(false);
        }}
      />
    </>
  );
};

export default FAQDetail;
