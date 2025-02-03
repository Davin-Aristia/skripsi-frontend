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
  const [inventoryIns, setInventoryIns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { authToken } = useAuth();

  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const fetchData = async () => {
    let link = `http://localhost:8080/inventory-ins`;
    axios
      .get(link)
      .then((response) => {
        setInventoryIns(response.data.response || []);
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

  const deleteInventoryIn = async (inventoryInId) => {
    try {
      await axios.delete(`http://localhost:8080/inventory-ins/${inventoryInId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the inventoryIn list after deletion
      // setInventoryIns((prevInventoryIns) => prevInventoryIns.filter((inventoryIn) => inventoryIn.id !== inventoryInId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedInventoryIns = inventoryIns.filter(
        (inventoryIn) => inventoryIn.id !== inventoryInId
      );
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageInventoryIns = updatedInventoryIns.slice(startIndex, startIndex + pageSize);
      if (currentPageInventoryIns.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("InventoryIn deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the inventoryIn.");
      console.error("Error deleting the inventoryIn:", error);
    }
  };

  const columns = [
    { Header: "name", accessor: "name", width: "30%", align: "left" },
    { Header: "date", accessor: "date", align: "left" },
    { Header: "purchase", accessor: "purchase", align: "center" },
    { Header: "total", accessor: "total", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  const rows = inventoryIns.map((inventoryIn) => ({
    name: inventoryIn.name,
    date: convertToLocalDate(inventoryIn.date),
    purchase: inventoryIn.purchase,
    total: `Rp ${new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(inventoryIn.total)}`,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/inventory-in/${inventoryIn.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color={darkMode ? "white" : "dark"} iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton
          variant="text"
          color="error"
          iconOnly
          onClick={() => deleteInventoryIn(inventoryIn.id)}
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
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
