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
  InputAdornment,
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

export default function CreateInventoryInForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { id } = useParams();

  const initialInventoryInState = {
    date: "",
    dueDate: null,
    billDate: null,
    billNumber: "",
    deliveryNumber: "",
    selectedPurchase: {},
    selectedVendor: {},
    consignment: false,
    total: 0,
  };
  const initialDetailWizard = {
    product: {},
    quantity: null,
    price: null,
    discount: null,
    tax: null,
    subtotal: 0,
  };
  const [inventoryIn, setInventoryIn] = useState(initialInventoryInState);
  const [details, setDetails] = useState([]);
  const [detailWizard, setDetailWizard] = useState(initialDetailWizard);
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [open, setOpen] = useState(false);
  const [openBillReceiptWizard, setOpenBillReceiptWizard] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch both purchases and products simultaneously
        const [purchasesResponse, productsResponse, vendorsResponse] = await Promise.all([
          API.get(`/purchases`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get(`/products`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get(`/vendors`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        // Extract the data from the responses
        const purchases = purchasesResponse.data.response.filter(
          (purchase) => purchase.status !== "done"
        );
        const products = productsResponse.data.response;
        const vendors = vendorsResponse.data.response;

        // Set the state with fetched data
        setPurchases(purchases);
        setProducts(products);
        setVendors(vendors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`/inventory-ins/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const inventoryIn = response.data.response;
        setInventoryIn({
          name: inventoryIn.name,
          date: convertToLocalDate(inventoryIn.date),
          dueDate: convertToLocalDate(inventoryIn.due_date),
          billDate: convertToLocalDate(inventoryIn.bill_date),
          billNumber: inventoryIn.bill_number,
          deliveryNumber: inventoryIn.delivery_number,
          selectedPurchase: inventoryIn.purchase_object,
          vendor: inventoryIn.purchase_object.vendor,
          selectedVendor: inventoryIn.vendor,
          total: 0,
          consignment: inventoryIn.purchase_id ? false : true,
          createdAt: convertToLocalDate(inventoryIn.created_at),
          updatedAt: convertToLocalDate(inventoryIn.updated_at),
        });
        const transformedDetails = (inventoryIn.stock_moves || []).map((detail) => ({
          id: detail.purchase_detail_id,
          product: detail.product,
          quantity: detail.quantity || null,
          receipt_quantity:
            detail.purchase_detail.quantity -
              detail.purchase_detail.receipt_quantity +
              detail.quantity || null,
          price: detail.price || null,
          discount: detail.discount || null,
          tax: detail.tax || null,
          subtotal: calculateSubtotal(
            detail.purchase_detail.quantity -
              detail.purchase_detail.receipt_quantity +
              detail.quantity,
            detail.price,
            detail.discount,
            detail.tax
          ),
        }));

        setPurchases((prevPurchases) => {
          const exists = prevPurchases.some((p) => p.id === inventoryIn.purchase_object.id);
          if (!exists) {
            return [...prevPurchases, inventoryIn.purchase_object];
          }
          return prevPurchases;
        });

        setDetails(transformedDetails);

        if (inventoryIn.purchase_id) {
          const purchaseResponse = await API.get(`/purchases/${inventoryIn.purchase_object.id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const purchaseDetails = purchaseResponse.data.response.details || [];

          const availableRows = purchaseDetails
            .filter((detail) => detail.quantity - detail.receipt_quantity > 0)
            .map((detail) => ({
              ...detail,
              product_name: detail.product?.name || "Unknown Product",
              receipt_quantity: detail.quantity - detail.receipt_quantity,
            }))
            .filter((detail) => !transformedDetails.some((d) => d.id === detail.id)); // Exclude selected ones

          setRows(availableRows);
        }
      } catch (error) {
        console.error("Error fetching purchase:", error);
      }
    })();
  }, [id]);

  const convertToLocalDate = (utcDateString) => {
    if (utcDateString) {
      const date = new Date(utcDateString);
      const jakartaOffset = 7 * 60;
      const jakartaTime = new Date(date.getTime() + jakartaOffset * 60 * 1000);
      return jakartaTime.toISOString().split("T")[0];
    }
    return utcDateString;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newInventoryIn = {
      date: ensureDateTimeFormat(inventoryIn.date),
      due_date: ensureDateTimeFormat(inventoryIn.dueDate),
      bill_date: ensureDateTimeFormat(inventoryIn.billDate),
      bill_number: inventoryIn.billNumber,
      delivery_number: inventoryIn.deliveryNumber,
      purchase_id: inventoryIn.selectedPurchase?.id === 0 ? null : inventoryIn.selectedPurchase?.id,
      vendor_id: inventoryIn.selectedVendor.id === 0 ? null : inventoryIn.selectedVendor.id,
      total: parseFloat(inventoryIn.total),
    };

    if (details.length > 0) {
      newInventoryIn.stock_moves = details.map((item) => ({
        purchase_detail_id: item.id,
        product_id: item.product.id,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price),
        discount: parseFloat(item.discount),
        tax: parseFloat(item.tax),
        subtotal: parseFloat(item.subtotal),
      }));
    } else {
      toast.error("You must add at least one product!");
      return;
    }

    try {
      // Send POST request to the API
      const response = await API.put(`/inventory-ins/${id}`, newInventoryIn, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setInventoryIn(initialInventoryInState);
      setDetails([]);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new inventory in");
      navigate("/inventory-in");
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
    { field: "product_name", headerName: "Product", flex: 1 },
    {
      field: "receipt_quantity",
      headerName: "Quantity",
      type: "number",
      flex: 1,
    },
    {
      field: "price",
      headerName: "Unit Price",
      type: "number",
      flex: 1,
    },
    {
      field: "discount",
      headerName: "Unit Discount",
      type: "number",
      flex: 1,
    },
    {
      field: "tax",
      headerName: "PPN",
      type: "number",
      flex: 1,
      valueFormatter: (params) => `${params} %`,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      type: "number",
      flex: 1,
    },
  ];
  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    setDetailWizard(initialDetailWizard);
  };

  const calculateSubtotal = (quantity, price, discount, tax) => {
    const qty = parseFloat(quantity) || 0;
    const unitPrice = parseFloat(price) || 0;
    const disc = parseFloat(discount) || 0;
    const taxPercentage = parseFloat(tax) || 0;

    // Calculate subtotal with tax as a percentage
    const subtotal = qty * (unitPrice - disc) * (1 + taxPercentage / 100);
    return parseFloat(subtotal.toFixed(2));
  };

  // const handleSelect = () => {
  //   const subtotal = calculateSubtotal(detailWizard.quantity, detailWizard.price, detailWizard.tax);
  //   const newDetail = { ...detailWizard, subtotal };
  //   setDetails([...details, newDetail]);
  //   handleCloseWizard();
  // };

  // const handleDelete = (index) => {
  //   const updatedData = details.filter((_, i) => i !== index);
  //   setDetails(updatedData);
  // };

  const handleDelete = (index) => {
    setDetails((prevDetails) => {
      const deletedItem = {
        ...prevDetails[index],
        product_name: prevDetails[index].product?.name || "Unknown Product",
        subtotal: calculateSubtotal(
          // (detail.quantity || 0) - (detail.receipt_quantity || 0),
          prevDetails[index].receipt_quantity,
          prevDetails[index].price,
          prevDetails[index].discount,
          prevDetails[index].tax
        ),
      };
      const updatedDetails = prevDetails.filter((_, i) => i !== index);

      setRows((prevRows) => [...prevRows, deletedItem]); // Add back to rows

      return updatedDetails;
    });
  };

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
          updatedDetail.discount,
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
    setInventoryIn((prevInventoryIn) => ({ ...prevInventoryIn, total }));
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

  const setBillReceipt = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    setInventoryIn({
      ...inventoryIn,
      billDate: formData.get("billDate"),
      billNumber: formData.get("billNumber"),
    });

    // Close wizard or handle navigation
    setOpenBillReceiptWizard(false);
  };

  // const handlePurchaseChange = (event, newValue) => {
  //   setInventoryIn({ ...inventoryIn, selectedPurchase: newValue });
  //   setRows(newValue.details);
  // };

  const handlePurchaseChange = async (event, newValue) => {
    if (!newValue) return;

    try {
      const response = await API.get(`/purchases/${newValue.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const purchaseDetails = response.data.response.details;
      // const formattedDetails = (purchaseDetails || []) // Ensure it's always an array
      //   .filter((detail) => !details.some((d) => d.id === detail.id)) // Filter out existing ones
      //   .map((detail) => ({
      //     ...detail,
      //     product_name: detail.product?.name || "Unknown Product", // Add product_name
      //     receipt_quantity: detail.quantity - detail.receipt_quantity,
      //   }));
      const formattedDetails = purchaseDetails
        ? purchaseDetails
            .filter((detail) => detail.quantity - detail.receipt_quantity > 0)
            .map((detail) => ({
              ...detail,
              product_name: detail.product?.name || "Unknown Product",
              receipt_quantity: detail.quantity - detail.receipt_quantity,
              subtotal: calculateSubtotal(
                detail.quantity - detail.receipt_quantity,
                detail.price,
                detail.discount,
                detail.tax
              ),
            }))
        : [];

      setInventoryIn({ ...inventoryIn, selectedPurchase: newValue });
      setRows(formattedDetails);
      setDetails([]);
    } catch (error) {
      console.error("Error fetching purchase details:", error);
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
        quantity: row.receipt_quantity, // Add quantity from receipt_quantity
      })),
    ]);
    setRows((prevRows) =>
      prevRows.filter((row) => !selectedRows.some((selected) => selected.id === row.id))
    );
    handleCloseWizard();
  };

  const handleDateOrVendorChange = async (newDate, selectedPurchase, selectedVendor) => {
    if (!newDate || (!selectedPurchase && !selectedVendor)) return; // Ensure both values exist

    try {
      let vendor;

      if (inventoryIn.consignment) {
        vendor = selectedVendor;
      } else {
        const response = await API.get(`/vendors/${selectedPurchase.vendor_id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        vendor = response.data.response;
      }

      if (vendor?.net_term) {
        const billDate = new Date(newDate); // Convert string to Date object
        billDate.setDate(billDate.getDate() + vendor.net_term); // Add net_term days

        setInventoryIn((prev) => ({
          ...prev,
          date: newDate,
          dueDate: billDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        }));
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
    }
  };

  const handleCreate = () => {
    const subtotal = calculateSubtotal(
      detailWizard.quantity,
      detailWizard.price,
      detailWizard.discount,
      detailWizard.tax
    );
    const newDetail = { ...detailWizard, subtotal };
    setDetails([...details, newDetail]);
    handleCloseWizard();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={handleCloseWizard}
        PaperProps={{
          sx: { width: inventoryIn.consignment ? "30%" : "80%", maxWidth: "none" },
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
          {inventoryIn.consignment ? (
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              <MDBox mb={2} mt={2}>
                <Autocomplete
                  disablePortal
                  onChange={(event, newValue) =>
                    setDetailWizard({ ...detailWizard, product: newValue })
                  }
                  options={products}
                  getOptionLabel={(option) => option?.name || ""}
                  sx={{
                    "& .MuiInputLabel-root": {
                      lineHeight: "1.5",
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
                  type="number"
                  label="Discount"
                  fullWidth
                  value={detailWizard.discount}
                  onChange={(e) => setDetailWizard({ ...detailWizard, discount: e.target.value })}
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
          ) : (
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          <Button onClick={inventoryIn.consignment ? handleCreate : handleSelect}>
            {inventoryIn.consignment ? "Create" : "Select"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBillReceiptWizard}
        onClose={() => setOpenBillReceiptWizard(false)}
        PaperProps={{
          sx: { width: "30%", maxWidth: "none" },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Bill Receipt</span>
            <IconButton aria-label="close" onClick={() => setOpenBillReceiptWizard(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <MDBox component="form" role="form" onSubmit={setBillReceipt}>
          <DialogContent dividers>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="date"
                label="Bill Date"
                fullWidth
                name="billDate"
                required
                InputLabelProps={{
                  shrink: true, // Ensures label stays on top even when the input is empty
                }}
              />
            </MDBox>
            <MDBox mb={2} mt={2}>
              <MDInput type="text" label="Bill Number" fullWidth name="billNumber" />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button type="submit">Add</Button>
          </DialogActions>
        </MDBox>
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
            Edit Inventory In
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
            Create Date: {inventoryIn.createdAt || "-"}
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium" sx={{ color: "grey.600" }}>
            Last Edit: {inventoryIn.updatedAt || "-"}
          </MDTypography>
        </MDBox>
        {!inventoryIn.billDate && (
          <MDBox
            sx={{
              position: "absolute",
              top: 5, // Adjust the top spacing
              left: 15, // Align to the right
            }}
          >
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => setOpenBillReceiptWizard(true)}
              sx={{ marginTop: "20px" }}
            >
              Bill Receipt
            </MDButton>
          </MDBox>
        )}
        <MDBox pt={5} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <h3>{inventoryIn.name}</h3>
            <MDBox mb={2}>
              {inventoryIn.consignment ? (
                <Autocomplete
                  disablePortal
                  onChange={(event, newValue) => {
                    setInventoryIn((prev) => ({ ...prev, selectedVendor: newValue }));
                    handleDateOrVendorChange(
                      inventoryIn.date,
                      inventoryIn.selectedPurchase,
                      newValue
                    );
                  }}
                  value={inventoryIn.selectedVendor}
                  options={vendors}
                  getOptionLabel={(option) => option?.company || ""}
                  sx={{
                    "& .MuiInputLabel-root": {
                      lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                    },
                  }}
                  renderInput={(params) => <MDInput {...params} label="Select Vendor" required />}
                />
              ) : (
                <Autocomplete
                  disablePortal
                  onChange={(event, newValue) => {
                    handlePurchaseChange(event, newValue);
                    handleDateOrVendorChange(
                      inventoryIn.date,
                      newValue,
                      inventoryIn.selectedVendor
                    );
                  }}
                  value={inventoryIn.selectedPurchase}
                  options={purchases}
                  getOptionLabel={(option) => {
                    if (!option) return "";
                    return `${option.vendor?.company || "Unknown Vendor"} - ${option.name || ""}`;
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                    },
                  }}
                  renderInput={(params) => <MDInput {...params} label="Select Purchase" required />}
                />
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Delivery Number"
                fullWidth
                value={inventoryIn.deliveryNumber}
                py={5}
                onChange={(e) => setInventoryIn({ ...inventoryIn, deliveryNumber: e.target.value })}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="date"
                label="Date"
                fullWidth
                value={inventoryIn.date}
                required
                onChange={(e) => {
                  const newDate = e.target.value;
                  setInventoryIn((prev) => ({ ...prev, date: newDate }));
                  handleDateOrVendorChange(
                    newDate,
                    inventoryIn.selectedPurchase,
                    inventoryIn.selectedVendor
                  );
                }}
                InputLabelProps={{
                  shrink: true, // Ensures label stays on top even when the input is empty
                }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="date"
                label="Due Date"
                fullWidth
                value={inventoryIn.dueDate}
                onChange={(e) => setInventoryIn({ ...inventoryIn, dueDate: e.target.value })}
                InputLabelProps={{
                  shrink: true, // Ensures label stays on top even when the input is empty
                }}
              />
            </MDBox>
            {inventoryIn.billDate && (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <MDBox mb={2}>
                    <MDInput
                      type="date"
                      label="Bill Date"
                      fullWidth
                      value={inventoryIn.billDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setInventoryIn({ ...inventoryIn, billDate: e.target.value });
                        }
                      }}
                      InputLabelProps={{
                        shrink: true, // Ensures label stays on top even when the input is empty
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <MDBox mb={2}>
                    <MDInput
                      type="text"
                      label="Bill Number"
                      fullWidth
                      value={inventoryIn.billNumber}
                      py={5}
                      onChange={(e) =>
                        setInventoryIn({ ...inventoryIn, billNumber: e.target.value })
                      }
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={2}>
                  <MDButton
                    variant="gradient"
                    color="error"
                    fullWidth
                    type="button"
                    onClick={() => setInventoryIn({ ...inventoryIn, billDate: "", billNumber: "" })}
                  >
                    cancel bill receipt
                  </MDButton>
                </Grid>
              </Grid>
            )}
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
                      width="30%"
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
                      Max Qty
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
                      Discount
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
                      PPN
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
                        {inventoryIn.consignment ? (
                          <Autocomplete
                            disablePortal
                            value={detail.product}
                            onChange={(event, newValue) => handleEdit(index, "product", newValue)}
                            options={products}
                            getOptionLabel={(option) => option?.name || ""}
                            sx={{
                              "& .MuiInputLabel-root": {
                                lineHeight: "1.5",
                              },
                            }}
                            renderInput={(params) => <MDInput {...params} label="Select Product" />}
                          />
                        ) : (
                          detail.product.name
                        )}
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
                        {detail.receipt_quantity}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {inventoryIn.consignment ? (
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
                        ) : (
                          detail.price
                        )}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {inventoryIn.consignment ? (
                          <input
                            type="number"
                            value={detail.discount}
                            onChange={(e) => handleEdit(index, "discount", e.target.value)}
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
                        ) : (
                          detail.discount
                        )}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {inventoryIn.consignment ? (
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
                        ) : (
                          `${detail.tax} %`
                        )}
                      </TableCell>
                      <TableCell component="th" scope="row" align="right">
                        <h5>
                          {new Intl.NumberFormat("id-ID", {
                            style: "decimal",
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
                }).format(inventoryIn.total)}
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
