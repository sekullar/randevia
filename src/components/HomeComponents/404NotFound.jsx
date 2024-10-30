import "../../css/404notfound.css"
import { useNavigate } from "react-router-dom"

const NotFound = () => {

    const navigate = useNavigate();

    return(
        <>
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-screen bg404">
                <p className="inter-600 text-[160px]"><span className="text-sky-500">4</span>0<span className="text-sky-500">4</span></p>
                <p className="inter-500 text-[20px]">Böyle bir sayfa yok!</p>
                <button onClick={() => navigate("/home")} className="bg-sky-500 hover:bg-sky-600 text-white inter-500 rounded-lg px-4 py-2 mt-2">Anasayfaya dön</button>
            </div>
        </>
    )
}

export default NotFound