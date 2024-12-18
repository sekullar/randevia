import { useEffect } from "react";
import Main from "./components/Main";
import "./css/main.css";
import toast, { Toaster } from "react-hot-toast";
import { DataProvider } from "./components/Context/MainContext"; 


function App() {

  return (
    <>
      <DataProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Main />
      </DataProvider>
    </>
  );
}

export default App;
