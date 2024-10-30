import { addDoc, collection } from "firebase/firestore"
import CreateMeetDetails from "./CreateMeetDetails"
import Header from "./HomeComponents/Header"





const createMeet = () => {
    return(
        <>
            <Header />
            <div className="h-full-special relative">
                <CreateMeetDetails />
            </div>
            {/* <div className="flex flex-col mt-20 px-16">
                <hr />
                <p className="text-3xl inter-400 mt-4">Toplantı Kodu ne işe yarar?</p>
                <p className="mt-5 inter-400">Toplantı kodu, her toplantıya özel olarak üretilen koddur. <strong>Toplantıya katılacak üyelere bu kodu paylaşmanız gerekmektedir.</strong></p>
            </div>
            <div className="flex flex-col mt-8 px-16">
                <p className="text-3xl inter-400 mt-4">Toplantı Resmi ne işe yarar?</p>
                <p className="mt-5 inter-400">Toplantı resmi, ana sayfada toplantınız gözükeceği zaman ona verilen bir resimdir. Dilerseniz toplantıyı temsil eden bir resim veya bir şirket resmi olabilir</p>
            </div> */}
        </>
    )
}

export default createMeet