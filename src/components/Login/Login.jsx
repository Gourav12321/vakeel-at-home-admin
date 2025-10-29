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
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

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

  const handleSendOtp = async () => {
    try {
      const values = await form.validateFields(["mobileNumber"]);
      const mobileNumberValue = values.mobileNumber;

      setSendingOtp(true);
      postQuery({
        url: apiUrls.auth.getOtp,
        postData: { mobileNumber: `+91${mobileNumberValue}` },
        onSuccess: (res) => {
          setOtpSent(true);
          setMobileNumber(mobileNumberValue);
          toast.success("OTP sent successfully");
          setSendingOtp(false);
        },
        onFail: (err) => {
          console.error("Send OTP failed:", err);
          setSendingOtp(false);
        },
      });
    } catch (error) {
      console.error("Validation failed:", error);
      setSendingOtp(false);
    }
  };

  const handleLogin = (values) => {
    if (!coords.latitude || !coords.longitude) {
      toast.error("Unable to get your location. Please enable GPS.");
      return;
    }

    // Add +91 prefix to mobile number
    const mobileNumberWithPrefix = `+91${mobileNumber || values.mobileNumber}`;

    const payload = {
      mobileNumber: mobileNumberWithPrefix,
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
            color: "#1E3A5F",
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
              disabled={otpSent}
              onChange={(e) => {
                const value = e.target.value;
                setMobileNumber(value);
              }}
            />
          </Form.Item>

          {!otpSent && (
            <Form.Item>
              <Button
                type="primary"
                size="large"
                loading={sendingOtp}
                block
                className="simple-button"
                onClick={handleSendOtp}
                style={{
                  borderRadius: 20,
                }}
                disabled={!mobileNumber || mobileNumber.length !== 10}
              >
                Send OTP
              </Button>
            </Form.Item>
          )}

          {otpSent && (
            <>
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
                  placeholder="Enter 6-digit OTP"
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
                  className="simple-button"
                  style={{
                    borderRadius: 20,
                  }}
                >
                  Log In
                </Button>
              </Form.Item>
            </>
          )}
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
