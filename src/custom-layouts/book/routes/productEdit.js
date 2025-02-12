// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

export default function CreateBookForm() {
  // State to store form inputs
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/books/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const product = response.data.response;
        setTitle(product.title);
        setAuthor(product.author);
        setPrice(product.price);
        setStock(product.stock);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [id]); // Dependency array includes `id` to refetch if the ID changes

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8080/books/${id}`,
        {
          title,
          author,
          price: parseFloat(price),
          stock: parseInt(stock),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      // Handle success, e.g., show a success message or redirect
      navigate("/product", {
        state: { message: response.data.message, severity: "success" },
      });
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Card sx={{ mt: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx="auto"
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          width="30%"
        >
          <MDTypography variant="h5" fontWeight="medium" color="white" mt={1}>
            Edit Product
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Author"
                fullWidth
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Price"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Stock"
                fullWidth
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                edit
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
