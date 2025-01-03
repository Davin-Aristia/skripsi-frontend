import React, { useEffect, useRef, useState } from "react";
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

function POSPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});

  const toastOptions = {
    autoClose: 1500,
    pauseOnHover: true,
  };

  const fetchCategories = async () => {
    const categoriesResult = await axios.get(`http://localhost:8080/product-categories`);
    const fetchedCategories = categoriesResult.data.response;
    setCategories(fetchedCategories);
    let selected = fetchedCategories[0];
    if (fetchedCategories.length > 0) {
      setSelectedCategory(selected);
    }
    fetchProducts(selected);
  };

  const fetchProducts = async (selected = null) => {
    setIsLoading(true);
    const result = await axios.get("http://localhost:8080/products", {
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

  const addProductToCart = async (product) => {
    // check if the adding product exist
    let findProductInCart = await cart.find((i) => {
      return i.id === product.id;
    });

    if (findProductInCart) {
      let newCart = [];
      let newItem;

      cart.forEach((cartItem) => {
        if (cartItem.id === product.id) {
          newItem = {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            totalAmount: cartItem.price * (cartItem.quantity + 1),
          };
          newCart.push(newItem);
        } else {
          newCart.push(cartItem);
        }
      });

      setCart(newCart);
      console.log("this works?");
      toast.success(`Added ${newItem.name} to cart`, toastOptions);
    } else {
      let addingProduct = {
        ...product,
        quantity: 1,
        totalAmount: product.price,
      };
      setCart([...cart, addingProduct]);
      toast(`Added ${product.name} to cart`, toastOptions);
    }
  };

  const removeProduct = async (product) => {
    const newCart = cart.filter((cartItem) => cartItem.id !== product.id);
    setCart(newCart);
  };

  const componentRef = useRef();

  const handleReactToPrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handlePrint = () => {
    handleReactToPrint();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let newTotalAmount = 0;
    cart.forEach((icart) => {
      newTotalAmount = newTotalAmount + parseInt(icart.totalAmount);
    });
    setTotalAmount(newTotalAmount);
  }, [cart]);

  const handleCategoryChange = async (event, newValue) => {
    // if (!newValue) {
    //   newValue = categories[0];
    // }
    setSelectedCategory(newValue);
    fetchProducts(newValue);
  };

  return (
    // <MainLayout>
    <DashboardLayout>
      <DashboardNavbar />
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
          <div className="table-responsive bg-dark">
            <table className="table table-responsive table-dark table-hover">
              <thead>
                <tr>
                  <td>#</td>
                  <td>Name</td>
                  <td>Price</td>
                  <td>Qty</td>
                  <td>Total</td>
                  <td>Action</td>
                </tr>
              </thead>
              <tbody>
                {cart
                  ? cart.map((cartProduct, key) => (
                      <tr key={key}>
                        <td>{cartProduct.id}</td>
                        <td>{cartProduct.name}</td>
                        <td>{cartProduct.price}</td>
                        <td>{cartProduct.quantity}</td>
                        <td>{cartProduct.totalAmount}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeProduct(cartProduct)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  : "No Item in Cart"}
              </tbody>
            </table>
            <h2 className="px-2 text-white">Total Amount: ${totalAmount}</h2>
          </div>

          <div className="mt-3">
            {totalAmount !== 0 ? (
              <div>
                <button className="btn btn-primary" onClick={handlePrint}>
                  Pay Now
                </button>
              </div>
            ) : (
              "Please add a product to the cart"
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
    // </MainLayout>
  );
}

export default POSPage;
