import InventoryInAdd from "./inventoryInAdd";
import InventoryInEdit from "./inventoryInEdit";

const routes = [
  {
    type: "sub-route",
    key: "inventory-in-add",
    route: "/inventory-in/add",
    component: <InventoryInAdd />,
  },
  {
    type: "sub-route",
    key: "inventory-in-edit",
    route: "/inventory-in/:id/edit",
    component: <InventoryInEdit />,
  },
];

export default routes;
