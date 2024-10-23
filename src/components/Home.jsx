import Header from  "./HomeComponents/Header"
import { collection,getDocs, getDoc, doc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useState,useEffect, useContext } from "react"
import { useCookies } from "react-cookie"
import toast from "react-hot-toast"
import { DataContext } from "./Context/MainContext"
import "../css/loader.css"
import Article from "../components/HomeComponents/Article"


const Home = () => {

    const [loading,setLoading] = useState(false);

    const [userData,setUserData] = useState([]);

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    const {userDataSwip , setUserDataSwip , setMeetDataSwip} = useContext(DataContext)

    const [meetDataState,setMeetDataState] = useState([]);

    useEffect(() => {
            console.log("userDataSwip",userDataSwip)
    }, [userDataSwip])

    const getUserInfo = async () => {
        setLoading(true);
        try {
            const userDoc = doc(db, "users", cookies.uid);
            const userSnapshot = await getDoc(userDoc);
            
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserData(userData);
                console.log(userData);
                setUserDataSwip(userData); 
            } else {
                toast.error("Kullanıcı bulunamadı.");
            }
        } catch (error) {
            toast.error("Veriler çekilirken bir hata oluştu, lütfen sayfayı yenileyip tekrar deneyin.");
            console.error(error);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (userDataSwip && userDataSwip.meetCode) {
            getMeets();
        }
    }, [userDataSwip]);
    
    const getMeets = async () => {
        setLoading(true); 
        try {
            const meetsCollection = collection(db, "meets");
            const meetsSnapshot = await getDocs(meetsCollection);
    
            const meetData = meetsSnapshot.docs.map(doc => ({
                id: doc.id, 
                ...doc.data() 
            }));
    
            if (meetData.length > 0) {
                console.log(meetData);
                setMeetDataState(meetData); 
                setMeetDataSwip(meetData);   
            } else {
                toast.error("Üstünüze kayıtlı bir randevu gözükmüyor lütfen randevu sağlayıcınızla iletişime geçin");
            }
        } catch (error) {
            console.error(error);
            toast.error("Meet verisi çekilirken bir hata oluştu.");
        } finally {
            setLoading(false); 
        }
    };
    

    useEffect(() => {
        getUserInfo();
    }, [])

    return(
        <>  
            {loading ? 
            <div className="fixed bg-white h-screen w-screen z-50 flex justify-center items-center">
                <div className="loader"></div>
            </div>
            :
            ""
            }
            <Header />
            <Article />
        </>
    )
}

export default Home