import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { tr } from 'date-fns/locale'; 
import Select from 'react-select';
import DatePicker from "react-datepicker"; 
import "../css/popupMeet.css"
import "../css/loader.css";

const PopupMeet = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const meetCode = queryParams.get("meetCode");


    const [meetData, setMeetData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [selectedDate,setSelectedDate] = useState(null);
    const [clockOptions,setClockOptions] = useState("");
    const [fillCount,setFillCount] = useState();

    // SAAT KISITLAMASI
    const [excludingDateState,setExcludingDateState] = useState();
    const [excludingTime,setExcludingTime] = useState("");
    const [excludingFillCountState,setExcludingFillCountState] = useState();
    // SAAT KISITLAMASI BİTTİ

    const getMeetInfo = async () => {
        const actualMeetCode = meetCode.startsWith("allShow-") ? meetCode.split("-").pop() : meetCode;
        console.log(actualMeetCode);
        try {
            const meetRef = doc(db, "meets", actualMeetCode);
            const meetSnap = await getDoc(meetRef);
            console.log(meetSnap.data());
            setMeetData(meetSnap.data());
            setLoading(false);
        } catch (error) {
            toast.error("Veriler çekilirken bir hata oluştu");
            console.error("Veri çekme hatası:", error);
        }
    };

    const convertTimestampToTRString = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp * 1000);
        const formattedDate = new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);

        return formattedDate;
    };

    const convertTimestampToDate = (timestamp) => {
        return new Date(timestamp * 1000); 
      }
      
      const convertLongTimetoymd = (rawDate) => {
        console.log("convertLongTimetoymd - gelen rawDate:", rawDate);
    
        if (!rawDate || typeof rawDate !== "string") {
            console.error("Geçersiz tarih formatı:", rawDate);
            return null;
        }
    
        const [dateString] = rawDate.split("==FOR==");
        console.log("convertLongTimetoymd - tarih stringi:", dateString);
    
        const date = new Date(dateString);
        console.log("convertLongTimetoymd - tarih objesi:", date);
    
        if (isNaN(date.getTime())) {
            console.error("Geçersiz tarih:", dateString);
            return null;
        }
    
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 olduğu için +1 yapıyoruz
        const day = String(date.getDate()).padStart(2, '0');
    
        const formattedDate = `${year}-${month}-${day}`;
        console.log("convertLongTimetoymd - formatlı tarih:", formattedDate);
    
        return formattedDate;
    };
    
    

    

    const extractFirstPart = (rawDate) => {
        if (rawDate && typeof rawDate === 'string') {
            const firstPart = rawDate.split('==')[0];
            console.log(firstPart)
            setFillCount(firstPart)
            return firstPart;
        }
        return ""; 
    };
    
    

    const convertTimestampToymd = (timestamp) => {
        const date = new Date(timestamp * 1000); 
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        const day = date.getDate().toString().padStart(2, '0'); 
        console.log(`${year}-${month}-${day}`)
        return `${year}-${month}-${day}`; 
    }


    useEffect(() => {
        getMeetInfo();
    }, []);

    const checkIfFull = (fillCount) => {
        if (!fillCount) return false; 
        const [currentCount, maxCount] = fillCount.split("/").map(Number); 
        console.log("Bu sol değer ", currentCount," bu maks değer ", maxCount)
        console.log ("o zaman??",currentCount >= maxCount);
        return currentCount >= maxCount;
    };
    

    useEffect(() => {
        const allOptions = [
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
    
        const startHour = meetData?.meetTimeStart;
        const endHour = meetData?.meetTimeEnd;
        const excludingTimes = excludingTime || []; 
    
        if (startHour && endHour) {
            const start = new Date(`1970-01-01T${startHour}:00`);
            const end = new Date(`1970-01-01T${endHour}:00`);
    
            const filteredOptions = allOptions.filter(option => {
                const optionTime = new Date(`1970-01-01T${option.value}:00`);
    
                const isExcluded = excludingTimes.includes(option.value);
    
                if (meetData?.checkIfFull && isExcluded) {
                    return false;
                }
    
                return optionTime >= start && optionTime <= end;
            });
            console.log(filteredOptions)
            if(meetData != null){
                console.log("meetData status",meetData)
                const excludingApplyOptions = filteredOptions.filter(option => {
                    console.log("check if full",checkIfFull(fillCount))
                    console.log("meetData excluding date",meetData.excludingDate)
                    console.log("formatDate selected date falan filan", formatDate(selectedDate) === formatDate(meetData?.excludingDate))
                    console.log("control 1", formatDate(selectedDate));
                    console.log("control 2", meetData.excludingDate ? convertLongTimetoymd(meetData.excludingDate) : "Veri henüz gelmedi");
                    if (
                        meetData?.excludingDate && // Veri geldi mi kontrolü
                        checkIfFull(fillCount) && 
                        formatDate(selectedDate) === convertLongTimetoymd(meetData.excludingDate)
                    ) {
                        console.log("Tarih kontrolü başarılı");
                    
                        if (excludingTimes.includes(option.value)) {
                            console.log("Saat dilimi kapalı");
                            return false;
                        }
                    }
                    return true;
                });
                
    
                setClockOptions(excludingApplyOptions);   
            }
        }

        // VERİTABANINDAN AYIN 9 UNDA GELİRSE CONVERT LONGTIMETOYMD ONU BIR GUN EKSIK VERİYOR
    
        console.log(convertLongTimetoymd(meetData?.excludingDate));
        setExcludingTime(meetData?.excludingTime);
        setExcludingFillCountState(extractFirstPart(meetData?.excludingFillCount));
    }, [selectedDate, meetData]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
      
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arasında olduğu için +1 ekledik
        const day = String(date.getDate()).padStart(2, '0');
      
        return `${year}-${month}-${day}`;
      };
      
      
      
    
    
    useEffect(() => {
        console.log("selected date",selectedDate)
        console.log("filtered date", formatDate(selectedDate))
    }, [selectedDate])

    useEffect(() => {
        console.log(meetData)
    }, [meetData])

    return (
        <>  <div className="bg-bg-2 h-screen">
                <div className="backdrop-blur-md h-full">   
                    <div className={`${loading ? "h-full w-screen fixed justify-center flex items-center  z-40" : "hidden"}`}>
                        <div className="loader"></div>
                    </div>
                    {meetData && (
                        <div className="flex justify-center h-full w-full px-3">
                            <div className="flex flex-col justify-center  w-1/2 pt-12 gap-5">
                            <div className="shadow-2xl flex flex-col justify-between bg-special-white p-3 rounded-lg">
                                <div className="flex items-center   rounded-lg px-4 ">
                                        <img src={meetData.fileUrl} className="w-[155px]" alt="Meet Photo" />
                                        <p className="inter-500 text-lg">{meetData.meetTitle}</p>
                                    </div>
                                    <div className=" p-3 rounded-lg ">
                                        <p className="max-h-[500px] overflow-auto inter-400 pe-3 specialOverflowStyle">{meetData.meetDesc}</p>
                                    </div>
                                    <div className=" flex flex-col p-4 rounded-lg">
                                        <p className="inter-400">Toplantı kodu: {meetData.meetCode}</p>
                                        <p className="inter-400 text-xl">{convertTimestampToTRString(meetData.meetCreatedAt)} tarihinde kuruldu</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-1/2 justify-center pt-12 h-full relative popupDatepicker px-4 mb-5">
                                <div className={`shadow-2xl p-2 bg-special-white  transition-all duration-500 rounded-lg ${selectedDate ? "-translate-y-12" : ""}`}>
                                <DatePicker 
                                    locale={tr} 
                                    selected={selectedDate}  
                                    minDate={convertTimestampToDate(meetData.meetStartDate.seconds)}
                                    maxDate={convertTimestampToDate(meetData.meetEndDate.seconds)}
                                    excludeDates={[convertTimestampToDate(meetData.excludingDayDate.seconds)]} 
                                    onChange={(date) => {
                                        console.log("Seçilen Tarih:", date);
                                        setSelectedDate(date);
                                    }} 
                                    className="shadow-2xl " 
                                    open={true} 
                                />

                                </div>
                                <div className={`transition-all duration-500 ease-in-out ${selectedDate ? "opacity-100 " : "opacity-0"}`}>
                                    <Select options={clockOptions}/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PopupMeet;
