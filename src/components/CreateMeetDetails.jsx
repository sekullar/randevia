import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, setDoc, doc, addDoc, collection,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Copy from "../images/lets-icons--copy-light.svg";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker"; 
import DateIcon from "../images/lets-icons--date-range.svg";
import "react-datepicker/dist/react-datepicker.css";
import "../css/datepickerMore.css";
import { useCookies } from "react-cookie";
import Select from 'react-select';
import Plus from "../images/ic--round-plus.svg";
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

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);


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

                const updatedMeetCodes = existingMeetCodes ? `${existingMeetCodes},${uniqueState}` : uniqueState;

                await updateDoc(userDocRef, {
                    meetCode: updatedMeetCodes // Yeni değeri kaydet
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
            toast.error("Lütfen bir dosya seçin!");
            return;
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

    const createMeetFunc = async () => {
        try {
            setLoading(true)
            const fileURL = await uploadFileToFirebase();
            AddSelfCode();
            const docRef = await addDoc(collection(db, "meets"), {
                meetTitle: title,
                meetDesc: desc,
                meetCreatedAt: getCurrentUnixTimestamp(),
                meetCode: uniqueState,
                meetStartDate: meetStart,
                meetEndDate: meetEnd,
                meetTimeStart: timeStart,
                meetTimeEnd: timeEnd,
                fileUrl: fileURL 
            });
            setLoading(false)
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
                    <div className="flex flex-col gap-2">
                        <p className="inter-400">Toplantınızın kodu:</p>
                        <div className="flex ">
                            <input type="text" onChange={(e) => setMeetCodeState(e.target.value)} value={uniqueState} className="inter-400 outline-0 p-1 px-2 rounded-lg max-h-[350px]" placeholder="Toplantı kodu"/>
                            <img src={Copy} onClick={handleCopy} className="invert w-[35px] cursor-pointer" alt="Copy" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="flex flex-col mt-10 px-24">
                        <p className="inter-400 text-2xl">Toplantınızda hangi günler rezervasyon yapılabilir?</p>
                        <div className="flex items-center flex-col gap-12">
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col mt-16">
                                    <p className="inter-500">Başlangıç Tarihi:</p>
                                    <div className="border flex items-center rounded-lg my-4 mt-2 w-[250px]">
                                        <DatePicker selected={meetStart} onChange={(date) => setMeetStart(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2"/>
                                        <img src={DateIcon} className="h-6 w-6 cursor-pointer" alt="date"/>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-16">
                                    <p className="inter-500">Bitiş Tarihi:</p>
                                    <div className="border flex items-center rounded-lg my-4 mt-2 w-[250px]">
                                        <DatePicker selected={meetEnd} onChange={(date) => setMeetEnd(date)} className="outline-0 py-2 rounded-lg cursor-pointer px-2"/>
                                        <img src={DateIcon} className="h-6 w-6 cursor-pointer" alt="date"/>
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
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <button onClick={createMeetFunc} className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 rounded-lg absolute bottom-0 text-white inter-500 px-4 py-2 mt-6">Toplantı Oluştur</button>
            </div>
        </>
    );
};

export default CreateMeetDetails;
