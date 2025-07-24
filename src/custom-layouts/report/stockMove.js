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
  Select,
  FormControl,
  InputLabel,
  Card,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";
import API from "custom-layouts/authentication/axiosConfig";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Grid from "@mui/material/Grid";
import ExcelJS from "exceljs";

export default function CreateStockMoveForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialStockMoveState = {
    dateFrom: "",
    dateTo: "",
    selectedProduct: null,
    selectedCategory: null,
  };
  const [stockMove, setStockMove] = useState(initialStockMoveState);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          API.get(`/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get(`/product-categories`, {
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
      product_id: stockMove.selectedProduct.id,
      category_id: stockMove.selectedCategory.id,
      filter: stockMove.selectedFilter,
    };

    try {
      // Send POST request to the API
      const response = await API.post("/reports/stockMove", queryParam, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setStockMove(initialStockMoveState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new stockMove");
      navigate("/stockMove");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const fetchStockMoveData = async (fromDate, toDate, productId, categoryId) => {
    try {
      const queryParam = {
        date_from: fromDate ? ensureDateTimeFormat(fromDate) : null,
        date_to: toDate ? ensureDateTimeFormat(toDate) : null,
        product_id: productId?.id ?? null,
        category_id: categoryId?.id ?? null,
      };

      const response = await API.post("/reports/stock-moves", queryParam, {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  const formatDateRange = (from, to) => {
    const fromFormatted = formatDate(from);
    const toFormatted = formatDate(to);

    if (!fromFormatted && !toFormatted) return "All Dates";
    if (fromFormatted && !toFormatted) return `From ${fromFormatted}`;
    if (!fromFormatted && toFormatted) return `Until ${toFormatted}`;
    return `${fromFormatted} - ${toFormatted}`;
  };

  const exportSimpleExcel = async (fromDate, toDate, productId, categoryId) => {
    const data = await fetchStockMoveData(productId, categoryId);
    if (data.length === 0) {
      toast.error("No data available for export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Move Report");

    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Stock Move Report";
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Row 2: Period
    worksheet.mergeCells("A2:F2");
    const periodCell = worksheet.getCell("A2");
    periodCell.value = `Period: ${formatDateRange(fromDate, toDate)}`;
    periodCell.font = { italic: true };
    periodCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]);

    // worksheet.columns = [
    //   { header: "No", key: "no", width: 10 },
    //   { header: "Product", key: "product", width: 30 },
    //   { header: "Initial", key: "initial", width: 15 },
    //   { header: "In", key: "in", width: 15 },
    //   { header: "Out", key: "out", width: 15 },
    //   { header: "Last", key: "last", width: 15 },
    // ];

    const headerRow = worksheet.addRow(["No", "Product", "Initial", "In", "Out", "Last"]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Set column widths manually
    worksheet.columns = [
      { key: "no", width: 10 },
      { key: "product", width: 30 },
      { key: "initial", width: 15 },
      { key: "in", width: 15 },
      { key: "out", width: 15 },
      { key: "last", width: 15 },
    ];

    // data.forEach((item) => {
    //   worksheet.addRow(item);
    // });

    let totalSum = 0;
    data.forEach((item, index) => {
      totalSum += item.total;
      const row = worksheet.addRow({
        no: index + 1, // Incremental number starting from 1
        product: item.product,
        initial: item.initial,
        in: item.in,
        out: item.out,
        last: item.last,
      });

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === 1) {
          // 1 = No, 3 = Date
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Stock Move.xlsx");
    toast.success("Export successful");
  };

  const handlePreview = async (fromDate, toDate, productId, categoryId) => {
    const data = await fetchStockMoveData(fromDate, toDate, productId, categoryId);
    if (data.length === 0) {
      toast.error("No data available for preview");
      return;
    }
    console.log("dataaaa", data);

    navigate("/preview-stock-move", { state: { reportData: data, fromDate, toDate } });
    // const previewUrl = "/preview-stockMove";
    // const newTab = window.open(previewUrl, "_blank");

    // if (newTab) {
    //   newTab.onload = () => {
    //     newTab.postMessage({ reportData: data }, window.location.origin);
    //     // newTab.postMessage({ reportData: data }, window.location.origin);
    //   };
    // } else {
    //   toast.error("Popup blocked! Please allow pop-ups for this site.");
    // }
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
            Stock Move Report
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <Grid container rowSpacing={3} columnSpacing={8}>
              <Grid item xs={6}>
                <MDBox>
                  <MDInput
                    type="date"
                    label="Date From"
                    fullWidth
                    value={stockMove.dateFrom}
                    onChange={(e) => setStockMove({ ...stockMove, dateFrom: e.target.value })}
                    InputLabelProps={{
                      shrink: true, // Ensures label stays on top even when the input is empty
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={6}>
                <MDBox>
                  <MDInput
                    type="date"
                    label="Date To"
                    fullWidth
                    value={stockMove.dateTo}
                    onChange={(e) => setStockMove({ ...stockMove, dateTo: e.target.value })}
                    InputLabelProps={{
                      shrink: true, // Ensures label stays on top even when the input is empty
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={6}>
                <MDBox>
                  <Autocomplete
                    disablePortal
                    onChange={(event, newValue) =>
                      setStockMove({ ...stockMove, selectedProduct: newValue })
                    }
                    options={products}
                    getOptionLabel={(option) => option?.name || ""}
                    sx={{
                      "& .MuiInputLabel-root": {
                        lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                      },
                    }}
                    renderInput={(params) => <MDInput {...params} label="Select Product" />}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={6}>
                <MDBox>
                  <Autocomplete
                    disablePortal
                    onChange={(event, newValue) =>
                      setStockMove({ ...stockMove, selectedCategory: newValue })
                    }
                    options={categories}
                    getOptionLabel={(option) => option?.name || ""}
                    sx={{
                      "& .MuiInputLabel-root": {
                        lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                      },
                    }}
                    renderInput={(params) => <MDInput {...params} label="Select Category" />}
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
                        handlePreview(
                          stockMove.dateFrom,
                          stockMove.dateTo,
                          stockMove.selectedProduct,
                          stockMove.selectedCategory
                        )
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
                        exportSimpleExcel(
                          stockMove.dateFrom,
                          stockMove.dateTo,
                          stockMove.selectedProduct,
                          stockMove.selectedCategory
                        )
                      }
                      sx={{ marginTop: "20px" }}
                    >
                      Export to Excel
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
