"use client";

import moment from "moment";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";

import { Card, Avatar, Button, Tag, Space, Typography, Divider } from "antd";
import {
  UserOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const { Text, Paragraph } = Typography;

// Component to render nested replies
const ReplyComponent = ({ reply, level = 0 }) => {
  const isHidden = reply.hide;
  const maxLevel = 3; // Maximum nesting level to prevent infinite recursion

  if (level > maxLevel) {
    return null;
  }

  return (
    <div style={{ marginLeft: `${level * 24}px`, marginTop: "12px" }}>
      <Card
        size="small"
        style={{
          marginBottom: "12px",
          opacity: isHidden ? 0.6 : 1,
          backgroundColor: isHidden ? "#f9fafb" : "#ffffff",
          boxShadow: isHidden
            ? "none"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
        styles={{
          body: { padding: "12px 16px" },
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Avatar
            size="default"
            icon={<UserOutlined />}
            style={{ flexShrink: 0, backgroundColor: "#dbeafe" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>
                {reply.author && typeof reply.author === "object"
                  ? reply.author.fullName
                  : "Unknown User"}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {reply.createdAt
                  ? moment(reply.createdAt).format("MMM DD, h:mm A")
                  : "No date"}
              </Text>
              {isHidden && (
                <Tag color="red" size="small" style={{ marginLeft: "auto" }}>
                  Hidden
                </Tag>
              )}
            </div>
            <Paragraph
              style={{
                marginBottom: "8px",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {reply.comment || "No comment"}
            </Paragraph>
            {reply.replies && reply.replies.length > 0 && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {reply.replies.length}{" "}
                {reply.replies.length === 1 ? "reply" : "replies"}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* Render nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div style={{ marginTop: "4px" }}>
          {reply.replies.map((nestedReply, index) => (
            <ReplyComponent
              key={nestedReply._id || index}
              reply={nestedReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component to render main comment
const CommentCard = ({ comment }) => {
  return (
    <Card
      style={{
        marginTop: "32px",
        marginBottom: "32px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "none",
      }}
      styles={{
        body: { padding: "20px" },
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <Avatar
          size="large"
          src={comment.author?.profilePic}
          icon={<UserOutlined />}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Text strong style={{ fontSize: "18px", color: "#1f2937" }}>
              {comment.author?.fullName || "Unknown User"}
            </Text>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              {comment.author?.email || "No email"}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "12px", marginLeft: "auto" }}
            >
              {comment.createdAt
                ? moment(comment.createdAt).format("MMM DD, YYYY h:mm A")
                : "No date"}
            </Text>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "20px",
                display: "block",
                marginBottom: "12px",
                color: "#111827",
              }}
            >
              {comment.title || "No title"}
            </Text>
            <Paragraph
              style={{
                marginBottom: 0,
                color: "#374151",
                lineHeight: "1.6",
                fontSize: "16px",
              }}
            >
              {comment.comment || "No comment"}
            </Paragraph>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div
              style={{
                borderLeft: "4px solid #dbeafe",
                paddingLeft: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "0 8px 8px 0",
                padding: "12px",
              }}
            >
              <Text
                strong
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "Reply" : "Replies"}
              </Text>
              {comment.replies.map((reply, index) => (
                <ReplyComponent
                  key={reply._id || index}
                  reply={reply}
                  level={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AskMeAnthing = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();

  const [commentsData, setCommentsData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5; // Fixed to 5 comments per page

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.askMeAnything?.getComments}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.posts)
          ? response?.data?.posts
          : [];
        setTotalDocuments(response.data.pagination.totalPosts);

        console.log("datalist", dataList);
        setCommentsData(dataList);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

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
      <Title title={"Ask Me Anything"} />

      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Total Comments: {totalDocuments}
          </Text>
          <Text type="secondary" style={{ fontSize: "14px", display: "block" }}>
            Showing {Math.min((page - 1) * limit + 1, totalDocuments)}-
            {Math.min(page * limit, totalDocuments)} of {totalDocuments}{" "}
            comments
          </Text>
        </div>
        <div style={{ textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Page {page} of {Math.ceil(totalDocuments / limit)}
          </Text>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "256px",
          }}
        >
          <Loader />
        </div>
      ) : (
        <div style={{ paddingTop: "16px" }}>
          {commentsData.length > 0 ? (
            <div>
              {commentsData.map((comment, index) => (
                <CommentCard key={comment._id || index} comment={comment} />
              ))}
            </div>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <MessageOutlined
                  style={{
                    fontSize: "48px",
                    color: "#9ca3af",
                    marginBottom: "16px",
                  }}
                />
                <Text type="secondary">No comments found</Text>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalDocuments > limit && (
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                style={{
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                }}
              >
                <Space size="large" style={{ padding: "8px 16px" }}>
                  <Button
                    type="primary"
                    icon={<LeftOutlined />}
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Previous
                  </Button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Text strong style={{ color: "#374151" }}>
                      Page {page} of {Math.ceil(totalDocuments / limit)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      ({totalDocuments} total comments)
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    disabled={page >= Math.ceil(totalDocuments / limit)}
                    onClick={() => handlePageChange(page + 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Next
                  </Button>
                </Space>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AskMeAnthing;
