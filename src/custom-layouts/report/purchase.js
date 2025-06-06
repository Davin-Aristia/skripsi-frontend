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
import API from "custom-layouts/authentication/axiosConfig";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Grid from "@mui/material/Grid";
import ExcelJS from "exceljs";

export default function CreatePurchaseForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialPurchaseState = {
    dateFrom: "",
    dateTo: "",
    selectedVendor: null,
  };
  const [purchase, setPurchase] = useState(initialPurchaseState);
  const [details, setDetails] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both vendors and products simultaneously
        const [vendorsResponse, productsResponse] = await Promise.all([
          API.get(`/vendors`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const vendors = vendorsResponse.data.response;

        // Set the state with fetched data
        setVendors(vendors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const queryParam = {
      date_from: ensureDateTimeFormat(purchase.dateFrom),
      date_to: ensureDateTimeFormat(purchase.dateTo),
      vendor_id: purchase.selectedVendor.id,
    };

    try {
      // Send POST request to the API
      const response = await API.post("/reports/purchase", queryParam, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setPurchase(initialPurchaseState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new purchase");
      navigate("/purchase");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const fetchPurchaseData = async (fromDate, toDate, vendorId) => {
    try {
      const queryParam = {
        date_from: fromDate ? ensureDateTimeFormat(fromDate) : null,
        date_to: toDate ? ensureDateTimeFormat(toDate) : null,
        vendor_id: vendorId?.id ?? null, // If vendorId is undefined or null, set it as null
      };

      const response = await API.post("/reports/purchase", queryParam, {
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

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  const exportSimpleExcel = async (fromDate, toDate, vendorId) => {
    const data = await fetchPurchaseData(fromDate, toDate, vendorId);
    if (data.length === 0) {
      toast.error("No data available for export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Purchase Report");

    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Purchase Report";
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Row 2: Period
    worksheet.mergeCells("A2:E2");
    const periodCell = worksheet.getCell("A2");
    periodCell.value = `Period: ${formatDate(fromDate)} - ${formatDate(toDate)}`;
    periodCell.font = { italic: true };
    periodCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(["No", "Purchase Order", "Date", "Vendor", "Total"]);

    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" }; // Center align
      cell.font = { bold: true }; // Make header bold
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.columns = [
      { key: "no", width: 10 },
      { key: "name", width: 30 },
      { key: "date", width: 15 },
      { key: "vendor", width: 20 },
      { key: "total", width: 15 },
    ];

    // data.forEach((item) => {
    //   worksheet.addRow(item);
    // });

    let totalSum = 0;
    data.forEach((item, index) => {
      totalSum += item.total;
      const row = worksheet.addRow({
        no: index + 1, // Incremental number starting from 1
        name: item.name,
        date: formatDate(item.date),
        vendor: item.vendor,
        total: `Rp ${new Intl.NumberFormat("id-ID", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.total)}`,
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
        if (colNumber === 5) {
          cell.alignment = { horizontal: "right" };
        }
      });
    });

    const totalRow = worksheet.addRow([
      "Total",
      "",
      "",
      "",
      `Rp ${new Intl.NumberFormat("id-ID", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalSum)}`,
    ]);

    // Merge first 4 cells for "Total" label
    worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
    totalRow.getCell(1).alignment = { horizontal: "right" }; // Right align "Total"
    totalRow.getCell(5).alignment = { horizontal: "right" }; // Right align "Total"
    totalRow.getCell(1).font = { bold: true }; // Bold font for "Total"
    totalRow.getCell(5).font = { bold: true }; // Bold font for total value
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Purchase.xlsx");
    toast.success("Export successful");
  };

  const handlePreview = async (fromDate, toDate, vendorId) => {
    const data = await fetchPurchaseData(fromDate, toDate, vendorId);
    if (data.length === 0) {
      toast.error("No data available for preview");
      return;
    }

    navigate("/preview-purchase", { state: { reportData: data, fromDate, toDate } });
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
            Purchase Report
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
                      setPurchase({ ...purchase, selectedVendor: newValue })
                    }
                    options={vendors}
                    getOptionLabel={(option) => option?.company || ""}
                    sx={{
                      "& .MuiInputLabel-root": {
                        lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                      },
                    }}
                    renderInput={(params) => <MDInput {...params} label="Select Vendor" />}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={4}>
                <MDBox mb={2}>
                  <MDInput
                    type="date"
                    label="Date From"
                    fullWidth
                    value={purchase.dateFrom}
                    onChange={(e) => setPurchase({ ...purchase, dateFrom: e.target.value })}
                    InputLabelProps={{
                      shrink: true, // Ensures label stays on top even when the input is empty
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={4}>
                <MDBox mb={2}>
                  <MDInput
                    type="date"
                    label="Date To"
                    fullWidth
                    value={purchase.dateTo}
                    onChange={(e) => setPurchase({ ...purchase, dateTo: e.target.value })}
                    InputLabelProps={{
                      shrink: true, // Ensures label stays on top even when the input is empty
                    }}
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
                        handlePreview(purchase.dateFrom, purchase.dateTo, purchase.selectedVendor)
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
                          purchase.dateFrom,
                          purchase.dateTo,
                          purchase.selectedVendor
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

            {/* <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                create
              </MDButton>
            </MDBox> */}
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
