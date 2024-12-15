// import { Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
  Card,
  Icon,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

export default function CreateBookForm() {
  // State to store form inputs
  const { id } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [name, setName] = useState("");
  const [specsName, setSpecsName] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [newId, setNewId] = useState(1);

  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/product-categories/${id}`);
        const product = response.data.response;
        setName(product.name);
        setDescription(product.description);
        setSpecifications(product.specifications || []);
        console.log(product.specifications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product category:", error);
      }
    };

    fetchProductData();
  }, [id]); // Dependency array includes `id` to refetch if the ID changes

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8080/product-categories/${id}`,
        {
          name,
          description,
          specifications,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      // Handle success, e.g., show a success message or redirect
      navigate("/product-category", {
        state: { message: response.data.message, severity: "success" },
      });
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    setSpecsName("");
  };

  const handleCreate = () => {
    const newData = [...specifications, { name: specsName }];
    setSpecifications(newData);
    handleCloseWizard();
  };

  const handleEdit = (index, newValue) => {
    const updatedData = specifications.map((spec, i) =>
      i === index ? { ...spec, name: newValue } : spec
    );
    setSpecifications(updatedData); // Update the state with the modified specifications
  };

  const handleDelete = (index) => {
    const updatedData = specifications.filter((_, i) => i !== index);
    setSpecifications(updatedData);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Dialog
        open={open}
        onClose={handleCloseWizard}
        PaperProps={{
          sx: { width: "30%", maxWidth: "none" },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Add New Specifications</span>
            <IconButton aria-label="close" onClick={handleCloseWizard}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2} mt={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={specsName}
                onChange={(e) => setSpecsName(e.target.value)}
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWizard}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
      <Card sx={{ mt: 4 }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx="auto"
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          width="30%"
        >
          <MDTypography variant="h5" fontWeight="medium" color="white" mt={1}>
            Edit Product
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </MDBox>
            {/* <DataTable
              table={{ columns, rows }}
              isSorted={false}
              showTotalEntries={false}
              entriesPerPage={false}
            /> */}

            <TableContainer component={Paper}>
              {/* <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table"> */}
              <Table
                sx={({ palette: { light }, borders: { borderWidth } }) => ({
                  borderTop: `${borderWidth[1]} solid ${light.main}`,
                  minWidth: 650,
                })}
                size="small"
                aria-label="a dense table"
              >
                <MDBox component="thead">
                  <TableRow>
                    <MDBox
                      component="th"
                      width="auto"
                      py={1.5}
                      px={3}
                      sx={({ palette: { light }, borders: { borderWidth } }) => ({
                        borderBottom: `${borderWidth[1]} solid ${light.main}`,
                      })}
                    >
                      Specifications
                    </MDBox>
                    <MDBox
                      component="th"
                      width="auto"
                      py={1.5}
                      px={3}
                      sx={({ palette: { light }, borders: { borderWidth } }) => ({
                        borderBottom: `${borderWidth[1]} solid ${light.main}`,
                      })}
                    >
                      Action
                    </MDBox>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {specifications.map((specification, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <input
                          type="text"
                          value={specification.name}
                          onChange={(e) => handleEdit(index, e.target.value)}
                          style={{
                            width: "100%",
                            border: "1px solid lightgray",
                            background: "transparent",
                            outline: "none",
                            padding: "5px",
                            borderRadius: "4px",
                            cursor: "text",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <MDButton
                          variant="text"
                          color="error"
                          iconOnly
                          onClick={() => handleDelete(index)}
                        >
                          <Icon>delete</Icon>
                        </MDButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* <table className="table bordered">
              <thead>
                <tr>
                  <th>Specifications</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((specification) => (
                  <tr key={specification.id}>
                    <td>{specification.name}</td>
                    <td>{specification.name}</td>
                  </tr>
                ))}
              </tbody>
            </table> */}
            <MDButton variant="gradient" color="info" onClick={handleOpenWizard}>
              + Create
            </MDButton>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                edit
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
