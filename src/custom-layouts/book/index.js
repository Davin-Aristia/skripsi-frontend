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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";

// @mui material components
// import Grid from "@mui/material/Grid";
// import Card from "@mui/material/Card";
// import Icon from "@mui/material/Icon";
// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  Icon,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useLocation, useNavigate } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { NavLink } from "react-router-dom";

// Data
import AuthorsTableData from "custom-layouts/product/data/authorsTableData";

function Products() {
  const [alert, setAlert] = useState({ open: false, severity: null, message: "" });
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
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
      navigate("/product", { replace: true });
    }
  }, [location.state, navigate]);

  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    setFromDate(null);
    setToDate(null);
  };

  const handleExport = () => {
    // if (fromDate && toDate) {
    exportSimpleExcel(fromDate, toDate);
    // }
    handleCloseWizard();
  };

  const handleClose = () => {
    setAlert({ open: false, message: "" });
  };

  const fetchData = async () => {
    API.get(`/books`)
      .then((response) => {
        setBooks(response.data.response || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const exportSimpleExcel = (fromDate, toDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    fetchData();
    console.log("fromDate", fromDate);
    console.log("toDate", toDate);
    console.log("books", books);

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 30 },
      { header: "Author", key: "author", width: 30 },
      { header: "Price", key: "price", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
    ];

    books.forEach((book) => {
      worksheet.addRow(book);
    });

    // Generate Excel file and trigger download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "simple.xlsx");
    });
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    console.log("Search Input Value:", value); // You can use this value as needed
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
      {/* <button onClick={exportSimpleExcel}>Download Simple Excel</button> */}
      <Button variant="contained" onClick={handleOpenWizard}>
        Export Books
      </Button>

      <Dialog open={open} onClose={handleCloseWizard}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From"
              sx={{ marginTop: 2, mx: 1 }}
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="To"
              sx={{ marginTop: 2, mx: 1 }}
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          <Button onClick={handleExport} disabled={!fromDate || !toDate}>
            Export
          </Button>
        </DialogActions>
      </Dialog>
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
                  Products Table
                </MDTypography>
                <NavLink to="/product/add" style={{ textDecoration: "none" }}>
                  <MDButton variant="gradient" color="dark">
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;add new product
                  </MDButton>
                </NavLink>
              </MDBox>
              <MDBox pt={3}>
                {/* <DataTable
                  table={{ columns, rows: paginatedRows }}
                  isSorted={false}
                  entriesPerPage={{ defaultValue: entriesPerPage }}
                  showTotalEntries={true}
                  noEndBorder
                />
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <MDButton
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      color={currentPage === index + 1 ? "info" : "dark"}
                    >
                      {index + 1}
                    </MDButton>
                  ))}
                </div> */}
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

export default Products;
