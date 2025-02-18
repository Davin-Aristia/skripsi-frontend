// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Grid from "@mui/material/Grid";
import ExcelJS from "exceljs";

export default function CreateInventoryForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialInventoryState = {
    selectedProduct: null,
    selectedCategory: null,
  };
  const [inventory, setInventory] = useState(initialInventoryState);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`http://localhost:8080/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          axios.get(`http://localhost:8080/product-categories`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const products = productsResponse.data.response;
        const categories = categoriesResponse.data.response;

        // Set the state with fetched data
        setProducts(products);
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const queryParam = {
      product_id: inventory.selectedProduct.id,
      category_id: inventory.selectedCategory.id,
    };

    try {
      // Send POST request to the API
      const response = await axios.post("http://localhost:8080/reports/inventory", queryParam, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setInventory(initialInventoryState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new inventory");
      navigate("/inventory");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const fetchInventoryData = async (productId, categoryId) => {
    try {
      const queryParam = {
        product_id: productId?.id ?? null,
        category_id: categoryId?.id ?? null,
      };

      const response = await axios.post("http://localhost:8080/reports/inventory", queryParam, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.response || []; // Ensure it returns an array
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const exportSimpleExcel = async (productId, categoryId) => {
    const data = await fetchInventoryData(productId, categoryId);
    if (data.length === 0) {
      toast.error("No data available for export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Report");

    worksheet.columns = [
      { header: "No", key: "no", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Stock", key: "stock", width: 20 },
      { header: "Min Stock", key: "min_stock", width: 20 },
      { header: "Price", key: "price", width: 15 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" }; // Center align
      cell.font = { bold: true }; // Make header bold
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // data.forEach((item) => {
    //   worksheet.addRow(item);
    // });

    let totalSum = 0;
    data.forEach((item, index) => {
      totalSum += item.total;
      const row = worksheet.addRow({
        no: index + 1, // Incremental number starting from 1
        name: item.name,
        category: item.category,
        stock: item.stock,
        min_stock: item.min_stock,
        price: `Rp ${new Intl.NumberFormat("id-ID", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.price)}`,
      });

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === 1 || colNumber === 3) {
          // 1 = No, 3 = Date
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "inventory.xlsx");
    toast.success("Export successful");
  };

  const handlePreview = async (productId, categoryId) => {
    const data = await fetchInventoryData(productId, categoryId);
    if (data.length === 0) {
      toast.error("No data available for preview");
      return;
    }

    navigate("/preview-inventory", { state: { reportData: data } });
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
            Inventory Report
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <Grid container spacing={8}>
              <Grid item xs={4}>
                <MDBox mb={2}>
                  <Autocomplete
                    disablePortal
                    onChange={(event, newValue) =>
                      setInventory({ ...inventory, selectedProduct: newValue })
                    }
                    options={products}
                    getOptionLabel={(option) => option?.name || ""}
                    sx={{
                      "& .MuiInputLabel-root": {
                        lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                      },
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} label="Select Product" required />
                    )}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={4}>
                <MDBox mb={2}>
                  <Autocomplete
                    disablePortal
                    onChange={(event, newValue) =>
                      setInventory({ ...inventory, selectedCategory: newValue })
                    }
                    options={categories}
                    getOptionLabel={(option) => option?.name || ""}
                    sx={{
                      "& .MuiInputLabel-root": {
                        lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                      },
                    }}
                    renderInput={(params) => (
                      <MDInput {...params} label="Select Category" required />
                    )}
                  />
                </MDBox>
              </Grid>
            </Grid>
            <MDBox>
              <Grid container spacing={0}>
                <Grid item xs={2}>
                  <MDBox display="flex" justifyContent="flex-start" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() =>
                        handlePreview(inventory.selectedProduct, inventory.selectedCategory)
                      }
                      sx={{ marginTop: "20px" }}
                    >
                      Preview
                    </MDButton>
                  </MDBox>
                </Grid>
                <Grid item xs={2}>
                  <MDBox display="flex" justifyContent="flex-start" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() =>
                        exportSimpleExcel(inventory.selectedProduct, inventory.selectedCategory)
                      }
                      sx={{ marginTop: "20px" }}
                    >
                      Print to Excel
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
