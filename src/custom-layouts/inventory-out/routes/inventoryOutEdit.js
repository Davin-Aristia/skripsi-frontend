// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
  Card,
  Icon,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";

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
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";

export default function CreateInventoryOutForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { id } = useParams();

  const initialInventoryOutState = {
    name: "",
    date: "",
    selectedCustomer: {},
    total: 0,
  };
  const initialDetailWizard = {
    selectedProduct: {},
    quantity: null,
    price: null,
    tax: null,
    subtotal: 0,
  };
  const [inventoryOut, setInventoryOut] = useState(initialInventoryOutState);
  const [details, setDetails] = useState([]);
  const [detailWizard, setDetailWizard] = useState(initialDetailWizard);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both customers and products simultaneously
        const [customersResponse, productsResponse] = await Promise.all([
          API.get(`/customers`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get(`/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const customers = customersResponse.data.response;
        const products = productsResponse.data.response;

        // Set the state with fetched data
        setCustomers(customers);
        setProducts(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`/inventory-outs/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const inventoryOut = response.data.response;
        setInventoryOut({
          name: inventoryOut.name,
          date: convertToLocalDate(inventoryOut.date),
          selectedCustomer: inventoryOut.customer,
          total: inventoryOut.total,
          createdAt: convertToLocalDate(inventoryOut.created_at),
          updatedAt: convertToLocalDate(inventoryOut.updated_at),
        });
        const transformedDetails = inventoryOut.stock_moves.map((detail) => ({
          selectedProduct: detail.product,
          quantity: detail.quantity || null,
          price: detail.price || null,
          tax: detail.tax || null,
          subtotal: detail.subtotal || 0,
        }));

        setDetails(transformedDetails);
      } catch (error) {
        console.error("Error fetching inventoryOut:", error);
      }
    })();
  }, [id]);

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const jakartaOffset = 7 * 60;
    const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
    return jakartaTime.toISOString().split("T")[0];
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newInventoryOut = {
      date: ensureDateTimeFormat(inventoryOut.date),
      consignment: inventoryOut.consignment,
      customer_id: inventoryOut.selectedCustomer.id,
      total: parseFloat(inventoryOut.total),
    };

    if (details.length > 0) {
      newInventoryOut.stock_moves = details.map((item) => ({
        product_id: item.selectedProduct.id,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price),
        tax: parseFloat(item.tax),
        subtotal: parseFloat(item.subtotal),
      }));
    } else {
      toast.error("You must add at least one product!");
      return;
    }

    try {
      // Send POST request to the API
      const response = await API.put(`/inventory-outs/${id}`, newInventoryOut, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setInventoryOut(initialInventoryOutState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success update new inventoryOut");
      navigate("/inventory-out");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    setDetailWizard(initialDetailWizard);
  };

  const calculateSubtotal = (quantity, price, tax) => {
    const subtotal =
      (parseFloat(quantity) || 0) * (parseFloat(price) || 0) * (1 + (parseFloat(tax) || 0) / 100);
    return parseFloat(subtotal.toFixed(2));
  };

  const handleCreate = () => {
    const subtotal = calculateSubtotal(detailWizard.quantity, detailWizard.price, detailWizard.tax);
    const newDetail = { ...detailWizard, subtotal };
    setDetails([...details, newDetail]);
    handleCloseWizard();
  };

  const handleDelete = (index) => {
    const updatedData = details.filter((_, i) => i !== index);
    setDetails(updatedData);
  };

  // const handleEdit = (index, fieldName, newValue) => {
  //   const updatedDetails = details.map((detail, i) =>
  //     i === index
  //       ? {
  //           ...detail,
  //           [fieldName]: newValue,
  //           subtotal:
  //             parseFloat(detail.quantity) * parseFloat(detail.price) + parseFloat(detail.tax),
  //         }
  //       : detail
  //   );
  //   setDetails(updatedDetails);
  //   updateTotal();
  //   console.log("detailnya:", details);
  // };

  const handleEdit = (index, fieldName, newValue) => {
    const updatedDetails = details.map((detail, i) => {
      if (i === index) {
        const updatedDetail = {
          ...detail,
          [fieldName]: newValue,
        };

        updatedDetail.subtotal = calculateSubtotal(
          updatedDetail.quantity,
          updatedDetail.price,
          updatedDetail.tax
        );

        return updatedDetail;
      }
      return detail;
    });

    setDetails(updatedDetails);
  };

  useEffect(() => {
    const total = details.reduce((sum, detail) => sum + (detail.subtotal || 0), 0);
    setInventoryOut((prevInventoryOut) => ({ ...prevInventoryOut, total }));
  }, [details]);

  const ensureDateTimeFormat = (date) => {
    // If it's just a date (YYYY-MM-DD), add default time T00:00:00Z
    if (date && date.length === 10) {
      return date + "T00:00:00Z"; // Convert to datetime format (2025-01-07 -> 2025-01-07T00:00:00Z)
    }
    if (date && date.length === 16) {
      return date + ":00Z"; // Add missing seconds (e.g., 2025-01-03T00:00 -> 2025-01-03T00:00:00Z)
    }
    // console.log("date", date);
    return date; // If it's already in datetime format (e.g., 2025-01-07T12:30)
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={handleCloseWizard}
        PaperProps={{
          sx: { width: "30%", maxWidth: "none" },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Add New Detail</span>
            <IconButton aria-label="close" onClick={handleCloseWizard}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2} mt={2}>
              <Autocomplete
                disablePortal
                onChange={(event, newValue) =>
                  setDetailWizard({ ...detailWizard, selectedProduct: newValue })
                }
                options={products}
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Product" />}
              />
            </MDBox>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="number"
                label="Quantity"
                fullWidth
                value={detailWizard.quantity}
                onChange={(e) => setDetailWizard({ ...detailWizard, quantity: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="number"
                label="Price"
                fullWidth
                value={detailWizard.price}
                onChange={(e) => setDetailWizard({ ...detailWizard, price: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="text"
                label="Tax (%)"
                fullWidth
                value={detailWizard.tax}
                onChange={(e) => {
                  let value = e.target.value;

                  // Allow only numbers and one decimal point
                  if (!/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

                  // Ensure it does not exceed 99.99
                  if (parseFloat(value) > 99.99) return;

                  setDetailWizard({ ...detailWizard, tax: value });
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mt: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="dark"
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
            Edit InventoryOut
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
            Create Date:{" "}
            {inventoryOut.createdAt
              ? new Date(inventoryOut.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit:{" "}
            {inventoryOut.updatedAt
              ? new Date(inventoryOut.updatedAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-"}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <h3>{inventoryOut.name}</h3>
            <MDBox mb={2} mt={3}>
              <Autocomplete
                disablePortal
                value={inventoryOut.selectedCustomer}
                onChange={(event, newValue) =>
                  setInventoryOut({ ...inventoryOut, selectedCustomer: newValue })
                }
                options={customers}
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Customer" />}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="date"
                label="Date"
                fullWidth
                value={inventoryOut.date}
                onChange={(e) => setInventoryOut({ ...inventoryOut, date: e.target.value })}
                InputLabelProps={{
                  shrink: true, // Ensures label stays on top even when the input is empty
                }}
              />
            </MDBox>
            {/* <DataTable table={{ columns, rows }} isSorted={false} showTotalEntries={false} /> */}
            <h3 style={{ padding: "20px 0px 15px 0px" }}>Details</h3>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                {/* <Table
                  sx={({ palette: { light }, borders: { borderWidth } }) => ({
                    borderTop: `${borderWidth[1]} solid ${light.main}`,
                    minWidth: 650,
                  })}
                  size="small"
                  aria-label="a dense table"
                > */}
                <MDBox component="thead">
                  <TableRow>
                    <MDBox
                      component="th"
                      width="35%"
                      py={1.5}
                      px={3}
                      sx={({ palette: { light }, borders: { borderWidth } }) => ({
                        borderBottom: `${borderWidth[1]} solid ${light.main}`,
                        borderTop: `${borderWidth[2]} solid ${light.main}`,
                      })}
                    >
                      Product
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
                      Quantity
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
                      Unit Price
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
                      Tax
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
                      Subtotal (Rp)
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
                      Action
                    </MDBox>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {details.map((detail, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Autocomplete
                          disablePortal
                          value={detail.selectedProduct}
                          onChange={(event, newValue) =>
                            handleEdit(index, "selectedProduct", newValue)
                          }
                          options={products}
                          getOptionLabel={(option) => option?.name || ""}
                          sx={{
                            "& .MuiInputLabel-root": {
                              lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                            },
                          }}
                          renderInput={(params) => <MDInput {...params} label="Select Product" />}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <input
                          type="number"
                          value={detail.quantity}
                          onChange={(e) => handleEdit(index, "quantity", e.target.value)}
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
                      <TableCell component="th" scope="row">
                        <input
                          type="number"
                          value={detail.price}
                          onChange={(e) => handleEdit(index, "price", e.target.value)}
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
                      <TableCell component="th" scope="row">
                        <div
                          style={{ position: "relative", display: "inline-block", width: "100%" }}
                        >
                          <input
                            type="text" // Use text type to handle proper decimal formatting
                            value={detail.tax}
                            onChange={(e) => {
                              let value = e.target.value;

                              // Allow only numbers and one decimal point
                              if (!/^\d{0,2}(\.\d{0,2})?$/.test(value)) return;

                              // Ensure it does not exceed 99.99
                              if (parseFloat(value) > 99.99) return;

                              handleEdit(index, "tax", value);
                            }}
                            required
                            style={{
                              width: "100%",
                              border: "1px solid lightgray",
                              background: "transparent",
                              outline: "none",
                              padding: "5px",
                              borderRadius: "4px",
                              cursor: "text",
                              paddingRight: "20px", // Add space for % symbol
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "gray",
                            }}
                          >
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        <h5>
                          {new Intl.NumberFormat("id-ID", {
                            style: "decimal",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(detail.subtotal)}
                        </h5>
                      </TableCell>
                      <TableCell align="center">
                        <MDButton
                          variant="text"
                          color="error"
                          iconOnly
                          onClick={() => handleDelete(index)}
                        >
                          <Icon>delete</Icon>
                        </MDButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <MDBox>
              {/* Add Details Button */}
              <MDBox display="flex" justifyContent="flex-start" mt={3}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={handleOpenWizard}
                  sx={{ marginTop: "20px" }}
                >
                  Add Details
                </MDButton>
              </MDBox>

              {/* Divider */}
              <MDBox my={3}>
                <Divider />
              </MDBox>

              {/* Total Section */}
              <MDBox
                display="flex"
                justifyContent="flex-end"
                sx={{
                  padding: "0px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                }}
              >
                Total: Rp{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(inventoryOut.total)}
              </MDBox>
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
