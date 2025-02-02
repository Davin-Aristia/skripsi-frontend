// import { Link } from "react-router-dom";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import { Card } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Grid from "@mui/material/Grid";

export default function CreateCustomerForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialCustomerState = {
    name: "",
    email: "",
    phone: "",
  };

  const [customer, setCustomer] = useState(initialCustomerState);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/customers", customer, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setCustomer(initialCustomerState);

      toast.success("success add new customer");
      navigate("/customer");
    } catch (error) {
      toast.error("failed add new customer");
      console.log(error.response.data.message);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Card sx={{ mt: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx="auto"
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          width="30%"
        >
          <MDTypography variant="h5" fontWeight="medium" color="white" mt={1}>
            Add New Customer
          </MDTypography>
        </MDBox>
        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <h3 style={{ paddingBottom: "10px" }}>Customer Information</h3>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={customer.name}
                required
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Email"
                fullWidth
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Phone"
                fullWidth
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                create
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
