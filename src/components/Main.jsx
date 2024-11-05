import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Login from "./Login";
import Home from "./Home";
import { useNavigate, useLocation } from 'react-router-dom';
import CreateMeet from "./CreateMeet";
import AccountSettings from "./HomeComponents/AccountSettings";
import JoinMeet from "./JoinMeet";
import NotFound from "./HomeComponents/404NotFound";
import ListMeetUsers from "./ListMeetUsers";
import AdminOperations from "./AdminOperations"

const Main = () => {
  const [cookies] = useCookies(['uid']);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (cookies.uid) {
      if(location.pathname === "/"){
        navigate("/home")
      }
    } else {
      navigate("/login");
    }
  }, [cookies, navigate]); 

  useEffect(() => {
    if (
      location.pathname !== "/login" &&
      location.pathname !== "/home" &&
      location.pathname !== "/createMeet" &&
      location.pathname !== "/accountSettings" &&
      location.pathname !== "/joinMeet" &&
      location.pathname !== "/listUsers" &&
      location.pathname !== "/adminOperations" &&
      location.pathname !== "/"
    ) {
      navigate("/404NotFound");
    }
  }, [location.pathname]);
  



  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/createMeet" element={<CreateMeet />} />
      <Route path="/accountSettings" element={<AccountSettings />} />
      <Route path="/joinMeet" element={<JoinMeet />} />
      <Route path="/404NotFound" element={<NotFound />} />
      <Route path="/listUsers" element={<ListMeetUsers />} />
      <Route path="/adminOperations" element={<AdminOperations />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

export default App;
