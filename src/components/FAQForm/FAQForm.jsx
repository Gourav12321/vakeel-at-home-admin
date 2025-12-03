"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Modal, Form, Input, Button, Spin } from "antd";
import usePostQuery from "@/hooks/postQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import { apiUrls } from "@/apis";

const FAQForm = ({ visible, faq, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { postQuery, loading: createLoading } = usePostQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const isEditing = !!faq?._id;
  const isLoading = createLoading || updateLoading;

  // Set initial form values when faq changes
  useEffect(() => {
    if (visible && faq && form) {
      form.setFieldsValue({
        question: faq.question,
        answer: faq.answer,
      });
    } else if (visible && !faq && form) {
      form.resetFields();
    }
  }, [visible, faq, form]);

  const handleSubmit = async (values) => {
    const payload = {
      question: values.question,
      answer: values.answer,
    };

    if (isEditing) {
      // Update FAQ
      putQuery({
        url: `${apiUrls.faqs.updateFAQ.replace("/id", `/${faq._id}`)}`,
        putData: payload,
        onSuccess: (response) => {
          toast.success("FAQ updated successfully");
          form.resetFields();
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Update failed:", err);
          toast.error(err?.response?.data?.message || "Failed to update FAQ");
        },
      });
    } else {
      // Create new FAQ
      postQuery({
        url: apiUrls.faqs.createFAQ,
        postData: payload,
        onSuccess: (response) => {
          toast.success("FAQ created successfully");
          form.resetFields();
          onSuccess();
          onClose();
        },
        onFail: (err) => {
          console.log("Create failed:", err);
          toast.error(err?.response?.data?.message || "Failed to create FAQ");
        },
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit FAQ" : "Create FAQ"}
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
      width={700}
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="pt-4"
        >
          <Form.Item
            label="Question"
            name="question"
            rules={[
              { required: true, message: "Please enter FAQ question" },
              { min: 5, message: "Question must be at least 5 characters" },
              { max: 500, message: "Question must not exceed 500 characters" },
            ]}
          >
            <Input.TextArea
              placeholder="Enter FAQ question"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Answer"
            name="answer"
            rules={[
              { required: true, message: "Please enter FAQ answer" },
              { min: 10, message: "Answer must be at least 10 characters" },
              { max: 3000, message: "Answer must not exceed 3000 characters" },
            ]}
          >
            <Input.TextArea
              placeholder="Enter FAQ answer"
              rows={6}
              maxLength={3000}
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FAQForm;
