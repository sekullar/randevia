import { useState, useEffect } from "react"
import "../css/login.css"
import logo from "../images/logoRandevia.svg"
import toast from "react-hot-toast"
import { register, login } from "../firebase/firebase"
import Seen from "../images/streamline--visible.svg"
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom"

const Login = () => {

    const [loginPage,setLoginPage] = useState(true)

    const [registerUsername,setRegisterUsername] = useState("");
    const [registerEmail,setRegisterEmail] = useState("");
    const [registerPassword,setRegisterPassword] = useState("");
    const [registerPasswordCheck,setRegisterPasswordCheck] = useState("");
    const [registerMeetCode,setRegisterMeetCode] = useState("");
    const [meetCreatorCheck,setMeetCreatorCheck] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['uid']);

    const [loginMail,setLoginMail] = useState("");
    const [loginPassword,setLoginPassword] = useState("");

    const navigate = useNavigate();


    const [seenOk,setSeenOk] = useState(false);

    const [loginSeen,setLoginSeen] = useState(false);

    const sendRegister = async (e) => {
        const inOneYear = new Date();
        inOneYear.setFullYear(inOneYear.getFullYear() + 1); 

        e.preventDefault();
        if(registerPassword != registerPasswordCheck){
            toast.error("Şifreleriniz birbiriyle uyuşmamaktadır!")
        }
        else{
            try{
                
                const user = await register(registerEmail,registerPassword, registerUsername, "member", "no-meetcode")
                if(user){
                    setCookie("uid", user.uid,{path: "/", expires: inOneYear})
                    setLoginPage(true)
                }
            }
            catch(error){
                toast.error("Lütfen başka bir kullanıcı adı ve e-posta adresiyle tekrar deneyin.")
            }
            
        }
    }

    const sendLogin = async (e) => {
        const inOneYear = new Date();
        inOneYear.setFullYear(inOneYear.getFullYear() + 1); 

        e.preventDefault();
        try{
            const user = await login(loginMail,loginPassword)
            setCookie("uid", user.uid, {path: "/", expires: inOneYear})
            navigate("/home")
        }
        catch{
            //pass
        }
    }

    const handleKeyEnterRegister = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            sendRegister(event);
        }
    };

    const handleKeyEnterLogin = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            sendLogin(event);
        } 
    }

    useEffect(() => {
    }, [meetCreatorCheck])
    

  
    return(
        
        <>
            <div className="loginBackground h-screen w-full relative">
                <img src={logo} className="absolute start-0 top-0 w-[50px] mt-2 ms-2" alt="" />
                <div className="flex items-center  h-full justify-center">
                    <div className="flex gap-12 loginScreenBoxShadow bg-white-special p-6 rounded-xl">
                        {loginPage ? 
                            <div className="flex flex-col gap-6 items-center">
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">E-Posta:</p>
                                    <input type="mail" value={loginMail} onKeyDown={handleKeyEnterLogin} onChange={(e) => setLoginMail(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="E-Posta adresi"/>
                                </div>
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">Parola:</p>
                                    <div className="flex items-center relative">
                                        <input type={`${loginSeen ? "hidePassword" : "password"}`} value={loginPassword} onKeyDown={handleKeyEnterLogin} onChange={(e) => setLoginPassword(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="Parola"/>
                                        <img src={Seen} onClick={() => setLoginSeen(!loginSeen)} className="absolute end-0 me-3 invert cursor-pointer w-[25px]" alt="Seen" />
                                    </div>
                                </div>
                                <button className="bg-cyan-500 text-center inter-500 text-white w-full rounded-lg py-2" onClick={() => sendLogin()}>Giriş yap</button>
                                <p className="cursor-pointer inter-500" onClick={() => setLoginPage(!loginPage)}>Hesabınız yok mu?</p>
                            </div>
                        :
                        <div className="flex flex-col gap-6 items-center">
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">Kullanıcı Adı:</p>
                                    <input type="mail" value={registerUsername}  onKeyDown={handleKeyEnterRegister} onChange={(e) => setRegisterUsername(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="Kullanıcı Adı"/>
                                </div>
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">E-Posta adresi:</p>
                                    <input type="mail" value={registerEmail}  onKeyDown={handleKeyEnterRegister} onChange={(e) => setRegisterEmail(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="E-Posta adresi"/>
                                </div>
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">Parola:</p>
                                    <div className="flex items-center relative">
                                        <input type={`${seenOk ? "hidePassword" : "password"}`}  onKeyDown={handleKeyEnterRegister} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="Parola"/>
                                        <img src={Seen} onClick={() => setSeenOk(!seenOk)} className="invert absolute cursor-pointer end-0 me-3 w-[25px]" alt="" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">Parola Tekrardan:</p>
                                    <input type={`${seenOk ? "hidePassword" : "password"}`} onKeyDown={handleKeyEnterRegister} value={registerPasswordCheck} onChange={(e) => setRegisterPasswordCheck(e.target.value)} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="Parola tekrarı"/>
                                </div>
                                {meetCreatorCheck ? 
                                ""
                                :
                                <div className="flex flex-col">
                                    <p className="inter-500 text-sm mb-2">Toplantı Kodu:</p>
                                    <input type="text"  value={registerMeetCode} onKeyDown={handleKeyEnterRegister} className="border p-2 rounded-lg outline-0 w-[300px]" placeholder="Toplantı Kodu" onChange={(e) => setRegisterMeetCode(e.target.value)}/>
                                </div>
                                }
                                
                                <button className="bg-cyan-500 text-center inter-500 text-white w-full rounded-lg py-2" onClick={sendRegister}>Kayıt Ol</button>
                                <p className="cursor-pointer inter-500" onClick={() => setLoginPage(!loginPage)}>Hesabınız var mı?</p>
                            </div>
                        }
                         
                        <div className={`bg-neutral-400 rounded-xl opacity-50 w-[2px]`}><span className="invisible h-full block">AA</span></div>
                        <div className="max-w-[300px] flex items-center flex-col justify-center">
                            <p className="inter-500 text-3xl">Gelişmis randevu  sistemi: <span className="inter-600 text-4xl">Randevia</span></p>
                            <p className="mt-3 opacity-70">Bir çok işletmenin işini kolaylaştıran randevu sistemi, hem hızlıca görüşme, hemde odağınızı bozmayan bir kolaylık sağlamakta. Randevia ile randevulara katılın randevu düzenleyin, işletmelerinizde tam verim alın.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login