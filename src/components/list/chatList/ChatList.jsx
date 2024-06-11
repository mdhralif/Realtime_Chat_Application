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
                    <img src="./search.png" alt="" style={{ width: "20px" }} />
                    <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => setInput(e.target.value)}
                        style={{ flex: "1", padding: "5px", borderRadius: "5px", border: "1px solid #ccc", backgroundColor: "transparent", color: "white", outline: "none" }}
                    />
                </div>
                <img
                    src={addMode ? "./minus.png" : "./plus.png"}
                    alt=""
                    className="add"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(17, 25, 40, 0.5)", padding: "10px", borderRadius: "10px", cursor: "pointer" }}
                    onClick={() => setAddMode((prev) => !prev)}
                />
            </div>
            {filteredChats.map((chat) => (
                <div
                    className="item"
                    key={chat.chatId}
                    onClick={() => handleSelect(chat)}
                    style={{
                        padding: "20px",
                        cursor: "pointer",
                        borderBottom: "1px solid #dddddd35",
                        position: "relative"
                    }}
                >
                    <img
                        src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : chat.user.avatar || "./avatar.png"}
                        alt=""
                        style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="texts" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ fontWeight: "500" }}>
                            {chat.user.blocked.includes(currentUser.id)
                                ? "User"
                                : chat.user.username}
                        </span>
                        <p style={{ fontSize: "14px", fontWeight: "300" }}>{chat.lastMessage}</p>
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
                        <div className="context-menu" style={{ position: "absolute", top: "0", right: "0", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "5px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", padding: "5px", zIndex: "1000" }} onClick={(e) => e.stopPropagation()}>
                            <button className="delete-btn" style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", width: "100%", display: "block", textAlign: "center" }} onClick={() => handleDelete(chat.chatId)}>Delete Chat</button>
                        </div>
                    )}
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default ChatList;
