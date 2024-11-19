import Header from "./HomeComponents/Header"
import { useContext, useEffect, useState } from "react"
import { DataContext } from "./Context/MainContext"
import { ca, tr } from 'date-fns/locale'; 
import DatePicker from "react-datepicker"; 
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import "../css/joinMeet.css"
import { db } from '../firebase/firebase'; 
import { doc, getDoc,setDoc,getDocs,collection } from 'firebase/firestore';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const JoinMeet = () => {

    const [selectedDate,setSelectedDate] = useState("")
    const [formattedDate,setFormattedDate] = useState("")
    const [selectedTime,setSelectedTime] = useState("");


    const [excludingCountState,setExcludingCountState] = useState("");
    const [excludingCountFillState,setExcludingCountFillState] = useState("");
    const [excludingTimeState,setExcludingTimeState] = useState("");
    const [excludingDateState,setExcludingDateState] = useState("");
    const [excludingDayDateState,setExcludingDayDateState] = useState("");
    const [untilDateOkState,setUntilDateOkState] = useState("");
    const [untilDateOkValid,setUntilDateOkValid] = useState(true);
    const [userListData,setUserListData] = useState();
    const [usersValueOk,setUsersValueOk] = useState(true)
    const [usersMaxValue,setUsersMaxValue] = useState(0);

    const [loading,setLoading] = useState(false);

    const [busyTimeData,setBusyTimeData] = useState("");

    const [filteredBusyTimeData,setFilteredBusyTimeData] = useState();
    const [filteredTime,setFilteredTime] = useState("");

    const navigate = useNavigate();

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    const {userDataSwip,meetInfoTitle, meetInfoPhoto, meetInfoDesc, meetInfoStartDate, meetInfoEndDate, meetInfoStartTime,meetInfoEndTime, meetCreatedAtSwip, meetCodeSwip} = useContext(DataContext)

      const convertUnixToDate = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000); 
        }
        return null; 
    };

    useEffect(() => {
      if(excludingDayDateState != null){
      }
    }, [excludingDayDateState]) 

    function formatDateFromStringTimestamp(stringTimestamp) {
      if (!stringTimestamp) {
        return ''; 
      }
      const timestamp = Number(stringTimestamp);
      if (isNaN(timestamp) || timestamp < 0) {
        return ''; 
      }
      const date = new Date(timestamp * 1000); 
      if (date.getTime() < 0) {
        return ''; 
      }
    
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
    
      return `${year}-${month}-${day}`;
    }
    

    const getBusyTimeMeets = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "busyTimeMeets", meetCodeSwip);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBusyTimeData(docSnap.data());
        } else {
          
          const newDocData = {
            busyTimes: [], 
            createdAt: new Date(),
          };
    
          await setDoc(docRef, newDocData);
          setBusyTimeData(newDocData); 
        }
    
        setLoading(false);
      } catch (error) {
        toast.error("Toplantı verisi alınırken bir hata oluştu!");
      }
    };
    

    const parseBusyTimeData = (busyTimeData, formattedDate) => {
      if (!busyTimeData || !busyTimeData.busyTime) {
        return [];
      }
    
      const dateParts = busyTimeData.busyTime.split("//").filter(part => part);
    
      const unavailableHours = dateParts.reduce((acc, part) => {
        const [hours, date] = part.split("=FOR=");
        if (date && date.trim() === formattedDate) {
          acc.push(...hours.split(",").map(hour => `${hour}:00`));
        }
        return acc;
      }, []);
      
      return Array.from(new Set(unavailableHours)); 
    };
    
  const updateOrCreateBusyTimeMeet = async (meetCode, filteredTime, selectedDate) => {
    const docRef = doc(db, "busyTimeMeets", meetCode);

    try {
      toast.loading("Randevunuz ekleniyor...");
      const docSnap = await getDoc(docRef);

      const newBusyTimeData = `//${filteredTime}=FOR=${selectedDate}`;

      if (docSnap.exists()) {
        const currentBusyTime = docSnap.data().busyTime || "";
        const updatedBusyTime = `${currentBusyTime}${newBusyTimeData}`;
        await setDoc(docRef, { busyTime: updatedBusyTime }, { merge: true });
      } else {
        await setDoc(docRef, { busyTime: newBusyTimeData });
      }

      const meetsOkDocRef = doc(db, "meetsOk", `${cookies.uid}-${meetCodeSwip}`);
      const meetsSnap = await getDoc(meetsOkDocRef);

      if (!meetsSnap.exists()) {
        const newMeetData = {
          busyTime: filteredTime,
          name: userDataSwip.username,
          rezervationFor: selectedDate,
          uid: cookies.uid
        };
        await setDoc(meetsOkDocRef, newMeetData);
      } else {
        const currentBusyTime = meetsSnap.data().busyTime || "";
        const updatedBusyTime = `${currentBusyTime}//${filteredTime}`;

        const currentReservationFor = meetsSnap.data().rezerationFor || "";
        const updatedReservationFor = `${currentReservationFor}//${selectedDate}`;

        await setDoc(meetsOkDocRef,
          {
            busyTime: updatedBusyTime,
            rezerationFor: updatedReservationFor
          },
          { merge: true }
        );
      }

      toast.dismiss();
      toast.success("Randevunuz başarıyla eklendi");
      navigate("/home");
    } catch (error) {
      toast.error("Randevunuz eklenirken hata oluştu");
    }
  };
  
  

  const sendMeetRezervation = (meetCode,filteredTime,selectedDate) => {
    if(selectedDate == "NaN-NaN-NaN"){
      toast.error("Lütfen tarih seçin")
    }
    else{
      if(selectedTime == ""){
        toast.error("Lütfen randevu saati seçin")
      }
      else{
        setLoading(true)

        updateOrCreateBusyTimeMeet(meetCode,filteredTime,selectedDate)
        setLoading(false)
      }
    }
  }

  const getMeetsForExcluding = async () => {
    setLoading(true);
    
    const processedMeetCode = meetCodeSwip.startsWith("allShow-") 
      ? meetCodeSwip.replace("allShow-", "") 
      : meetCodeSwip;
  
    try {
      const meetRef = doc(db, 'meets', processedMeetCode); 
      const meetSnap = await getDoc(meetRef);
  
      if (meetSnap.exists()) {
        const meetData = meetSnap.data();
        setExcludingCountFillState(meetData.excludingFillCount);
        setExcludingCountState(meetData.excludingCount);
        setExcludingTimeState(meetData.excludingTime);
        setExcludingDateState(meetData.excludingDate);
        setExcludingDayDateState(meetData.excludingDayDate);
        setUntilDateOkState(meetData.untilDateOk);
        setUsersMaxValue(meetData.maxUser)
      } else {
        return null;
      }
    } catch (error) {
      toast.error("Toplantı verileri çekilirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (busyTimeData && formattedDate && meetInfoStartTime && meetInfoEndTime) {
        const unavailableHours = parseBusyTimeData(busyTimeData, formattedDate);
        const startHour = parseInt(meetInfoStartTime.split(":")[0]);
        const endHour = parseInt(meetInfoEndTime.split(":")[0]);
        const dateString = excludingDateState.split("==FOR==")[0];
        const currentDate = formatDate(dateString);
        const selectedDateString = formattedDate;  

        const options = [
            { value: "00:00", label: "00:00" },
            { value: "01:00", label: "01:00" },
            { value: "02:00", label: "02:00" },
            { value: "03:00", label: "03:00" },
            { value: "04:00", label: "04:00" },
            { value: "05:00", label: "05:00" },
            { value: "06:00", label: "06:00" },
            { value: "07:00", label: "07:00" },
            { value: "08:00", label: "08:00" },
            { value: "09:00", label: "09:00" },
            { value: "10:00", label: "10:00" },
            { value: "11:00", label: "11:00" },
            { value: "12:00", label: "12:00" },
            { value: "13:00", label: "13:00" },
            { value: "14:00", label: "14:00" },
            { value: "15:00", label: "15:00" },
            { value: "16:00", label: "16:00" },
            { value: "17:00", label: "17:00" },
            { value: "18:00", label: "18:00" },
            { value: "19:00", label: "19:00" },
            { value: "20:00", label: "20:00" },
            { value: "21:00", label: "21:00" },
            { value: "22:00", label: "22:00" },
            { value: "23:00", label: "23:00" },
        ];

        const excludingFillCount = excludingCountFillState;
        const excludingCount = excludingCountState;

        const maxParticipants = parseInt(excludingCount);
        const currentParticipants = parseInt(excludingFillCount.split("/")[0]);

        const filteredOptions = options.filter(option => {
            const hourValue = parseInt(option.value.split(":")[0]);
            const isSameDate = currentDate === selectedDateString;
            const isFull = currentParticipants === maxParticipants && excludingTimeState !== null && hourValue === parseInt(excludingTimeState.split(":")[0]);

            

            return (
                hourValue >= startHour &&
                hourValue <= endHour &&
                hourValue >= parseInt(meetInfoStartTime.split(":")[0]) && 
                hourValue <= parseInt(meetInfoEndTime.split(":")[0]) && 
                !unavailableHours.includes(option.value) &&
                !isFull 
            );
        });

        setFilteredBusyTimeData(filteredOptions);
    }
}, [busyTimeData, formattedDate, meetInfoStartTime, meetInfoEndTime]);

    useEffect(() => {
      if(untilDateOkState){
      }
    }, [untilDateOkState])    

    useEffect(() => {
      setFormattedDate(formatDate(selectedDate));
    }, [selectedDate])

    useEffect(() => {
    }, [formattedDate])

    const getHour = (time) => {
      return time.slice(0, 2); 
    }

    useEffect(() => {
      if (!untilDateOkState || !untilDateOkState.seconds) {
          return; 
      }
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      const dateToCheck = formatTimestampToDate(untilDateOkState.seconds);
      const formattedDateToCheck = new Date(dateToCheck);
      if (formattedDateToCheck <= today) {
          setUntilDateOkValid(false);
      } else {
          setUntilDateOkValid(true); 
      }
  }, [untilDateOkState]);

  const fetchMeetCodeDocs = async (meetCode) => {
    setLoading(true);
    try {
        const meetsOkRef = collection(db, "meetsOk");
        const querySnapshot = await getDocs(meetsOkRef);

        const matchingDocs = [];
        querySnapshot.forEach((doc) => {
            if (doc.id.includes(`-${meetCode}`)) { 
                matchingDocs.push({ id: doc.id, data: doc.data() });
            }
        });

        if(matchingDocs.length >= usersMaxValue){
          setUsersValueOk(false)
        }
        else{
          setUsersValueOk(true)
        }
        setUserListData(matchingDocs);
        setLoading(false);
        return matchingDocs;

    } catch (error) {
        console.error("Dokümanları çekerken hata oluştu:", error);
        toast.error("Veriler çekilirken bir hata oluştu");
        setLoading(false); 
        return [];
    }
};

useEffect(() => {
  fetchMeetCodeDocs(meetCodeSwip);
}, [usersMaxValue])
   

  function formatTimestampToDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  const unixFormatDateInTurkish = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = {
        year: "numeric",
        month: "long", 
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "Europe/Istanbul", 
        timeZoneName: "short" 
    };
    const formattedDate = new Intl.DateTimeFormat("tr-TR", options).format(date);
    return formattedDate;
};

      useEffect(() => {
        const fetchData = async () => {
            await getBusyTimeMeets(); 
            await getMeetsForExcluding(); 
        };

        fetchData();
      }, []);


      useEffect(() => {
        setFilteredTime(getHour(selectedTime))
      }, [selectedTime])


      const formatDate = (dateStr) => {
        const dateObj = new Date(dateStr);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      

      const getExcludedDates = (timestampParam) => {
        if (!timestampParam || (Array.isArray(timestampParam.seconds) && timestampParam.seconds.length === 0)) {
          return [];
        }
        if (Array.isArray(timestampParam.seconds)) {
          return timestampParam.seconds.map(date => new Date(date * 1000));
        }
        return [new Date(timestampParam.seconds * 1000)];
      };
      

    return(
        <>
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-50" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <Header />
            <div className="flex items-center p-5">
                <div className="flex flex-col gap-3">
                    <p className="inter-500 text-2xl">{meetInfoTitle}</p>
                    <img src={meetInfoPhoto} className="w-[300px]" alt="" />
                    <p className="inter-400 w-[300px] max-h-[400px] overflow-auto">{meetInfoDesc}</p>
                    <p className="inter-400">{unixFormatDateInTurkish(meetCreatedAtSwip)} tarihinde oluşturuldu.</p>
                    {meetCodeSwip == "allShow" ? 
                        <p className="inter-400">Bu toplantı herkese açık olarak paylaşılıyor</p>
                      :
                        <p className="inter-400">Toplantı kodu: {meetCodeSwip}</p>
                    }
                </div>
                {untilDateOkValid ?
                  usersValueOk ? 
                 <div className="flex flex-col w-full items-center joinMeetDatePicker">
                      <p className="inter-400 mb-4">Hangi güne randevu almak istersiniz?</p>
                      <DatePicker  className="border" selected={selectedDate} onChange={(date) => setSelectedDate(date)} locale={tr} minDate={convertUnixToDate(meetInfoStartDate)} maxDate={convertUnixToDate(meetInfoEndDate)} excludeDates={getExcludedDates(excludingDayDateState)} open="true"/>
                      <p className="my-3">Randevuyu saat kaça almak istersiniz?</p>
                      <Select options={filteredBusyTimeData} onChange={(selectedOption) => setSelectedTime(selectedOption.value)}  className="rounded-lg border outline-0 mt-2"/>
                      <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-6 py-2 inter-500 rounded-lg text-white mt-4" onClick={() => sendMeetRezervation(meetCodeSwip,filteredTime,formattedDate)}>Randevu al</button>
                  </div> 
                  :
                  <div className="flex flex-col items-center w-full">
                    <p className="text-red-500 inter-500 text-2xl">Bu randevu için maksimum üye sınırına erişildi</p>
                  </div>
                  :

                  <div className="flex flex-col items-center w-full">
                    <p className="text-red-500 inter-500 text-2xl">Bu randevu için randevu alma süresi geçti</p>
                  </div>
                }
               
            </div>
        </>
    )
}

export default JoinMeet