import PurchaseAdd from "./purchaseAdd";
import PurchaseEdit from "./purchaseEdit";

const routes = [
  {
    type: "sub-route",
    key: "purchase-add",
    route: "/purchase/add",
    component: <PurchaseAdd />,
  },
  {
    type: "sub-route",
    key: "purchase-edit",
    route: "/purchase/:id/edit",
    component: <PurchaseEdit />,
  },
];

export default routes;
