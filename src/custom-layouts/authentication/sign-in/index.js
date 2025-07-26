/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import axios from "axios";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import { toast } from "react-toastify";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";
import API from "custom-layouts/authentication/axiosConfig";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function Basic() {
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState(""); // returned from backend after verifying OTP
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSendOtp = async () => {
    // send email to backend
    try {
      await API.put("/users/send-otp", { email });
      setStep(2);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await API.put("/users/validate-otp", { email, otp });
      setToken(res.data.response.token); // save token from backend
      setStep(3);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await API.put(
        "/users/change-password",
        { token, password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStep(4);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
    }
    // redirect or show success
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the API
      const response = await API.post("/users/signin", {
        email,
        password,
      });
      localStorage.setItem("authToken", response.data.response.token);
      localStorage.setItem("email", response.data.response.email);
      const role = response.data.response.role;
      localStorage.setItem("role", role);

      // Clear the form fields after submission
      setEmail("");
      setPassword("");

      let path = "/sign-in"; // Default to sign-in if role is invalid

      if (role === "staff") {
        path = "/point-of-sales";
      } else if (role === "owner") {
        path = "/product";
      }

      // Optionally refetch data or update the state to reflect the new book in the UI
      navigate(path, {
        state: { message: response.data.message, severity: "success" },
      });
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
    }
  };

  return (
    <BasicLayout image={bgImage}>
      {/* <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar> */}
      <Card>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="info"
          mx={12}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            FlowTera
          </MDTypography>
          {/* <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid> */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleLogin}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                disabled={step !== 1 && step !== 4}
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              {/* <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                disabled={step !== 1 && step !== 4}
                required
                onChange={(e) => setPassword(e.target.value)}
              /> */}
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Password"
                fullWidth
                value={password}
                disabled={step !== 1 && step !== 4}
                required
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      <Icon>{showPassword ? "visibility_off" : "visibility"}</Icon>
                    </IconButton>
                  ),
                }}
              />
            </MDBox>
            {/* <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox> */}
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={step !== 1 && step !== 4}
              >
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={2} mb={0} textAlign="center">
              {/* <MDTypography variant="button" color="text">
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Forgot Password
                </MDTypography>
              </MDTypography> */}
              <MDBox>
                {step === 1 && (
                  <>
                    <MDTypography variant="button" color="text">
                      <MDTypography
                        sx={{ cursor: "pointer" }}
                        onClick={handleSendOtp}
                        variant="button"
                        color="info"
                        fontWeight="medium"
                        textGradient
                      >
                        Forgot Password
                      </MDTypography>
                    </MDTypography>
                  </>
                )}

                {step === 2 && (
                  <>
                    <MDInput
                      label="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                    <MDButton onClick={handleVerifyOtp} fullWidth color="info" sx={{ mt: 2 }}>
                      Verify OTP
                    </MDButton>
                    <MDButton variant="text" color="info" onClick={handleSendOtp} sx={{ mt: 1 }}>
                      Resend OTP
                    </MDButton>
                  </>
                )}

                {step === 3 && (
                  <>
                    <MDInput
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                    <MDInput
                      label="New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                    <MDButton onClick={handleResetPassword} fullWidth color="info" sx={{ mt: 2 }}>
                      Reset Password
                    </MDButton>
                  </>
                )}

                {step === 4 && (
                  <MDTypography variant="h6" color="success" textAlign="center" mt={2}>
                    Password successfully changed!
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
