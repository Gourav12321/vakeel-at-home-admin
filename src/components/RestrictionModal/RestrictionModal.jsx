"use client";

import { useEffect } from "react";
import { Modal, Form, DatePicker, Input, Button } from "antd";
import moment from "moment";
import usePostQuery from "@/hooks/postQuery.hook";
import { apiUrls } from "@/apis";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;

const RestrictionModal = ({
  visible,
  onCancel,
  userId,
  authorName,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { range, reason } = values;

      if (!range || range.length !== 2) {
        toast.error("Please select start and end dates");
        return;
      }

      const startAt = moment(range[0]).startOf("day").toISOString();
      const endAt = moment(range[1]).endOf("day").toISOString();

      if (moment(endAt).isBefore(startAt)) {
        toast.error("End date must be after start date");
        return;
      }

      if (!userId) {
        toast.error("Invalid user selected");
        return;
      }

      const url = `${apiUrls.vahGram.restrictUser}/${userId}`;

      postQuery({
        url,
        postData: {
          startAt,
          endAt,
          reason,
        },
        onSuccess: (res) => {
          toast.success("User restricted successfully");
          onSuccess && onSuccess(res);
        },
        onFail: () => {},
      });
    } catch (err) {
      // validation errors are handled by antd form
    }
  };

  return (
    <Modal
      title={`Restrict ${authorName || "User"} from posting`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={560}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="Restriction Period"
          name="range"
          rules={[{ required: true, message: "Please select date range" }]}
        >
          <RangePicker showTime={false} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: "Please provide a reason" }]}
        >
          <Input.TextArea rows={4} placeholder="Enter reason for restriction" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              Restrict
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RestrictionModal;
