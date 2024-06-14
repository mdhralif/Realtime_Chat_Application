import { useEffect, useState } from "react";
import "./chatList.css";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import AddUser from "./addUser/addUser";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");
    const [menuVisible, setMenuVisible] = useState(null); // State to manage menu visibility

    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "userchats", currentUser.id),
            async (res) => {
                const items = res.data().chats;

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);

                    const user = userDocSnap.data();

                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);
                setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            }
        );

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async (chatId) => {
        const filteredChats = chats.filter((chat) => chat.chatId !== chatId);
        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: filteredChats.map((chat) => {
                    const { user, ...rest } = chat;
                    return rest;
                }),
            });

            // Update local state with filtered chats
            setChats(filteredChats);
        } catch (err) {
            console.log(err);
        }
    };

    const filteredChats = chats.filter((c) =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className='chatList'>
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={input}
                        onChange={(e) => setInput(e.target.value)} 
                    />
                </div>
                <img
                    src={addMode ? "./minus.png" : "./plus.png"}
                    alt=""
                    className="add" 
                    onClick={() => setAddMode((prev) => !prev)}
                />
            </div>
            <div className="item" onClick={() => handleSelect({ chatId: "NexTalk", user: { username: "NexTalk", avatar: "./favicon.png" } })}>
                <img src="./favicon.png" alt=""/>
                <div className="texts">
                    <span>NexTalk</span>
                    <p>Hey,There!</p>
                </div>
            </div>
            {filteredChats.map((chat) => (
                <div
                    className="item"
                    key={chat.chatId}
                    onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                    }}
                >
                    <img
                        src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"}
                        alt=""
                    />
                    <div className="texts">
                        <span>
                            {chat.user.blocked.includes(currentUser.id)
                                ? "User"
                                : chat.user.username}
                        </span>
                        <p>{chat.lastMessage}</p>
                    </div>
                    <img
                        src="./more.png"
                        alt=""
                        className="menu-dots"
                        style={{ width: "20px", height: "20px", marginLeft: "auto", cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuVisible(chat.chatId === menuVisible ? null : chat.chatId);
                        }}
                    />
                    {menuVisible === chat.chatId && (
                        <div className="item-context-menu">
                            <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="delete-btn"
                                    style={{
                                        backgroundColor: "#ff4d4d",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}
                                    onClick={() => handleDelete(chat.chatId)}
                                >
                                    Remove User
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default ChatList;
