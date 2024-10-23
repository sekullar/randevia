import { createContext, useState } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [userDataSwip,setUserDataSwip] = useState(null);
    const [meetDataSwip,setMeetDataSwip] = useState(null);


    return (
        <DataContext.Provider value={{ userDataSwip, meetDataSwip,setUserDataSwip, setMeetDataSwip }}>
            {children}
        </DataContext.Provider>
    )

}


export {DataProvider , DataContext}


