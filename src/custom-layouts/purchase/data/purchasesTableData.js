/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { toast } from "react-toastify";

import { useAuth } from "custom-layouts/authentication";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Box,
} from "@mui/material";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { PurchasePrint } from "printout/Purchase";
import { useReactToPrint } from "react-to-print";

export default function data({ query }) {
  const [purchases, setPurchases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();
  const [selectedData, setSelectedData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const printRef = useRef(null);

  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const fetchData = async () => {
    let link = `http://localhost:8080/purchases`;
    axios
      .get(link, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        setPurchases(response.data.response || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, [query]);

  const handlePrintClick = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/purchases/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("API Response:", response.data);
      setSelectedData(response.data); // Store fetched data
      setOpenDialog(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle print action
  const handleReactToPrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handlePrint = () => {
    handleReactToPrint();
  };

  // Handle send email action
  const handleSendEmail = async () => {
    if (!selectedData) {
      toast.error("No data selected!");
      return;
    }

    const id = selectedData.response.id; // Get ID from selected data
    if (!id) {
      toast.error("Invalid ID!");
      return;
    }
    console.log("id", id);

    try {
      const response = await axios.post(`http://localhost:8080/purchases/email/${id}`, null, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      toast.success("Email sent successfully!");
      console.log("Email response:", response.data);
      setOpenDialog(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  // Close dialog
  const handleClose = () => {
    setOpenDialog(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const deletePurchase = async (purchaseId) => {
    try {
      await axios.delete(`http://localhost:8080/purchases/${purchaseId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the purchase list after deletion
      // setPurchases((prevPurchases) => prevPurchases.filter((purchase) => purchase.id !== purchaseId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedPurchases = purchases.filter((purchase) => purchase.id !== purchaseId);
      const startIndex = (currentPage - 1) * pageSize;
      const currentPagePurchases = updatedPurchases.slice(startIndex, startIndex + pageSize);
      if (currentPagePurchases.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Purchase deleted successfully");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const columns = [
    { Header: "name", accessor: "name", width: "30%", align: "left" },
    { Header: "date", accessor: "date", align: "left" },
    { Header: "vendor", accessor: "vendor", align: "center" },
    { Header: "total", accessor: "total", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  const rows = purchases.map((purchase) => ({
    name: purchase.name,
    date: convertToLocalDate(purchase.date),
    vendor: purchase.vendor.company,
    total: `Rp ${new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(purchase.total)}`,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/purchase/${purchase.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color={darkMode ? "white" : "dark"} iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton variant="text" color="error" iconOnly onClick={() => deletePurchase(purchase.id)}>
          <Icon>delete</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="info"
          iconOnly
          onClick={() => handlePrintClick(purchase.id)}
        >
          <Icon>print</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <>
      <div style={{ display: "none" }}>
        {selectedData ? (
          <div style={{ display: "none" }}>
            <PurchasePrint ref={printRef} purchase={selectedData} />
          </div>
        ) : (
          <p>Loading purchase data...</p>
        )}
      </div>
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Purchase</span>
            <IconButton aria-label="close" onClick={handleClose}>
              <Icon>close</Icon>
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <p>Do you want to print purchase or send this as an email?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrint} color="primary">
            Print
          </Button>
          <MDButton onClick={handleSendEmail} color="info" variant="gradient">
            Send Email
          </MDButton>
        </DialogActions>
      </Dialog>
      <DataTable
        table={{ columns, rows }}
        isSorted={true}
        entriesPerPage={false}
        showTotalEntries={true}
        canSearch={true}
        noEndBorder
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
