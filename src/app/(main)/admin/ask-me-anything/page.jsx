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
    <div
      className={`ml-${level * 4} mt-3`}
      style={{ marginLeft: `${level * 24}px` }}
    >
      <Card
        size="small"
        className={`mb-3 ${
          isHidden
            ? "opacity-60 bg-gray-50"
            : "shadow-sm hover:shadow-md transition-shadow"
        }`}
        styles={{
          body: { padding: "12px 16px" },
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar
            size="default"
            icon={<UserOutlined />}
            className="flex-shrink-0 bg-blue-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Text strong className="text-sm text-gray-800">
                {reply.author && typeof reply.author === "object"
                  ? reply.author.fullName
                  : "Unknown User"}
              </Text>
              <Text type="secondary" className="text-xs">
                {reply.createdAt
                  ? moment(reply.createdAt).format("MMM DD, h:mm A")
                  : "No date"}
              </Text>
              {isHidden && (
                <Tag color="red" size="small" className="ml-auto">
                  Hidden
                </Tag>
              )}
            </div>
            <Paragraph className="mb-2 text-sm text-gray-700 leading-relaxed">
              {reply.comment || "No comment"}
            </Paragraph>
            {reply.replies && reply.replies.length > 0 && (
              <Text type="secondary" className="text-xs">
                {reply.replies.length}{" "}
                {reply.replies.length === 1 ? "reply" : "replies"}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* Render nested replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-1">
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
      className="mb-6 shadow-md hover:shadow-lg transition-shadow border-0"
      styles={{
        body: { padding: "20px" },
      }}
    >
      <div className="flex items-start gap-4">
        <Avatar
          size="large"
          src={comment.author?.profilePic}
          icon={<UserOutlined />}
          className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <Text strong className="text-lg text-gray-800">
              {comment.author?.fullName || "Unknown User"}
            </Text>
            <Text type="secondary" className="text-sm">
              {comment.author?.email || "No email"}
            </Text>
            <Text type="secondary" className="text-xs ml-auto">
              {comment.createdAt
                ? moment(comment.createdAt).format("MMM DD, YYYY h:mm A")
                : "No date"}
            </Text>
          </div>

          <div className="mb-4">
            <Text strong className="text-xl block mb-3 text-gray-900">
              {comment.title || "No title"}
            </Text>
            <Paragraph className="mb-0 text-gray-700 leading-relaxed text-base">
              {comment.comment || "No comment"}
            </Paragraph>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="border-l-4 border-blue-200 pl-4 bg-gray-50 rounded-r-lg p-3">
              <Text strong className="text-sm text-gray-600 mb-3 block">
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

      <div className="mb-6 flex justify-between items-center">
        <div>
          <Text type="secondary" className="text-base">
            Total Comments: {totalDocuments}
          </Text>
          <Text type="secondary" className="text-sm block">
            Showing {Math.min((page - 1) * limit + 1, totalDocuments)}-
            {Math.min(page * limit, totalDocuments)} of {totalDocuments}{" "}
            comments
          </Text>
        </div>
        <div className="text-right">
          <Text type="secondary" className="text-sm">
            Page {page} of {Math.ceil(totalDocuments / limit)}
          </Text>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          {commentsData.length > 0 ? (
            <div className="space-y-4">
              {commentsData.map((comment, index) => (
                <CommentCard key={comment._id || index} comment={comment} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <MessageOutlined className="text-4xl text-gray-400 mb-4" />
                <Text type="secondary">No comments found</Text>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalDocuments > limit && (
            <div className="mt-8 flex justify-center">
              <Card className="shadow-sm">
                <Space size="large" className="px-4 py-2">
                  <Button
                    type="primary"
                    icon={<LeftOutlined />}
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="flex items-center gap-2"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Text strong className="text-gray-700">
                      Page {page} of {Math.ceil(totalDocuments / limit)}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      ({totalDocuments} total comments)
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    disabled={page >= Math.ceil(totalDocuments / limit)}
                    onClick={() => handlePageChange(page + 1)}
                    className="flex items-center gap-2"
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
