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
        <h2 style={{ marginBottom: "5px", fontWeight: "bold" }}>StockMove Report</h2>
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
              <th width="10%">No</th>
              <th width="50%">Product</th>
              <th width="10%">Initial</th>
              <th width="10%">In</th>
              <th width="10%">Out</th>
              <th width="10%">Last</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <React.Fragment key={index}>
                {/* summary row */}
                <tr
                  onClick={() => item.details?.length > 0 && toggleRow(index)}
                  style={{
                    cursor: item.details?.length > 0 ? "pointer" : "default",
                    fontWeight: "bold",
                    backgroundColor: item.details?.length > 0 ? undefined : "#f9f9f9",
                  }}
                >
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.product}</td>
                  <td>{item.initial}</td>
                  <td>{item.in}</td>
                  <td>{item.out}</td>
                  <td>{item.last}</td>
                </tr>

                {/* detail rows in-line, only if expanded */}
                {expandedIndexes.includes(index) && item.details?.length > 0 && (
                  <>
                    {/* Top divider only once */}
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          borderBottom: "3px solid #ccc",
                          paddingTop: "10px", // space above the border inside td
                          paddingBottom: "10px", // space below the border inside td
                        }}
                      ></td>
                    </tr>

                    {/* Render all detail rows without dividers */}
                    {item.details.map((detail, idx) => (
                      <tr key={`${index}-${idx}`} style={{ backgroundColor: "#fafafa" }}>
                        {/* No column left blank */}
                        <td colSpan={2} style={{ padding: 0, border: "none" }}>
                          <table style={{ width: "100%" }}>
                            <tbody>
                              <tr>
                                {/* Date and Name with your desired widths */}
                                <td style={{ width: "35%" }}>{formatDate(detail.date)}</td>
                                <td style={{ width: "65%" }}>{detail.name}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td>{detail.initial}</td>
                        <td>{detail.in}</td>
                        <td>{detail.out}</td>
                        <td>{detail.last}</td>
                      </tr>
                    ))}

                    {/* Bottom divider only once */}
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          borderTop: "3px solid #ccc",
                          paddingTop: "10px", // space above the border inside td
                          paddingBottom: "10px", // space below the border inside td
                        }}
                      ></td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
          {/* <tfoot>
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
          </tfoot> */}
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
