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
import API from "custom-layouts/authentication/axiosConfig";

// Material Dashboard 2 React context
// import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ query }) {
  const [inventoryAdjustments, setInventoryAdjustments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();

  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const fetchData = async () => {
    let link = `/inventory-adjustments`;
    API.get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setInventoryAdjustments(response.data.response || []);
        console.log("response.data.response", response.data.response);
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

  const deleteInventoryAdjustment = async (inventoryAdjustmentId) => {
    try {
      await API.delete(`/inventory-adjustments/${inventoryAdjustmentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the vendor list after deletion
      // setInventoryAdjustments((prevInventoryAdjustments) => prevInventoryAdjustments.filter((vendor) => vendor.id !== vendorId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedInventoryAdjustments = inventoryAdjustments.filter(
        (inventoryAdjustment) => inventoryAdjustment.id !== inventoryAdjustmentId
      );
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageInventoryAdjustments = updatedInventoryAdjustments.slice(
        startIndex,
        startIndex + pageSize
      );
      if (currentPageInventoryAdjustments.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("InventoryAdjustment deleted successfully");
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
    { Header: "product", accessor: "product", width: "30%", align: "left" },
    { Header: "date", accessor: "date", align: "left" },
    { Header: "quantity", accessor: "quantity", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  const rows = inventoryAdjustments.map((inventoryAdjustment) => ({
    product: inventoryAdjustment.product.name,
    date: convertToLocalDate(inventoryAdjustment.date), // or another appropriate field
    quantity: inventoryAdjustment.quantity,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink
          to={`/inventory-adjustment/${inventoryAdjustment.id}/edit`}
          style={{ textDecoration: "none" }}
        >
          <MDButton variant="text" color="dark" iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => deleteInventoryAdjustment(inventoryAdjustment.id)}
        >
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
      // onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
