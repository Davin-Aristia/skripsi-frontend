import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import BasicLayout from "examples/LayoutContainers/PageLayout";

const PreviewReport = () => {
  const location = useLocation();
  const { reportData, fromDate, toDate } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  const [expandedIndexes, setExpandedIndexes] = useState([]);

  const toggleRow = (index) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <BasicLayout>
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginBottom: "5px", fontWeight: "bold" }}>PaymentCustomer Report</h2>
        <p style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
          Report Period:{" "}
          <span style={{ fontWeight: "normal" }}>
            {formatDate(fromDate)} - {formatDate(toDate)}
          </span>
        </p>

        <table
          border="1"
          width="80%"
          cellPadding="8"
          style={{
            borderCollapse: "collapse",
            margin: "auto",
            fontSize: "14px",
            textAlign: "left",
            width: "80%",
          }}
        >
          <thead>
            <tr style={{ background: "#F0F0F0", fontWeight: "bold", textAlign: "center" }}>
              <th width="5%">No</th>
              <th width="30%">Payment Number</th>
              <th width="20%">Date</th>
              <th width="25%">Customer</th>
              <th width="20%" style={{ textAlign: "right" }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <React.Fragment key={index}>
                {/* Main Row */}
                <tr
                  onClick={() => toggleRow(index)}
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.name}</td>
                  <td style={{ textAlign: "center" }}>{formatDate(item.date)}</td>
                  <td>{item.customer}</td>
                  <td style={{ textAlign: "right" }}>
                    Rp{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(item.total)}
                  </td>
                </tr>

                {/* Detail Row */}
                {expandedIndexes.includes(index) && (
                  <>
                    <tr>
                      <td colSpan="5">
                        <table width="100%" style={{ marginTop: "10px", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#e0e0e0" }}>
                              <th>Inventory Number</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.details.map((detail, idx) => (
                              <tr key={idx}>
                                <td>{detail.inventory_out}</td>
                                <td>
                                  Rp{" "}
                                  {Number(detail.amount || 0).toLocaleString("id-ID", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Spacer Row */}
                    <tr>
                      <td colSpan="5" style={{ height: "10px", borderTop: "1px solid #ccc" }}></td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "bold", background: "#F0F0F0" }}>
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10px" }}>
                Total
              </td>
              <td style={{ textAlign: "right" }}>
                Rp{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(reportData.reduce((sum, item) => sum + item.total, 0))}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* <button
          onClick={handlePrint}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            border: "1px solid black",
            backgroundColor: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Print / Save as PDF
        </button> */}
      </div>
    </BasicLayout>
  );
};

export default PreviewReport;
