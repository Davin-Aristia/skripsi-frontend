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

import { useAuth } from "custom-layouts/authentication";
import API from "custom-layouts/authentication/axiosConfig";

// Material Dashboard 2 React context
// import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ query }) {
  const [productCategories, setProductCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const fetchData = async () => {
    console.log("authToken", authToken);
    let link = `/product-categories`;
    API.get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setProductCategories(response.data.response || []);
        setLoading(false);
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

  const handleDeleteClick = (categoryId) => {
    setCategoryToDelete(categoryId);
    setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/product-categories/${categoryToDelete}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the book list after deletion
      // setProductCategories((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedProductCategories = productCategories.filter(
        (productCategory) => productCategory.id !== categoryToDelete
      );
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageProductCategories = updatedProductCategories.slice(
        startIndex,
        startIndex + pageSize
      );
      if (currentPageProductCategories.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Product Category deleted successfully");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    } finally {
      setOpenConfirm(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    { Header: "name", accessor: "name", align: "left" },
    { Header: "description", accessor: "description", align: "left" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const rows = productCategories.map((productCategory) => ({
    name: productCategory.name,
    description: productCategory.description,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink
          to={`/product-category/${productCategory.id}/edit`}
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
          onClick={() => handleDeleteClick(productCategory.id)}
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
        <DialogContent dividers>Are you sure you want to delete this category?</DialogContent>
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
