// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/products/${id}`);
        const product = response.data.response;
        setName(product.name);
        setStock(product.stock);
        setMinStock(product.min_stock);
        setPrice(product.price);
        setImagePreview(product.image);

        const categoriesResponse = await axios.get(`http://localhost:8080/product-categories`);
        const productCategories = categoriesResponse.data.response;
        setCategories(productCategories);
        setSelectedCategory(
          productCategories.find((category) => category.id === product.category_id)
        );

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

    const BookUpdate = {
      name,
      stock: parseInt(stock, 10), // Convert stock to an integer
      min_stock: minStock,
      price: parseFloat(price), // Convert price to a number
    };

    if (selectedCategory) {
      BookUpdate["category_id"] = selectedCategory.id; // `selectedFile` should be the file object from input
    }

    if (selectedFile) {
      BookUpdate["image"] = selectedFile; // `selectedFile` should be the file object from input
    }

    try {
      const response = await axios.put(`http://localhost:8080/products/${id}`, BookUpdate, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
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
              {imagePreview && (
                <MDBox mb={2}>
                  <img
                    src={imagePreview}
                    alt="Product Image"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </MDBox>
              )}
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
                value={selectedCategory}
                onChange={(_event, newValue) => setSelectedCategory(newValue)}
                options={categories}
                getOptionLabel={(option) => option.name}
                sx={{
                  width: 300,
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <TextField {...params} label="Select Category" />}
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
