import { createContext, useState } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [userDataSwip,setUserDataSwip] = useState(null);
    const [meetDataSwip,setMeetDataSwip] = useState(null);
    const [userMeetCodeSwip,setUserMeetCodeSwip] = useState(null)


    return (
        <DataContext.Provider value={{ userDataSwip, meetDataSwip,userMeetCodeSwip, setUserDataSwip, setMeetDataSwip, setUserMeetCodeSwip }}>
            {children}
        </DataContext.Provider>
    )

}


export {DataProvider , DataContext}


