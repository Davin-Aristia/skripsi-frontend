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
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

import { useAuth } from "custom-layouts/authentication";

// Material Dashboard 2 React context
// import { useMaterialUIController } from "context";
import { NavLink } from "react-router-dom";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import DataTable from "examples/Tables/DataTable";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function data({ setAlert, query }) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();

  // const [controller] = useMaterialUIController();
  // const { darkMode } = controller;

  const fetchData = async () => {
    console.log("query", query);
    let link = `/books`;
    if (query) {
      link += "?title=" + query;
    }
    API.get(link)
      .then((response) => {
        setBooks(response.data.response || []);
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
    // if (newPage !== currentPage) {
    //   setCurrentPage(newPage);
    // }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const deleteBook = async (bookId) => {
    try {
      await API.delete(`/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Refresh the book list after deletion
      // setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      fetchData();

      // Check if the current page is empty after deletion
      const updatedBooks = books.filter((book) => book.id !== bookId);
      const startIndex = (currentPage - 1) * pageSize;
      const currentPageBooks = updatedBooks.slice(startIndex, startIndex + pageSize);
      if (currentPageBooks.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      setAlert({
        open: true,
        severity: "success",
        message: "Book deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting the book:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to delete the book.",
      });
    }
  };

  // const Author = ({ image, name, email }) => (
  //   <MDBox display="flex" alignItems="center" lineHeight={1}>
  //     <MDAvatar src={image} name={name} size="sm" />
  //     <MDBox ml={2} lineHeight={1}>
  //       <MDTypography display="block" variant="button" fontWeight="medium">
  //         {name}
  //       </MDTypography>
  //       <MDTypography variant="caption">{email}</MDTypography>
  //     </MDBox>
  //   </MDBox>
  // );

  // const Job = ({ title, description }) => (
  //   <MDBox lineHeight={1} textAlign="left">
  //     <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
  //       {title}
  //     </MDTypography>
  //     <MDTypography variant="caption">{description}</MDTypography>
  //   </MDBox>
  // );

  //   return {
  //     columns: [
  //       { Header: "title", accessor: "title", width: "30%", align: "left" },
  //       { Header: "author", accessor: "author", align: "left" },
  //       { Header: "price", accessor: "price", align: "center" },
  //       { Header: "stock", accessor: "stock", align: "center" },
  //       { Header: "action", accessor: "action", align: "center" },
  //     ],

  //     rows: posts.map((book) => ({
  //       author: book.author,
  //       title: book.title, // or another appropriate field
  //       stock: book.stock,
  //       price: `Rp ${new Intl.NumberFormat("id-ID", {
  //         style: "decimal",
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(book.price)}`,
  //       action: (
  //         <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
  //           <MDButton variant="text" color="dark" iconOnly="true">
  //             <Icon>edit</Icon>
  //           </MDButton>
  //           <MDButton variant="text" color="error" iconOnly="true">
  //             <Icon>delete</Icon>
  //           </MDButton>
  //         </MDBox>
  //       ),
  //     })),

  //     // rows: [
  //     //   {
  //     //     author: <Author image={team2} name="John Michael" email="john@creative-tim.com" />,
  //     //     function: <Job title="Manager" description="Organization" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         23/04/18
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       // <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //       //   Edit
  //     //       // </MDTypography>
  //     //       <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
  //     //         <MDButton variant="text" color="dark" iconOnly="true">
  //     //           <Icon>edit</Icon>
  //     //         </MDButton>
  //     //         <MDButton variant="text" color="error" iconOnly="true">
  //     //           <Icon>delete</Icon>
  //     //         </MDButton>
  //     //       </MDBox>
  //     //     ),
  //     //   },
  //     //   {
  //     //     author: <Author image={team3} name="Alexa Liras" email="alexa@creative-tim.com" />,
  //     //     function: <Job title="Programator" description="Developer" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         11/01/19
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         Edit
  //     //       </MDTypography>
  //     //     ),
  //     //   },
  //     //   {
  //     //     author: <Author image={team4} name="Laurent Perrier" email="laurent@creative-tim.com" />,
  //     //     function: <Job title="Executive" description="Projects" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         19/09/17
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         Edit
  //     //       </MDTypography>
  //     //     ),
  //     //   },
  //     //   {
  //     //     author: <Author image={team3} name="Michael Levi" email="michael@creative-tim.com" />,
  //     //     function: <Job title="Programator" description="Developer" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         24/12/08
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         Edit
  //     //       </MDTypography>
  //     //     ),
  //     //   },
  //     //   {
  //     //     author: <Author image={team3} name="Richard Gran" email="richard@creative-tim.com" />,
  //     //     function: <Job title="Manager" description="Executive" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         04/10/21
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         Edit
  //     //       </MDTypography>
  //     //     ),
  //     //   },
  //     //   {
  //     //     author: <Author image={team4} name="Miriam Eric" email="miriam@creative-tim.com" />,
  //     //     function: <Job title="Programator" description="Developer" />,
  //     //     status: (
  //     //       <MDBox ml={-1}>
  //     //         <MDBadge badgeContent="offline" color="dark" variant="gradient" size="sm" />
  //     //       </MDBox>
  //     //     ),
  //     //     employed: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         14/09/20
  //     //       </MDTypography>
  //     //     ),
  //     //     action: (
  //     //       <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
  //     //         Edit
  //     //       </MDTypography>
  //     //     ),
  //     //   },
  //     // ],
  //   };
  // }

  const columns = [
    { Header: "title", accessor: "title", width: "30%", align: "left" },
    { Header: "author", accessor: "author", align: "left" },
    { Header: "price", accessor: "price", align: "center" },
    { Header: "stock", accessor: "stock", align: "center" },
    { Header: "action", accessor: "action", align: "center" },
  ];

  const rows = books.map((book) => ({
    author: book.author,
    title: book.title, // or another appropriate field
    stock: book.stock,
    price: `Rp ${new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(book.price)}`,
    action: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <NavLink to={`/product/${book.id}/edit`} style={{ textDecoration: "none" }}>
          <MDButton variant="text" color="dark" iconOnly>
            <Icon>edit</Icon>
          </MDButton>
        </NavLink>
        <MDButton variant="text" color="error" iconOnly onClick={() => deleteBook(book.id)}>
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
      // onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
