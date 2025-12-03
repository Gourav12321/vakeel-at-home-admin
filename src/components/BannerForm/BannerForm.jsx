"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Form, Input, Button, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import usePostQuery from "@/hooks/postQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import { apiUrls } from "@/apis";

const BannerForm = ({ visible, banner, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(banner?.imageLink || null);
  const { postQuery, loading: createLoading } = usePostQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const isEditing = !!banner?._id;
  const isLoading = imageLoading || createLoading || updateLoading;

  // Set initial form values when banner changes
  if (banner && form) {
    form.setFieldsValue({
      title: banner.title,
    });
  }

  const handleImageUpload = async (file) => {
    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG and JPG images are allowed");
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return false;
    }

    setImageFile(file);
    setImageLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      postQuery({
        url: apiUrls.upload.uploadDocument,
        postData: formData,
        onSuccess: (response) => {
          const uploadedImageUrl = response?.data?.url;
          if (uploadedImageUrl) {
            setImageUrl(uploadedImageUrl);
            toast.success("Image uploaded successfully");
          } else {
            toast.error("Failed to get image URL from response");
          }
        },
        onFail: (err) => {
          console.log("Image upload failed:", err);
          toast.error("Failed to upload image");
          setImageFile(null);
        },
      });
    } finally {
      setImageLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values) => {
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    const payload = {
      title: values.title,
      imageLink: imageUrl,
    };

    if (isEditing) {
      // Update banner
      putQuery({
        url: `${apiUrls.banners.updateBanner}/${banner._id}`,
        putData: payload,
        onSuccess: (response) => {
          toast.success("Banner updated successfully");
          form.resetFields();
          setImageFile(null);
          setImageUrl(null);
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Update failed:", err);
        },
      });
    } else {
      // Create new banner
      postQuery({
        url: apiUrls.banners.createBanner,
        postData: payload,
        onSuccess: (response) => {
          toast.success("Banner created successfully");
          form.resetFields();
          setImageFile(null);
          setImageUrl(null);
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Create failed:", err);
        },
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFile(null);
    setImageUrl(null);
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit Banner" : "Create Banner"}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={isLoading}
        >
          {isEditing ? "Update" : "Create"}
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={isLoading} tip={imageLoading ? "Uploading image..." : ""}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="pt-4"
        >
          <Form.Item
            label="Banner Title"
            name="title"
            rules={[
              { required: true, message: "Please enter banner title" },
              { min: 3, message: "Title must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter banner title" />
          </Form.Item>

          <Form.Item label="Banner Image">
            <div className="space-y-3">
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    className="w-full h-auto max-h-48 object-contain rounded-lg border"
                  />
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      setImageUrl(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
              {!imageUrl && (
                <Upload
                  accept="image/png,image/jpeg,image/jpg"
                  maxCount={1}
                  beforeUpload={handleImageUpload}
                  listType="picture"
                  disabled={isLoading}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Click to upload image (PNG, JPG only, max 5MB)
                  </Button>
                </Upload>
              )}
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default BannerForm;
