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

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ query }) {
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();

  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const fetchData = async () => {
    let link = `http://localhost:8080/vendors`;
    axios
      .get(link)
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

  const deleteVendor = async (vendorId) => {
    try {
      await axios.delete(`http://localhost:8080/vendors/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the vendor list after deletion
      // setVendors((prevVendors) => prevVendors.filter((vendor) => vendor.id !== vendorId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedVendors = vendors.filter((vendor) => vendor.id !== vendorId);
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageVendors = updatedVendors.slice(startIndex, startIndex + pageSize);
      if (currentPageVendors.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Vendor deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the vendor.");
      console.error("Error deleting the vendor:", error);
    }
  };

  const columns = [
    { Header: "company", accessor: "company", width: "30%", align: "left" },
    { Header: "email", accessor: "email", align: "left" },
    { Header: "phone_number", accessor: "phone_number", align: "center" },
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
          <MDButton variant="text" color={darkMode ? "white" : "dark"} iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton variant="text" color="error" iconOnly onClick={() => deleteVendor(vendor.id)}>
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
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
  );
}
