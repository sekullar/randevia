import { useContext, useState } from "react"
import { DataContext } from "../Context/MainContext"
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../../firebase/firebase";
import Header from "./Header"   
import DeleteImg from "../../images/ic--outline-delete.svg"
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"
import Modal from 'react-modal';

const AccountSettings = () => {

    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    const {userMeetCodeSwip,userDataSwip} = useContext(DataContext)
    const [newMeetCode,setNewMeetCode] = useState("");
    const [modalOpen,setModalOpen] = useState(false)
    const navigate = useNavigate();

    
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
            toast.success("Toplantı Kodunuz başarıyla güncellendi")
            navigate("/home")
          } else {
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

    const signOut = () => {
        removeCookie("uid"); 
        toast.success("Başarıyla çıkış yaptınız")
    }

    const userMeetCodeSwipArray = typeof userMeetCodeSwip === 'string' ? userMeetCodeSwip.split(',') : [];


    return(
        <>  <Modal isOpen={modalOpen} style={customStyles}>
                <div className="flex flex-col">
                    <p className="inter-500 text-2xl border-b pb-3">Çıkış yap</p>
                    <p className="inter-400 text-xl border-b py-5">Çıkış yapmak istediğinize emin misiniz?</p>
                    <div className="flex justify-end mt-5 gap-3">
                        <button className="bg-gray-500 hover:bg-gray-600 transition-all duration-300 rounded-lg px-4 py-2 inter-500 text-white outline-0" onClick={() => setModalOpen(!modalOpen)}>İptal</button>
                        <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 rounded-lg px-4 py-2 inter-500 text-white outline-0" onClick={() => signOut()}>Çıkış yap</button>
                    </div>
                </div>
            </Modal>
            <Header />
            <div className="flex flex-col">
                <div className="flex flex-col items-center mt-5">
                    <p className="inter-500 text-2xl">Toplantı Kodları</p>
                    <div className="border rounded-lg p-3 mt-4 flex flex-col gap-3 max-h-[300px] overflow-auto">
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
                {userDataSwip.role === "meetCreator" ? 
                    <div className="flex justify-center items-center">
                        <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 rounded-lg px-4 py-2 inter-500 text-white mt-3" onClick={() => navigate("/adminOperations")}>Admin işlemleri</button>
                    </div>
                    :
                    ""
                }
                <div className="flex justify-center items-center w-full mb-5 absolute bottom-0">
                    <button className="text-white inter-500 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-300 outline-0" onClick={() => setModalOpen(!modalOpen)}>Çıkış yap</button>
                </div>
            </div>
        </>
    )
}

export default AccountSettings