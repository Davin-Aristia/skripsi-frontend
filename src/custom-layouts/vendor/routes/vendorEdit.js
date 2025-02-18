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

export default function CreateVendorForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { id } = useParams();
  const [vendor, setVendor] = useState({
    company: "",
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
    accountName: "",
    accountNumber: "",
    accountBank: "",
    netTerm: null,
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`http://localhost:8080/vendors/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const vendor = response.data.response;
        setVendor({
          company: vendor.company,
          email: vendor.email,
          name: vendor.name,
          phoneNumber: vendor.phone_number,
          address: vendor.address,
          accountName: vendor.account_name,
          accountNumber: vendor.account_number,
          accountBank: vendor.account_bank,
          netTerm: vendor.net_term,
          createdAt: convertToLocalDate(vendor.created_at),
          updatedAt: convertToLocalDate(vendor.updated_at),
        });
      } catch (error) {
        console.error("Error fetching vendor:", error);
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
    console.log(parseInt(vendor.netTerm, 10));
    console.log(vendor.netTerm);

    try {
      const response = await axios.put(
        `http://localhost:8080/vendors/${id}`,
        {
          company: vendor.company,
          email: vendor.email,
          name: vendor.name,
          phone_number: vendor.phoneNumber,
          address: vendor.address,
          account_name: vendor.accountName,
          account_number: vendor.accountNumber,
          account_bank: vendor.accountBank,
          net_term: parseInt(vendor.netTerm, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success("success update new vendor");
      navigate("/vendor");
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
            Edit Vendor
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
            Create Date: {vendor.createdAt || "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit: {vendor.updatedAt || "-"}
          </MDTypography>
        </MDBox>
        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <h3 style={{ paddingBottom: "10px" }}>Vendor Information</h3>
            <Grid container spacing={0}>
              <Grid item xs={4}>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Company"
                    fullWidth
                    value={vendor.company}
                    required
                    onChange={(e) => setVendor({ ...vendor, company: e.target.value })}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Email"
                    fullWidth
                    value={vendor.email}
                    onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Name"
                    fullWidth
                    value={vendor.name}
                    onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Phone Number"
                    fullWidth
                    value={vendor.phoneNumber}
                    onChange={(e) => setVendor({ ...vendor, phoneNumber: e.target.value })}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={6}>
                <MDBox height="100%">
                  <MDInput
                    type="text"
                    label="Address"
                    fullWidth
                    multiline
                    rows={10}
                    value={vendor.address}
                    onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
                  />
                </MDBox>
              </Grid>
            </Grid>
            <h3 style={{ paddingBottom: "10px", paddingTop: "20px" }}>Payment Data</h3>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Account Name"
                fullWidth
                value={vendor.accountName}
                onChange={(e) => setVendor({ ...vendor, accountName: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Account Number"
                fullWidth
                value={vendor.accountNumber}
                onChange={(e) => setVendor({ ...vendor, accountNumber: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Bank Account"
                fullWidth
                value={vendor.accountBank}
                onChange={(e) => setVendor({ ...vendor, accountBank: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Net Term"
                fullWidth
                value={vendor.netTerm !== null ? String(vendor.netTerm) : ""}
                onChange={(e) => setVendor({ ...vendor, netTerm: e.target.value })}
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
