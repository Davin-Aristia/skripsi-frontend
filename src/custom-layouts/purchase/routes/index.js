import CustomerAdd from "./customerAdd";
import CustomerEdit from "./purchaseEdit";

const routes = [
  {
    type: "sub-route",
    key: "customer-add",
    route: "/customer/add",
    component: <CustomerAdd />,
  },
  {
    type: "sub-route",
    key: "customer-edit",
    route: "/customer/:id/edit",
    component: <CustomerEdit />,
  },
];

export default routes;
