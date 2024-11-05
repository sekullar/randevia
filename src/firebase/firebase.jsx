import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { getAnalytics } from "firebase/analytics";
import { getFirestore, setDoc, doc  } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import toast from 'react-hot-toast';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
};



const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export const register = async (email, password,username,role,meetCode) => {
  try {
    toast.loading("Yükleniyor...");
    const { user } = await createUserWithEmailAndPassword(auth, email, password,role,meetCode);
    await setDoc(doc(db,"users",user.uid), {
        username: username,
        email: email,
        uid: user.uid,
        role: role,
        meetCode: meetCode
      });
    toast.dismiss();
    toast.success("Kayıt olma işlemi başarılı");
    return user;
  } catch (error) {
    toast.dismiss();
    if (error.message === "Firebase: Error (auth/invalid-email).") {
      toast.error("E-Posta bilgileriniz doğru değil!");
    } else {
      toast.error("Kayıt işlemi sırasında bir hata oluştu.");
      console.log(error)
    }
  }
}

export const login = async (email, password) => {
  try {
    toast.loading("Yükleniyor...");
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    toast.dismiss();
    toast.success("Giriş işlemi başarılı!");
    return user;
  } catch (error) {
    toast.dismiss();
    switch (error.code) {
      case "auth/invalid-credential":
        toast.error("Kullanıcı adı veya şifre yanlış");
        break;
      case "auth/too-many-requests":
        toast.error("Çok fazla istekte bulundunuz, lütfen bir süre sonra tekrar");
        break;
      case "auth/invalid-email":
        toast.error("Geçersiz e-posta adresi!");
        break;
      default:
        toast.error("Giriş işlemi sırasında bir hata oluştu.");
        break;
    }
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    toast.loading("Şifre yenileme bağlantısı gönderiliyor...");
    await sendPasswordResetEmail(auth, email);
    toast.dismiss();
    toast.success("Şifre yenileme bağlantısı e-posta adresinize gönderildi!");
  } catch (error) {
    toast.dismiss();
    switch (error.code) {
      case "auth/user-not-found":
        toast.error("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
        break;
      case "auth/invalid-email":
        toast.error("Geçersiz e-posta adresi!");
        break;
      default:
        toast.error("Şifre sıfırlama işlemi sırasında bir hata oluştu.");
        console.error(error);
        break;
    }
  }
};

export { db,storage,auth }
export default app;
