// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// function GoogleSuccess() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get("token");

//     if (token) {
//       localStorage.setItem("token", token);
//       navigate("/dashboard");
//     } else {
//       navigate("/");
//     }
//   }, []);

//   return <h2>Signing in...</h2>;
// }

// export default GoogleSuccess;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // alert("GoogleSuccess loaded");  (removed cz it's temp part)

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // console.log("Token:", token);   (removed cz it's temp part)

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [navigate]);

  return <h2>Signing in...</h2>;
}

export default GoogleSuccess;