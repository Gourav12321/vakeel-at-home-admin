"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Modal, Form, Input, Button, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import usePostQuery from "@/hooks/postQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import { apiUrls } from "@/apis";

const CategoryForm = ({ visible, category, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [iconFile, setIconFile] = useState(null);
  const [iconLoading, setIconLoading] = useState(false);
  const [iconUrl, setIconUrl] = useState(null);
  const { postQuery, loading: createLoading } = usePostQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const isEditing = !!category?._id;
  const isLoading = iconLoading || createLoading || updateLoading;

  // Set initial form values and icon when category changes
  useEffect(() => {
    if (visible && category) {
      form.setFieldsValue({
        category: category.category,
      });
      setIconUrl(category?.icon || null);
    } else if (visible && !category) {
      form.resetFields();
      setIconUrl(null);
      setIconFile(null);
    }
  }, [visible, category, form]);

  const handleIconUpload = async (file) => {
    console.log("handleIconUpload called with:", file);

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG images are allowed");
      return false;
    }

    // Validate file size (max 2MB for icons)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Icon size must be less than 2MB");
      return false;
    }

    setIconFile(file);
    setIconLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("FormData contents:");
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size);
      console.log("FormData entries:", Array.from(formData.entries()));

      postQuery({
        url: apiUrls.upload.uploadDocument,
        postData: formData,
        onSuccess: (response) => {
          console.log("Upload response:", response);
          const uploadedIconUrl = response?.data?.url;
          if (uploadedIconUrl) {
            setIconUrl(uploadedIconUrl);
            toast.success("Icon uploaded successfully");
          } else {
            toast.error("Failed to get icon URL from response");
          }
        },
        onFail: (err) => {
          console.log("Icon upload failed:", err);
          toast.error("Failed to upload icon");
          setIconFile(null);
        },
      });
    } finally {
      setIconLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values) => {
    if (!iconUrl) {
      toast.error("Please upload a category icon");
      return;
    }

    const payload = {
      category: values.category,
      icon: iconUrl,
    };

    if (isEditing) {
      // Update existing category
      putQuery({
        url: `${apiUrls.categories.updateCategory}/${category._id}`,
        putData: payload,
        onSuccess: (response) => {
          toast.success("Category updated successfully");
          form.resetFields();
          setIconFile(null);
          setIconUrl(null);
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Update failed:", err);
          toast.error(
            err?.response?.data?.message || "Failed to update category"
          );
        },
      });
    } else {
      // Create new category
      postQuery({
        url: apiUrls.categories.createCategory,
        postData: payload,
        onSuccess: (response) => {
          toast.success("Category created successfully");
          form.resetFields();
          setIconFile(null);
          setIconUrl(null);
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Create failed:", err);
          toast.error(
            err?.response?.data?.message || "Failed to create category"
          );
        },
      });
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Category" : "Create Category"}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Spin spinning={isLoading} tip={iconLoading ? "Uploading icon..." : ""}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
        >
          <Form.Item
            name="category"
            label="Category Name"
            rules={[
              {
                required: true,
                message: "Please enter category name",
              },
              {
                min: 2,
                message: "Category name must be at least 2 characters",
              },
            ]}
          >
            <Input
              placeholder="e.g., Family Law, Criminal Law"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item label="Category Icon">
            <div className="space-y-3">
              {iconUrl && (
                <div className="relative">
                  <img
                    src={iconUrl}
                    alt="Icon preview"
                    className="w-24 h-24 object-contain rounded-lg border"
                  />
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      setIconUrl(null);
                      setIconFile(null);
                    }}
                    className="absolute top-0 right-0"
                  >
                    Remove
                  </Button>
                </div>
              )}
              {!iconUrl && (
                <Upload
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  maxCount={1}
                  beforeUpload={handleIconUpload}
                  customRequest={() => {
                    // Prevent Upload component's default request
                    // We handle the upload in beforeUpload
                  }}
                  listType="picture"
                  disabled={isLoading}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} disabled={isLoading}>
                    Upload Icon
                  </Button>
                </Upload>
              )}
            </div>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-3">
              <Button
                type="default"
                size="large"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CategoryForm;
