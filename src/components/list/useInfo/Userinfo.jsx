import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";
import"./userInfo.css"

const Userinfo =() =>{

    const {currentUser}=useUserStore();
    return (
        <div className='userInfo'>
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <img src="./edit.png" alt="" />
                <img src="./signOut.png" className="logout" onClick={()=>auth.signOut()}/>
            </div>
        </div>
    )
}
export default Userinfo