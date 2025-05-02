import InventoryAdjustmentAdd from "./inventoryAdjustmentAdd";
import InventoryAdjustmentEdit from "./inventoryAdjustmentEdit";

const routes = [
  {
    type: "sub-route",
    key: "inventory-adjustment-add",
    route: "/inventory-adjustment/add",
    component: <InventoryAdjustmentAdd />,
  },
  {
    type: "sub-route",
    key: "inventory-adjustment-edit",
    route: "/inventory-adjustment/:id/edit",
    component: <InventoryAdjustmentEdit />,
  },
];

export default routes;
