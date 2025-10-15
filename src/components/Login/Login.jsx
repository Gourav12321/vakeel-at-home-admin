"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";

import { apiUrls } from "@/apis";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setUser } from "@/helpers/slices/userSlice";
import { setAuthTokens, setUserData } from "@/utils/storage";
import { Form, Input, Button, Typography } from "antd";
import { LockOutlined, PhoneOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  // Get live coordinates once when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Location access denied:", err);
          toast.error("Location access denied. Please enable location.");
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser.");
    }
  }, []);

  const handleLogin = (values) => {
    if (!coords.latitude || !coords.longitude) {
      toast.error("Unable to get your location. Please enable GPS.");
      return;
    }

    // Validate OTP - only 123456 is allowed
    if (values.otp !== "123456") {
      toast.error("Invalid OTP. Please enter the correct OTP.");
      return;
    }

    // Add +91 prefix to mobile number
    const mobileNumber = `+91${values.mobileNumber}`;

    const payload = {
      mobileNumber,
      otp: values.otp,
      role: "admin",
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    postQuery({
      url: apiUrls.auth.login,
      postData: payload,
      onSuccess: (res) => {
        const { token } = res.user;

        dispatch(
          setUser({
            user: res.user,
            tokens: { accessToken: token },
          })
        );

        setAuthTokens({ accessToken: token });
        setUserData(res.user);

        if (res.isNewUser) {
          toast.success(
            res.message ||
              "Registration successful! Please update your profile."
          );
        } else {
          toast.success("Login successful");
        }

        router.push("/admin/dashboard");
      },
      onFail: (err) => {
        console.error("Login failed:", err);
        toast.error("Login failed. Please try again.");
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: 400,
          padding: 32,
          borderRadius: 16,
          backgroundColor: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            color: "#366598",
            marginBottom: 24,
          }}
        >
          Admin Login
        </Title>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Mobile Number"
            name="mobileNumber"
            rules={[
              { required: true, message: "Please enter your mobile number" },
              {
                pattern: /^[6-9]\d{9}$/,
                message: "Please enter a valid 10-digit mobile number",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              size="large"
              placeholder="9699554545"
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            label="OTP"
            name="otp"
            rules={[
              { required: true, message: "Please enter the OTP" },
              { len: 6, message: "OTP must be 6 digits" },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              size="large"
              placeholder="123456"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                borderRadius: 20,
                background: "#366598",
              }}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Login automatically uses your live location
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
