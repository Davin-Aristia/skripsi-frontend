// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import Grid from "@mui/material/Grid";
import { DataGrid } from "@mui/x-data-grid";

export default function CreatePaymentCustomerForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const initialPaymentCustomerState = {
    date: "",
    paymentMethod: null,
    selectedCustomer: {},
    total: 0,
  };
  // const initialDetailWizard = {
  //   product: {},
  //   quantity: null,
  //   price: null,
  //   tax: null,
  //   subtotal: 0,
  // };
  const [paymentCustomer, setPaymentCustomer] = useState(initialPaymentCustomerState);
  const [details, setDetails] = useState([]);
  // const [detailWizard, setDetailWizard] = useState(initialDetailWizard);
  const [customers, setCustomers] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both purchases and products simultaneously
        const [customersResponse] = await Promise.all([
          API.get(`/customers`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const customers = customersResponse.data.response;

        // Set the state with fetched data
        setCustomers(customers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPaymentCustomer = {
      date: ensureDateTimeFormat(paymentCustomer.date),
      payment_method: paymentCustomer.paymentMethod,
      customer_id: paymentCustomer.selectedCustomer.id,
      total: parseFloat(paymentCustomer.total),
    };

    if (details.length > 0) {
      newPaymentCustomer.details = details.map((item) => ({
        inventory_out_id: item.id,
        amount: parseFloat(item.amount),
      }));
    }

    try {
      // Send POST request to the API
      const response = await API.post("/payments", newPaymentCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setPaymentCustomer(initialPaymentCustomerState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new payment");
      navigate("/customer-payment");
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
    { field: "name", headerName: "Inventory Number", flex: 1 },
    {
      field: "residual_amount",
      headerName: "Residual Amount",
      type: "number",
      flex: 1,
    },
  ];
  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    // setDetailWizard(initialDetailWizard);
  };

  const handleDelete = (index) => {
    setDetails((prevDetails) => {
      const deletedItem = prevDetails[index]; // Get the deleted item
      const updatedDetails = prevDetails.filter((_, i) => i !== index);

      setRows((prevRows) => [...prevRows, deletedItem]); // Add back to rows

      return updatedDetails;
    });
  };

  const handleEdit = (index, fieldName, newValue) => {
    const updatedDetails = details.map((detail, i) => {
      if (i === index) {
        return {
          ...detail,
          [fieldName]: fieldName === "amount" ? parseFloat(newValue) || 0 : newValue,
        };
      }
      return detail;
    });

    setDetails(updatedDetails);
  };

  useEffect(() => {
    const total = details.reduce((sum, detail) => sum + (detail.amount || 0), 0);
    setPaymentCustomer((prevPaymentCustomer) => ({ ...prevPaymentCustomer, total }));
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

  // const handleCustomerChange = (event, newValue) => {
  //   setPaymentCustomer({ ...paymentCustomer, selectedPurchase: newValue });
  //   setRows(newValue.details);
  // };

  const handleCustomerChange = async (event, newValue) => {
    if (!newValue) return;

    try {
      const response = await API.get(`/customers/${newValue.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const customerDetails = response.data.response.available_inventory;
      // const formattedDetails = customerDetails
      //   ? customerDetails.map((detail) => ({
      //       ...detail,
      //       product_name: detail.product?.name || "Unknown Product", // Handle potential null product
      //     }))
      //   : [];

      const filteredCustomerDetails = customerDetails
        ? customerDetails.filter((detail) => detail.residual_amount > 0)
        : [];

      setPaymentCustomer({ ...paymentCustomer, selectedCustomer: newValue });
      setRows(filteredCustomerDetails);
      // console.log("formattedDetails", formattedDetails);
      setDetails([]);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const handleSelectionChange = (selectionModel) => {
    const selectedDetails = rows.filter((row) => selectionModel.includes(row.id));
    setSelectedRows(selectedDetails);
  };

  const handleSelect = () => {
    // setDetails((prevDetails) => [...prevDetails, ...selectedRows]); // Add selected rows to details
    setDetails((prevDetails) => [
      ...prevDetails,
      ...selectedRows.map((row) => ({
        ...row,
        amount: row.residual_amount, // Add quantity from receipt_quantity
      })),
    ]);
    setRows((prevRows) =>
      prevRows.filter((row) => !selectedRows.some((selected) => selected.id === row.id))
    );
    handleCloseWizard();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={handleCloseWizard}
        PaperProps={{
          sx: { width: "80%", maxWidth: "none" },
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
          <DataGrid
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableColumnSelector
            disableColumnFilter
            checkboxSelection
            onRowSelectionModelChange={handleSelectionChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          <Button onClick={handleSelect}>Select</Button>
        </DialogActions>
      </Dialog>

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
            Add New Payment
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <Autocomplete
                disablePortal
                onChange={handleCustomerChange}
                options={customers}
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Customer" required />}
              />
            </MDBox>
            <MDBox mb={2}>
              <Autocomplete
                disablePortal
                onChange={(event, newValue) =>
                  setPaymentCustomer({ ...paymentCustomer, paymentMethod: newValue?.value || null })
                }
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Credit", value: "credit" },
                  { label: "Debit", value: "debit" },
                ]}
                getOptionLabel={(option) => option?.label || ""}
                sx={{
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Payment Method" />}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="date"
                label="Date"
                fullWidth
                value={paymentCustomer.date}
                required
                onChange={(e) => setPaymentCustomer({ ...paymentCustomer, date: e.target.value })}
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
                      width="auto"
                      py={1.5}
                      px={3}
                      sx={({ palette: { light }, borders: { borderWidth } }) => ({
                        borderBottom: `${borderWidth[1]} solid ${light.main}`,
                        borderTop: `${borderWidth[2]} solid ${light.main}`,
                      })}
                    >
                      Inventory Number
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
                      Amount
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
                        {detail.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <input
                          type="number"
                          value={detail.amount}
                          required
                          onChange={(e) => handleEdit(index, "amount", e.target.value)}
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
                }).format(paymentCustomer.total)}
              </MDBox>
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
