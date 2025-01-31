import InventoryOutAdd from "./inventoryOutAdd";
import InventoryOutEdit from "./inventoryOutEdit";

const routes = [
  {
    type: "sub-route",
    key: "inventory-out-add",
    route: "/inventory-out/add",
    component: <InventoryOutAdd />,
  },
  {
    type: "sub-route",
    key: "inventory-out-edit",
    route: "/inventory-out/:id/edit",
    component: <InventoryOutEdit />,
  },
];

export default routes;
