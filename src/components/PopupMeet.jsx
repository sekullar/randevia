import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { getDoc, doc, setDoc,collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { tr } from 'date-fns/locale'; 
import Select from 'react-select';
import Close from "../images/mingcute--close-fill.svg"
import DatePicker from "react-datepicker"; 
import Modal from 'react-modal';
import Ok from "../images/okey.svg"
import { v4 as uuidv4 } from "uuid";
import "../css/popupMeet.css"
import "../css/loader.css";

const PopupMeet = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const meetCode = queryParams.get("meetCode");

    const navigate = useNavigate();

    const [name,setName] = useState("");
    const [mail,setMail] = useState("");
    const [phone,setPhone] = useState("");

    const [meetOkStatus,setMeetOkStatus] = useState(false);

    const [meetData, setMeetData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [selectedDate,setSelectedDate] = useState(null);
    const [clockOptions,setClockOptions] = useState("");
    const [fillCount,setFillCount] = useState();
    const [selectedTime,setSelectedTime] = useState();
    const [modalOpen,setModalOpen] = useState(false);
    const [busyTimeMeets,setBusyTimeMeets] = useState();

    // SAAT KISITLAMASI
    const [excludingDateState,setExcludingDateState] = useState();
    const [excludingTime,setExcludingTime] = useState("");
    const [excludingFillCountState,setExcludingFillCountState] = useState();
    // SAAT KISITLAMASI BİTTİ

    useEffect(() => {
        console.log(meetData)
    }, [meetData])

    const makeRezervation = () => {
        updateOrCreateBusyTimeMeet(meetCode,selectedTime,formatDate(selectedDate))
    }

    const addMeetData = async (meetCode) => {
        try {
            const docRef = doc(db, "iFrameMeets", meetCode);

            const meetCollectionRef = collection(docRef, "meets");

            const randomDocId = uuidv4();

            const meetDocRef = doc(meetCollectionRef, randomDocId);

            const data = {
            name: name,
            mail: mail,
            phoneNumber: phone,
            selectedTime: selectedTime,
            meetDate: formatDate(selectedDate),
            dateAt: new Date().toISOString(),
            meetCode: meetCode,
            };

            await setDoc(meetDocRef, data);
        } catch (error) {
          console.error("Veri eklenirken hata oluştu: ", error);
        }
      };

    const updateOrCreateBusyTimeMeet = async (meetCode, filteredTime, selectedDate) => {
        const docRef = doc(db, "busyTimeMeets", meetCode);
    
        try {
          if(selectedDate == "1970-01-01"){
            toast.error("Lütfen tarih seçiniz!")
          }
          else{
            if(selectedTime == undefined){
                toast.error("Lütfen saat seçiniz!")
            }
            else{
                    toast.loading("Randevunuz ekleniyor...");
                    const docSnap = await getDoc(docRef);
                    addMeetData(meetCode)
                    const newBusyTimeData = `//${filteredTime.value}=FOR=${selectedDate}`;
                
                    if (docSnap.exists()) {
                        const currentBusyTime = docSnap.data().busyTime || "";
                        const updatedBusyTime = `${currentBusyTime}${newBusyTimeData}`;
                        await setDoc(docRef, { busyTime: updatedBusyTime }, { merge: true });
                    } else {
                        await setDoc(docRef, { busyTime: newBusyTimeData });
                    }
                
                    const meetsOkDocRef = doc(db, "meetsOk", `guest-${name}`);
                    const meetsSnap = await getDoc(meetsOkDocRef);
                
                    if (!meetsSnap.exists()) {
                        const newMeetData = {
                        busyTime: filteredTime,
                        name: `guest-${name}`,
                        rezervationFor: selectedDate,
                        uid: "guest-nouid"
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
                    setMeetOkStatus(true)
            }
          }
        } catch (error) {
          console.error("Güncelleme veya oluşturma hatası:", error);
          toast.error("Randevunuz eklenirken hata oluştu");
        }
      };

    const getMeetInfo = async () => {
        const actualMeetCode = meetCode.startsWith("allShow-") ? meetCode.split("-").pop() : meetCode;
        try {
            const meetRef = doc(db, "meets", actualMeetCode);
            const meetSnap = await getDoc(meetRef);
            setMeetData(meetSnap.data());
            console.log(meetData)
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

    const fetchBusyTimeMeets = async (meetCode) => {
        try {
            const docRef = doc(db, "busyTimeMeets", meetCode);
        
            const docSnap = await getDoc(docRef);
        
            if (docSnap.exists()) {
              const data = docSnap.data();
              setBusyTimeMeets(data);
              return data; 
            } else {
              return null;
            }
          } catch (error) {
            console.error("Veri çekilirken hata oluştu:", error);
          }
    }

    const convertTimestampToDate = (timestamp) => {
        return new Date(timestamp * 1000); 
      }
      
      const convertLongTimetoymd = (rawDate) => {
    
        if (!rawDate || typeof rawDate !== "string") {
            console.error("Geçersiz tarih formatı:", rawDate);
            return null;
        }
    
        const [dateString] = rawDate.split("==FOR==");
    
        const date = new Date(dateString);
    
        if (isNaN(date.getTime())) {
            console.error("Geçersiz tarih:", dateString);
            return null;
        }
    
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 olduğu için +1 yapıyoruz
        const day = String(date.getDate()).padStart(2, '0');
    
        const formattedDate = `${year}-${month}-${day}`;
    
        return formattedDate;
    };
    
    useEffect(() => {
    }, busyTimeMeets)

    const extractFirstPart = (rawDate) => {
        if (rawDate && typeof rawDate === 'string') {
            const firstPart = rawDate.split('==')[0];
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
        return `${year}-${month}-${day}`; 
    }


    useEffect(() => {
        getMeetInfo();
        fetchBusyTimeMeets(meetCode);
    }, []);

    const checkIfFull = (fillCount) => {
        if (!fillCount) return false; 
        const [currentCount, maxCount] = fillCount.split("/").map(Number); 
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

            if (
                meetData?.excludingCount === "null" || 
                meetData?.excludingDate === "null" || 
                meetData?.excludingDayDate === null || 
                meetData?.excludingFillCount === "null" ||
                meetData?.excludingTime === null
            ) {
                setClockOptions(filteredOptions); 
                return;
            }
    
            if (meetData != null && busyTimeMeets !== undefined) {
                const excludingApplyOptions = filteredOptions.filter(option => {
                    if (
                        meetData?.excludingDate && 
                        checkIfFull(fillCount) && 
                        formatDate(selectedDate) === convertLongTimetoymd(meetData.excludingDate)
                    ) {
                        if (excludingTimes.includes(option.value)) {
                            return false;
                        }
                    }
                    return true;
                });
    
                const timeExcludingFilter = excludingApplyOptions.filter(option => {
                    const parsedData = busyTimeMeets.busyTime.split("//");
                    const splitData = parsedData.map(item => item.split("="));
    
                    const isExcluded = splitData.some(([time, , date]) => {
                        if (date === formatDate(selectedDate) && time === option.value) {
                            return true; 
                        }
                        return false; 
                    });
    
                    return !isExcluded; 
                });
    
                setClockOptions(timeExcludingFilter);
            }
        }
    
        setExcludingTime(meetData?.excludingTime);
        setExcludingFillCountState(extractFirstPart(meetData?.excludingFillCount));
    }, [selectedDate, meetData]);
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
      
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
      
        return `${year}-${month}-${day}`;
      };
      
      
      
    
      const handleTimeChange = (selectedOption) => {
        setSelectedTime(selectedOption);
      };
    
    useEffect(() => {
    }, [selectedDate])

    useEffect(() => {
    }, [meetData])

    useEffect(() => {
    }, [selectedTime])

    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: "8px",
          overflow: "hidden"
        },
    };

    return (
        <>  
            <div className={`${meetOkStatus ? "ok z-50" : "hidden"} w-screen fixed h-screen bg-white flex flex-col items-center justify-center`}>
                <img src={Ok} alt="Ok" className="w-[150px]"/>
                <p className="text-green-700 inter-600 text-2xl">Randevunuz başarıyla alındı!</p>
            </div>
            <Modal style={customStyles} isOpen={modalOpen}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setModalOpen(!modalOpen)} alt="Close" />
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col">
                        <p className="mb-2">İsim soyisim</p>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border p-1 rounded-lg outline-0 focus:border-sky-600 transition-all ps-2" placeholder="İsminiz soyisminiz"/>
                    </div>
                    <div className="flex flex-col">
                        <p className="mb-2">Cep telefonu numarası</p>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-1 rounded-lg outline-0 focus:border-sky-600 transition-all ps-2" placeholder="Cep telefonu numaranız"/>
                    </div>
                    <div className="flex flex-col">
                        <p className="mb-2">E-Posta adresi</p>
                        <input type="text" value={mail} onChange={(e) => setMail(e.target.value)} className="border p-1 rounded-lg outline-0 focus:border-sky-600 transition-all  ps-2" placeholder="E-Posta adresiniz"/>
                    </div>
                </div>
                <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 rounded-lg inter-500 text-white mt-4 outline-0" onClick={() => makeRezervation()}>Rezervasyon yap</button>
            </Modal>
            <div className="bg-bg-2 h-screen">
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
                                    minDate={meetData.meetStartDate?.seconds ? convertTimestampToDate(meetData.meetStartDate.seconds) : undefined}
                                    maxDate={meetData.meetEndDate?.seconds ? convertTimestampToDate(meetData.meetEndDate.seconds) : undefined}
                                    excludeDates={
                                        meetData.excludingDayDate?.seconds
                                        ? [convertTimestampToDate(meetData.excludingDayDate.seconds)]
                                        : []
                                    }
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                    }} 
                                    className="shadow-2xl " 
                                    open={true} 
                                />
                                </div>
                                <div className={`transition-all duration-500 ease-in-out ${selectedDate ? "opacity-100 " : "opacity-0"}`}>
                                    <Select options={clockOptions} onChange={(e) => handleTimeChange(e)}/>
                                </div>
                                <div className={`${selectedDate != null && selectedTime != undefined ? "isOk opacity-100" : "opacity-0"} transition-all duration-300`}>
                                    <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 rounded-lg text-white inter-500 mt-4 outline-0" onClick={() => setModalOpen(!modalOpen)}>Rezervasyon yap</button>
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
