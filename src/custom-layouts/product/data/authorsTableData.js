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
// // import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ query }) {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();

  // // const [controller] = useMaterialUIController();
  // // const { darkMode } = controller;

  const fetchData = async () => {
    let link = `/products`;
    API.get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        setProducts(response.data.response || []);
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

  const deleteProduct = async (productId) => {
    try {
      await API.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the product list after deletion
      // setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedProducts = products.filter((product) => product.id !== productId);
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageProducts = updatedProducts.slice(startIndex, startIndex + pageSize);
      if (currentPageProducts.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Product deleted successfully");
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
    { Header: "stock", accessor: "stock", align: "left" },
    { Header: "min stock", accessor: "min_stock", align: "center" },
    { Header: "price", accessor: "price", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const rows = products.map((product) => ({
    name: product.name,
    // name: (
    //   <MDBox display="flex" alignItems="center" lineHeight={1}>
    //     <MDAvatar src={product.image} name={product.name} size="sm" />
    //     <MDTypography display="block" variant="button" fontWeight="medium" ml={1} lineHeight={1}>
    //       {product.name}
    //     </MDTypography>
    //   </MDBox>
    // ),
    stock: product.stock, // or another appropriate field
    min_stock: product.min_stock === null ? "N/A" : product.min_stock,
    price: `Rp ${new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(product.price)}`,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/product/${product.id}/edit`} style={{ textDecoration: "none" }}>
          {/* <MDButton variant="text" color="dark" iconOnly> */}
          <MDButton variant="text" color="dark" iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton variant="text" color="error" iconOnly onClick={() => deleteProduct(product.id)}>
          <Icon>delete</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <DataTable
      table={{ columns, rows }}
      isSorted={true}
      // entriesPerPage={{ defaultValue: pageSize }}
      entriesPerPage={false}
      showTotalEntries={true}
      canSearch={true}
      noEndBorder
      currentPage={currentPage}
      // // onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
