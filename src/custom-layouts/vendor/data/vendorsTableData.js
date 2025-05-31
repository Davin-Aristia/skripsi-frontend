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
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const fetchData = async () => {
    let link = `/vendors`;
    API.get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setVendors(response.data.response || []);
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

  const handleDeleteClick = (vendorId) => {
    setVendorToDelete(vendorId);
    setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setVendorToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/vendors/${vendorToDelete}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the vendor list after deletion
      // setVendors((prevVendors) => prevVendors.filter((vendor) => vendor.id !== vendorToDelete));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedVendors = vendors.filter((vendor) => vendor.id !== vendorToDelete);
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageVendors = updatedVendors.slice(startIndex, startIndex + pageSize);
      if (currentPageVendors.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Vendor deleted successfully");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    } finally {
      setOpenConfirm(false);
      setVendorToDelete(null);
    }
  };

  const columns = [
    { Header: "company", accessor: "company", width: "30%", align: "left" },
    { Header: "email", accessor: "email", align: "left" },
    { Header: "phone number", accessor: "phone_number", align: "center" },
    { Header: "address", accessor: "address", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const rows = vendors.map((vendor) => ({
    company: vendor.company,
    email: vendor.email, // or another appropriate field
    phone_number: vendor.phone_number,
    address: vendor.address,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/vendor/${vendor.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color="dark" iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => handleDeleteClick(vendor.id)}
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
        <DialogContent dividers>Are you sure you want to delete this vendor?</DialogContent>
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
