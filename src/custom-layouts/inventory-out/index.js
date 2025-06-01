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

import { Grid, Card, Icon } from "@mui/material";

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
import InventoryOutsTableData from "custom-layouts/inventory-out/data/inventoryOutsTableData";

function InventoryOuts() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
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
                // bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: "#323232" }}
              >
                <MDTypography variant="h6" color="white">
                  Inventory outs Table
                </MDTypography>
                <NavLink to="/inventory-out/add" style={{ textDecoration: "none" }}>
                  <MDButton variant="gradient" color="info">
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;add new inventory out
                  </MDButton>
                </NavLink>
              </MDBox>
              <MDBox pt={3}>
                <InventoryOutsTableData />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default InventoryOuts;
