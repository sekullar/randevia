import { useContext, useState } from "react"
import { DataContext } from "../Context/MainContext"
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../../firebase/firebase";
import Header from "./Header"   
import DeleteImg from "../../images/ic--outline-delete.svg"
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"

const AccountSettings = () => {

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    const {userMeetCodeSwip} = useContext(DataContext)
    const [newMeetCode,setNewMeetCode] = useState("");
    const navigate = useNavigate();
    

    const updateMeetCode = async () => {
        try {
        toast.loading("Toplantı Kodunuz Güncelleniyor...");    
          const userDocRef = doc(db, "users", cookies.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const currentMeetCode = userDoc.data().meetCode || ""; 
            const updatedMeetCode = currentMeetCode ? `${currentMeetCode},${newMeetCode}` : newMeetCode; 
      
            await updateDoc(userDocRef, {
              meetCode: updatedMeetCode
            });
            toast.dismiss();
            console.log("meetCode başarıyla güncellendi:", updatedMeetCode);
            toast.success("Toplantı Kodunuz başarıyla güncellendi")
            navigate("/home")
          } else {
            console.log("Belirtilen kullanıcı dokümanı bulunamadı.");
            toast.error("Toplantı Kodu eklenecek kullanıcı yok (Giriş yapılmamış olabilir)")
            navigate("/login")
          }
        } catch (error) {
          console.error("meetCode güncelleme hatası:", error);
          toast.error("Toplantı Kodları düzenlenirken bir hata oluştu")
        }
      };

      const handleDelete = async (meetCodeToDelete) => {
        try {
            toast.loading("Toplantı Kodunuz siliniyor...")

            const userDocRef = doc(db, "users", cookies.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const currentMeetCode = userDoc.data().meetCode || "";
                const updatedMeetCodes = currentMeetCode
                    .split(',')
                    .filter(meetCode => meetCode !== meetCodeToDelete) 
                    .join(','); 

                await updateDoc(userDocRef, {
                    meetCode: updatedMeetCodes
                });
                toast.dismiss();
                toast.success("Toplantı Kodu başarıyla silindi");
            }
        } catch (error) {
            console.error("Toplantı Kodu silme hatası:", error);
            toast.error("Toplantı Kodu silinirken bir hata oluştu");
        }
    };

    return(
        <>  
            <Header />
            <div className="flex flex-col">
                <div className="flex flex-col items-center mt-5">
                    <p className="inter-500 text-2xl">Toplantı Kodları</p>
                    <div className="border rounded-lg p-3 mt-4 flex flex-col gap-3 max-h-[300px] overflow-auto1">
                        {userMeetCodeSwip && 
                            userMeetCodeSwip.split(',').map((meetCode, key) => {
                                return (
                                <div key={key} className="flex items-center justify-between w-[250px]">
                                    <span className="inter-500 text-lg">{meetCode}</span>
                                    <img src={DeleteImg} onClick={() => handleDelete(meetCode)} className="w-[30px]" alt="Delete" />
                                </div>
                                );
                            })
                        }
                    </div>
                    <input type="text" value={newMeetCode} onChange={(e) => setNewMeetCode(e.target.value)} className="border my-3 p-2 rounded-lg outline-0" placeholder="Toplantı Kodu"/>
                    <button className="px-4 py-2 inter-500 bg-sky-500 hover:bg-sky-600 transition-all outline-0 duration-300 rounded-lg text-white" onClick={() => updateMeetCode()}>Toplantı Kodu Ekle</button>
                </div>
            </div>
        </>
    )
}

export default AccountSettings