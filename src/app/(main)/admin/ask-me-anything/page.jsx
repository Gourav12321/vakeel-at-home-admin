"use client";

import moment from "moment";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";

import { Card, Avatar, Button, Tag, Space, Typography } from "antd";
import { UserOutlined, MessageOutlined, LikeOutlined } from "@ant-design/icons";
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
      className={`ml-${level * 4} mt-2`}
      style={{ marginLeft: `${level * 20}px` }}
    >
      <Card
        size="small"
        className={`mb-2 ${isHidden ? "opacity-50 bg-gray-50" : ""}`}
        styles={{ body: { padding: "8px 12px" } }}
      >
        <div className="flex items-start gap-2">
          <Avatar
            size="small"
            icon={<UserOutlined />}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Text strong className="text-sm">
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
                <Tag color="red" size="small">
                  Hidden
                </Tag>
              )}
            </div>
            <Paragraph className="mb-1 text-sm">
              {reply.comment || "No comment"}
            </Paragraph>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                icon={<LikeOutlined />}
                className="text-xs"
              >
                {reply.likes?.length || 0}
              </Button>
              <Text type="secondary" className="text-xs">
                {reply.replies?.length || 0} replies
              </Text>
            </div>
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
    <Card className="mb-4" styles={{ body: { padding: "16px" } }}>
      <div className="flex items-start gap-3">
        <Avatar
          size="default"
          src={comment.author?.profilePic}
          icon={<UserOutlined />}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Text strong className="text-base">
              {comment.author?.fullName || "Unknown User"}
            </Text>
            <Text type="secondary" className="text-sm">
              {comment.author?.email || "No email"}
            </Text>
            <Text type="secondary" className="text-xs">
              {comment.createdAt
                ? moment(comment.createdAt).format("MMM DD, YYYY h:mm A")
                : "No date"}
            </Text>
          </div>

          <div className="mb-3">
            <Text strong className="text-lg block mb-2">
              {comment.title || "No title"}
            </Text>
            <Paragraph className="mb-0">
              {comment.comment || "No comment"}
            </Paragraph>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <Button
              type="text"
              size="small"
              icon={<LikeOutlined />}
              className={comment.isLiked ? "text-blue-500" : ""}
            >
              {comment.likes?.length || 0} Likes
            </Button>
            <Text type="secondary" className="text-sm">
              {comment.replies?.length || 0} Replies
            </Text>
          </div>

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="border-l-2 border-gray-200 pl-4">
              <Text strong className="text-sm text-gray-600 mb-2 block">
                Replies:
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
  const limit = parseInt(searchParams.get("limit") || "10", 10);

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

      <div className="mb-4">
        <Text type="secondary">Total Comments: {totalDocuments}</Text>
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
            <div className="mt-6 flex justify-center">
              <Space>
                <Button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Text>
                  Page {page} of {Math.ceil(totalDocuments / limit)}
                </Text>
                <Button
                  disabled={page >= Math.ceil(totalDocuments / limit)}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </Space>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AskMeAnthing;
