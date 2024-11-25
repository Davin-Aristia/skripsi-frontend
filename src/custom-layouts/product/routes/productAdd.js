// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
// import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

export default function CreateBookForm() {
  // State to store form inputs
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/product-categories`);
        const productCategories = response.data.response;
        setCategories(productCategories);
      } catch (error) {
        console.error("Error fetching product categories:", error);
      }
    };

    fetchProductData();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Create a new book object
    const newBook = {
      name,
      category_id: selectedCategory.id,
      stock: parseInt(stock, 10), // Convert stock to an integer
      min_stock: minStock,
      price: parseFloat(price), // Convert price to a number
    };

    if (selectedFile) {
      newBook["image"] = selectedFile; // `selectedFile` should be the file object from input
    }

    try {
      // Send POST request to the API
      const response = await axios.post("http://localhost:8080/products", newBook, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear the form fields after submission
      setSelectedFile(null);
      setName("");
      setStock("");
      setMinStock("");
      setPrice("");

      // Optionally refetch data or update the state to reflect the new book in the UI
      navigate("/product", {
        state: { message: response.data.message, severity: "success" },
      });
    } catch (error) {
      setError(error.response.data.message);
      console.log(error.response.data.response);
    }
  };

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
            Add New Product
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <Autocomplete
                disablePortal
                onChange={(_event, newValue) => setSelectedCategory(newValue)}
                options={categories}
                getOptionLabel={(option) => option.name}
                sx={{
                  width: 300,
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Category" />}
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
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="MinStock"
                fullWidth
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
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
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                create
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
