import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth";
import { auth,db } from "../../lib/firebase";
import { doc,setDoc } from "firebase/firestore";
import { update } from "firebase/database";
import upload from "../../lib/upload";

const Login =() =>{

    const [avatar,setAvatar]=useState({
        file:null,
        url:""
    });

    const[loading, setLoading]=useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);

    const handleAvatar = (e)=>{
        if(e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleRegister =async(e) =>{
        e.preventDefault();
        setLoading(true);
        const formData=new FormData(e.target);

        const{username,email,password}=Object.fromEntries(formData);
        
        try{
            const res=await createUserWithEmailAndPassword(auth,email,password);

            const imgUrl=await upload(avatar.file);

            await setDoc(doc(db,"users",res.user.uid),{
                username,
                email,
                avatar:imgUrl,
                id:res.user.uid,
                blocked:[]
            });

            await setDoc(doc(db,"userchats",res.user.uid),{
                chats:[],
            });


            toast.success("Account Created! You can login now!")
        }catch(err){
            console.log(err);
            toast.error(err.message);
        }finally{
            setLoading(false);
        }
    };

    const handleLogin =async(e) =>{
        e.preventDefault();
        setLoading(true);

        const formData=new FormData(e.target);

        const{email,password}=Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth,email,password);

        }catch(err){
            console.log(err);
             toast.error(err.message);
        }
        finally{
            setLoading(false);
        }
       
    };

    const handleCreateAccountClick = () => {
        setShowCreateAccount(true);
    };

    const handleGoBackToLogin = () => {
        setShowCreateAccount(false);
    };

    return (
        <div className='login'>
            {!showCreateAccount && (
                <div className="item">
                    <img src="./favicon.png" alt="Logo" className="logo" style={{ width: '100px', height: '100px' }} />

                    <h2>Get in touch with faves</h2>
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder="Email" name="email"/>
                        <input type="password" placeholder="Password" name="password"/>
                        <button disabled={loading}>{loading ? "Loading" :"Sign In"}</button>
                        <label onClick={handleCreateAccountClick}>Don't have an account?</label>
                    </form>
                </div>
            )}
            {showCreateAccount && (
                <>
                    <div className="item">
                        <h2>Create an Account !</h2>
                        <form onSubmit={handleRegister}>
                            <label htmlFor="file">
                                <img src={avatar.url || "./avatar.png"} alt="" />
                                Upload an image</label>
                            <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar}/>
                            <input type="text" placeholder="Username" name="username"/>
                            <input type="text" placeholder="Email" name="email"/>
                            <input type="password" placeholder="Password" name="password"/>
                            <button disabled={loading}>{loading ? "Loading" :"Sign Up"}</button>
                        </form>
                        <label style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleGoBackToLogin}>Go back to Sign In</label>
                    </div>
                </>
            )}
        </div>
    );
};
export default Login;
