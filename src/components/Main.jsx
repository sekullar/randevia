import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Login from "./Login";
import Home from "./Home";
import Article from "./HomeComponents/Article";
import { useNavigate } from 'react-router-dom';
import CreateMeet from "./CreateMeet";

const Main = () => {
  const [cookies] = useCookies(['uid']);
  const navigate = useNavigate();

  useEffect(() => {
    if (cookies.uid) {
      
    } else {
      navigate("/login");
    }
  }, [cookies, navigate]); 

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/createMeet" element={<CreateMeet />} />
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
