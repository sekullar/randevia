import { createContext, useState } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [userDataSwip,setUserDataSwip] = useState(null);
    const [meetDataSwip,setMeetDataSwip] = useState(null);
    const [userMeetCodeSwip,setUserMeetCodeSwip] = useState(null);
    const [meetInfoTitle,setMeetInfoTitle] = useState(null);
    const [meetInfoPhoto,setMeetInfoPhoto] = useState(null);
    const [meetInfoDesc,setMeetInfoDesc] = useState(null);
    const [meetInfoStartDate,setMeetInfoStartDate] = useState(null);
    const [meetInfoEndDate,setMeetInfoEndDate] = useState(null);
    const [meetInfoStartTime,setMeetInfoStartTime] = useState(null);
    const [meetInfoEndTime,setMeetInfoEndTime] = useState(null);
    const [meetCreatedAtSwip,setMeetCreatedAt] = useState(null);
    const [meetCodeSwip,setMeetCodeSwip] = useState(null);
    const [moveMeetCode,setMoveMeetCode] = useState(null)




    return (
        <DataContext.Provider value={{ userDataSwip, meetDataSwip,userMeetCodeSwip, meetInfoTitle, meetInfoPhoto, meetInfoDesc, meetInfoStartDate, meetInfoEndDate, meetInfoStartTime,meetInfoEndTime, meetCreatedAtSwip, meetCodeSwip, moveMeetCode, setUserDataSwip, setMeetDataSwip, setUserMeetCodeSwip, setMeetInfoTitle, setMeetInfoPhoto,setMeetInfoDesc,setMeetInfoStartDate,setMeetInfoEndDate,setMeetInfoStartTime,setMeetInfoEndTime,setMeetCreatedAt,setMeetCodeSwip, setMoveMeetCode}}>
            {children}
        </DataContext.Provider>
    )

}


export {DataProvider , DataContext}


