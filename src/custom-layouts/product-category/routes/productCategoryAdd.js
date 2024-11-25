// import { Link } from "react-router-dom";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

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
import DataTable from "examples/Tables/DataTable";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

export default function CreateProductCategoryForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Create a new product category object
    const newProductCategory = {
      name,
      description,
    };

    try {
      // Send POST request to the API
      const response = await axios.post(
        "http://localhost:8080/product-categories",
        newProductCategory,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Clear the form fields after submission
      setName("");
      setDescription("");

      // Optionally refetch data or update the state to reflect the new book in the UI
      navigate("/product-category", {
        state: { message: response.data.message, severity: "success" },
      });
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    // setFromDate(null);
    // setToDate(null);
  };

  const columns = [
    { Header: "specifications", accessor: "specifications", align: "left" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const rows = [
    {
      specifications: "Processor",
      action: (
        <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
          <MDButton
            variant="text"
            color="error"
            iconOnly
            // onClick={() => deleteProductCategory(productCategory.id)}
          >
            <Icon>delete</Icon>
          </MDButton>
        </MDBox>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={handleCloseWizard}
        PaperProps={{
          sx: { width: "30%", maxWidth: "none" },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Add New Specifications</span>
            <IconButton aria-label="close" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => Name(e.target.value)}
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          {/* <Button onClick={handleExport}>Create</Button> */}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

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
            Create New Product Category
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </MDBox>
            <DataTable table={{ columns, rows }} isSorted={false} showTotalEntries={false} />
            <Button variant="contained" onClick={handleOpenWizard} sx={{ color: "white" }}>
              + Create
            </Button>
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
