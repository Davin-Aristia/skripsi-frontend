import PaymentVendorAdd from "./paymentVendorAdd";
import PaymentVendorEdit from "./paymentVendorEdit";

const routes = [
  {
    type: "sub-route",
    key: "vendor-payment-add",
    route: "/vendor-payment/add",
    component: <PaymentVendorAdd />,
  },
  {
    type: "sub-route",
    key: "vendor-payment-edit",
    route: "/vendor-payment/:id/edit",
    component: <PaymentVendorEdit />,
  },
];

export default routes;
