import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, setDoc, doc, addDoc, collection,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Copy from "../images/lets-icons--copy-light.svg";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker"; 
import { tr } from 'date-fns/locale'; 
import "../css/datepickerMore.css";
import { useCookies } from "react-cookie";
import Select from 'react-select';
import MeetingPng from "../images/toplanti.png"
import Modal from 'react-modal';
import Close from "../images/mingcute--close-fill.svg"
import "../css/loader.css"
import "../css/createMeet.css"


const CreateMeetDetails = () => {
    
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [meetCodeState, setMeetCodeState] = useState("");
    const [meetStart, setMeetStart] = useState(null);
    const [meetEnd, setMeetEnd] = useState(null);
    const [timeStart, setTimeStart] = useState(null);
    const [timeEnd, setTimeEnd] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false); 
    const [loading,setLoading] = useState(false);
    const [uniqueState,setUniqueState] = useState("");
    const [meetPrivate,setMeetPrivate] = useState(false)
    const [modalOpen,setModalOpen] = useState(false);


    const [excludingDate,setExcludingDate] = useState(null);
    const [excludingTime,setExcludingTime] = useState(null);
    const [excludingCount,setExcludingCount] = useState(0);
    const [excludingDayDate,setExcludingDayDate] = useState(null);
    const [maxUser,setMaxUser] = useState(null);

    const [untilDateOk,setUntilDateOk] = useState(null);

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

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
          height: "calc(100vh - 30vh)"
        },
    };

    const getCurrentUnixTimestamp = () => {
        const now = new Date();
        return Math.floor(now.getTime() / 1000);  
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; 
        if (file) {
            setSelectedFile(file); 
        }
    };

    const AddSelfCode = async () => {
        const userDocRef = doc(db, "users", cookies.uid); 

        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const existingMeetCodes = userDoc.data().meetCode; 

                const updatedMeetCodes = existingMeetCodes ? `${existingMeetCodes},${uniqueState}` : `${uniqueState}`;

                await updateDoc(userDocRef, {
                    meetCode: updatedMeetCodes 
                });

                console.log("Meet code başarıyla güncellendi:", updatedMeetCodes);
            } else {
                console.log("Kullanıcı belgesi bulunamadı!");
            }
        } catch (error) {
            console.error("Hata oluştu:", error);
        }
    }

    const uploadFileToFirebase = async () => {
        if (!selectedFile) {
            return MeetingPng;  
        }
    
        const storage = getStorage();
        const storageRef = ref(storage, `files/${selectedFile.name}`);
        try {
            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Dosya başarıyla yüklendi:", downloadURL);
            setIsFileUploaded(true); 
            return downloadURL;
        } catch (error) {
            console.error("Dosya yükleme hatası:", error);
            toast.error("Dosya yüklenirken bir hata oluştu.");
        }
    };
    
    const createMeetFuncControl = () => {
        if(title == ""){
            toast.error("Lütfen toplantı başlığı girin")
        }
        else{
            if(desc == ""){
                toast.error("Lütfen toplantı açıklaması girin")
            }
            else{
                if(meetStart == null){
                    toast.error("Lütfen başlangıç tarihini girin")
                }
                else{
                    if(meetEnd == null){
                        toast.error("Lütfen bitiş tarihi seçin")
                    }
                    else{
                        if(timeStart == null){
                            toast.error("Lütfen başlangıç saatini seçin")
                        }
                        else{
                            if(timeEnd == null){
                                toast.error("Lütfen bitiş saatini seçin")
                            }
                            else{
                                if(timeStart >= timeEnd){
                                    toast.error("Başlangıç saati bitiş saatiyle eşit yada küçük olamaz")
                                }
                                else{
                                    createMeetFunc();
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const createMeetFunc = async () => {
        try {
            if (excludingCount == 0 && excludingDate == null && excludingTime == null) {
                setExcludingDate("no-excluding");
                setExcludingTime("no-excluding");
                setExcludingCount("no-excluding");
            }
            setLoading(true);
            const fileURL = await uploadFileToFirebase();
            AddSelfCode();
            
            const docRef = await setDoc(doc(db, "meets", uniqueState), {
                meetTitle: title,
                meetDesc: desc,
                meetCreatedAt: getCurrentUnixTimestamp(),
                meetCode: !meetPrivate ? uniqueState : `allShow-${uniqueState}`,
                meetStartDate: meetStart,
                meetEndDate: meetEnd,
                meetTimeStart: timeStart,
                meetTimeEnd: timeEnd,
                fileUrl: fileURL,
                excludingCount: `${excludingCount}==FOR==${excludingTime}`,
                excludingDate: `${excludingDate}==FOR==${excludingTime}`,
                excludingTime: excludingTime,
                excludingFillCount: `0/${excludingCount}==FOR==${excludingTime}`,
                excludingDayDate: excludingDayDate,
                untilDateOk: untilDateOk,
                maxUser: maxUser
            });
            
            setLoading(false);
            toast.success("Toplantı başarıyla oluşturuldu!");
        } catch (error) {
            toast.error("Toplantı oluşturulurken bir hata oluştu.");
            console.error(error);
            setLoading(false);
        }
    };
    

    const generateRandomCode = (length = 12) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
    
        return result;
    };

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

    useEffect(() => {
        console.log(meetStart);
        console.log(meetEnd);
        console.log(timeStart);
        console.log(timeEnd);
    }, [meetStart, meetEnd, timeStart, timeEnd]);

    useEffect(() => {
        console.log(selectedFile);
    }, [selectedFile]);


    const handleCopy = () => {
        navigator.clipboard.writeText(uniqueState)
            .then(() => {
                toast.success("Toplantı kodunuz kopyalandı!");
            })
            .catch(err => {
                console.error('Kopyalama işlemi başarısız oldu: ', err);
            });
    };

    useEffect(() => {
        const uniqueCodeValue = generateRandomCode();
        setUniqueState(uniqueCodeValue)
    }, [])

   

    return (
        <>     
            <Modal style={customStyles} isOpen={modalOpen}>
                <div className="flex justify-end">
                    <img src={Close} className="w-[35px]" onClick={() => setModalOpen(!modalOpen)} alt="Close" />
                </div>
                <p className="inter-400 text-2xl my-5">Kısıtlama ekle</p>
                <div className="flex items-center gap-2">
                    <DatePicker selected={excludingDate} locale={tr} onChange={(date) => setExcludingDate(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2 border"/>
                    <p className="inter-400">tarihindeki</p>
                    <Select 
                        options={options}
                        onChange={(option) => setExcludingTime(option.value)}
                        className="rounded-lg border outline-0 mt-2"
                    />
                    <p className="inter-400">saati için</p>
                    <input type="text" className="w-[120px] border p-1 rounded-lg" value={excludingCount} onChange={(e) => setExcludingCount(e.target.value)} placeholder="Kaç kere?"/>
                    <p>kere randevu yapılabilinir.</p>
                </div>
                <div className="mt-5 flex items-center">
                    <DatePicker selected={excludingDayDate} locale={tr} onChange={(date) => setExcludingDayDate(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2 border"/>
                    <p className="inter-400 ms-2">tarihinde randevu yapılmasını istemiyorum.</p>
                </div>
                <div className="mt-5 flex items-center">
                    <DatePicker selected={untilDateOk} locale={tr} onChange={(date) => setUntilDateOk(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2 border"/>
                    <p className="ms-2 inter-400">tarihine kadar randevu alınabilinir, bu tarihten sonra randevu alınamaz.</p>
                </div>
                <div className="flex items-center mt-5">
                    <p className="me-2 inter-400">Bu randevuya en fazla</p>
                    <input type="text" className="w-[120px] border p-1 rounded-lg" value={maxUser} onChange={(e) => setMaxUser(e.target.value)} placeholder="Kişi sayısı girin"/>
                    <p className="ms-2 inter-400">kişi katılabilir.</p>
                </div>
            </Modal>
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-50" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <div className="flex justify-around h-full items-center">
                <div className="px-24 py-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <p className="inter-400">Toplantınızın başlığı:</p>
                        <div>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="inter-400 outline-0 border p-1 px-2 w-[270px] rounded-lg" placeholder="Toplantı Başlığı"/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="inter-400">Toplantınızın açıklaması:</p>
                        <div>
                            <textarea type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="inter-400 outline-0 border p-1 px-2 rounded-lg max-h-[350px] w-[270px] h-[270px]" placeholder="Toplantı açıklaması"/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="inter-400">Toplantınızın resmi:</p>
                        <label htmlFor="fileInput" className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 rounded-lg text-white inter-500 px-4 py-2 cursor-pointer">
                            Resim Seç
                        </label>

                        <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                    <div className="flex items-center">
                        <div onClick={() => setMeetPrivate(true)} className={`${meetPrivate ? "bg-sky-500 p-5 w-[150px] flex justify-center rounded-s-lg" : "bg-gray-100 p-5 w-[150px] transition-all  flex justify-center rounded-s-lg cursor-pointer text-black"}`}>
                            <span className={`${meetPrivate ? "text-white inter-500" : "text-black inter-600"} cursor-pointer `}>Herkese açık</span>
                        </div>
                        <div onClick={() => setMeetPrivate(false)} className={` ${!meetPrivate ? "bg-sky-500" : "bg-gray-100"}  p-5 w-[150px] flex justify-center transition-all  cursor-pointer rounded-e-lg`}>
                            <span className={`${!meetPrivate ? "text-white inter-500" : "text-black inter-600"} cursor-pointer `}>Özel</span>
                        </div>
                    </div>
                    {
                        meetPrivate !== true ?  
                        <div className="flex flex-col gap-2">
                            <p className="inter-400">Toplantınızın kodu:</p>
                            <div className="flex ">
                                <input type="text" onChange={(e) => setMeetCodeState(e.target.value)} value={uniqueState} className="inter-400 outline-0 p-1 px-2 rounded-lg max-h-[350px]" placeholder="Toplantı kodu"/>
                                <img src={Copy} onClick={handleCopy} className="invert w-[35px] cursor-pointer" alt="Copy" />
                            </div>
                        </div>
                        :
                        ""
                    }
                </div>
                <div className="flex items-center">
                    <div className="flex flex-col mt-10 px-24">
                        <p className="inter-400 text-2xl">Toplantınızda hangi günler rezervasyon yapılabilir?</p>
                        <div className="flex items-center flex-col gap-12">
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col mt-16">
                                    <p className="inter-500">Başlangıç Tarihi:</p>
                                    <div className="border flex items-center flex-col  rounded-lg my-4 createDatepicker mt-2 h-[45px] w-[250px]">
                                        <DatePicker selected={meetStart} locale={tr} onChange={(date) => setMeetStart(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2"/>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-16">
                                    <p className="inter-500">Bitiş Tarihi:</p>
                                    <div className="border flex items-center flex-col rounded-lg my-4 createDatepicker mt-2 h-[45px] w-[250px]">
                                        <DatePicker selected={meetEnd} locale={tr} onChange={(date) => setMeetEnd(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2"/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col mt-16 ">
                                    <p className="inter-500">Başlangıç Saati:</p>
                                    <Select 
                                        options={options}
                                        onChange={(option) => setTimeStart(option.value)}
                                        className="rounded-lg border outline-0 mt-2"
                                    />
                                </div>
                                <div className="flex flex-col mt-16">
                                    <p className="inter-500">Bitiş Saati:</p>
                                    <Select 
                                        options={options}
                                        onChange={(option) => setTimeEnd(option.value)}
                                        className="rounded-lg border outline-0 mt-2"
                                    />
                                </div>
                            </div>
                            <button className="bg-sky-500 hover:bg-sky-600 rounded-lg text-white inter-500 px-4 py-2 transition-all duration-300 outline-0" onClick={() => setModalOpen(!modalOpen)}>Kısıtlama ekle</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <button onClick={() => createMeetFuncControl()} className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 rounded-lg absolute bottom-0 text-white inter-500 px-4 py-2 mb-5">Toplantı Oluştur</button>
            </div>
        </>
    );
};

export default CreateMeetDetails;
