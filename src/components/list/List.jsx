import ChatList from "./chatList/ChatList"
import Userinfo from "./useInfo/Userinfo"
import "./list.css"

const List =() =>{
    return (
        <div className='list'>
            <Userinfo/>
            <ChatList/>
        </div>
    )
}
export default List