import PreviewPurchase from "./preview/previewPurchase";
import PreviewSales from "./preview/previewSales";
import PreviewInventory from "./preview/previewInventory";
import PreviewInventoryIn from "./preview/previewInventoryIn";
import PreviewPaymentCustomer from "./preview/previewPaymentCustomer";
import PreviewPaymentVendor from "./preview/previewPaymentVendor";
import PreviewStockMove from "./preview/previewStockMove";
// import CustomerEdit from "./customerEdit";

const routes = [
  {
    type: "sub-route",
    key: "preview-purchase",
    route: "/preview-purchase",
    component: <PreviewPurchase />,
  },
  {
    type: "sub-route",
    key: "preview-sales",
    route: "/preview-sales",
    component: <PreviewSales />,
  },
  {
    type: "sub-route",
    key: "preview-inventory-in",
    route: "/preview-inventory-in",
    component: <PreviewInventoryIn />,
  },
  {
    type: "sub-route",
    key: "preview-payment-vendor",
    route: "/preview-payment-vendor",
    component: <PreviewPaymentVendor />,
  },
  {
    type: "sub-route",
    key: "preview-payment-customer",
    route: "/preview-payment-customer",
    component: <PreviewPaymentCustomer />,
  },
  {
    type: "sub-route",
    key: "preview-inventory",
    route: "/preview-inventory",
    component: <PreviewInventory />,
  },
  {
    type: "sub-route",
    key: "preview-stock-move",
    route: "/preview-stock-move",
    component: <PreviewStockMove />,
  },
];

export default routes;
