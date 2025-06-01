// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditInventoryAdjustmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialInventoryAdjustmentState = {
    selectedProduct: null,
    date: "",
    quantity: 0,
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

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`/inventory-adjustments/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const inventoryAdjustment = response.data.response;
        console.log("inventoryAdjustment", inventoryAdjustment);
        setInventoryAdjustment({
          selectedProduct: inventoryAdjustment.product,
          date: convertToLocalDate(inventoryAdjustment.date),
          reason: inventoryAdjustment.reason,
          quantity: inventoryAdjustment.quantity,
          createdAt: convertToLocalDate(inventoryAdjustment.created_at),
          updatedAt: convertToLocalDate(inventoryAdjustment.updated_at),
        });
      } catch (error) {
        console.error("Error fetching inventory Adjustment:", error);
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
    console.log(
      "parseInt(inventoryAdjustment.quantity, 10),",
      parseInt(inventoryAdjustment.quantity, 10)
    );

    try {
      const response = await API.put(
        `/inventory-adjustments/${id}`,
        {
          product_id: inventoryAdjustment.selectedProduct.id,
          date: ensureDateTimeFormat(inventoryAdjustment.date),
          quantity: parseInt(inventoryAdjustment.quantity, 10),
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
            Edit Inventory Adjustment
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
            Create Date:{" "}
            {inventoryAdjustment.createdAt
              ? new Date(inventoryAdjustment.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit:{" "}
            {inventoryAdjustment.updatedAt
              ? new Date(inventoryAdjustment.updatedAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-"}
          </MDTypography>
        </MDBox>
        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <h3 style={{ paddingBottom: "10px" }}>InventoryAdjustment Information</h3>
            <MDBox mb={2}>
              <Autocomplete
                disablePortal
                onChange={(event, newValue) =>
                  setInventoryAdjustment({ ...inventoryAdjustment, selectedProduct: newValue })
                }
                value={inventoryAdjustment.selectedProduct}
                options={products}
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Product" required />}
              />
            </MDBox>
            <MDBox mb={2}>
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
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Quantity"
                fullWidth
                value={inventoryAdjustment.quantity}
                onChange={(e) =>
                  setInventoryAdjustment({ ...inventoryAdjustment, quantity: e.target.value })
                }
              />
            </MDBox>
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
                edit
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
