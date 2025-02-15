import PreviewPurchase from "./preview/previewPurchase";
import PreviewSales from "./preview/previewSales";
import PreviewInventory from "./preview/previewInventory";
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
    key: "preview-inventory",
    route: "/preview-inventory",
    component: <PreviewInventory />,
  },
];

export default routes;
