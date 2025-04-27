import React from "react";
import PropTypes from "prop-types";

export const InvoicePrint = React.forwardRef(({ invoice }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "auto",
        border: "1px solid #ddd",
        paddingBottom: "30px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>INVOICE</h2>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>{invoice?.response.name}</p>
      </div>

      {/* Customer & Date Section */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Customer:</strong> {invoice?.response.customer.name}
        </p>
        <p>
          <strong>Date:</strong> {new Date(invoice?.response.date).toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={tableHeaderStyle}>Product</th>
            <th style={tableHeaderStyle}>Quantity</th>
            <th style={tableHeaderStyle}>Unit Price</th>
            <th style={tableHeaderStyle}>Tax</th>
            <th style={tableHeaderStyle}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(invoice?.response.stock_moves || []).map((item, index) => (
            <tr key={index}>
              <td style={tableCellStyle}>
                {item.purchase_detail?.product?.name || item.product?.name || "Unknown"}
              </td>
              <td style={tableCellStyle}>{item.quantity}</td>
              <td style={tableCellStyle}>Rp {item.price.toLocaleString("id-ID")}</td>
              <td style={tableCellStyle}>{item.tax ? item.tax : 0} %</td>
              <td style={{ ...tableCellStyle, textAlign: "right" }}>
                Rp {item.subtotal.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Amount */}
      <div style={{ textAlign: "right", fontSize: "18px", fontWeight: "bold" }}>
        <p>Total: Rp {invoice?.response.total.toLocaleString("id-ID")}</p>
        {/* <p>Remaining Balance: Rp {invoice?.response.residual_amount.toLocaleString("id-ID")}</p> */}
      </div>
    </div>
  );
});

// Styles
const tableHeaderStyle = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid black",
  padding: "8px",
};

InvoicePrint.propTypes = {
  invoice: PropTypes.shape({
    response: PropTypes.shape({
      name: PropTypes.string.isRequired,
      customer: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      date: PropTypes.string.isRequired,
      stock_moves: PropTypes.arrayOf(
        PropTypes.shape({
          purchase_detail: PropTypes.shape({
            product: PropTypes.shape({
              name: PropTypes.string,
            }),
          }),
          product: PropTypes.shape({
            name: PropTypes.string,
          }),
          quantity: PropTypes.number.isRequired,
          price: PropTypes.number.isRequired,
          subtotal: PropTypes.number.isRequired,
        })
      ).isRequired,
      total: PropTypes.number.isRequired,
      residual_amount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
