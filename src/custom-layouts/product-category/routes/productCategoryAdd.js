// import { Link } from "react-router-dom";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";

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

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useAuth } from "custom-layouts/authentication";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

export default function CreateProductCategoryForm() {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [name, setName] = useState("");
  const [specs, setSpecs] = useState([]);
  const [specsName, setSpecsName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Create a new product category object
    const newProductCategory = {
      name,
      description,
      specifications: specs,
    };

    try {
      // Send POST request to the API
      const response = await axios.post(
        "http://localhost:8080/product-categories",
        newProductCategory,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Clear the form fields after submission
      setName("");
      setDescription("");

      // Optionally refetch data or update the state to reflect the new book in the UI
      toast.success("success add new product category");
      navigate("/product-category");
    } catch (error) {
      toast.success("success add new product category");
      setError(error.response.data.message);
    }
  };

  const handleOpenWizard = () => setOpen(true);
  const handleCloseWizard = () => {
    setOpen(false);
    setSpecsName("");
  };

  const handleCreate = () => {
    const newData = [...specs, { name: specsName }];
    setSpecs(newData);
    handleCloseWizard();
  };

  const handleDelete = (index) => {
    const updatedData = specs.filter((_, i) => i !== index);
    setSpecs(updatedData);
  };

  const handleEdit = (index, newValue) => {
    const updatedSpecs = specs.map((spec, i) => (i === index ? { ...spec, name: newValue } : spec));
    setSpecs(updatedSpecs); // Update the state with the modified specifications
  };

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
            Create New Product Category
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
            {/* <DataTable table={{ columns, rows }} isSorted={false} showTotalEntries={false} /> */}
            <h3 style={{ padding: "40px 0px 15px 0px" }}>Specifications</h3>
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    {/* <Table
                      sx={({ palette: { light }, borders: { borderWidth } }) => ({
                        borderTop: `${borderWidth[1]} solid ${light.main}`,
                        minWidth: 650,
                      })}
                      size="small"
                      aria-label="a dense table"
                    > */}
                    <MDBox component="thead">
                      <TableRow>
                        <MDBox
                          component="th"
                          width="auto"
                          py={1.5}
                          px={3}
                          sx={({ palette: { light }, borders: { borderWidth } }) => ({
                            borderBottom: `${borderWidth[1]} solid ${light.main}`,
                            borderTop: `${borderWidth[2]} solid ${light.main}`,
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
                            borderTop: `${borderWidth[2]} solid ${light.main}`,
                          })}
                        >
                          Action
                        </MDBox>
                      </TableRow>
                    </MDBox>
                    <TableBody>
                      {specs.map((specification, index) => (
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
              </Grid>
            </Grid>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleOpenWizard}
              sx={{ marginTop: "20px" }}
            >
              add specs
            </MDButton>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                create
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
