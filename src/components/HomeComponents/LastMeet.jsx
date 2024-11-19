import { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { collection, getDocs, doc } from "firebase/firestore"; 
import { db } from "../../firebase/firebase";
import { useContext } from 'react';
import { DataContext } from '../Context/MainContext';
import "../../css/lastMeet.css"

const LastMeet = () => {
    const { userDataSwip } = useContext(DataContext);
    const [loading, setLoading] = useState(false);
    const [fetchMeetCodes, setFetchMeetCodes] = useState();
    const [fillData,setFillData] = useState(true)

    const [allRezervationData,setAllRezervationData] = useState([]);

    const responsive = {
        superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
    };


    useEffect(() => {
        if (userDataSwip) {
            setFetchMeetCodes(userDataSwip.meetCode);
        }
    }, [userDataSwip]);

    const fetchMeetCodesFunc = async (meetCode) => {
        try {
            const meetsOkRef = collection(db, "meetsOk");
            const querySnapshot = await getDocs(meetsOkRef);
            
            const filteredDocs = querySnapshot.docs.filter(doc => 
                doc.id.endsWith(`-${meetCode}`)
            );

            return filteredDocs.map(doc => ({
                id: doc.id,
                data: doc.data(),
            }));
        } catch (error) {
            console.error("Belgeleri getirirken hata oluştu:", error);
            return [];
        }
    };

    const fetchMultipleMeetCodes = async (meetCodesString) => {
        setLoading(true);
        const meetCodes = meetCodesString.split(",").map(code => code.trim()); 
        const allMeetData = [];

        for (const meetCode of meetCodes) {
            const meetData = await fetchMeetCodesFunc(meetCode); 
            allMeetData.push(...meetData); 
        }

        setAllRezervationData(allMeetData)
        setFillData(false)
        setLoading(false); 
        return allMeetData; 
    };

    useEffect(() => {
        if (fetchMeetCodes) {
            fetchMultipleMeetCodes(fetchMeetCodes);
        }
    }, [fetchMeetCodes]);

    return (
        <>
            <div className={`${loading ? "h-screen w-screen fixed justify-center flex items-center bg-special-white z-50" : "hidden"}`}>
                <div className="loader"></div>
            </div>
            <div className="flex items-center flex-col justify-center my-12">
                <p className='inter-400 text-3xl mb-3'>Toplantınızdaki randevular</p>
                <Carousel 
                    swipeable={false}
                    draggable={false}
                    showDots={true}
                    responsive={responsive}
                    ssr={true}
                    infinite={true}
                    autoPlaySpeed={1000}
                    keyBoardControl={true}
                    customTransition="all 1"
                    transitionDuration={500}
                    containerClass="carousel-container"
                    removeArrowOnDeviceType={["tablet", "mobile"]}
                    dotListClass="custom-dot-list-style"
                    itemClass="carousel-item-padding-40-px">
                    {allRezervationData.length > 0 ? allRezervationData.map((meet, key) => (
                        fillData ? 
                            <div key={key}></div> 
                            :
                            <div key={key} className='p-3 border rounded-lg flex items-center justify-center flex-col mx-6'>
                                <p className='inter-400 text-2xl'>{meet.data.name} kişisi</p>
                                <p className='inter-500 text-3xl'>{meet.data.busyTime}:00 saatinden</p>
                                <p className='inter-400 text-xl'>sizden randevu aldı!</p>
                            </div>
                    )) : (
                        <div className='p-3 border rounded-lg'>
                            <p>Henüz randevu yok!</p>
                        </div>
                    )}

                </Carousel>
            </div>
        </>
    );
};

export default LastMeet;
