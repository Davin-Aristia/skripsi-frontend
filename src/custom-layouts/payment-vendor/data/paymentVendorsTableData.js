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
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { toast } from "react-toastify";

import { useAuth } from "custom-layouts/authentication";
import API from "custom-layouts/authentication/axiosConfig";

// Material Dashboard 2 React context
// import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ query }) {
  const [paymentVendors, setPaymentVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [paymentVendorToDelete, setPaymentVendorToDelete] = useState(null);

  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const fetchData = async () => {
    let link = `/payments?payment_type=vendor`;
    API.get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setPaymentVendors(response.data.response || []);
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

  const handleDeleteClick = (paymentVendorId) => {
    setPaymentVendorToDelete(paymentVendorId);
    setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setPaymentVendorToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/payments/${paymentVendorToDelete}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the paymentVendor list after deletion
      // setPaymentVendors((prevPaymentVendors) => prevPaymentVendors.filter((paymentVendor) => paymentVendor.id !== paymentVendorToDelete));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedPaymentVendors = paymentVendors.filter(
        (paymentVendor) => paymentVendor.id !== paymentVendorToDelete
      );
      const startIndex = (currentPage - 1) * pageSize;
      const currentPagePaymentVendors = updatedPaymentVendors.slice(
        startIndex,
        startIndex + pageSize
      );
      if (currentPagePaymentVendors.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("PaymentVendor deleted successfully");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    } finally {
      setOpenConfirm(false);
      setPaymentVendorToDelete(null);
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

  const rows = paymentVendors.map((paymentVendor) => ({
    name: paymentVendor.name,
    date: paymentVendor.date
      ? new Date(paymentVendor.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-",
    vendor: paymentVendor.vendor.company,
    total: `Rp ${new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(paymentVendor.total)}`,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/vendor-payment/${paymentVendor.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color="dark" iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDeleteClick(paymentVendor.id)}
        >
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <>
      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent dividers>Are you sure you want to delete this payment vendor?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <MDButton onClick={handleConfirmDelete} color="error">
            Delete
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
        // onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
