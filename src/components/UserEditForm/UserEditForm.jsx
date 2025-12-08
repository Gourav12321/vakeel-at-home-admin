"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Select,
  Checkbox,
  TimePicker,
  Row,
  Col,
  Divider,
  Table,
  Tag,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";
import toast from "react-hot-toast";

const { Option } = Select;
const { TextArea } = Input;

const UserEditForm = ({
  userData,
  lawyerServices = [],
  onSave,
  onCancel,
  loading = false,
  userType = "user",
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});

  // Category options for lawyers/clerks
  const categoryOptions = [
    { label: "Criminal Law", value: "criminal_law" },
    { label: "Civil Law", value: "civil_law" },
    { label: "Family Law", value: "family_law" },
    { label: "Corporate Law", value: "corporate_law" },
    { label: "Property Law", value: "property_law" },
    { label: "Labor Law", value: "labor_law" },
    { label: "Tax Law", value: "tax_law" },
    { label: "Immigration Law", value: "immigration_law" },
    { label: "Consumer Law", value: "consumer_law" },
    { label: "Environmental Law", value: "environmental_law" },
  ];

  // Language options
  const languageOptions = [
    { label: "English", value: "english" },
    { label: "Hindi", value: "hindi" },
    { label: "Bengali", value: "bengali" },
    { label: "Telugu", value: "telugu" },
    { label: "Marathi", value: "marathi" },
    { label: "Tamil", value: "tamil" },
    { label: "Gujarati", value: "gujarati" },
    { label: "Urdu", value: "urdu" },
    { label: "Kannada", value: "kannada" },
    { label: "Odia", value: "odia" },
    { label: "Malayalam", value: "malayalam" },
    { label: "Punjabi", value: "punjabi" },
  ];

  useEffect(() => {
    if (userData) {
      const initialData = {
        // Basic Information
        fullName: userData.fullName || "",
        email: userData.email || "",
        mobileNumber: userData.mobileNumber || "",
        experience: userData.experience || 0,
        isProfileUpdated: userData.isProfileUpdated || false,
        description: userData.description || "",
        gender: userData.gender || "",

        // Professional Information
        category: userData.category || [],
        languages: userData.languages || [],

        // Business Information (mainly for lawyers)
        business_name: userData.business_name || "",
        address: userData.address || "",
        gps_address: userData.gps_address || "",
        open_time: userData.open_time
          ? moment(userData.open_time, "HH:mm")
          : null,
        closing_time: userData.closing_time
          ? moment(userData.closing_time, "HH:mm")
          : null,

        // Service Charges (mainly for lawyers)
        audio_call_charge: userData.audio_call_charge || 0,
        chat_charge: userData.chat_charge || 0,
        sos_charge: userData.sos_charge || 0,

        // Banking Information (mainly for lawyers)
        bank_name: userData.bank_name || "",
        account_no: userData.account_no || "",
        ifsc_code: userData.ifsc_code || "",
        account_holder_name: userData.account_holder_name || "",
        bank_branch: userData.bank_branch || "",

        // Referral Information
        my_referral_code: userData.my_referral_code || "",
        parent_refer_id: userData.parent_refer_id || "",
        referral_status: userData.referral_status || "",
      };
      setFormData(initialData);
      form.setFieldsValue(initialData);
    }
  }, [userData, form]);

  const handleFinish = (values) => {
    // Convert time values to string format
    const processedValues = {
      ...values,
      open_time: values.open_time ? values.open_time.format("HH:mm") : null,
      closing_time: values.closing_time
        ? values.closing_time.format("HH:mm")
        : null,
    };
    onSave(processedValues);
  };

  const handleValuesChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  return (
    <Card
      title={`Edit ${userType} Information`}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onCancel}>
            Back
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        initialValues={formData}
      >
        {/* Basic Information Section */}
        <Divider orientation="left">Basic Information</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: "Please input the full name!" },
                { min: 2, message: "Full name must be at least 2 characters!" },
              ]}
            >
              <Input
                placeholder="Enter full name"
                size="large"
                disabled={formData.isProfileUpdated}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input the email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter email address" size="large" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Mobile Number"
              name="mobileNumber"
              rules={[
                { required: true, message: "Please input the mobile number!" },
                {
                  message: "Please enter a valid 10-digit mobile number!",
                },
              ]}
            >
              <Input
                placeholder="Enter mobile number"
                size="large"
                maxLength={13}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Experience (Years)"
              name="experience"
              rules={[
                { required: true, message: "Please input the experience!" },
                {
                  type: "number",
                  min: 0,
                  max: 50,
                  message: "Experience must be between 0 and 50 years!",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter years of experience"
                size="large"
                style={{ width: "100%" }}
                min={0}
                max={50}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Gender" name="gender">
              <Select placeholder="Select gender" size="large" allowClear>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Profile Status"
              name="isProfileUpdated"
              rules={[
                { required: true, message: "Please select profile status!" },
              ]}
            >
              <Select placeholder="Select profile status" size="large">
                <Option value={true}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Updated</span>
                  </div>
                </Option>
                <Option value={false}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Not Updated</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Description" name="description">
              <TextArea rows={4} placeholder="Enter description" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Professional Information Section */}
        <Divider orientation="left">Professional Information</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Categories" name="category">
              <Select
                mode="multiple"
                placeholder="Select categories"
                size="large"
                options={categoryOptions}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Languages" name="languages">
              <Select
                mode="multiple"
                placeholder="Select languages"
                size="large"
                options={languageOptions}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Lawyer Services Section (Read-only) */}
        {userType.toLowerCase() === "lawyer" && lawyerServices.length > 0 && (
          <>
            <Divider orientation="left">Lawyer Services (Read Only)</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card
                  title="Associated Services"
                  size="small"
                  style={{ marginBottom: 16 }}
                >
                  <Table
                    dataSource={lawyerServices}
                    pagination={false}
                    size="small"
                    rowKey={(record) => record._id || record.id}
                    columns={[
                      {
                        title: "Service Name",
                        dataIndex: "category",
                        key: "category",
                        render: (text) => (
                          <Tag color="blue">{text || "N/A"}</Tag>
                        ),
                      },

                      {
                        title: "Price",
                        dataIndex: "offer_price",
                        key: "offer_price",
                        render: (price) => (price ? `₹${price}` : "N/A"),
                      },
                      {
                        title: "Status",
                        dataIndex: "isEnabled",
                        key: "isEnabled",
                        render: (status) => (
                          <Tag color={status === true ? "green" : "red"}>
                            {status.toString() || "Unknown"}
                          </Tag>
                        ),
                      },
                    ]}
                    locale={{
                      emptyText: "No services found for this lawyer",
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Business Information Section (Mainly for Lawyers) */}
        {userType.toLowerCase() === "lawyer" && (
          <>
            <Divider orientation="left">Business Information</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Business Name" name="business_name">
                  <Input placeholder="Enter business name" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Address" name="address">
                  <Input placeholder="Enter address" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Opening Time" name="open_time">
                  <TimePicker
                    format="HH:mm"
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Select opening time"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Closing Time" name="closing_time">
                  <TimePicker
                    format="HH:mm"
                    size="large"
                    style={{ width: "100%" }}
                    placeholder="Select closing time"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Banking Information Section */}
            <Divider orientation="left">Banking Information</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Bank Name" name="bank_name">
                  <Input placeholder="Enter bank name" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Account Number" name="account_no">
                  <Input placeholder="Enter account number" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="IFSC Code" name="ifsc_code">
                  <Input placeholder="Enter IFSC code" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Account Holder Name"
                  name="account_holder_name"
                >
                  <Input placeholder="Enter account holder name" size="large" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Bank Branch" name="bank_branch">
                  <Input placeholder="Enter bank branch" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Referral Information Section */}
        <Divider orientation="left">Referral Information</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="My Referral Code" name="my_referral_code">
              <Input placeholder="Enter referral code" size="large" disabled />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Parent Referral ID" name="parent_refer_id">
              <Input placeholder="Enter parent referral ID" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Save Changes
            </Button>
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserEditForm;
