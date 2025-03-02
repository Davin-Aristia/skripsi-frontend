import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import MainLayout from "../layouts/MainLayout";
import axios from "axios";
import { toast } from "react-toastify";
import { ComponentToPrint } from "printout/Checkout";
import { useReactToPrint } from "react-to-print";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { useAuth } from "custom-layouts/authentication";
import API from "custom-layouts/authentication/axiosConfig";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Select,
  MenuItem,
  TextField,
  FormControl,
  Typography,
  Icon,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function POSPage() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [consignment, setConsignment] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [consignmentTotal, setConsignmentTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [selectedCustomers, setSelectedCustomer] = useState({});
  const [selectedVendors, setSelectedVendor] = useState({});

  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [payAmount, setPayAmount] = useState(0);

  const toastOptions = {
    autoClose: 1500,
    pauseOnHover: true,
  };

  // const fetchCategories = async () => {
  //   const categoriesResult = await API.get(`/product-categories`);
  //   const fetchedCategories = categoriesResult.data.response;
  //   setCategories(fetchedCategories);
  //   let selected = fetchedCategories[0];
  //   if (fetchedCategories.length > 0) {
  //     setSelectedCategory(selected);
  //   }
  //   fetchProducts(selected);
  // };

  const fetchProducts = async (selected = null) => {
    setIsLoading(true);
    const result = await API.get("/products", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        category: selected ? selected.id : selectedCategory?.id,
      },
    });
    setProducts(await result.data.response);
    // const result = [
    //   {
    //     id: 123,
    //     name: "orange",
    //     price: "2",
    //     image: "https://cdn.pixabay.com/photo/2017/01/20/15/06/oranges-1995056_960_720.jpg",
    //   },
    //   {
    //     id: 131,
    //     name: "Milk",
    //     price: "3",
    //     image: "https://cdn.pixabay.com/photo/2018/03/16/16/42/milk-3231772_960_720.jpg",
    //   },
    //   {
    //     id: 132,
    //     name: "Ice Cream",
    //     price: "4",
    //     image: "https://cdn.pixabay.com/photo/2016/12/26/16/09/bowl-1932375_960_720.jpg",
    //   },
    //   {
    //     id: 133,
    //     name: "Salmon",
    //     price: "10",
    //     image: "https://cdn.pixabay.com/photo/2021/01/05/23/18/salmon-5892659_960_720.jpg",
    //   },
    //   {
    //     id: 134,
    //     name: "Watermelon",
    //     price: "2",
    //     image: "https://cdn.pixabay.com/photo/2015/09/27/18/18/watermelons-961128_960_720.jpg",
    //   },
    //   {
    //     id: 173,
    //     name: "Salmon",
    //     price: "10",
    //     image: "https://cdn.pixabay.com/photo/2021/01/05/23/18/salmon-5892659_960_720.jpg",
    //   },
    //   {
    //     id: 174,
    //     name: "Watermelon",
    //     price: "2",
    //     image: "https://cdn.pixabay.com/photo/2015/09/27/18/18/watermelons-961128_960_720.jpg",
    //   },
    //   {
    //     id: 135,
    //     name: "Potato",
    //     price: "4",
    //     image: "https://cdn.pixabay.com/photo/2016/08/11/08/43/potatoes-1585060_960_720.jpg",
    //   },
    // ];
    // setProducts(result);
    setIsLoading(false);
  };

  const updateList = (list, setList, product, type) => {
    let findProduct = list.find((i) => i.id === product.id);

    if (findProduct) {
      let newList = list.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalAmount: item.price * (item.quantity + 1),
            }
          : item
      );

      setList(newList);
      toast.success(`Added ${product.name} to ${type}`, toastOptions);
    } else {
      let newItem = {
        ...product,
        quantity: 1,
        totalAmount: product.price,
      };
      setList([...list, newItem]);
      toast.success(`Added ${product.name} to ${type}`, toastOptions);
    }
  };

  const addProductToCart = (product) => {
    updateList(cart, setCart, product, "cart");
  };

  const addToConsignment = (product) => {
    updateList(consignment, setConsignment, product, "consignment");
  };

  const removeProduct = async (product) => {
    const newCart = cart.filter((cartItem) => cartItem.id !== product.id);
    setCart(newCart);
  };

  const removeProductConsignment = async (product) => {
    const newConsignment = consignment.filter(
      (consignmentItem) => consignmentItem.id !== product.id
    );
    setConsignment(newConsignment);
  };

  const componentRef = useRef();

  const handleReactToPrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handlePrint = () => {
    handleReactToPrint();
  };

  useEffect(() => {
    (async () => {
      try {
        // const [categoriesResponse, customersResponse, vendorsResponse] = await API.get(`/product-categories`);
        const [categoriesResponse, customersResponse, vendorsResponse] = await Promise.all([
          API.get("/product-categories", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get("/customers", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          API.get("/vendors", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ]);

        const fetchedCategories = categoriesResponse.data.response || [];
        const fetchedCustomer = customersResponse.data.response || [];
        const fetchedVendors = vendorsResponse.data.response || [];

        setCategories(fetchedCategories);
        setCustomers(fetchedCustomer);
        setVendors(fetchedVendors);

        let selected = fetchedCategories[0];
        if (fetchedCategories.length > 0) {
          setSelectedCategory(selected);
        }
        fetchProducts(selected);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    let newCartTotal = 0;
    let newConsignmentTotal = 0;

    cart.forEach((icart) => {
      newCartTotal += parseInt(icart.totalAmount);
    });

    consignment.forEach((iconsignment) => {
      newConsignmentTotal += parseInt(iconsignment.totalAmount);
    });

    setTotalAmount(newCartTotal);
    setPayAmount(newCartTotal);
    setConsignmentTotal(newConsignmentTotal);
  }, [cart, consignment]);

  const handleCategoryChange = async (event, newValue) => {
    // if (!newValue) {
    //   newValue = categories[0];
    // }
    setSelectedCategory(newValue);
    fetchProducts(newValue);
  };

  // const updateProduct = (list, setList, index, field, value) => {
  //   let updatedList = [...list];
  //   updatedList[index] = {
  //     ...updatedList[index],
  //     [field]: field === "price" || field === "quantity" ? parseFloat(value) || 0 : value,
  //     totalAmount: (updatedList[index].price || 0) * (updatedList[index].quantity || 0),
  //   };

  //   setList(updatedList);
  // };

  const updateProduct = (list, setList, index, field, value) => {
    let updatedList = [...list];

    // Allow empty string temporarily to prevent "032" issue
    // let newValue = value === "" ? "" : parseFloat(value) || 0;

    let newValue = parseFloat(value) || 1;
    if (newValue < 1) newValue = 1;

    updatedList[index] = {
      ...updatedList[index],
      [field]: newValue,
      totalAmount:
        (field === "price" ? newValue : updatedList[index].price || 0) *
        (field === "quantity" ? newValue : updatedList[index].quantity || 0),
    };

    setList(updatedList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newInventoryOut = {
      date: new Date().toISOString(),
      consignment: false,
      customer_id: selectedCustomers.id,
      total: parseFloat(totalAmount),
    };

    if (cart.length > 0) {
      newInventoryOut.stock_moves = cart.map((item) => ({
        product_id: item.id,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price),
        subtotal: parseFloat(item.totalAmount),
      }));
    }

    const newInventoryIn = {
      date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      vendor_id: selectedVendors.id,
      // bill_date: ensureDateTimeFormat(inventoryIn.billDate),
      // bill_number: inventoryIn.billNumber,
      // delivery_number: inventoryIn.deliveryNumber,
      // purchase_id: inventoryIn.selectedPurchase.id,
      total: parseFloat(consignmentTotal),
    };

    if (consignment.length > 0) {
      newInventoryIn.stock_moves = consignment.map((item) => ({
        product_id: item.id,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.price),
        subtotal: parseFloat(item.totalAmount),
      }));
    }

    try {
      // Send POST request to the API
      if (consignment.length > 0) {
        const consignmentResponse = await API.post("/inventory-ins", newInventoryIn, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }

      const response = await API.post("/inventory-outs", newInventoryOut, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const inventoryOut = response.data.response;

      const newPaymentCustomer = {
        date: new Date().toISOString(),
        customer_id: selectedCustomers.id,
        total: parseFloat(totalAmount),
        payment_method: paymentMethod,
        details: [
          {
            inventory_out_id: inventoryOut.id,
            amount: parseFloat(totalAmount),
          },
        ],
      };

      const paymentResponse = await API.post("/payments", newPaymentCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Clear the form fields after submission
      setCart([]);
      setConsignment([]);
      setSelectedCustomer({});
      setSelectedVendor({});
      setOpen(false);

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success checkout");
      // navigate("/point-of-sales");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.response) {
        toast.error(error.response.data.response);
      } else {
        toast.error("Something went wrong with the server");
      }
      console.log("error:", error);
    }
  };

  return (
    // <MainLayout>
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: "30%", maxWidth: "none" } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Checkout</span>
            <IconButton aria-label="close" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <MDBox component="form" role="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            {/* Payment Method (Moved to the Right) */}
            <Grid container alignItems="center" spacing={2} mb={2}>
              <Grid item xs={7}>
                <Typography variant="body1">Payment Method</Typography>
              </Grid>
              <Grid item xs={5}>
                <FormControl
                  variant="standard"
                  fullWidth
                  sx={{ textAlign: "right", minHeight: "30px" }}
                >
                  <Select
                    fullWidth
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    variant="standard"
                    sx={{
                      fontSize: "1rem", // Increase font size
                      height: "30px",
                      display: "flex",
                      justifyContent: "flex-end", // Align text to the right
                      paddingRight: "1rem",
                      "& .MuiSelect-icon": {
                        display: "block !important", // Force arrow to show
                        fontSize: "1.5rem",
                      },
                    }}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
                    <MenuItem value="debit">Debit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Payment Details */}
            {/* <Box mb={2}>
              <Typography variant="body1" fontWeight="bold">
                Payment Details
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography>Subtotal</Typography>
                <Typography>Rp. {totalAmount.toLocaleString("id-ID")}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total</Typography>
                <Typography color="primary" fontWeight="bold">
                  Rp. {totalAmount.toLocaleString("id-ID")}
                </Typography>
              </Box>
            </Box> */}

            {/* Pay Amount */}
            <Grid container alignItems="center" spacing={2} mb={2}>
              <Grid item xs={7}>
                <Typography variant="body1">Pay Amount</Typography>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  type="number"
                  value={payAmount}
                  sx={{
                    "& input": {
                      textAlign: "right",
                      paddingRight: "10px",
                      fontSize: "1.1rem",
                    },
                    "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                      {
                        WebkitAppearance: "none", // Hide default spinner
                        margin: 0,
                      },
                  }}
                  onChange={(e) => setPayAmount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </Grid>
            </Grid>

            <Box mb={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography
                  sx={{ fontWeight: "bold", color: "#000 !important", fontSize: "1.3rem" }}
                >
                  Total
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#000 !important", fontSize: "1.3rem" }}
                >
                  Rp. {totalAmount.toLocaleString("id-ID")}
                </Typography>
              </Box>
            </Box>

            {/* Change */}
            <Box>
              <Typography variant="body1">Change</Typography>
              <Typography color="error" fontWeight="bold">
                Rp. {(payAmount - totalAmount).toLocaleString("id-ID")}
              </Typography>
            </Box>
          </DialogContent>

          {/* Action Buttons */}
          <DialogActions>
            <MDButton variant="gradient" color="error" onClick={() => setOpen(false)}>
              CANCEL
            </MDButton>
            <MDButton variant="gradient" color="info" type="submit">
              CONFIRM
            </MDButton>
          </DialogActions>
        </MDBox>
      </Dialog>
      <MDBox
        component="form"
        role="form"
        onSubmit={(event) => {
          event.preventDefault(); // Prevent form submission from reloading the page
          setOpen(true); // Open the dialog
        }}
      >
        <div className="row">
          <div className="col-lg-6">
            <div className="col-lg-5 mb-4">
              <Autocomplete
                disablePortal
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={categories}
                disableClearable
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  mb: 1,
                  mt: 1,
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5", // Adjust the line height for proper vertical alignment
                  },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Category" />}
              />
            </div>
            {isLoading ? (
              "Loading"
            ) : !products ? (
              <h1 className="text-center mt-4">Product Not Found</h1>
            ) : (
              <div className="row">
                {products.map((product, key) => (
                  <div key={key} className="col-lg-4 mb-4">
                    <div
                      className="pos-item px-3 text-center border"
                      onClick={() => addProductToCart(product)}
                    >
                      <p>{product.name}</p>
                      <img src={product.image} className="img-fluid" alt={product.name} />
                      <p>${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="col-lg-6">
            <div style={{ display: "none" }}>
              <ComponentToPrint cart={cart} totalAmount={totalAmount} ref={componentRef} />
            </div>
            {consignment && consignment.length > 0 && (
              <>
                <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                  <h1 style={{ margin: 0 }}>Consignment</h1>
                  <Autocomplete
                    disablePortal
                    value={selectedVendors}
                    onChange={(e, newValue) => setSelectedVendor(newValue)}
                    options={vendors}
                    disableClearable
                    getOptionLabel={(option) => option?.company || ""}
                    sx={{
                      width: 250, // Adjust width as needed
                      "& .MuiInputLabel-root": { lineHeight: "1.5" },
                    }}
                    renderInput={(params) => <MDInput {...params} label="Select Vendor" required />}
                  />
                </MDBox>
                <div className="table-responsive bg-dark mb-5">
                  <table className="table table-responsive table-dark table-hover">
                    <thead>
                      <tr>
                        <td>Name</td>
                        <td>Price</td>
                        <td>Qty</td>
                        <td>Total</td>
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>Action</td>
                      </tr>
                    </thead>
                    <tbody>
                      {consignment
                        ? consignment.map((consignmentProduct, key) => (
                            <tr key={key}>
                              <td>{consignmentProduct.name}</td>
                              <td>
                                <input
                                  type="number"
                                  value={consignmentProduct.price}
                                  required
                                  onChange={(e) =>
                                    updateProduct(
                                      consignment,
                                      setConsignment,
                                      key,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={consignmentProduct.quantity}
                                  required
                                  onChange={(e) =>
                                    updateProduct(
                                      consignment,
                                      setConsignment,
                                      key,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="form-control"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                Rp{" "}
                                {new Intl.NumberFormat("id-ID", {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(consignmentProduct.totalAmount)}
                              </td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <MDButton
                                  variant="text"
                                  color="error"
                                  iconOnly
                                  onClick={() => removeProductConsignment(consignmentProduct)}
                                >
                                  <Icon>delete</Icon>
                                </MDButton>
                              </td>
                            </tr>
                          ))
                        : "No Item in Consignment"}
                    </tbody>
                  </table>
                  <h2 className="px-2 text-white">
                    Total: Rp{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(consignmentTotal)}
                  </h2>
                </div>
              </>
            )}
            <MDBox display="flex" alignItems="center" gap={2} mb={2}>
              <h1 style={{ margin: 0 }}>Sales</h1>
              <Autocomplete
                disablePortal
                value={selectedCustomers}
                onChange={(e, newValue) => setSelectedCustomer(newValue)}
                options={customers}
                disableClearable
                getOptionLabel={(option) => option?.name || ""}
                sx={{
                  width: 250, // Adjust width as needed
                  "& .MuiInputLabel-root": { lineHeight: "1.5" },
                }}
                renderInput={(params) => <MDInput {...params} label="Select Customer" required />}
              />
            </MDBox>

            <div className="table-responsive bg-dark">
              <table className="table table-responsive table-dark table-hover">
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Price</td>
                    <td>Qty</td>
                    <td>Total</td>
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>Action</td>
                  </tr>
                </thead>
                <tbody>
                  {cart
                    ? cart.map((cartProduct, key) => (
                        <tr key={key}>
                          <td>{cartProduct.name}</td>
                          <td>
                            <input
                              type="number"
                              value={cartProduct.price}
                              required
                              onChange={(e) =>
                                updateProduct(cart, setCart, key, "price", e.target.value)
                              }
                              className="form-control"
                              style={{ width: "100px" }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={cartProduct.quantity}
                              required
                              onChange={(e) =>
                                updateProduct(cart, setCart, key, "quantity", e.target.value)
                              }
                              className="form-control"
                              style={{ width: "100px" }}
                            />
                          </td>
                          <td>
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(cartProduct.totalAmount)}
                          </td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                            <MDButton
                              variant="text"
                              color="info"
                              iconOnly
                              onClick={() => addToConsignment(cartProduct)}
                            >
                              <Icon>shop</Icon>
                            </MDButton>
                            <MDButton
                              variant="text"
                              color="error"
                              iconOnly
                              onClick={() => removeProduct(cartProduct)}
                            >
                              <Icon>delete</Icon>
                            </MDButton>
                          </td>
                        </tr>
                      ))
                    : "No Item in Cart"}
                </tbody>
              </table>
              <h2 className="px-2 text-white">
                Total: Rp{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalAmount)}
              </h2>
            </div>

            <div className="mt-3">
              {totalAmount !== 0 ? (
                <div>
                  <MDButton variant="gradient" color="info" type="submit">
                    Check Out
                  </MDButton>
                </div>
              ) : (
                "Please add a product to the cart"
              )}
              {/* {totalAmount !== 0 ? (
                <div>
                  <button className="btn btn-primary" onClick={handlePrint}>
                    Pay Now
                  </button>
                </div>
              ) : (
                "Please add a product to the cart"
              )} */}
            </div>
          </div>
        </div>
      </MDBox>
    </DashboardLayout>
    // </MainLayout>
  );
}

export default POSPage;
