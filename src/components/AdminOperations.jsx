import { useEffect, useState, useContext, useDebugValue } from "react"
import { getFirestore, collection, getDocs,doc, updateDoc, deleteDoc,arrayUnion,query, where,getDoc } from 'firebase/firestore';
import { getAuth,deleteUser as authDeleteUser} from "firebase/auth";
import {db,resetPassword, auth} from "../firebase/firebase"
import Header from "./HomeComponents/Header"
import Close from "../images/mingcute--close-fill.svg"
import toast from "react-hot-toast"
import "../css/loader.css"
import DeleteImg from "../images/ic--outline-delete.svg"
import Account from "../images/mdi--account.svg"
import Modal from 'react-modal';
import { DataContext } from "./Context/MainContext";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";


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
    const [userRole,setUserRole] = useState("");
    const [roleSender,setRoleSender] = useState("");
    const {moveMeetCode,setMoveMeetCode,userDataSwip} = useContext(DataContext)
    const navigate = useNavigate("");


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
    const [meetMaxValue,setMeetMaxValue] = useState("");
    const [untilDateOkState,setUntilDateOkState] = useState("");

    const [editedFillCount,setEditedFillCount] = useState("");
    const [editedDate,setEditedDate] = useState("");
    const [editedCreatedAt,setEditedCreatedAt] = useState("");

    const [userRoleState,setUserRoleState] = useState("");

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    
    const getUserInfo = async () => {
        setLoading(true);
        try {
            const userDoc = doc(db, "users", cookies.uid);
            const userSnapshot = await getDoc(userDoc);
            
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserRoleState(userData.role)
                if(userData.role != "meetCreator"){
                    navigate("/404NotFound")
                }
                setLoading(false)
            } else {
                toast.error("Kullanıcı bulunamadı.");
                removeCookie("uid");
            }
        } catch (error) {
            toast.error("Veriler çekilirken bir hata oluştu, lütfen sayfayı yenileyip tekrar deneyin.");
            console.error(error);
            setLoading(false);
        }
    };
 
    useEffect(() => {
        getUserInfo();
    }, [])


    useEffect(() => {
        const [count, , time] = excludingFillCountState.split("==");
        const formattedExcludingFillCount = `${time} için ${count}`;
        setEditedFillCount(formattedExcludingFillCount)
    }, [excludingFillCountState])

    useEffect(() => {
        if (excludingDateState && excludingDateState.includes("==FOR==")) {
            const [dateString, time] = excludingDateState.split("==FOR==");
            const date = new Date(dateString.trim());
            if (!isNaN(date.getTime())) {  
                const formattedDate = new Intl.DateTimeFormat('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).format(date);
    
                const formattedOutput = `${time.trim()} için ${formattedDate}`;
                setEditedDate(formattedOutput);
            } else {
                setEditedDate("Geçersiz tarih");  
            }
        }
    }, [excludingDateState]);
    
    useEffect(() => {
        const formattedDate = new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(new Date(meetCreatedAtState * 1000));
          setEditedCreatedAt(formattedDate)
    }, [meetCreatedAtState])


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
    
    const collectMeetData = (countParam,dateParam,timeParam,fillCountParam,fileUrl,id,code,createdAt,desc,startDate,endDate,timeStart,timeEnd,title,maxValue,untilDateOkParam) => {
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
        setMeetMaxValue(maxValue);
        setUntilDateOkState(untilDateOkParam)
    }

    const collectUserData = (usernameParam,emailParam,userIdParam,userMeetCodeParam,userRoleParam) => {
        setUsername(usernameParam)
        setEmail(emailParam)
        setUserId(userIdParam)
        setUserMeetCode(userMeetCodeParam)
        setUserRole(userRoleParam)
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
          toast.success("Kişinin bütün toplantı kodları silindi.")
        } catch (error) {
          toast.error("Kişinin toplantı kodları silinirken bir hata oluştu.")
        }
      };

      const deleteUser = async (userId) => {
        try {
            toast.loading("Yükleniyor...");
            const userDocRef = doc(db, "users", userId);
            await deleteDoc(userDocRef);
            toast.dismiss();
            toast.success("Kullanıcı başarıyla silindi");
        } catch (error) {
            toast.dismiss();
            toast.error("Kullanıcı silinirken bir hata oluştu");
        }
    };

    const deleteMeet = async (meetCodeParam) => {
        try {
            toast.loading("Yükleniyor...")
            const meetsRef = collection(db, "meets");
            const q = query(meetsRef, where("meetCode", "==", meetCodeParam));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(docSnapshot.ref);
            });
            toast.dismiss();
            toast.success("Toplantı başarıyla silindi");
        } catch (error) {
            toast.error("Toplantı silinirken hata oluştu")
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

      const changeRole = async (userId) => {
        try {
            toast.loading("Yükleniyor...");
            const userRef = doc(db, "users", userId);
            if(userRole === "member"){
                setRoleSender("meetCreator")
            }
            else{
                setRoleSender("member")
            }
            await updateDoc(userRef, {
                role: roleSender
            });
            toast.dismiss();
            toast.success("Yönetici olarak yapıldı");
        } catch (error) {
            toast.error("Yönetici yapılırken hata oluştu!")
        }
      }

      const addMeetCode = async (e) => {
        e.preventDefault();
        if (!newMeetCode) return;
        try {
            toast.loading("Yükleniyor...");
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            const currentMeetCode = userDoc.data().meetCode || ""; 
            const updatedMeetCode = currentMeetCode ? `${currentMeetCode}, ${newMeetCode}` : newMeetCode;
            await updateDoc(userDocRef, {
                meetCode: updatedMeetCode,
            });
    
            toast.dismiss();
            setNewMeetCode('');
            toast.success("Toplantı kodu eklendi");
        } catch (error) {
            toast.error("Toplantı kodu eklenirken hata oluştu");
            console.error('Hata: ', error);
        }
    };
    

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
             addMeetCode(e);
            }
        };

        const unixToTurkishDate = (unixTimestamp) => {
            if (unixTimestamp !== undefined && unixTimestamp !== null) {
                const date = new Date(unixTimestamp * 1000); 
                if (!isNaN(date.getTime())) {
                    const formattedDate = new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }).format(date);
                    return formattedDate;
                } else {
                    return "Geçersiz tarih"; 
                }
            }
            return "Tarih henüz mevcut değil"; 
        };
        

        const results = Array.isArray(userMeetCode)
        ? userMeetCode.map(item => item.toUpperCase()) 
        : typeof userMeetCode === 'string' 
          ? userMeetCode.split(',').map(item => item.toUpperCase()) 
          : []; 

    return(
        <>
            <Header />
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-40" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <Modal style={customStyles2} isOpen={meetSettingsModal}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => {setMeetSettingsModal(!meetSettingsModal); setMeetInfoModal(!meetInfoModal)}} alt="Close" />
                </div>
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <img src={fileUrlState} className="w-[120px]"  alt="Meet Photo" />
                            <div className="flex flex-col ms-4">
                                <p className="inter-400 text-2xl">{meetTitleState}</p>
                                <p className="inter-400 text-xl">{meetDescState}</p>
                                <p className="inter-400 text-lg">{meetCodeState}</p>
                                <p className="inter-400 text-lg">{editedCreatedAt} tarihinde kuruldu.</p>
                            </div>
                        </div>

                        {excludingTimeState === null && excludingFillCountState === "0/0==FOR==null" && editedDate === "Geçersiz tarih" && meetMaxValue === null && untilDateOkState === null ? 
                            "" : 
                            <p className="inter-500 text-2xl mt-8 mb-2">Kısıtlamalar</p>
                        }
                        {excludingTimeState === null && excludingFillCountState === "0/0==FOR==null" && editedDate === "Geçersiz tarih" && meetMaxValue === null && untilDateOkState === null ? 
                            <p className="inter-500 text-2xl mt-5">Kısıtlama bulunmuyor</p>
                            : 
                            <div className="flex flex-col border p-2 rounded-lg">
                                {excludingTimeState === null ? "" :
                                    <p className="inter-400">Birden fazla randevu verilen saat kaç? : <span className="inter-500">{excludingTimeState}</span></p>
                                }
                                {excludingFillCountState === "0/0==FOR==null" ? "" : 
                                    <p className="inter-400">Belirli saatler için verilen randevu hakları : <span className="inter-500">{editedFillCount}</span></p>
                                }
                                {editedDate === "Geçersiz tarih" ? "" : 
                                    <p className="inter-400">Belirli saate hangi gün için kısıtlama getirildi?: <span className="inter-500">{editedDate}</span></p>
                                }
                                {meetMaxValue === undefined || meetMaxValue === null ? "" : 
                                    <p className="inter-400">Maksimum katılabilecek üye sayısı: <span className="inter-500">{meetMaxValue}</span></p>
                                }
                                {untilDateOkState && untilDateOkState.seconds !== undefined ? (
                                    <p className="inter-400">
                                        <span className="inter-500">{unixToTurkishDate(untilDateOkState.seconds)}</span> tarihinden sonra randevu alınamaz
                                    </p>
                                ) : (
                                    ""
                                )}
                            </div>
                        }
                        <p className="inter-500 text-2xl mt-8 mb-2">Toplantı Saatleri</p>
                        <div className="flex items-center justify-center border p-2 rounded-lg">
                        <p className="inter-500 text-2xl">{meetTimeStartState} - {meetTimeEndState}</p>
                    </div>
                    </div>
                    <div className="hrElement h-[300px] w-[1px] bg-slate-500 rounded-lg"></div>
                    <div className="flex flex-col items-start">
                        <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 rounded-lg text-white inter-500" onClick={() => deleteMeet(meetCodeState)}>Toplantıyı sil</button>
                        <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 rounded-lg text-white inter-500 mt-5" onClick={() => {navigate("/listUsers"); setMoveMeetCode(meetCodeState)}} >Toplantıya katılanları görüntüle</button>
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
                                <button className="bg-sky-500 hover:bg-sky-600 outline-0 transition-all duration-300 inter-500 px-4 py-2 rounded-lg text-white" onClick={() => {setMeetSettingsModal(!meetSettingsModal); setMeetInfoModal(!meetInfoModal); collectMeetData(meet.excludingCount,meet.excludingDate,meet.excludingTime,meet.excludingFillCount,meet.fileUrl,meet.id,meet.meetCode,meet.meetCreatedAt,meet.meetDesc,meet.meetStartDate,meet.meetEndDate,meet.meetTimeStart,meet.meetTimeEnd,meet.meetTitle,meet.maxUser,meet.untilDateOk)}}>...</button>
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
                                <button className="bg-sky-500 hover:bg-sky-600 outline-0 transition-all duration-300 inter-500 px-4 py-2 rounded-lg text-white" onClick={() => {setUserInfoModal(!userInfoModal); collectUserData(user.username,user.email,user.id,user.meetCode,user.role)}}>...</button>
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
                                    <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 text-white inter-500 px-4 py-2 rounded-lg mt-2" onClick={(e) => addMeetCode(e)}>Ekle</button>
                                </div>
                            </div>
                        </div>
                        <div className="hrElement h-[300px] w-[1px] bg-slate-500 rounded-lg"></div>
                        <div className="flex flex-col items-start gap-4">
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => deleteUser(userId)}>Üyeliği sil</button>
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => updateMeetCode(userId)}>Bütün toplantı kodlarını sil</button>
                            <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg" onClick={() => resetPassword(email)}>Şifre yenileme bağlantısı gönder</button>
                            <button className={`${userRole === "member" ? "bg-red-500 hover:bg-red-600" : "bg-sky-500 hover:bg-sky-600"} transition-all duration-300 px-4 py-2 text-white inter-400 rounded-lg`} onClick={() => changeRole(userId)}>{userRole === "member"  ? "Yönetici yap" : "Üye yap"}</button>
                        </div>
                    </div>
                   
            </Modal>
            <div className="flex justify-center gap-2 mt-3">
                <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 outline-0 rounded-lg px-4 py-2 text-white inter-500" onClick={() => {setUserOperationsModal(true); fetchUsers()}}>Üye işlemleri</button>
                <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 outline-0 rounded-lg px-4 py-2 text-white inter-500" onClick={() => {setMeetInfoModal(!meetInfoModal); fetchMeets();}}>Toplantı işlemleri</button>
            </div>
        </>
    )
}

export default AdminOperations