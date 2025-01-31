import PaymentCustomerAdd from "./paymentCustomerAdd";
import PaymentCustomerEdit from "./paymentCustomerEdit";

const routes = [
  {
    type: "sub-route",
    key: "customer-payment-add",
    route: "/customer-payment/add",
    component: <PaymentCustomerAdd />,
  },
  {
    type: "sub-route",
    key: "customer-payment-edit",
    route: "/customer-payment/:id/edit",
    component: <PaymentCustomerEdit />,
  },
];

export default routes;
