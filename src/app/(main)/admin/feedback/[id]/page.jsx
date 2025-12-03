"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";

import { Card, Button, Typography, Divider, Form, Input, Select } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Rate } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader/BackHeader";

const { Text, Paragraph, Title: AntTitle } = Typography;

const FeedbackDetail = ({ params }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const { putQuery: updateClientStatus, loading: updateClientLoading } =
    usePutQuery();

  const [feedbackData, setFeedbackData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [updatingRealClient, setUpdatingRealClient] = useState(false);

  const feedbackId = params.id;

  const fetchFeedbackData = () => {
    getQuery({
      url: `${apiUrls?.feedback?.getFeedbackById.replace(
        "/id",
        `/${feedbackId}`
      )}`,
      onSuccess: (response) => {
        setFeedbackData(response.data);
        form.setFieldsValue({
          title: response.data.title,
        });
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch feedback details");
      },
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData({
      title: feedbackData.title,
    });
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedData(null);
    form.setFieldsValue({
      title: feedbackData.title,
    });
  };

  const handleUpdateFeedback = () => {
    form.validateFields().then(() => {
      const formValues = form.getFieldsValue();
      putQuery({
        url: `${apiUrls.feedback.updateFeedback.replace(
          "/id",
          `/${feedbackId}`
        )}`,
        body: {
          title: formValues.title,
        },
        onSuccess: (response) => {
          toast.success("Feedback updated successfully");
          setFeedbackData({
            ...feedbackData,
            ...formValues,
          });
          setIsEditing(false);
          setEditedData(null);
        },
        onFail: (err) => {
          console.log("Update failed:", err);
          toast.error("Failed to update feedback");
        },
      });
    });
  };

  const handleRealClientChange = (value) => {
    setUpdatingRealClient(true);
    updateClientStatus({
      url: `/feedback/mark-realclient/${feedbackId}`,
      body: {
        isRealAndClient: value,
      },
      onSuccess: (response) => {
        toast.success("Status updated successfully");
        setFeedbackData({
          ...feedbackData,
          isRealAndClient: value,
        });
        setUpdatingRealClient(false);
      },
      onFail: (err) => {
        console.log("Update failed:", err);
        toast.error("Failed to update status");
        setUpdatingRealClient(false);
      },
    });
  };

  useEffect(() => {
    if (feedbackId) {
      fetchFeedbackData();
    }
  }, [feedbackId]);

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    router.push(`/admin/feedback?page=${page}&limit=${limit}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!feedbackData) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">Feedback not found</Text>
      </div>
    );
  }

  return (
    <>
      <BackHeader label={"Back"} />

      <Title title={`Feedback: ${feedbackData.title}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            {isEditing ? (
              <Form form={form} layout="vertical" className="space-y-4">
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    { required: true, message: "Please enter feedback title" },
                  ]}
                >
                  <Input placeholder="Enter feedback title" />
                </Form.Item>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleUpdateFeedback}
                    loading={updateLoading}
                    disabled={updateLoading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleEditCancel}
                    disabled={updateLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <>
                <div className="mb-6">
                  <AntTitle level={2} className="mb-4">
                    {feedbackData.title}
                  </AntTitle>
                  <Paragraph className="text-base leading-relaxed whitespace-pre-wrap">
                    {feedbackData.description || "N/A"}
                  </Paragraph>
                  <div className="mb-4">
                    <Text type="secondary">
                      <CalendarOutlined className="mr-1" />
                      {moment(feedbackData.createdAt).format(
                        "MMM DD, YYYY h:mm A"
                      )}
                    </Text>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Feedback Information" className="mb-6">
            <div className="space-y-4">
              <div>
                <Text strong>Author</Text>
                <div className="flex items-center mt-2">
                  <UserOutlined className="mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">
                      {feedbackData.author?.fullName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {feedbackData.author?.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Rating</Text>
                <div className="mt-2">
                  <Rate disabled defaultValue={feedbackData.rating} />
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Real Client</Text>
                <div className="mt-2">
                  <Select
                    value={feedbackData.isRealAndClient ? "true" : "false"}
                    onChange={(value) =>
                      handleRealClientChange(value === "true")
                    }
                    loading={updatingRealClient}
                    disabled={updatingRealClient}
                    style={{ width: "100%" }}
                  >
                    <Select.Option value="true">Yes</Select.Option>
                    <Select.Option value="false">No</Select.Option>
                  </Select>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Created</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(feedbackData.createdAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>

              <div>
                <Text strong>Last Updated</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(feedbackData.updatedAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>
            </div>
          </Card>

          {!isEditing && (
            <Card title="Actions">
              <div className="space-y-3">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditClick}
                  disabled={updateLoading}
                  block
                >
                  Edit Feedback
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackDetail;
