"use client";

import toast from "react-hot-toast";
import usePostQuery from "@/hooks/postQuery.hook";
import Script from "next/script";

import { apiUrls } from "@/apis";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState, Fragment, useRef } from "react";
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
  const [msg91Token, setMsg91Token] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const responseCapturedRef = useRef(false);

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
      console.log("=== Send OTP Function Started ===");
      const values = await form.validateFields(["mobileNumber"]);
      const mobileNumberValue = values.mobileNumber;

      console.log("Mobile number validated:", mobileNumberValue);
      console.log("Form values:", values);

      setSendingOtp(true);
      setMobileNumber(mobileNumberValue);

      // Initialize MSG91 OTP widget
      if (!scriptLoaded) {
        console.error("MSG91 script not loaded yet");
        toast.error(
          "OTP service is loading. Please wait a moment and try again."
        );
        setSendingOtp(false);
        return;
      }

      console.log("MSG91 script loaded, proceeding with OTP send");

      if (typeof window !== "undefined" && window.initSendOTP) {
        const mobileWithPrefix = `+91${mobileNumberValue}`;
        console.log("Preparing MSG91 configuration for:", mobileWithPrefix);

        const configuration = {
          widgetId: "356b64693735303737333834",
          tokenAuth: "473471TDMg6G1MIkg6909cedeP1",
          identifier: mobileWithPrefix,
          exposeMethods: true,
          success: (data) => {
            // Store the message value as access-token
            console.log("=== MSG91 Success Callback Triggered ===");
            console.log("MSG91 success response", data);
            console.log("MSG91 response type:", typeof data);
            console.log(
              "MSG91 response keys:",
              data ? Object.keys(data) : "no data"
            );

            // Handle different response formats
            let messageValue = null;
            console.log("Attempting to extract message value from response...");

            if (data && data.message) {
              messageValue = data.message;
              console.log("Found message in data.message:", messageValue);
            } else if (typeof data === "string") {
              // Sometimes the response might be just the message string
              messageValue = data;
              console.log(
                "Response is string type, using as message:",
                messageValue
              );
            } else if (data && data.data && data.data.message) {
              messageValue = data.data.message;
              console.log("Found message in data.data.message:", messageValue);
            } else {
              console.warn("Could not find message in any expected location");
            }

            if (messageValue) {
              console.log("=== Setting MSG91 Token ===");
              console.log("Token value:", messageValue);
              setMsg91Token(messageValue);
              setOtpSent(true); // Show OTP section
              console.log("OTP sent state set to true");
              toast.success("OTP sent successfully");
              setSendingOtp(false);
              console.log("Send OTP loading state set to false");
            } else {
              console.error("=== MSG91: No message found in response ===");
              console.error(
                "Full response data:",
                JSON.stringify(data, null, 2)
              );
              toast.error("Failed to receive OTP token");
              setSendingOtp(false);
            }
          },
          failure: (error) => {
            console.log("=== MSG91 Failure Callback Triggered ===");
            console.log("MSG91 failure reason", error);
            console.log("MSG91 failure error type:", typeof error);
            console.log(
              "MSG91 failure error details:",
              JSON.stringify(error, null, 2)
            );
            toast.error("Failed to send OTP. Please try again.");
            setSendingOtp(false);
          },
        };

        console.log("=== Initializing MSG91 OTP Widget ===");
        console.log("Configuration:", JSON.stringify(configuration, null, 2));
        console.log("Calling window.initSendOTP() now...");

        // Reset the response captured flag
        responseCapturedRef.current = false;
        console.log("Response captured flag reset to false");

        // Intercept XMLHttpRequest to capture MSG91 response
        console.log(
          "Setting up XMLHttpRequest interception for MSG91 API calls"
        );
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
          this._url = url;
          if (
            url &&
            (url.includes("msg91") ||
              url.includes("verify.msg91") ||
              url.includes("sendOtp"))
          ) {
            console.log("Intercepted XHR open:", method, url);
          }
          return originalXHROpen.apply(this, [method, url, ...rest]);
        };

        XMLHttpRequest.prototype.send = function (...args) {
          this.addEventListener("load", function () {
            if (
              this._url &&
              (this._url.includes("msg91") ||
                this._url.includes("verify.msg91") ||
                this._url.includes("sendOtp"))
            ) {
              console.log("=== Intercepted MSG91 XHR Response ===");
              console.log("Response URL:", this._url);
              console.log("Response status:", this.status);
              try {
                const responseText = this.responseText;
                console.log("Raw response text:", responseText);
                if (responseText) {
                  const data = JSON.parse(responseText);
                  console.log("Parsed intercepted network response:", data);
                  if (
                    data &&
                    data.type === "success" &&
                    data.message &&
                    !responseCapturedRef.current
                  ) {
                    responseCapturedRef.current = true;
                    console.log(
                      "=== Successfully Intercepted MSG91 Response ==="
                    );
                    console.log("MSG91 token:", data.message);
                    setMsg91Token(data.message);
                    setOtpSent(true);
                    toast.success("OTP sent successfully");
                    setSendingOtp(false);

                    // Restore original XMLHttpRequest
                    XMLHttpRequest.prototype.open = originalXHROpen;
                    XMLHttpRequest.prototype.send = originalXHRSend;
                    console.log("Restored original XMLHttpRequest methods");
                  }
                }
              } catch (e) {
                console.error("Error parsing MSG91 XHR response:", e);
                console.error(
                  "Response text that failed to parse:",
                  this.responseText
                );
              }
            }
          });

          if (
            this._url &&
            (this._url.includes("msg91") ||
              this._url.includes("verify.msg91") ||
              this._url.includes("sendOtp"))
          ) {
            console.log("XHR send called for MSG91 URL:", this._url);
          }
          return originalXHRSend.apply(this, args);
        };

        // Also intercept fetch requests (in case MSG91 uses fetch)
        console.log("Setting up fetch interception for MSG91 API calls");
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
          if (
            args[0] &&
            typeof args[0] === "string" &&
            (args[0].includes("msg91") || args[0].includes("sendOtp"))
          ) {
            console.log("=== Intercepted MSG91 Fetch Request ===");
            console.log("Fetch URL:", args[0]);
            console.log("Fetch options:", args[1]);
          }

          const fetchPromise = originalFetch.apply(this, args);

          fetchPromise.then((response) => {
            if (
              args[0] &&
              typeof args[0] === "string" &&
              (args[0].includes("msg91") || args[0].includes("sendOtp"))
            ) {
              console.log("=== Intercepted MSG91 Fetch Response ===");
              console.log("Response status:", response.status);
              console.log("Response OK:", response.ok);
              response
                .clone()
                .json()
                .then((data) => {
                  console.log("Parsed intercepted fetch response:", data);
                  if (
                    data &&
                    data.type === "success" &&
                    data.message &&
                    !responseCapturedRef.current
                  ) {
                    responseCapturedRef.current = true;
                    console.log(
                      "=== Successfully Intercepted MSG91 Fetch Response ==="
                    );
                    console.log("MSG91 token:", data.message);
                    setMsg91Token(data.message);
                    setOtpSent(true);
                    toast.success("OTP sent successfully");
                    setSendingOtp(false);
                    window.fetch = originalFetch; // Restore original fetch
                    console.log("Restored original fetch method");
                  }
                })
                .catch((err) => {
                  console.error("Error parsing MSG91 fetch response:", err);
                });
            }
            return response;
          });

          return fetchPromise;
        };

        // Initialize MSG91 widget
        console.log("=== Calling window.initSendOTP() ===");
        window.initSendOTP(configuration);
        console.log("window.initSendOTP() called successfully");

        // Fallback: Show OTP section after 2 seconds if response isn't captured
        console.log("Setting up 2-second fallback timeout for OTP response");
        setTimeout(() => {
          console.log(
            "Fallback timeout triggered. Response captured:",
            responseCapturedRef.current
          );
          if (!responseCapturedRef.current) {
            console.log(
              "=== MSG91 response not captured - showing OTP section as fallback ==="
            );
            // Restore original methods
            XMLHttpRequest.prototype.open = originalXHROpen;
            XMLHttpRequest.prototype.send = originalXHRSend;
            window.fetch = originalFetch;
            console.log("Restored original network methods due to fallback");

            // Show OTP section anyway - assume OTP was sent
            setOtpSent(true);
            setSendingOtp(false);
            toast.success("OTP sent. Please enter the OTP you received.");
            console.log("OTP section shown via fallback mechanism");
          } else {
            console.log(
              "Response was captured successfully, no fallback needed"
            );
          }
        }, 2000);
      } else {
        console.error("=== window.initSendOTP is not available ===");
        console.error("Window object:", typeof window);
        console.error("window.initSendOTP type:", typeof window?.initSendOTP);
        toast.error("OTP service not available. Please refresh the page.");
        setSendingOtp(false);
      }
    } catch (error) {
      console.error("=== Error in handleSendOtp function ===");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Full error:", error);
      console.error("Validation failed:", error);
      setSendingOtp(false);
    }
    console.log("=== Send OTP Function Ended ===");
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
      accessToken: msg91Token,
    };

    // Use MSG91 token as access-token in authorization header
    postQuery({
      url: apiUrls.auth.login,
      postData: payload,
      headers: {
        "Content-Type": "application/json",
      },
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
    <Fragment>
      <Script
        src="https://verify.msg91.com/otp-provider.js"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />
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
    </Fragment>
  );
};

export default Login;
