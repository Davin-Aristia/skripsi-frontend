// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

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
  const [specs, setSpecs] = useState([]);

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

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
        setSpecs(product.specifications);

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

    if (specs.length > 0) {
      BookUpdate.specifications = JSON.stringify(specs);
    }

    try {
      const response = await axios.put(`http://localhost:8080/products/${id}`, BookUpdate, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Handle success, e.g., show a success message or redirect
      toast.success("success update product");
      navigate("/product");
    } catch (error) {
      toast.error("failed update product");
      console.log(error.response.data.message);
    }
  };

  const handleCategoryChange = async (event, newValue) => {
    setSelectedCategory(newValue || null);

    if (newValue) {
      try {
        const response = await axios.get(`http://localhost:8080/product-categories/${newValue.id}`);
        const transformedSpecs = (response.data.response.specifications || []).map((spec) => ({
          ...spec,
          description: "", // Add the empty description key
        }));

        setSpecs(transformedSpecs);
      } catch (error) {
        console.error("Error fetching specs:", error);
        setSpecs([]);
      }
    } else {
      setSpecs([]);
    }
  };

  const handleEdit = (index, newValue) => {
    const updatedSpecs = specs.map((spec, i) =>
      i === index ? { ...spec, description: newValue } : spec
    );
    setSpecs(updatedSpecs); // Update the state with the modified specifications
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <h3 style={{ paddingBottom: "20px" }}>Product Information</h3>
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
                    py={5}
                    onChange={(e) => setName(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <Grid container spacing={2}>
                    {/* Autocomplete Field */}
                    <Grid item xs={5}>
                      <Autocomplete
                        disablePortal
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={categories}
                        getOptionLabel={(option) => option?.name || ""}
                        sx={{
                          width: 300,
                          "& .MuiInputLabel-root": {
                            lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                          },
                        }}
                        renderInput={(params) => <TextField {...params} label="Select Category" />}
                      />
                    </Grid>

                    <Grid item xs={2}></Grid>

                    {/* Price Field */}
                    <Grid item xs={5}>
                      <MDInput
                        type="number"
                        label="Price"
                        fullWidth
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Grid>
                    {specs.length > 0 && (
                      <>
                        <h3 style={{ padding: "50px 0px 15px 0px" }}>Specifications</h3>
                        <TableContainer component={Paper}>
                          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                            <MDBox component="thead">
                              <TableRow>
                                <MDBox
                                  component="th"
                                  width="auto"
                                  py={1.5}
                                  px={3}
                                  sx={({ palette: { light }, borders: { borderWidth } }) => ({
                                    borderBottom: `${borderWidth[1]} solid ${light.main}`,
                                    borderTop: `${borderWidth[2]} solid ${light.main}`,
                                  })}
                                >
                                  Specifications
                                </MDBox>
                                <MDBox
                                  component="th"
                                  width="auto"
                                  py={1.5}
                                  px={3}
                                  sx={({ palette: { light }, borders: { borderWidth } }) => ({
                                    borderBottom: `${borderWidth[1]} solid ${light.main}`,
                                    borderTop: `${borderWidth[2]} solid ${light.main}`,
                                  })}
                                >
                                  Description
                                </MDBox>
                              </TableRow>
                            </MDBox>
                            <TableBody>
                              {specs.map((specification, index) => (
                                <TableRow
                                  key={index}
                                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    {specification.name}
                                  </TableCell>
                                  <TableCell align="right">
                                    <input
                                      type="text"
                                      value={specification.description}
                                      onChange={(e) => handleEdit(index, e.target.value)}
                                      style={{
                                        width: "100%",
                                        border: "1px solid lightgray",
                                        background: "transparent",
                                        outline: "none",
                                        padding: "5px",
                                        borderRadius: "4px",
                                        cursor: "text",
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </Grid>
                </MDBox>
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}>
                <h3 style={{ paddingBottom: "20px" }}>Stock Information</h3>
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
              </Grid>
            </Grid>
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
