// // import { createContext, useContext, useState } from "react";
// // import PropTypes from "prop-types";

// // const AuthContext = createContext();

// // export const AuthProvider = ({ children }) => {
// //   const [authToken, setAuthToken] = useState(null);

// //   return (
// //     <AuthContext.Provider value={{ authToken, setAuthToken }}>{children}</AuthContext.Provider>
// //   );
// // };

// // AuthProvider.propTypes = {
// //   children: PropTypes.node.isRequired,
// // };

// // export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useState, useEffect } from "react";
// import PropTypes from "prop-types";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);

//   useEffect(() => {
//     // Retrieve the token from localStorage when the component mounts
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       setAuthToken(token);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ authToken, setAuthToken }}>{children}</AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || null);

  useEffect(() => {
    // Listen for storage changes (another tab, login, or logout)
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setAuthToken(token);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateAuthToken = (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
    setAuthToken(token);
  };

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: updateAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
