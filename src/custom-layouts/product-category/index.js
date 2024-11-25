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

import React, { useState, useEffect } from "react";

// @mui material components
// import Grid from "@mui/material/Grid";
// import Card from "@mui/material/Card";
// import Icon from "@mui/material/Icon";
// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";
import { Grid, Card, Icon, Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { NavLink } from "react-router-dom";

// Data
import AuthorsTableData from "custom-layouts/product-category/data/authorsTableData";

function ProductCategories() {
  const [alert, setAlert] = useState({ open: false, severity: null, message: "" });
  const [searchValue, setSearchValue] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message && location.state.severity) {
      setAlert({
        open: true,
        severity: location.state.severity,
        message: location.state.message,
      });
      // Optionally clear the state to avoid showing the message again on refresh
      navigate("/product-category", { replace: true });
    }
  }, [location.state, navigate]);

  const handleClose = () => {
    setAlert({ open: false, message: "" });
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    console.log("Search Input Value:", value); // You can use this value as needed
  };

  return (
    <DashboardLayout>
      <DashboardNavbar onSearchChange={handleSearchChange} />
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Product Categories Table
                </MDTypography>
                <NavLink to="/product-category/add" style={{ textDecoration: "none" }}>
                  <MDButton variant="gradient" color="dark">
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;add new product category
                  </MDButton>
                </NavLink>
              </MDBox>
              <MDBox pt={3}>
                <AuthorsTableData setAlert={setAlert} query={searchValue} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProductCategories;
