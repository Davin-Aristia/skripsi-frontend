// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import { Card } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";
import API from "custom-layouts/authentication/axiosConfig";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";

import Grid from "@mui/material/Grid";

export default function CreateInventoryAdjustmentForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialInventoryAdjustmentState = {
    selectedProduct: null,
    // date: "",
    quantity: 0,
    difference: 0,
    reason: "",
  };

  const [inventoryAdjustment, setInventoryAdjustment] = useState(initialInventoryAdjustmentState);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both vendors and products simultaneously
        const [productsResponse] = await Promise.all([
          API.get(`/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const products = productsResponse.data.response;

        // Set the state with fetched data
        setProducts(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("inventoryAdjustment.selectedProduct", inventoryAdjustment.selectedProduct);

    try {
      const response = await API.post(
        "/inventory-adjustments",
        {
          product_id: inventoryAdjustment.selectedProduct.id,
          // date: ensureDateTimeFormat(inventoryAdjustment.date),
          quantity: parseInt(inventoryAdjustment.difference, 10),
          reason: inventoryAdjustment.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setInventoryAdjustment(initialInventoryAdjustmentState);

      toast.success("success add new inventory adjustment");
      navigate("/inventory-adjustment");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const ensureDateTimeFormat = (date) => {
    // If it's just a date (YYYY-MM-DD), add default time T00:00:00Z
    if (date && date.length === 10) {
      return date + "T00:00:00Z"; // Convert to datetime format (2025-01-07 -> 2025-01-07T00:00:00Z)
    }
    if (date && date.length === 16) {
      return date + ":00Z"; // Add missing seconds (e.g., 2025-01-03T00:00 -> 2025-01-03T00:00:00Z)
    }
    // console.log("date", date);
    return date; // If it's already in datetime format (e.g., 2025-01-07T12:30)
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Card sx={{ mt: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="dark"
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
            Add New Inventory Adjustment
          </MDTypography>
        </MDBox>
        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <Autocomplete
                disablePortal
                // onChange={(event, newValue) =>
                //   setInventoryAdjustment({ ...inventoryAdjustment, selectedProduct: newValue })
                // }
                onChange={(event, newValue) => {
                  const stock = newValue?.stock || 0;
                  setInventoryAdjustment((prev) => ({
                    ...prev,
                    selectedProduct: newValue,
                    // quantity: stock + (prev.difference ?? 0), // quantity adjusts with new stock
                    difference: (prev.quantity ?? stock) - stock, // difference recalculated
                  }));
                }}
                options={products}
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Product" required />}
              />
              {inventoryAdjustment.selectedProduct && (
                <MDBox mt={1}>
                  <MDTypography variant="subtitle2" fontWeight="bold">
                    Stock Information
                  </MDTypography>
                  <MDTypography variant="body2">
                    Stock: {inventoryAdjustment.selectedProduct.stock || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2">
                    Min Stock: {inventoryAdjustment.selectedProduct.min_stock || "N/A"}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
            {/* <MDBox mb={2}>
              <MDInput
                type="date"
                label="Date"
                fullWidth
                value={inventoryAdjustment.date}
                onChange={(e) =>
                  setInventoryAdjustment({ ...inventoryAdjustment, date: e.target.value })
                }
                InputLabelProps={{
                  shrink: true, // Ensures label stays on top even when the input is empty
                }}
              />
            </MDBox> */}
            <Grid container spacing={5}>
              <Grid item xs={6}>
                <MDBox mb={2}>
                  <MDInput
                    type="number"
                    label="Quantity"
                    fullWidth
                    value={inventoryAdjustment.quantity}
                    // onChange={(e) =>
                    //   setInventoryAdjustment({ ...inventoryAdjustment, quantity: e.target.value })
                    // }
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 0;
                      const stock = inventoryAdjustment.selectedProduct?.stock ?? 0;
                      setInventoryAdjustment((prev) => ({
                        ...prev,
                        quantity: newQuantity,
                        difference: newQuantity - stock, // auto-update difference
                      }));
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={6}>
                <MDBox mb={2}>
                  <MDInput
                    type="number"
                    label="Difference"
                    fullWidth
                    value={inventoryAdjustment.difference}
                    // onChange={(e) =>
                    //   setInventoryAdjustment({ ...inventoryAdjustment, difference: e.target.value })
                    // }
                    onChange={(e) => {
                      const newDifference = parseInt(e.target.value) || 0;
                      const stock = inventoryAdjustment.selectedProduct?.stock ?? 0;
                      setInventoryAdjustment((prev) => ({
                        ...prev,
                        difference: newDifference,
                        quantity: stock + newDifference, // auto-update quantity
                      }));
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Reason"
                fullWidth
                value={inventoryAdjustment.reason}
                onChange={(e) =>
                  setInventoryAdjustment({ ...inventoryAdjustment, reason: e.target.value })
                }
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
