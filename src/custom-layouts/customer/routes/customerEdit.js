// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id } = useParams();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`http://localhost:8080/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const customer = response.data.response;
        setCustomer({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          createdAt: convertToLocalDate(customer.created_at),
          updatedAt: convertToLocalDate(customer.updated_at),
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    })();
  }, [id]);

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`http://localhost:8080/customers/${id}`, customer, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      toast.success("success update new customer");
      navigate("/customer");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
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
            Edit Customer
          </MDTypography>
        </MDBox>

        <MDBox
          sx={{
            position: "absolute",
            top: 15, // Adjust the top spacing
            right: 10, // Align to the right
          }}
        >
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Create Date: {customer.createdAt || "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit: {customer.updatedAt || "-"}
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
                edit
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
