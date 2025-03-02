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
import API from "custom-layouts/authentication/axiosConfig";

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

import { IconButton } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CircularProgress from "@mui/material/CircularProgress";

export default function CreateBookForm() {
  // State to store form inputs
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState(null);
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [histories, setHistories] = useState([]);
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await API.get(`/products/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const product = response.data.response;
        setName(product.name);
        setStock(product.stock);
        setMinStock(product.min_stock);
        setPrice(product.price);
        setImagePreview(product.image);
        setSpecs(product.specifications);
        setHistories(
          product.purchase_history.map((history) => ({
            date: convertToLocalDate(history.date),
            vendor: history.vendor_name,
            phone: history.vendor_phone,
            price: history.price,
          }))
        );

        const formattedCreateDate = convertToLocalDate(product.created_at);
        setCreatedAt(formattedCreateDate);
        const formattedUpdateDate = convertToLocalDate(product.updated_at);
        setUpdatedAt(formattedUpdateDate);

        const categoriesResponse = await API.get(`/product-categories`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
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

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent further submission if already submitting
    setIsSubmitting(true);

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
    } else {
      BookUpdate["image"] = imagePreview;
    }

    if (specs && specs.length > 0) {
      BookUpdate.specifications = JSON.stringify(specs);
    }

    try {
      const response = await API.put(`/products/${id}`, BookUpdate, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Handle success, e.g., show a success message or redirect
      toast.success("success update product");
      navigate("/product");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  };

  const handleCategoryChange = async (event, newValue) => {
    setSelectedCategory(newValue || null);

    if (newValue) {
      try {
        const response = await API.get(`/product-categories/${newValue.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
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

        <MDBox
          sx={{
            position: "absolute",
            top: 15, // Adjust the top spacing
            right: 10, // Align to the right
          }}
        >
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Create Date: {createdAt || "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit: {updatedAt || "-"}
          </MDTypography>
        </MDBox>
        <MDBox pt={3} pb={3} px={3}>
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
                    required
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
                        renderInput={(params) => (
                          <TextField {...params} label="Select Category" required />
                        )}
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
                        required
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Grid>
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
                    required
                    onChange={(e) => setStock(e.target.value)}
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="MinStock"
                    fullWidth
                    value={minStock === null ? "" : minStock} // Ensure null is displayed as an empty field
                    onChange={(e) =>
                      setMinStock(e.target.value ? parseInt(e.target.value, 10) : null)
                    }
                  />
                </MDBox>
              </Grid>
            </Grid>
            <Grid container spacing={8}>
              {specs && specs.length > 0 && (
                <Grid item xs={6}>
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
                </Grid>
              )}
              <Grid item xs={6}>
                {histories && histories.length > 0 && (
                  <>
                    <h3 style={{ padding: "50px 0px 15px 0px" }}>Purchase History</h3>
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
                              Date
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
                              Vendor
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
                              Price
                            </MDBox>
                            <MDBox
                              component="th"
                              width="auto"
                              py={1.5}
                              px={3}
                              sx={({ palette: { light }, borders: { borderWidth } }) => ({
                                borderBottom: `${borderWidth[1]} solid ${light.main}`,
                                borderTop: `${borderWidth[2]} solid ${light.main}`,
                                textAlign: "center",
                              })}
                            >
                              Chat
                            </MDBox>
                          </TableRow>
                        </MDBox>
                        <TableBody>
                          {histories.map((history, index) => (
                            <TableRow
                              key={index}
                              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                              <TableCell component="th" scope="row">
                                {history.date}
                              </TableCell>
                              <TableCell align="left">{history.vendor}</TableCell>
                              <TableCell align="right">
                                Rp{" "}
                                {new Intl.NumberFormat("id-ID", {
                                  style: "decimal",
                                }).format(history.price)}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="success"
                                  onClick={() => {
                                    const message = encodeURIComponent(
                                      `Halo, saya ingin membeli produk ${name}, apakah tersedia?`
                                    );
                                    const whatsappUrl = `https://wa.me/${history.phone}?text=${message}`;
                                    window.open(whatsappUrl, "_blank"); // Open in a new tab
                                  }}
                                >
                                  <WhatsAppIcon sx={{ color: "#007bff" }} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Grid>
            </Grid>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Edit"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
