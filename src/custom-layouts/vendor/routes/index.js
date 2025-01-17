import VendorAdd from "./vendorAdd";
import VendorEdit from "./vendorEdit";

const routes = [
  {
    type: "sub-route",
    key: "vendor-add",
    route: "/vendor/add",
    component: <VendorAdd />,
  },
  {
    type: "sub-route",
    key: "vendor-edit",
    route: "/vendor/:id/edit",
    component: <VendorEdit />,
  },
];

export default routes;
