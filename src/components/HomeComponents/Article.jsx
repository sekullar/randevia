import { useContext, useEffect, useState } from "react"
import { DataContext } from "../Context/MainContext"
import Meeting from "../../images/toplanti.png"
import logo from "../../images/logoRandevia.svg"


const Article = () => {

    const {userDataSwip,meetDataSwip} = useContext(DataContext);
    const [countMatchesValue,setCountMatchesValue] = useState(0)

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

    useEffect(() => {
        
    })

    return(
        <>
        <div className="flex items-center gap-4 p-3">
                {meetDataSwip && meetDataSwip.map((meet, key) => {
                    const userMeetCodes = userDataSwip ? userDataSwip.meetCode.split(',') : []; // kullanıcı kodlarını dizilere ayırıyoruz
                    return (
                        <div 
                            className={`${userMeetCodes.includes(meet.meetCode) ? "showOk bg-white rounded-lg border itemBoxShadow w-[340px] p-4" : "hidden"}`} 
                            key={key}
                        >
                            <div className="flex flex-col">
                                <div className="flex justify-center">
                                    <img src={Meeting} className="w-[200px]" alt="" />
                                </div>
                                <p className="inter-600 text-3xl">{meet.meetTitle}</p>
                                <p className="inter-500">{meet.meetDesc}</p>
                                <hr className="my-3" />
                                <div>
                                    <button className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 px-4 py-2 inter-500 text-white rounded-lg outline-0">Toplantıya Katıl</button>
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