/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useState, useEffect } from "react";

// react-router-dom components
import { useLocation, NavLink, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const navigate = useNavigate();
  const [openStates, setOpenStates] = useState({});

  const handleClick = (key) => {
    setOpenStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  // const collapseName = location.pathname.replace("/", "");

  useEffect(() => {
    // Loop through all routes and check if any sub-item route matches the current pathname
    routes.forEach(({ key, collapse }) => {
      if (collapse) {
        const isAnyActive = collapse.some(
          (subItem) =>
            location.pathname === subItem.route || location.pathname.startsWith(`${subItem.route}/`)
        );

        if (isAnyActive) {
          setOpenStates((prev) => ({
            ...prev,
            [key]: true, // Open the parent menu if any sub-item is active
          }));
        }
      }
    });
  }, [location.pathname, routes]);

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/sign-in"); // Redirect to sign-in page
  };

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  // const renderRoutes = routes.map(
  // function renderRoutes(routes) {
  // const renderRoutes = routes.map(
  //   ({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
  //     let returnValue;

  //     if (type === "collapse") {
  //       console.log("routess", routes);
  //       // returnValue = href ? (
  //       //   <Link
  //       //     href={href}
  //       //     key={key}
  //       //     target="_blank"
  //       //     rel="noreferrer"
  //       //     sx={{ textDecoration: "none" }}
  //       //   >
  //       //     <SidenavCollapse
  //       //       name={name}
  //       //       icon={icon}
  //       //       active={key === collapseName}
  //       //       noCollapse={noCollapse}
  //       //     />
  //       //   </Link>
  //       // ) : (
  //       //   <NavLink key={key} to={route}>
  //       //     <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
  //       //   </NavLink>
  //       // );
  //       if (href) {
  //         returnValue = (
  //           <Link
  //             href={href}
  //             key={key}
  //             target="_blank"
  //             rel="noreferrer"
  //             sx={{ textDecoration: "none" }}
  //           >
  //             <SidenavCollapse
  //               name={name}
  //               icon={icon}
  //               active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
  //               // active={key === collapseName}
  //               noCollapse={noCollapse}
  //             />
  //           </Link>
  //         );
  //       } else if (!collapse) {
  //         returnValue = (
  //           <NavLink key={key} to={route}>
  //             <SidenavCollapse
  //               name={name}
  //               icon={icon}
  //               active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
  //             />
  //           </NavLink>
  //         );
  //       } else {
  //         // const [open, setOpen] = useState(false);
  //         // const handleClick = () => setOpen(!open);

  //         returnValue = (
  //           <React.Fragment key={key}>
  //             {/* <ListItemText primary={name} onClick={handleClick} style={{ cursor: "pointer" }}> */}
  //             <SidenavCollapse
  //               name={name}
  //               icon={icon}
  //               active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
  //               onClick={handleClick(key)}
  //               hasChild={true}
  //             />
  //             {/* </ListItemText> */}
  //             <Collapse in={openStates[key]} timeout="auto" unmountOnExit>
  //               <List component="div" disablePadding>
  //                 {/* {renderRoutes(collapse)} Recursively render nested routes */}
  //                 {/* <NavLink key={key} to={route}>
  //                   <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
  //                 </NavLink>
  //                 <NavLink key={key} to={route}>
  //                   <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
  //                 </NavLink> */}

  //                 {collapse.map((subItem) => {
  //                   const {
  //                     type,
  //                     name: subName,
  //                     icon: subIcon,
  //                     key: subKey,
  //                     route,
  //                     title,
  //                   } = subItem;

  //                   // Render based on the type of the sub-item
  //                   if (type === "collapse") {
  //                     return (
  //                       <NavLink key={subKey} to={route}>
  //                         {/* <ListItemButton sx={{ pl: 4, mt: -2, mb: -2 }}> */}
  //                         {/* <ListItemButton sx={{ pl: 4 }}> */}
  //                         <SidenavCollapse
  //                           name={subName}
  //                           icon={subIcon}
  //                           active={
  //                             location.pathname === route ||
  //                             location.pathname.startsWith(`${route}/`)
  //                           }
  //                         />
  //                         {/* </ListItemButton> */}
  //                       </NavLink>
  //                     );
  //                   } else if (type === "title") {
  //                     return (
  //                       <MDTypography
  //                         key={subKey}
  //                         color={textColor}
  //                         display="block"
  //                         variant="caption"
  //                         fontWeight="bold"
  //                         textTransform="uppercase"
  //                         pl={3}
  //                         mt={2}
  //                         mb={1}
  //                         ml={4}
  //                       >
  //                         {title}
  //                       </MDTypography>
  //                     );
  //                   }

  //                   // Handle other types if needed
  //                   return null;
  //                 })}
  //               </List>
  //             </Collapse>
  //           </React.Fragment>
  //         );
  //       }
  //     } else if (type === "title") {
  //       returnValue = (
  //         <MDTypography
  //           key={key}
  //           color={textColor}
  //           display="block"
  //           variant="caption"
  //           fontWeight="bold"
  //           textTransform="uppercase"
  //           pl={3}
  //           mt={2}
  //           mb={1}
  //           ml={1}
  //         >
  //           {title}
  //         </MDTypography>
  //       );
  //     } else if (type === "divider") {
  //       returnValue = (
  //         <Divider
  //           key={key}
  //           light={
  //             (!darkMode && !whiteSidenav && !transparentSidenav) ||
  //             (darkMode && !transparentSidenav && whiteSidenav)
  //           }
  //         />
  //       );
  //     }

  //     console.log("returnValue", returnValue);
  //     return returnValue;
  //   }
  // );

  const renderRoutes = routes.map(
    ({ type, name, icon, title, noCollapse, key, href, route, collapse }) => {
      let returnValue;

      if (type === "collapse") {
        if (href) {
          returnValue = (
            <Link
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
                noCollapse={noCollapse}
              />
            </Link>
          );
        } else if (!collapse) {
          returnValue = (
            <NavLink key={key} to={route}>
              <SidenavCollapse
                name={name}
                icon={icon}
                active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
              />
            </NavLink>
          );
        } else {
          returnValue = (
            <React.Fragment key={key}>
              <SidenavCollapse
                name={name}
                icon={icon}
                active={location.pathname === route || location.pathname.startsWith(`${route}/`)}
                onClick={() => handleClick(key)}
                hasChild={true}
                open={openStates[key] || false}
              />
              <Collapse in={openStates[key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {collapse.map((subItem) => {
                    const {
                      type,
                      name: subName,
                      icon: subIcon,
                      key: subKey,
                      route,
                      title,
                    } = subItem;

                    if (type === "collapse") {
                      return (
                        <NavLink key={subKey} to={route}>
                          <SidenavCollapse
                            name={subName}
                            icon={subIcon}
                            active={
                              location.pathname === route ||
                              location.pathname.startsWith(`${route}/`)
                            }
                          />
                        </NavLink>
                      );
                    } else if (type === "title") {
                      return (
                        <MDTypography
                          key={subKey}
                          color={textColor}
                          display="block"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="uppercase"
                          pl={3}
                          mt={2}
                          mb={1}
                          ml={4}
                        >
                          {title}
                        </MDTypography>
                      );
                    }

                    return null;
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox
          component={NavLink}
          to="/"
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            display="flex"
            justifyContent="center"
            textAlign="center"
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
      <MDBox p={2} mt="auto">
        {/* <MDButton
          component="a"
          href="https://www.creative-tim.com/product/material-dashboard-pro-react"
          target="_blank"
          rel="noreferrer"
          variant="gradient"
          color={sidenavColor}
          fullWidth
        >
          sign out
        </MDButton> */}
        <MDButton
          component="button"
          variant="contained"
          color="error"
          fullWidth
          onClick={handleSignOut}
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            paddingY: 1.5,
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#c62828", // Darker red on hover
              boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
            },
          }}
        >
          Sign Out
        </MDButton>
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
