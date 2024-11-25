import ProductCategoryAdd from "./productCategoryAdd";
import ProductCategoryEdit from "./productCategoryEdit";

const routes = [
  {
    type: "sub-route",
    key: "product-category-add",
    route: "/product-category/add",
    component: <ProductCategoryAdd />,
  },
  {
    type: "sub-route",
    key: "product-category-edit",
    route: "/product-category/:id/edit",
    component: <ProductCategoryEdit />,
  },
];

export default routes;
