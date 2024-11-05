import { useEffect, useState } from "react"
import { getFirestore, collection, getDocs,doc, updateDoc, deleteDoc,arrayUnion } from 'firebase/firestore';
import { getAuth,deleteUser as authDeleteUser} from "firebase/auth";
import {db,resetPassword, auth} from "../firebase/firebase"
import Header from "./HomeComponents/Header"
import Close from "../images/mingcute--close-fill.svg"
import toast from "react-hot-toast"
import "../css/loader.css"
import DeleteImg from "../images/ic--outline-delete.svg"
import Account from "../images/mdi--account.svg"
import Modal from 'react-modal';
import zIndex from "@mui/material/styles/zIndex";



const AdminOperations = () => {

    const [userOperationsModal,setUserOperationsModal] = useState(false);
    const [userInfoModal,setUserInfoModal] = useState(false);
    const [meetInfoModal,setMeetInfoModal] = useState(false);
    const [loading,setLoading] = useState(false);
    const [usersData,setUsersData] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTerm2,setSearchTerm2] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(usersData || []);
    const [meetDataState,setMeetDataState] = useState();
    const [filteredMeets,setFilteredMeets] = useState(meetDataState || [])
    const [meetSettingsModal,setMeetSettingsModal] = useState(false);

    const [excludingCountState, setExcludingCountState] = useState("");
    const [excludingDateState, setExcludingDateState] = useState("");
    const [excludingTimeState, setExcludingTimeState] = useState("");
    const [excludingFillCountState, setExcludingFillCountState] = useState("");
    const [fileUrlState, setFileUrlState] = useState("");
    const [meetIdState, setMeetIdState] = useState("");
    const [meetCodeState, setMeetCodeState] = useState("");
    const [meetCreatedAtState, setMeetCreatedAtState] = useState("");
    const [meetDescState, setMeetDescState] = useState("");
    const [meetStartDateState, setMeetStartDateState] = useState("");
    const [meetEndDateState, setMeetEndDateState] = useState("");
    const [meetTimeStartState, setMeetTimeStartState] = useState("");
    const [meetTimeEndState, setMeetTimeEndState] = useState("");
    const [meetTitleState, setMeetTitleState] = useState("");



    const [newMeetCode,setNewMeetCode] = useState("");

    const [username,setUsername] = useState("");
    const [email,setEmail] = useState("");
    const [userId,setUserId] = useState("");
    const [userMeetCode,setUserMeetCode] = useState("");

    useEffect(() => {
        if(usersData){
            setFilteredUsers(usersData);
        }
    }, [usersData])
    
    const collectMeetData = (countParam,dateParam,timeParam,fillCountParam,fileUrl,id,code,createdAt,desc,startDate,endDate,timeStart,timeEnd,title) => {
        setExcludingCountState(countParam);
        setExcludingDateState(dateParam);
        setExcludingTimeState(timeParam);
        setExcludingFillCountState(fillCountParam);
        setFileUrlState(fileUrl);
        setMeetIdState(id);
        setMeetCodeState(code);
        setMeetCreatedAtState(createdAt);
        setMeetDescState(desc);
        setMeetStartDateState(startDate);
        setMeetEndDateState(endDate);
        setMeetTimeStartState(timeStart);
        setMeetTimeEndState(timeEnd);
        setMeetTitleState(title);
    }

    const collectUserData = (usernameParam,emailParam,userIdParam,userMeetCodeParam) => {
        setUsername(usernameParam)
        setEmail(emailParam)
        setUserId(userIdParam)
        setUserMeetCode(userMeetCodeParam)
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const results = usersData.filter(user => 
            user.username && user.username.toLowerCase().includes(term)
        );
        
        setFilteredUsers(results);
    };

    const handleSearchMeet = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm2(term);
        const results = meetDataState.filter(meet => 
            meet.meetCode && meet.meetCode.toLowerCase().includes(term)
        );
        
        setFilteredMeets(results);
    };
    
    

    const fetchUsers = async () => {
        setLoading(true);
        const usersRef = collection(db, 'users');
        try {
          const snapshot = await getDocs(usersRef);
          const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsersData(usersList)
          console.log(usersList);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Üye bilgileri çekilirken hata oluştu.")
          return []; 
        }
      };

      const fetchMeets = async () => {
        setLoading(true);
        const meetRef = collection(db,"meets");
        try{
            const snapshot = await getDocs(meetRef);
            const meetList = snapshot.docs.map(doc => ({id:doc.id, ...doc.data() }));
            setMeetDataState(meetList);
            setFilteredMeets(meetList); 
            console.log(meetList);
            setLoading(false);
        }
        catch(error){
            toast.error("Toplantı verileri çekilirken hata oluştu!");
            console.error(error);
        }
    };
    

      const updateMeetCode = async (userId) => {
        try {
          toast.loading("Yükleniyor...")
          const userDocRef = doc(db, "users", userId);
          await updateDoc(userDocRef, {
            meetCode: "no-meetcode"
          });
          toast.dismiss();
          console.log("meetCode başarıyla 'no-meetcode' olarak güncellendi.");
          toast.success("Kişinin bütün toplantı kodları silindi.")
        } catch (error) {
          toast.error("Kişinin toplantı kodları silinirken bir hata oluştu.")
          console.error("meetCode güncellenirken hata oluştu:", error);
        }
      };

      const deleteUser = async (userId) => {
        try {
            toast.loading("Yükleniyor...");
            const userDocRef = doc(db, "users", userId);
            await deleteDoc(userDocRef);
            console.log("Kullanıcı belgesi Firestore'dan başarıyla silindi.");
            toast.dismiss();
            toast.success("Kullanıcı başarıyla silindi");
        } catch (error) {
            toast.dismiss();
            toast.error("Kullanıcı silinirken bir hata oluştu");
            console.error("Kullanıcı silinirken hata oluştu:", error);
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
          overflow: "hidden",
          zIndex: "49"
        },
      };

      const customStyles2 = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: "8px",
          overflow: "hidden",
          zIndex: "50"    
        },
      };

      const addMeetCode = async (e) => {
        e.preventDefault();
        if (!newMeetCode) return;
        try {
          toast.loading("Yükleniyor...")
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            meetCode: arrayUnion(newMeetCode), 
          });
          toast.dismiss();
          setNewMeetCode('');
          toast.success("Toplantı kodu eklendi")
          console.log('MeetCode başarıyla güncellendi!');
        } catch (error) {
          toast.error("Toplantı kodu silinirken hata oluştu")
          console.error('Hata: ', error);
        }
      };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
             addMeetCode(e);
            }
        };

        const results = Array.isArray(userMeetCode)
        ? userMeetCode.map(item => item.toUpperCase()) 
        : typeof userMeetCode === 'string' 
          ? userMeetCode.split(',').map(item => item.toUpperCase()) 
          : []; 

    return(
        <>
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-40" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <Modal style={customStyles2} isOpen={meetSettingsModal}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => {setMeetSettingsModal(!meetSettingsModal); setMeetInfoModal(!meetInfoModal)}} alt="Close" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <img src={fileUrlState} className="w-[120px]"  alt="Meet Photo" />
                        <div className="flex flex-col ms-4">
                            <p className="inter-400 text-2xl">{meetTitleState}</p>
                            <p className="inter-400 text-xl">{meetDescState}</p>
                            <p className="inter-400 text-lg">{meetCodeState}</p>
                        </div>
                    </div>
                    <p className="inter-500 text-2xl mt-8 mb-2">Kısıtlamalar</p>
                    <div className="flex flex-col border p-2 rounded-lg">
                        <p className="inter-400">Birden fazla randevu verilen saat kaç? : <span className="inter-500">{excludingTimeState}</span></p>
                        <p className="inter-400">Belirli saatler için verilen randevu hakları : <span className="inter-500">{excludingFillCountState}</span></p>
                    </div>
                </div>
            </Modal>
            <Modal style={customStyles} isOpen={meetInfoModal}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setMeetInfoModal(!meetInfoModal)} alt="Close" />
                </div>
                <input type="text" value={searchTerm2} onChange={(e) => handleSearchMeet(e)} className="my-2 outline-0 border p-1 rounded-lg w-full" placeholder="Toplantı kodu girin..."/>
                <div className="flex flex-col justify-center gap-3 items-start w-[350px] mt-2 border rounded-lg p-2 pb-0 max-h-[500px] overflow-auto">
                    {filteredMeets && filteredMeets.map((meet,key) => {
                        return(
                            <div key={key} className="flex items-center justify-between w-full border-b pb-3">
                                <div className="flex items-center">
                                    <img src={meet.fileUrl} className="w-[35px] me-2" alt="User" />
                                    <p>{meet.meetCode}</p>
                                </div>
                                <button className="bg-sky-500 hover:bg-sky-600 outline-0 transition-all duration-300 inter-500 px-4 py-2 rounded-lg text-white" onClick={() => {setMeetSettingsModal(!meetSettingsModal); setMeetInfoModal(!meetInfoModal); collectMeetData(meet.excludingCount,meet.excludingDate,meet.excludingTime,meet.excludingFillCount,meet.fileUrl,meet.id,meet.meetCode,meet.meetCreatedAt,meet.meetDesc,meet.meetStartDate,meet.meetEndDate,meet.meetTimeStart,meet.meetTimeEnd,meet.meetTitle)}}>...</button>
                            </div>
                        )
                    })}
                </div>
            </Modal>
            <Modal style={customStyles} isOpen={userOperationsModal}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setUserOperationsModal(!userOperationsModal)} alt="Close" />
                </div>
                <input type="text" value={searchTerm} onChange={(e) => handleSearch(e)} placeholder="Kullanıcı adı girin..."  className="my-2 outline-0 border p-1 rounded-lg mb-1 w-full"/>
                <div className="flex flex-col justify-center gap-3 items-start w-[350px] mt-2 border rounded-lg p-2 pb-0 max-h-[500px] overflow-auto">
                    {filteredUsers && filteredUsers.map((user,key) => {
                        return(
                            <div key={key} className="flex items-center justify-between w-full border-b pb-3">
                                <div className="flex items-center">
                                    <img src={Account} className="invert w-[35px]" alt="User" />
                                    <p>{user.username}</p>
                                </div>
                                <button className="bg-sky-500 hover:bg-sky-600 outline-0 transition-all duration-300 inter-500 px-4 py-2 rounded-lg text-white" onClick={() => {setUserInfoModal(!userInfoModal); collectUserData(user.username,user.email,user.id,user.meetCode)}}>...</button>
                            </div>
                        )
                    })}
                </div>
            </Modal>
            <Modal style={customStyles} isOpen={userInfoModal}>
                    <div className="flex justify-end">
                        <img src={Close} className="w-[35px]" onClick={() => setUserInfoModal(!setUserInfoModal)} alt="Close" />
                    </div>
                    <div className="flex items-center gap-7">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <img src={Account} className="invert w-[120px]" alt="" />
                                <div className="flex flex-col">
                                    <p className="inter-400 text-2xl">{username}</p>
                                    <p className="inter-400 text-lg">{userId}</p>
                                    <p className="inter-400 text-lg">{email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="inter-400 text-lg">Şu anda ekli olan toplantı kodları:</p>
                                <div className="flex flex-col border p-1 rounded-lg max-h-[250px] overflow-auto gap-3">
                                    {results.map((result,key) => {
                                        return(
                                            <div key={key} className="flex items-center justify-between">
                                                <p className={`inter-400 text-lg ${result === "NO-MEETCODE" ? "hidden" : "ok"}`}>{result}</p>
                                                {result === "NO-MEETCODE" ? "" : (<button className="bg-red-500 hover:bg-red-600 transition-all duration-300 p-2 px-4 rounded-lg"><img src={DeleteImg} className="invert" alt="Sil" /></button>)}
                                            </div>
                                        )
                                    })}
                                </div>
                                <input type="text" className="outline-0 mt-3 border rounded-lg p-2" onKeyDown={handleKeyDown} value={newMeetCode} onChange={(e) => setNewMeetCode(e.target.value)} placeholder="Toplantı Kodu Ekle"/>
                                <div className="flex justify-start">
                                    <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 text-white inter-500 px-4 py-2 rounded-lg mt-2">Ekle</button>
                                </div>
                            </div>
                        </div>
                        <div className="hrElement h-[300px] w-[1px] bg-slate-500 rounded-lg"></div>
                        <div className="flex flex-col items-start gap-4">
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => deleteUser(userId)}>Üyeliği sil</button>
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => updateMeetCode(userId)}>Bütün toplantı kodlarını sil</button>
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => resetPassword(email)}>Şifre yenileme bağlantısı gönder</button>
                        </div>
                    </div>
                   
            </Modal>
            <Header />
            <div className="flex justify-center gap-2 mt-3">
                <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 outline-0 rounded-lg px-4 py-2 text-white inter-500" onClick={() => {setUserOperationsModal(true); fetchUsers()}}>Üye işlemleri</button>
                <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 outline-0 rounded-lg px-4 py-2 text-white inter-500" onClick={() => {setMeetInfoModal(!meetInfoModal); fetchMeets();}}>Toplantı işlemleri</button>
            </div>
        </>
    )
}

export default AdminOperations