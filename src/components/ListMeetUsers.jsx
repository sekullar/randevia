import Header from "../components/HomeComponents/Header"
import { collection, getDocs,doc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "./Context/MainContext";
import { db } from "../firebase/firebase"
import Modal from 'react-modal';
import toast from "react-hot-toast";
import Close from "../images/mingcute--close-fill.svg"
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const ListMeetUsers = () => {
    const [loading, setLoading] = useState(false);
    const [listUsersData, setListUsersData] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const { moveMeetCode } = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('name'); 
    const [iframeUsersOk,setIframeUsersOk] = useState(true);
    const [iFrameUsers,setIframeUsers] = useState();
    const [iFrameModal,setIframeModal] = useState(false)


    const [iframeName,setIframeName] = useState("");
    const [iframeMail,setIframeMail] = useState("");
    const [iframeMeetCode,setIframeMeetCode] = useState("");
    const [iframePhone,setIframePhone] = useState("");
    const [iframeDateAt,setIframeDateAt] = useState("");
    const [iframeSelectedTime,setIframeSelectedTime] = useState("");
    const [iframeMeetCreated,setIframeMeetCreated] = useState("");

    const [filteredMeetCreated,setFilteredMeetCreated] = useState("");


    const filteredUsers = listUsersData?.filter(user => {
        const userName = user.data.name.toLowerCase(); 
        const userID = user.data.uid.toLowerCase();
        const busyTimes = user.data.busyTime.split('//').map(time => time.toLowerCase());
        const reservationDates = user.data.rezervationFor.split('//').map(date => date.toLowerCase());

        switch (filterType) {
            case 'name':
                return userName.includes(searchTerm.toLowerCase());
            case 'date':
                return reservationDates.some(date => date.includes(searchTerm.toLowerCase()));
            case 'time':
                return busyTimes.some(time => time.includes(searchTerm.toLowerCase()));
            case 'userID':
                return userID.includes(searchTerm.toLowerCase());
            case 'all':
                return userName.includes(searchTerm.toLowerCase()) || 
                       reservationDates.some(date => date.includes(searchTerm.toLowerCase())) ||
                       busyTimes.some(time => time.includes(searchTerm.toLowerCase())) ||
                       userID.includes(searchTerm.toLowerCase());
            default:
                return false;
        }
    });

    const getiFrameMeets = async (meetCode) => {
        try {
          if (!meetCode) {
            console.error("meetCode değeri boş.");
            return;
          }
      
          const iFrameMeetsRef = doc(db, "iFrameMeets", meetCode);
          const meetsCollectionRef = collection(iFrameMeetsRef, "meets");
      
          const querySnapshot = await getDocs(meetsCollectionRef);
          if (querySnapshot.empty) {
            return;
          }
      
          const meetsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
      
          setIframeUsers(meetsData);
          return meetsData;
      
        } catch (error) {
          console.error("Hata oluştu: ", error);
        }
      };
      
      const isoFormatDate = (iframeMeetCreated) => {
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        };
      
        if (!iframeMeetCreated) {
          return "Tarih bilgisi mevcut değil";
        }
      
        const date = new Date(iframeMeetCreated);
      
        if (isNaN(date.getTime())) {
          return "Geçersiz tarih";
        }
      
        return date.toLocaleDateString('tr-TR', options).replace(/\./g, '');
      };
      
      
    
      useEffect(() => {
         setFilteredMeetCreated(isoFormatDate(iframeMeetCreated))
      }, [iframeMeetCreated])

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
    
            setListUsersData(matchingDocs);
            getiFrameMeets(meetCode)
            setLoading(false);
            return matchingDocs;
    
        } catch (error) {
            console.error("Dokümanları çekerken hata oluştu:", error);
            toast.error("Veriler çekilirken bir hata oluştu");
            setLoading(false); 
            return [];
        }
    };

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

    useEffect(() => {
        fetchMeetCodeDocs(moveMeetCode);
    }, [moveMeetCode]);
    

    return(
        <>  <Modal style={customStyles} isOpen={iFrameModal}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setIframeModal(!iFrameModal)} alt="Close" />
                </div>
                <div className="flex flex-col">
                    <p>İsim Soyisim: {iframeName}</p>
                    <p>Mail Adresi: {iframeMail}</p>
                    <p>Telefon Numarası: {iframePhone}</p>
                    <p>Toplantı Kodu: {iframeMeetCode}</p>
                    <p>Seçilen saat: {iframeSelectedTime}</p>
                    <p>Seçilen Tarih: {iframeDateAt}</p>
                    <p>Toplantı şu tarihte alındı: {filteredMeetCreated}</p>
                </div>
            </Modal>
            <Modal style={customStyles} isOpen={modalOpen}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setModalOpen(!modalOpen)} alt="Close" />
                </div>
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Filtreleme türü seçin:</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={filterType} // Seçili değer
                        onChange={(e) => setFilterType(e.target.value)} 
                    >
                        <FormControlLabel value="name" control={<Radio />} label="İsme göre listele" />
                        <FormControlLabel value="date" control={<Radio />} label="Tarihe göre listele" />
                        <FormControlLabel value="time" control={<Radio />} label="Saate göre listele" />
                        <FormControlLabel value="userID" control={<Radio />} label="User ID'ye göre listele" />
                        <FormControlLabel value="all" control={<Radio />} label="Tümüne göre listele" />
                    </RadioGroup>
                </FormControl>
            </Modal>
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-50" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <Header />
            <div className="flex items-center justify-around my-2">
                <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-[20px] h-[20px] transition-all duration-300 outline-0" checked={iframeUsersOk} onChange={(e) => setIframeUsersOk(e.target.checked)} id="vehicle2" name="vehicle2" value="Car" />
                    <p>iFrame'den gelenleri listele</p>
                </div>
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}  
                    className="outline-0 border p-1 rounded-lg "
                />
                <button 
                    className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 rounded-lg text-white inter-500" 
                    onClick={() => setModalOpen(!modalOpen)}
                >
                    Filtrele
                </button>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="flex justify-center w-1/3">
                        <p className="inter-500">Kullanıcı Adı</p>
                    </div>
                    <div className="flex justify-center w-1/3">
                        <p className="inter-500">Saat ve Tarih</p>
                    </div>
                    <div className="flex justify-center w-1/3">
                        <p className="inter-500">User ID</p>
                    </div>
                </div>
                {iframeUsersOk ? 
                (iFrameUsers && Array.isArray(iFrameUsers) ? 
                    iFrameUsers.map((user, key) => {
                        return(
                            <div className="border-b flex items-center py-2 px-3" key={key}>
                                <div className="w-1/3 flex justify-center">
                                    <p>{user.name}</p>
                                </div>
                                <div className="w-1/3 flex justify-center">
                                    <p>{user.selectedTime.value} - {user.meetDate}</p>
                                </div>
                                <div className="w-1/3 flex justify-center">
                                    <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 rounded-lg inter-500 text-white outline-0" onClick={() => {setIframeName(user.name); setIframeMail(user.mail); setIframeMeetCode(user.meetCode); setIframePhone(user.phoneNumber); setIframeDateAt(user.meetDate); setIframeSelectedTime(user.selectedTime.value); setIframeMeetCreated(user.dateAt); setIframeModal(!iFrameModal) }}>iFrame</button>
                                </div>
                            </div>
                        );
                    }) : null
                ) : ""}
                {filteredUsers?.map((user, key) => {
                    const busyTimes = user.data.busyTime.split('//'); 
                    const rezervationDates = user.data.rezervationFor.split('//'); 

                    return busyTimes.map((time, index) => {
                        const formattedTime = `${time}:00`; 
                        const correspondingDate = rezervationDates[index]; 

                        return (
                            <div className="border-b flex items-center py-2 px-3" key={`${key}-${index}`}>
                                <div className="w-1/3 flex justify-center">
                                    <p>{user.data.name}</p>
                                </div>
                                <div className="w-1/3 flex justify-center">
                                    <p>{formattedTime} - {correspondingDate}</p>
                                </div>
                                <div className="w-1/3 flex justify-center">
                                    <p>{user.data.uid}</p>
                                </div>
                            </div>
                        );
                    });
                })}
            </div>
        </>
    );
}

export default ListMeetUsers;
