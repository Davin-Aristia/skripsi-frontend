import React from "react";
import PropTypes from "prop-types";

export const ComponentToPrint = React.forwardRef((props, ref) => {
  const { cart, totalAmount } = props;
  return (
    <div ref={ref} className="p-5">
      <table className="table">
        <thead>
          <tr>
            <td>#</td>
            <td>Name</td>
            <td>Price</td>
            <td>Qty</td>
            <td>Total</td>
          </tr>
        </thead>
        <tbody>
          {cart
            ? cart.map((cartProduct, key) => (
                <tr key={key}>
                  <td style={{ paddingBottom: "100px" }}>{cartProduct.id}</td>
                  <td>{cartProduct.name}</td>
                  <td>{cartProduct.price}</td>
                  <td>{cartProduct.quantity}</td>
                  <td>{cartProduct.totalAmount}</td>
                </tr>
              ))
            : ""}
        </tbody>
      </table>
      <h2 className="px-2">Total Amount: ${totalAmount}</h2>
    </div>
  );
});

ComponentToPrint.propTypes = {
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      totalAmount: PropTypes.number.isRequired,
    })
  ).isRequired,
  totalAmount: PropTypes.number.isRequired,
};
