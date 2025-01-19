/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Product from "custom-layouts/product";
import ProductCategory from "custom-layouts/product-category";
import Vendor from "custom-layouts/vendor";
import Customer from "custom-layouts/customer";
import Purchase from "custom-layouts/purchase";
import Billing from "layouts/billing";
// import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import PointOfSales from "custom-layouts/point-of-sales";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

//sub-route
import productRoutes from "custom-layouts/product/routes";
import productCategoryRoutes from "custom-layouts/product-category/routes";
import vendorRoutes from "custom-layouts/vendor/routes";
import customerRoutes from "custom-layouts/customer/routes";
import SignInCustom from "custom-layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  ...productRoutes,
  ...productCategoryRoutes,
  ...vendorRoutes,
  ...customerRoutes,
  // {
  //   type: "collapse",
  //   name: "Dashboard",
  //   key: "dashboard",
  //   icon: <Icon fontSize="small">dashboard</Icon>,
  //   route: "/dashboard",
  //   component: <Dashboard />,
  // },
  {
    type: "collapse",
    name: "Master Data",
    key: "master-data",
    icon: <Icon fontSize="small">source</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "Product",
        key: "product",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shopping_cart
          </Icon>
        ),
        route: "/product",
        component: <Product />,
      },
      {
        type: "collapse",
        name: "Product Category",
        key: "product-category",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            category
          </Icon>
        ),
        route: "/product-category",
        component: <ProductCategory />,
      },
      {
        type: "collapse",
        name: "Customer",
        key: "customer",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shop
          </Icon>
        ),
        route: "/customer",
        component: <Customer />,
      },
      {
        type: "collapse",
        name: "Vendor",
        key: "vendor",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            point_of_sale
          </Icon>
        ),
        route: "/vendor",
        component: <Vendor />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Transaction",
    key: "transaction",
    icon: <Icon fontSize="small">task</Icon>,
    // route: "/tables/test",
    // component: <Tables />,
    collapse: [
      {
        type: "collapse",
        name: "Purchase",
        key: "purchase",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shopping_cart
          </Icon>
        ),
        route: "/purchase",
        component: <Purchase />,
      },
      {
        type: "collapse",
        name: "Customer Payment",
        key: "customer-payment",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shop
          </Icon>
        ),
        route: "/purchase-return",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "Vendor Payment",
        key: "vendor-payment",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            assignment_return
          </Icon>
        ),
        route: "/sales-return",
        component: <Tables />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Inventory",
    key: "inventory",
    icon: <Icon fontSize="small">inventory</Icon>,
    // route: "/tables/test",
    // component: <Tables />,
    collapse: [
      {
        type: "collapse",
        name: "Inventory In",
        key: "inventory-in",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shop
          </Icon>
        ),
        route: "/purchase-return",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "Inventory Out",
        key: "inventory-out",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            assignment_return
          </Icon>
        ),
        route: "/sales-return",
        component: <Tables />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Report",
    key: "report",
    icon: <Icon fontSize="small">summarize</Icon>,
    // route: "/tables/test",
    // component: <Tables />,
    collapse: [
      {
        type: "collapse",
        name: "Purchase",
        key: "purchase-report",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            shop
          </Icon>
        ),
        route: "/purchase-return",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "Sales",
        key: "sales-report",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            assignment_return
          </Icon>
        ),
        route: "/sales-return",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "Inventory",
        key: "inventory-report",
        icon: (
          <Icon fontSize="small" style={{ marginLeft: "30px" }}>
            assignment_return
          </Icon>
        ),
        route: "/sales-return",
        component: <Tables />,
      },
    ],
  },
  // {
  //   type: "collapse",
  //   name: "Sign In Custom",
  //   key: "sign-in-custom",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/sign-in",
  //   component: <SignInCustom />,
  // },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },
  // // {
  // //   type: "collapse",
  // //   name: "RTL",
  // //   key: "rtl",
  // //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  // //   route: "/rtl",
  // //   component: <RTL />,
  // // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
  // {
  //   type: "collapse",
  //   name: "Sign In",
  //   key: "sign-in",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/authentication/sign-in",
  //   component: <SignIn />,
  // },
  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
  {
    type: "collapse",
    name: "Point of Sales",
    key: "point-of-sales",
    icon: <Icon fontSize="small">point_of_sale</Icon>,
    route: "/point-of-sales",
    component: <PointOfSales />,
  },
];

export default routes;
