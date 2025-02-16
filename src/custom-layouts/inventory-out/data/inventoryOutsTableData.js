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

import { InvoicePrint } from "printout/Invoice";
import { useReactToPrint } from "react-to-print";

export default function data({ query }) {
  const [inventoryOuts, setInventoryOuts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();
  const [selectedData, setSelectedData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const printRef = useRef(null);

  const handlePrintClick = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/inventory-outs/${id}`, {
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
  const handleSendEmail = () => {
    if (!selectedData) {
      alert("No data selected!");
      return;
    }

    alert(`Sending email for inventory-out ID: ${selectedData.response.id}`);
    setOpenDialog(false);
  };

  // Close dialog
  const handleClose = () => {
    setOpenDialog(false);
  };

  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const fetchData = async () => {
    let link = `http://localhost:8080/inventory-outs`;
    axios
      .get(link, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        setInventoryOuts(response.data.response || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, [query]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const deleteInventoryOut = async (inventoryOutId) => {
    try {
      await axios.delete(`http://localhost:8080/inventory-outs/${inventoryOutId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the inventoryOut list after deletion
      // setInventoryOuts((prevInventoryOuts) => prevInventoryOuts.filter((inventoryOut) => inventoryOut.id !== inventoryOutId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedInventoryOuts = inventoryOuts.filter(
        (inventoryOut) => inventoryOut.id !== inventoryOutId
      );
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageInventoryOuts = updatedInventoryOuts.slice(
        startIndex,
        startIndex + pageSize
      );
      if (currentPageInventoryOuts.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("InventoryOut deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the inventory out.");
      console.error("Error deleting the inventory out:", error);
    }
  };

  const columns = [
    { Header: "name", accessor: "name", width: "30%", align: "left" },
    { Header: "date", accessor: "date", align: "left" },
    { Header: "customer", accessor: "customer", align: "center" },
    { Header: "total", accessor: "total", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  const rows = inventoryOuts.map((inventoryOut) => ({
    name: inventoryOut.name,
    date: convertToLocalDate(inventoryOut.date),
    customer: inventoryOut.customer.name,
    total: inventoryOut.total,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/inventory-out/${inventoryOut.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color={darkMode ? "white" : "dark"} iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => deleteInventoryOut(inventoryOut.id)}
        >
          <Icon>delete</Icon>
        </MDButton>
        <MDButton
          variant="text"
          color="info"
          iconOnly
          onClick={() => handlePrintClick(inventoryOut.id)}
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
            <InvoicePrint ref={printRef} invoice={selectedData} />
          </div>
        ) : (
          <p>Loading invoice data...</p>
        )}
      </div>
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Invoice</span>
            <IconButton aria-label="close" onClick={handleClose}>
              <Icon>close</Icon>
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <p>Do you want to print invoice or send this as an email?</p>
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
