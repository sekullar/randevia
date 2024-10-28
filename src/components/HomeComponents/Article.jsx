import { useContext, useEffect, useState } from "react"
import { DataContext } from "../Context/MainContext"
import Meeting from "../../images/toplanti.png"
import logo from "../../images/logoRandevia.svg"
import SettingsImg from "../../images/ic--round-settings.svg"
import Modal from 'react-modal';
import CloseImg from "../../images/mingcute--close-fill.svg"
import "../../css/homeModal.css"



const Article = () => {

    const {userDataSwip,meetDataSwip} = useContext(DataContext);
    const [countMatchesValue,setCountMatchesValue] = useState(0)
    const [isHovered,setIsHovered] = useState(false);
    const [modalOpen,setModalOpen] = useState(false);
    const [settingsModal,setSettingsModal] = useState(false)

    const [meetTitleState,setMeetTitleState] = useState("");
    const [meetDescState,setMeetDescState] = useState("");
    const [meetPhotoUrlState,setMeetPhotoUrlState] = useState("");



    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: "8px"
        },
      };

    useEffect(() => {
        if (userDataSwip && meetDataSwip) {
            const userMeetCodes = userDataSwip.meetCode.split(','); 
            const matchedMeetings = meetDataSwip.filter(meet => 
                userMeetCodes.includes(meet.meetCode) 
            );
            setCountMatchesValue(matchedMeetings.length);
        }
    }, [userDataSwip, meetDataSwip]); 

    const generateRandomCode = (length = 12) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
    
        return result;
    }

    const uniqueCodeValue = generateRandomCode();


    return(
        <>
        <Modal style={customStyles} isOpen={settingsModal}>
            <div className="flex flex-col relative p-2">
                <img src={CloseImg} alt="Close" onClick={() => setSettingsModal(!settingsModal)} className="absolute cursor-pointer top-0 end-0 w-[35px]"/>
                <button className="bg-red-500 hover:bg-red-600 transition-all duration-300 text-white px-4 py-2 rounded-lg mt-10 inter-500">Toplantıyı sil (İşlevsiz)</button>
            </div>
        </Modal>
        <Modal style={customStyles} isOpen={modalOpen}>
            <div className="homeModalHeight relative">
                <div className="flex flex-col  items-center justify-center h-full">
                    <div className="flex justify-end absolute top-0 end-0">
                        <img src={CloseImg} className="w-[35px] cursor-pointer" onClick={() => setModalOpen(!modalOpen)} alt="" />
                    </div>
                    <p className="inter-500 text-2xl">{meetTitleState}</p>
                    <img src={meetPhotoUrlState} className="w-[300px] my-2" alt="Meet Image" />
                    <p className="inter-400 w-[400px] max-h-[500px] overflow-auto">{meetDescState}</p>
                </div>
                <div className="flex items-center justify-between mt-2 w-full absolute bottom-0">
                    <button  className="bg-sky-500 hover:bg-sky-600 transition-all w-full duration-300 px-4 py-2 inter-500 text-white rounded-lg h-[40px] outline-0">Toplantıya Katıl</button>
                </div>
            </div>
        </Modal>
        <div className="flex items-center justify-center flex-wrap gap-4 p-3">
                    {meetDataSwip && meetDataSwip.map((meet, key) => {
                            const userMeetCodes = userDataSwip ? userDataSwip.meetCode.split(',') : []; 
                            const MAX_DESC_LENGTH = 100; // Burada istediğiniz sınır uzunluğunu ayarlayabilirsiniz
                            const truncatedDesc = meet.meetDesc.length > MAX_DESC_LENGTH ? `${meet.meetDesc.substring(0, MAX_DESC_LENGTH)}...` : meet.meetDesc;

                            return (
                                <div 
                                    className={`${userMeetCodes.includes(meet.meetCode) ? "showOk bg-white rounded-lg border itemBoxShadow w-[340px] h-[360px] p-4" : "hidden"}`} 
                                    key={key}
                                >
                                    <div className="flex flex-col justify-between h-full">
                                        <div className="flex justify-center h-full items-center">
                                            <img src={meet.fileUrl} className="w-[100px]" alt="" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="inter-600 text-3xl">{meet.meetTitle}</p>
                                            <p className="inter-500">{truncatedDesc}</p> {/* Kısaltılmış açıklama buraya eklendi */}
                                            <hr className="my-3" />
                                            <div className="flex justify-between items-center">
                                                <button onClick={() => {setMeetTitleState(meet.meetTitle); setMeetDescState(meet.meetDesc); setMeetPhotoUrlState(meet.fileUrl); setModalOpen(true)}} className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 inter-500 text-white rounded-lg h-[40px] outline-0">Toplantıya Katıl</button>
                                                {userDataSwip.role == "MeetCreator" ?
                                                <div>
                                                    <button onClick={() => setSettingsModal(!settingsModal)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="bg-sky-500 hover:bg-sky-500 transition-all duration-300 outline-0 rounded-lg px-4 py-2">
                                                        <img src={SettingsImg} className={`${isHovered ? "animate-spin transition-all duration-300" : "noAni"}`} alt="Settings" />
                                                    </button>
                                                </div>
                                                : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                    })}

        </div>
        <div className="flex items-center p-4">
        {userDataSwip && userDataSwip.role === "MeetCreator" ? 
            <div className="flex flex-col gap-4">
                <p className="inter-400 text-4xl">Randevia'ya Hoşgeldiniz! 🎉</p>
                <p className="inter-400 text-lg">
                    Randevia ile randevularınızı 🗓️ ve toplantılarınızı 📅 daha hızlı ve etkili bir şekilde yönetebilirsiniz! 
                    Hedeflerinize ulaşmak için zamanınızı ⏳ daha iyi değerlendirmek artık çok kolay.
                </p>
                <p className="inter-400 text-lg">
                    Hayatın getirdiği koşturmacada, işleri bir düzene sokmak ve stresinizi azaltmak için Randevia tam da aradığınız çözüm! 
                    Randevularınızı planlarken veya toplantılarınızı organize ederken, her şey parmaklarınızın ucunda. ✌️
                </p>
                <p className="inter-400 text-lg">
                    Randevia ile iletişiminizi artırabilir, ekip çalışmalarınızı daha verimli hale getirebilir ve zaman kaybını minimuma indirebilirsiniz. 
                    İster bireysel kullanım, ister ekip bazında olsun, Randevia her zaman yanınızda! 🤝
                </p>
                <p className="inter-400 text-3xl">Her şeyden önce...</p>
                <div className="flex items-center gap-2">
                    <p className="inter-400">Başlamak için sağ üstteki</p>
                    <button className="bg-sky-500 cursor-not-allowed text-white px-4 py-2 rounded-lg inter-500">Toplantı Oluştur</button>
                    <p>butonundan toplantı oluşturabilirsiniz. 🚀</p>
                </div>
                <div className="flex flex-col">
                    <p>Oluşturduğunuz toplantıları; daha sonra düzenleyebilir, başlıklarını değiştirebilirsiniz. 📝</p>
                    <p>İptal etmek isterseniz bunları silebilirsiniz. ❌</p>
                </div>
                <img src={logo} className="w-[75px]" alt="Logo" />
            </div>
        :
        <div className="flex flex-col gap-4">
            <p className="inter-400 text-4xl">Randevia'ya Hoşgeldiniz! 🎉</p>
            <p className="inter-400 text-lg">
                Randevia ile randevularınızı 🗓️ ve toplantılarınızı 📅 daha hızlı ve etkili bir şekilde yönetebilirsiniz! 
                Hedeflerinize ulaşmak için zamanınızı ⏳ daha iyi değerlendirmek artık çok kolay.
            </p>
            <p className="inter-400 text-lg">
                Hayatın getirdiği koşturmacada, işleri bir düzene sokmak ve stresinizi azaltmak için Randevia tam da aradığınız çözüm! 
                Randevularınızı planlarken veya toplantılarınızı organize ederken, her şey parmaklarınızın ucunda. ✌️
            </p>
            <p className="inter-400 text-lg">
                Randevia ile iletişiminizi artırabilir, ekip çalışmalarınızı daha verimli hale getirebilir ve zaman kaybını minimuma indirebilirsiniz. 
                İster bireysel kullanım, ister ekip bazında olsun, Randevia her zaman yanınızda! 🤝
            </p>
            {meetDataSwip && userDataSwip && meetDataSwip.meetCode != userDataSwip.meetCode ? "" : 
                <div>
                    <p className="inter-400 text-3xl">Her şeyden önce...</p>
                    <div className="flex  flex-col gap-2">
                        <p className="inter-400">Şu anda üzerinize tanımlanmış bir toplantı gözükmüyor, toplantı kodunuzu doğru girdiğinizden emin misiniz?</p>
                        <p className="inter-400">Toplantı kodunuzu doğru girdiğinize eminseniz, toplantı kurucunuzla iletişime geçin.</p>
                    </div>
                </div>
            }
            
            <img src={logo} className="w-[75px]" alt="Logo" />
        </div>
        }


        </div>
        </>
    )
}

export default Article