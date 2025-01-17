// import { Link } from "react-router-dom";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
  Card,
  Icon,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

export default function CreateVendorForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialVendorState = {
    company: "",
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
    accountName: "",
    accountNumber: "",
    accountBank: "",
    netTerm: null,
  };

  const [vendor, setVendor] = useState(initialVendorState);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/vendors", vendor, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setVendor(initialVendorState);

      toast.success("success add new vendor");
      navigate("/vendor");
    } catch (error) {
      toast.error("failed add new vendor");
      setError(error.response.data.message);
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
            Add New Vendor
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
                type="text"
                label="Net Term"
                fullWidth
                value={vendor.netTerm}
                onChange={(e) => setVendor({ ...vendor, netTerm: e.target.value })}
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
