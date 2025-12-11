"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
// import usePatchQuery from "@/hooks/patchQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";

import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Image,
  Divider,
  Modal,
  Input,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader/BackHeader";

const { Text, Paragraph, Title: AntTitle } = Typography;

const BlogDetail = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();

  const [blogData, setBlogData] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Derive blogId from the current pathname to avoid accessing `params` Promise
  // directly in a client component.
  const blogId = pathname?.split("/").filter(Boolean).pop() ?? null;

  const fetchBlogData = () => {
    getQuery({
      url: `${apiUrls?.blogs?.getBlogById.replace("/id", `/${blogId}`)}`,
      onSuccess: (response) => {
        setBlogData(response.data);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch blog details");
      },
    });
  };

  const handleToggleVerification = () => {
    // If currently approved, open modal to get rejection reason before rejecting
    if (blogData?.isVerified) {
      setRejectionModalVisible(true);
      return;
    }

    // Otherwise approve directly
    setToggling(true);
    putQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      putData: { isVerified: true },
      onSuccess: (response) => {
        toast.success("Blog verification status updated successfully");
        setBlogData((prev) => ({
          ...prev,
          isVerified: true,
        }));
        setToggling(false);
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update verification status");
        setToggling(false);
      },
    });
  };

  const handleConfirmRejection = () => {
    setToggling(true);
    putQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      putData: { isVerified: false, rejectionReason },
      onSuccess: (response) => {
        toast.success("Blog verification status updated successfully");
        setBlogData((prev) => ({
          ...prev,
          isVerified: false,
        }));
        setToggling(false);
        setRejectionModalVisible(false);
        setRejectionReason("");
      },
      onFail: (err) => {
        console.log("Toggle failed:", err);
        toast.error("Failed to update verification status");
        setToggling(false);
      },
    });
  };

  const handleCancelRejection = () => {
    setRejectionModalVisible(false);
    setRejectionReason("");
  };

  const handleApprove = () => {
    setToggling(true);
    putQuery({
      url: `${apiUrls.blogs.verifyBlog.replace("/id", `/${blogId}`)}`,
      putData: { isVerified: true },
      onSuccess: (response) => {
        toast.success("Blog approved successfully");
        setBlogData((prev) => ({ ...prev, isVerified: true }));
        setToggling(false);
      },
      onFail: (err) => {
        console.log("Approve failed:", err);
        toast.error("Failed to approve blog");
        setToggling(false);
      },
    });
  };

  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    router.push(`/admin/blogs?page=${page}&limit=${limit}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">Blog not found</Text>
      </div>
    );
  }

  return (
    <>
      <BackHeader label={"Back"} />

      <Title title={`Blog: ${blogData.title}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <AntTitle level={2} className="mb-4">
                {blogData.title}
              </AntTitle>

              <div className="mb-4">
                <Space>
                  <Tag
                    color={
                      blogData.isVerified === true
                        ? "green"
                        : blogData.isVerified === false
                        ? "red"
                        : "gold"
                    }
                    icon={
                      blogData.isVerified ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                  >
                    {blogData.isVerified === true
                      ? "Approved"
                      : blogData.isVerified === false
                      ? "Rejected"
                      : "Pending"}
                  </Tag>
                  <Text type="secondary">
                    <CalendarOutlined className="mr-1" />
                    {moment(blogData.createdAt).format("MMM DD, YYYY h:mm A")}
                  </Text>
                </Space>
              </div>

              {/* Render HTML description as formatted content.
                  NOTE: using dangerouslySetInnerHTML — ensure the HTML is trusted
                  or sanitize it on the server/API to avoid XSS risks. */}
              <div
                className="text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blogData.description || "" }}
              />
            </div>

            {/* Images */}
            {blogData.images && blogData.images.length > 0 && (
              <div className="mb-6">
                <AntTitle level={4} className="mb-4">
                  Images
                </AntTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogData.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Blog image ${index + 1}`}
                      className="rounded-lg"
                      style={{ width: "100%", height: "auto" }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Blog Information" className="mb-6">
            <div className="space-y-4">
              <div>
                <Text strong>Author</Text>
                <div className="flex items-center mt-2">
                  <UserOutlined className="mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">
                      {blogData.author.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {blogData.author.email}
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Verification Status</Text>
                <div className="mt-2">
                  <Tag
                    color={
                      blogData.isVerified === true
                        ? "green"
                        : blogData.isVerified === false
                        ? "red"
                        : "gold"
                    }
                    icon={
                      blogData.isVerified === true ? (
                        <CheckCircleOutlined />
                      ) : blogData.isVerified === false ? (
                        <CloseCircleOutlined />
                      ) : null
                    }
                    className="text-sm"
                  >
                    {blogData.isVerified === true
                      ? "Approved"
                      : blogData.isVerified === false
                      ? "Rejected"
                      : "Pending"}
                  </Tag>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Created</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(blogData.createdAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>

              <div>
                <Text strong>Last Updated</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {moment(blogData.updatedAt).format("MMM DD, YYYY h:mm A")}
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Rejection Reason</Text>
                <div className="mt-2 text-sm text-gray-600">
                  {blogData.rejectionReason &&
                  blogData.rejectionReason.trim() !== "" ? (
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {blogData.rejectionReason}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Actions">
            <div className="space-y-3">
              {blogData.isVerified === true ? (
                // Approved -> allow reject (open modal)
                <Button
                  type="default"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectionModalVisible(true)}
                  loading={toggling}
                  disabled={toggling}
                  block
                >
                  Mark as Not Approved
                </Button>
              ) : blogData.isVerified === false ? (
                // Rejected -> allow approve
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  loading={toggling}
                  disabled={toggling}
                  block
                >
                  Mark as Approved
                </Button>
              ) : (
                // Pending -> show Approve and Reject buttons
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleApprove}
                    loading={toggling}
                    disabled={toggling}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => setRejectionModalVisible(true)}
                    loading={toggling}
                    disabled={toggling}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Rejection Reason Modal for detail page */}
          <Modal
            title="Rejection Reason"
            open={rejectionModalVisible}
            onOk={handleConfirmRejection}
            onCancel={handleCancelRejection}
            okButtonProps={{
              disabled: !rejectionReason || rejectionReason.trim() === "",
            }}
            okText="Reject"
          >
            <div className="py-2">
              <p className="text-sm text-gray-600 mb-2">
                Please provide a reason for rejection:
              </p>
              <Input.TextArea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason"
              />
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
