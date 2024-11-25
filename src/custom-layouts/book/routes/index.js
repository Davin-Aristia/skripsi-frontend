import ProductAdd from "./productAdd";
import ProductEdit from "./productEdit";

const routes = [
  {
    type: "sub-route",
    key: "product-add",
    route: "/product/add",
    component: <ProductAdd />,
  },
  {
    type: "sub-route",
    key: "product-edit",
    route: "/product/:id/edit",
    component: <ProductEdit />,
  },
];

export default routes;
