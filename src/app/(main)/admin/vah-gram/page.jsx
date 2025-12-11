"use client";

import moment from "moment";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import Loader from "@/components/Loader/Loader";

import {
  Card,
  Avatar,
  Button,
  Tag,
  Space,
  Typography,
  Dropdown,
  Modal,
  DatePicker,
  Input,
} from "antd";
import {
  UserOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
  MoreOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { apiUrls } from "@/apis";
import apiClient from "@/apis/apiClient";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import RestrictionModal from "@/components/RestrictionModal/RestrictionModal";

const { Text, Paragraph } = Typography;

// Confirmation Modal Component
const ConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  title,
  content,
  confirmText,
  loading,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={confirmText}
      cancelText="Cancel"
      confirmLoading={loading}
      width={500}
    >
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
            {content?.author || "N/A"}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: "14px", display: "block", marginTop: "4px" }}
          >
            {content?.email || "No email"}
          </Text>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Text
            strong
            style={{
              fontSize: "14px",
              color: "#4b5563",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {content?.isReply ? "Reply:" : "Post:"}
          </Text>
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ fontSize: "14px", lineHeight: "1.5" }}>
              {content?.text || "No content"}
            </Text>
          </div>
        </div>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {content?.isReply
            ? "This action will hide/show the selected reply."
            : "This action will hide/show the entire post and all its replies."}
        </Text>
      </div>
    </Modal>
  );
};

// Component to render nested replies
const ReplyComponent = ({
  reply,
  level = 0,
  parentCommentId,
  onShowModal,
  resolveAuthor,
}) => {
  const isHidden = reply.hide;
  const maxLevel = 3; // Maximum nesting level to prevent infinite recursion
  const { putQuery, loading: hideLoading } = usePutQuery();

  if (level > maxLevel) {
    return null;
  }

  // resolve author object early so avatar, restriction and menu use the same data
  const resolvedAuthor = resolveAuthor
    ? resolveAuthor(reply.author)
    : reply.author && typeof reply.author === "object"
    ? reply.author
    : null;

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, currentHideStatus) => { ... };
  // const handleModalConfirm = () => { ... };

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
          width: "100%",
          maxWidth: "100%",
        }}
        styles={{
          body: { padding: "12px 16px" },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Avatar
            size="default"
            src={resolvedAuthor?.profilePic}
            icon={!resolvedAuthor?.profilePic ? <UserOutlined /> : null}
            style={{
              flexShrink: 0,
              backgroundColor: "#dbeafe",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>
                {resolvedAuthor
                  ? resolvedAuthor.fullName
                  : reply.author && typeof reply.author === "string"
                  ? reply.author
                  : "Unknown User"}
              </Text>

              {resolvedAuthor &&
                resolvedAuthor.restrictions &&
                resolvedAuthor.restrictions.length > 0 &&
                resolvedAuthor.restrictions[0].active && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Tag color="orange" size="small">
                      Restricted
                    </Tag>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {resolvedAuthor.restrictions[0].reason || "No reason"} •{" "}
                      {resolvedAuthor.restrictions[0].start
                        ? moment(resolvedAuthor.restrictions[0].start).format(
                            "MMM DD, h:mm A"
                          )
                        : ""}{" "}
                      -{" "}
                      {resolvedAuthor.restrictions[0].end
                        ? moment(resolvedAuthor.restrictions[0].end).format(
                            "MMM DD, h:mm A"
                          )
                        : ""}
                    </Text>
                  </div>
                )}

              <Text type="secondary" style={{ fontSize: "12px" }}>
                {reply.createdAt
                  ? moment(reply.createdAt).format("MMM DD, h:mm A")
                  : "No date"}
              </Text>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isHidden && (
                  <Tag color="red" size="small">
                    Hidden
                  </Tag>
                )}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "hide",
                        label: isHidden ? "Show" : "Hide",
                        icon: isHidden ? (
                          <EyeOutlined />
                        ) : (
                          <EyeInvisibleOutlined />
                        ),
                        onClick: () => {
                          console.log("Dropdown clicked for reply:", reply._id);
                          onShowModal &&
                            onShowModal({
                              type: "reply",
                              id: reply._id,
                              author:
                                reply.author && typeof reply.author === "object"
                                  ? reply.author.fullName
                                  : "Unknown User",
                              email:
                                reply.author && typeof reply.author === "object"
                                  ? reply.author.email
                                  : "No email",
                              text: reply.text || "No comment",
                              isHidden: isHidden,
                              parentCommentId: parentCommentId,
                              userId:
                                reply.author && typeof reply.author === "object"
                                  ? reply.author._id
                                  : reply.author,
                            });
                        },
                      },

                      (function () {
                        const restrictionObj =
                          resolvedAuthor &&
                          (resolvedAuthor.restriction ||
                            (Array.isArray(resolvedAuthor.restrictions) &&
                            resolvedAuthor.restrictions.length > 0
                              ? resolvedAuthor.restrictions[0]
                              : null));
                        const isRestricted = !!(
                          restrictionObj && restrictionObj.active
                        );
                        return {
                          key: "restrict",
                          label: isRestricted
                            ? "Unrestrict User"
                            : "Restrict User",
                          icon: <LockOutlined />,
                          onClick: async () => {
                            if (isRestricted) {
                              const restrictionId =
                                restrictionObj?._id ||
                                restrictionObj?.id ||
                                null;
                              const userId =
                                resolvedAuthor?._id ||
                                resolvedAuthor?.id ||
                                (reply.author &&
                                typeof reply.author === "string"
                                  ? reply.author
                                  : null);

                              if (!userId || !restrictionId) {
                                toast.error(
                                  "Unable to unrestrict: missing restriction id for user"
                                );
                                return;
                              }

                              try {
                                await apiClient.delete(
                                  `/restrictions/${userId}/${restrictionId}`
                                );
                                toast.success("User unrestricted");
                                window.dispatchEvent(
                                  new Event("vahgram:refresh")
                                );
                              } catch (err) {
                                console.error(err);
                                toast.error("Failed to unrestrict user");
                              }
                            } else {
                              onShowModal &&
                                onShowModal({
                                  type: "restrict",
                                  id: reply._id,
                                  author: resolvedAuthor
                                    ? resolvedAuthor.fullName
                                    : "Unknown User",
                                  email: resolvedAuthor
                                    ? resolvedAuthor.email
                                    : "No email",
                                  text: reply.text || "No comment",
                                  parentCommentId: parentCommentId,
                                  userId: resolvedAuthor
                                    ? resolvedAuthor._id
                                    : reply.author,
                                });
                            }
                          },
                        };
                      })(),
                    ],
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    loading={hideLoading}
                    style={{ padding: "4px" }}
                    onClick={(e) => {
                      console.log("Button clicked for reply:", reply._id);
                      e.stopPropagation();
                    }}
                  />
                </Dropdown>
              </div>
            </div>
            <Paragraph
              style={{
                marginBottom: "8px",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              {reply.text || "No comment"}
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
              parentCommentId={parentCommentId}
              onShowModal={onShowModal}
              resolveAuthor={resolveAuthor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Component to render main post
const PostCard = ({ post, onShowModal, resolveAuthor }) => {
  const { putQuery, loading: hideLoading } = usePutQuery();

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, currentHideStatus) => { ... };
  // const handleMainPostHideToggle = (commentId, currentHideStatus) => { ... };
  // const handleMainPostModalConfirm = () => { ... };

  const isMainPostHidden = post.hide;

  return (
    <Card
      style={{
        marginTop: "32px",
        marginBottom: "32px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "none",
        width: "100%",
        maxWidth: "100%",
        opacity: isMainPostHidden ? 0.6 : 1,
        backgroundColor: isMainPostHidden ? "#f9fafb" : "#ffffff",
      }}
      styles={{
        body: { padding: "20px" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <Avatar
          size="large"
          src={post.author?.profilePic}
          icon={<UserOutlined />}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            {(() => {
              const authorObj = resolveAuthor
                ? resolveAuthor(post.author)
                : post.author && typeof post.author === "object"
                ? post.author
                : null;
              const name = authorObj
                ? authorObj.fullName
                : post.author && typeof post.author === "string"
                ? post.author
                : "Unknown User";
              const email = authorObj
                ? authorObj.email
                : post.author?.email || "No email";

              // prefer singular `restriction`, fallback to first element of `restrictions` array
              const restriction =
                authorObj &&
                (authorObj.restriction ||
                  (Array.isArray(authorObj.restrictions) &&
                  authorObj.restrictions.length > 0
                    ? authorObj.restrictions[0]
                    : null));

              return (
                <>
                  <Text strong style={{ fontSize: "18px", color: "#1f2937" }}>
                    {name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {email}
                  </Text>

                  {restriction && restriction.active && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginLeft: 8,
                      }}
                    >
                      <Tag color="orange" size="small">
                        Restricted
                      </Tag>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {restriction.reason || "No reason"} •{" "}
                        {restriction.start
                          ? moment(restriction.start).format("MMM DD, h:mm A")
                          : ""}{" "}
                        -{" "}
                        {restriction.end
                          ? moment(restriction.end).format("MMM DD, h:mm A")
                          : ""}
                      </Text>
                    </div>
                  )}
                </>
              );
            })()}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isMainPostHidden && (
                <Tag color="red" size="small">
                  Hidden
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {post.createdAt
                  ? moment(post.createdAt).format("MMM DD, YYYY h:mm A")
                  : "No date"}
              </Text>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "hide",
                      label: isMainPostHidden ? "Show" : "Hide",
                      icon: isMainPostHidden ? (
                        <EyeOutlined />
                      ) : (
                        <EyeInvisibleOutlined />
                      ),
                      onClick: () => {
                        console.log(
                          "Dropdown clicked for main post:",
                          post._id
                        );
                        const authorObj = resolveAuthor
                          ? resolveAuthor(post.author)
                          : post.author && typeof post.author === "object"
                          ? post.author
                          : null;
                        onShowModal &&
                          onShowModal({
                            type: "mainPost",
                            id: post._id,
                            author: authorObj
                              ? authorObj.fullName
                              : post.author?.fullName || "Unknown User",
                            email: authorObj
                              ? authorObj.email
                              : post.author?.email || "No email",
                            text: post.description || "No content",
                            title: post.title || "No title",
                            isHidden: isMainPostHidden,
                            userId: authorObj
                              ? authorObj._id || authorObj.id
                              : post.author && typeof post.author === "object"
                              ? post.author._id
                              : post.author,
                          });
                      },
                    },

                    (function () {
                      const authorObj = resolveAuthor
                        ? resolveAuthor(post.author)
                        : post.author && typeof post.author === "object"
                        ? post.author
                        : null;
                      const restrictionObj =
                        authorObj &&
                        (authorObj.restriction ||
                          (Array.isArray(authorObj.restrictions) &&
                          authorObj.restrictions.length > 0
                            ? authorObj.restrictions[0]
                            : null));
                      const isRestricted = !!(
                        restrictionObj && restrictionObj.active
                      );
                      return {
                        key: "restrict",
                        label: isRestricted
                          ? "Unrestrict User"
                          : "Restrict User",
                        icon: <LockOutlined />,
                        onClick: async () => {
                          if (isRestricted) {
                            const restrictionId =
                              restrictionObj?._id || restrictionObj?.id || null;
                            const userId =
                              authorObj?._id ||
                              authorObj?.id ||
                              (post.author && typeof post.author === "string"
                                ? post.author
                                : null);

                            if (!userId || !restrictionId) {
                              toast.error(
                                "Unable to unrestrict: missing restriction id for user"
                              );
                              return;
                            }

                            try {
                              await apiClient.delete(
                                `/restrictions/${userId}/${restrictionId}`
                              );
                              toast.success("User unrestricted");
                              window.dispatchEvent(
                                new Event("vahgram:refresh")
                              );
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to unrestrict user");
                            }
                          } else {
                            onShowModal &&
                              onShowModal({
                                type: "restrict",
                                id: post._id,
                                author: authorObj
                                  ? authorObj.fullName
                                  : post.author?.fullName || "Unknown User",
                                email: authorObj
                                  ? authorObj.email
                                  : post.author?.email || "No email",
                                text: post.description || "No content",
                                title: post.title || "No title",
                                userId: authorObj
                                  ? authorObj._id || authorObj.id
                                  : post.author &&
                                    typeof post.author === "object"
                                  ? post.author._id
                                  : post.author,
                              });
                          }
                        },
                      };
                    })(),
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  loading={hideLoading}
                  style={{ padding: "4px" }}
                  onClick={(e) => {
                    console.log("Button clicked for main post:", post._id);
                    e.stopPropagation();
                  }}
                />
              </Dropdown>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            {post.isRepost && post.originalPost && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Reposted from{" "}
                  {post.originalPost.author?.fullName || "Unknown User"}
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "8px",
                    color: "#111827",
                  }}
                >
                  {post.originalPost.description || "No content"}
                </Text>
                {post.repostComment && (
                  <Text style={{ fontSize: "14px", color: "#374151" }}>
                    "{post.repostComment}"
                  </Text>
                )}
              </div>
            )}
            {!post.isRepost && (
              <>
                <Text
                  strong
                  style={{
                    fontSize: "20px",
                    display: "block",
                    marginBottom: "12px",
                    color: "#111827",
                  }}
                >
                  {post.description || "No content"}
                </Text>
              </>
            )}
          </div>

          {((post.comments && post.comments.length > 0) ||
            (post.isRepost &&
              post.originalPost &&
              post.originalPost.comments &&
              post.originalPost.comments.length > 0)) && (
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
                {post.isRepost
                  ? post.originalPost.comments.length
                  : post.comments.length}{" "}
                {(post.isRepost
                  ? post.originalPost.comments.length
                  : post.comments.length) === 1
                  ? "Comment"
                  : "Comments"}
              </Text>
              {(post.isRepost ? post.originalPost.comments : post.comments).map(
                (comment, index) => (
                  <ReplyComponent
                    key={comment._id || index}
                    reply={comment}
                    level={0}
                    parentCommentId={
                      post.isRepost ? post.originalPost._id : post._id
                    }
                    onShowModal={onShowModal}
                    resolveAuthor={resolveAuthor}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const VahGram = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { putQuery } = usePutQuery();

  const [postsData, setPostsData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [authorMap, setAuthorMap] = useState({});
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Note: These functions are no longer needed since we refresh data from server
  // const handleHideToggle = (replyId, newHideStatus) => { ... };
  // const handleMainPostHideToggle = (commentId, newHideStatus) => { ... };

  const handleShowModal = (data) => {
    setModalData(data);
  };

  const handleModalCancel = () => {
    setModalData(null);
    setModalLoading(false);
  };

  const handleModalConfirm = () => {
    if (!modalData) return;

    setModalLoading(true);

    if (modalData.type === "mainPost") {
      // Call API directly for main post
      const url = `/posts/${modalData.id}/hide`;
      putQuery({
        url: url,
        onSuccess: (response) => {
          console.log("Main post hide toggle success:", response);
          // Refresh the data after successful toggle
          fetchData();
          setModalData(null);
          setModalLoading(false);
        },
        onFail: (error) => {
          console.error("Failed to toggle main post hide status:", error);
          setModalData(null);
          setModalLoading(false);
        },
      });
    } else if (modalData.type === "reply") {
      // Call API directly for reply
      const url = `/posts/${modalData.parentCommentId}/hide/${modalData.id}`;
      putQuery({
        url: url,
        onSuccess: (response) => {
          console.log("Reply hide toggle success:", response);
          // Refresh the data after successful toggle
          fetchData();
          setModalData(null);
          setModalLoading(false);
        },
        onFail: (error) => {
          console.error("Failed to toggle reply hide status:", error);
          setModalData(null);
          setModalLoading(false);
        },
      });
    }
  };

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5; // Fixed to 5 posts per page

  const fetchData = () => {
    getQuery({
      url: `${apiUrls?.vahGram?.getComments}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.posts)
          ? response?.data?.posts
          : [];
        setTotalDocuments(response.data.total);

        console.log("posts list", dataList);
        setPostsData(dataList);

        // build an author map to allow resolving author objects by id
        const map = {};
        const collectAuthorsFromComment = (comment) => {
          if (
            comment &&
            comment.author &&
            typeof comment.author === "object" &&
            comment.author._id
          ) {
            map[comment.author._id] = comment.author;
          }
          if (comment && comment.replies && Array.isArray(comment.replies)) {
            comment.replies.forEach((r) => collectAuthorsFromComment(r));
          }
        };

        dataList.forEach((post) => {
          if (
            post.author &&
            typeof post.author === "object" &&
            post.author._id
          ) {
            map[post.author._id] = post.author;
          }
          if (
            post.isRepost &&
            post.originalPost &&
            post.originalPost.author &&
            typeof post.originalPost.author === "object" &&
            post.originalPost.author._id
          ) {
            map[post.originalPost.author._id] = post.originalPost.author;
          }
          const comments =
            post.isRepost && post.originalPost
              ? post.originalPost.comments
              : post.comments;
          if (comments && Array.isArray(comments)) {
            comments.forEach((c) => collectAuthorsFromComment(c));
          }
        });

        setAuthorMap(map);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  };

  // helper to resolve author: either object passed or lookup by id
  const resolveAuthor = (author) => {
    if (!author) return null;
    if (typeof author === "object") return author;
    if (typeof author === "string") return authorMap[author] || { _id: author };
    return null;
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  // listen for refresh events triggered after unrestrict
  useEffect(() => {
    const onRefresh = () => fetchData();
    window.addEventListener("vahgram:refresh", onRefresh);
    return () => window.removeEventListener("vahgram:refresh", onRefresh);
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
      <Title title={"VAH GRAM COMMENTS"} />

      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Total Posts: {totalDocuments}
          </Text>
          <Text type="secondary" style={{ fontSize: "14px", display: "block" }}>
            Showing {Math.min((page - 1) * limit + 1, totalDocuments)}-
            {Math.min(page * limit, totalDocuments)} of {totalDocuments} posts
          </Text>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
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
        <div style={{ paddingTop: "16px", width: "100%", maxWidth: "100%" }}>
          {postsData.length > 0 ? (
            <div style={{ width: "100%" }}>
              {postsData.map((post, index) => (
                <PostCard
                  key={post._id || index}
                  post={post}
                  onShowModal={handleShowModal}
                  resolveAuthor={resolveAuthor}
                />
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
                <Text type="secondary">No posts found</Text>
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
                width: "100%",
              }}
            >
              <Card
                style={{
                  boxShadow:
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  width: "100%",
                  maxWidth: "600px",
                }}
              >
                <Space
                  size="large"
                  style={{
                    padding: "8px 16px",
                    width: "100%",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<LeftOutlined />}
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "100px",
                    }}
                  >
                    Previous
                  </Button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Text strong style={{ color: "#374151" }}>
                      Page {page} of {Math.ceil(totalDocuments / limit)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      ({totalDocuments} total posts)
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
                      minWidth: "100px",
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={!!modalData}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        title={
          modalData
            ? `${modalData.isHidden ? "Show" : "Hide"} ${
                modalData.type === "mainPost" ? "Post" : "Reply"
              }`
            : ""
        }
        content={
          modalData
            ? {
                author: modalData.author,
                email: modalData.email,
                text: modalData.text,
                isReply: modalData.type === "reply",
              }
            : null
        }
        confirmText={modalData ? `${modalData.isHidden ? "Show" : "Hide"}` : ""}
        loading={modalLoading}
      />

      {/* Restriction Modal */}
      <RestrictionModal
        visible={!!modalData && modalData.type === "restrict"}
        onCancel={handleModalCancel}
        userId={modalData ? modalData.userId : null}
        authorName={modalData ? modalData.author : null}
        onSuccess={(res) => {
          // Refresh data and close modal on success
          fetchData();
          setModalData(null);
        }}
      />
    </>
  );
};

export default VahGram;
