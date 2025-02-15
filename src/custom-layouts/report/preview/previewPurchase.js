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

  return (
    <BasicLayout>
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginBottom: "5px", fontWeight: "bold" }}>Purchase Report</h2>
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
              <th width="30%">Purchase Order</th>
              <th width="20%">Date</th>
              <th width="25%">Vendor</th>
              <th width="20%" style={{ textAlign: "right" }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>{item.name}</td>
                <td style={{ textAlign: "center" }}>{formatDate(item.date)}</td>
                <td>{item.vendor}</td>
                <td style={{ textAlign: "right" }}>
                  Rp {new Intl.NumberFormat("id-ID").format(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "bold", background: "#F0F0F0" }}>
              <td colSpan="4" style={{ textAlign: "right", paddingRight: "10px" }}>
                Total
              </td>
              <td style={{ textAlign: "right" }}>
                Rp{" "}
                {new Intl.NumberFormat("id-ID").format(
                  reportData.reduce((sum, item) => sum + item.total, 0)
                )}
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
