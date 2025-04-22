// import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BasicLayout from "examples/LayoutContainers/PageLayout";

const PreviewReport = () => {
  const location = useLocation();
  const { reportData } = location.state || {};

  // const [reportData, setReportData] = useState([]);

  // useEffect(() => {
  //   const receiveMessage = (event) => {
  //     console.log("Received message:", event.data);
  //     if (event.origin !== window.location.origin) return;
  //     console.warn("Ignored message from different origin:", event.origin);
  //     setReportData(event.data.reportData);
  //   };

  //   window.addEventListener("message", receiveMessage);
  //   return () => window.removeEventListener("message", receiveMessage);
  // }, []);

  return (
    <BasicLayout>
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginBottom: "5px", fontWeight: "bold" }}>Inventory Report</h2>

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
              <th width="30%">Name</th>
              <th width="20%">Category</th>
              <th width="10%">Stock</th>
              <th width="10%">Min Stock</th>
              <th width="25%" style={{ textAlign: "right" }}>
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => {
              let rowColor = "inherit";

              if (item.min_stock == null) {
                rowColor = "#D28100"; // orange
              } else if (item.stock < item.min_stock) {
                rowColor = "red";
              }

              return (
                <tr key={index} style={{ color: rowColor }}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.name}</td>
                  <td style={{ textAlign: "center" }}>{item.category}</td>
                  <td>{item.stock}</td>
                  <td>{item.min_stock != null ? item.min_stock : "N/A"}</td>
                  <td style={{ textAlign: "right" }}>
                    Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                  </td>
                </tr>
              );
            })}
          </tbody>
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
