import logo from "../../images/logoRandevia.svg"
import Account from "../../images/mdi--account-cog.svg"
import { useContext, useEffect } from "react"
import { DataContext } from "../Context/MainContext"
import { useNavigate, useLocation } from "react-router-dom"

const Header = () => {

    const {userDataSwip} = useContext(DataContext);
    const location = useLocation(); 

    const navigate = useNavigate();
    
    const forwardCreateMeet = () => {
        navigate("/createMeet")
    }

    const forwardHome = () => {
        navigate("/home")
    }

    const isCreateMeetPage = location.pathname === '/createMeet';
    const buttonText = isCreateMeetPage ? 'Toplantı Oluştur' : 'Toplantılarınız';

    


    return(
        <>
            <div className="flex items-center justify-between p-2 border-b">
                <div className="flex items-center gap-2 cursor-pointer w-[215px]" onClick={forwardHome}>
                    <img src={logo} className="w-[50px]" alt="Logo" />
                    <p className="text-xl inter-500">Randevia</p>
                </div>
                <p className="inter-500 text-3xl">{buttonText}</p>
                <div className="flex items-center justify-end gap-3 w-[215px]">
                    {userDataSwip && userDataSwip.role === "MeetCreator" ? 
                        <div>
                            <button onClick={forwardCreateMeet} className="bg-sky-500 hover:bg-sky-600 transition-all duration-300 rounded-lg inter-500 text-white px-4 py-2 cursor-pointer select-none">Toplantı Oluştur</button>
                        </div>
                        :
                        null
                    }
                    <img src={Account} className="invert w-[50px]" alt="Account" />
                </div>
            </div>
        </>
    )
}

export default Header