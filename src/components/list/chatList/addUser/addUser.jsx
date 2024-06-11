import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
    const [users, setUsers] = useState([]); // Change to array
    const [message, setMessage] = useState(""); // State for feedback messages
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");

            // Perform the search for the given username
            const q = query(userRef, where("username", "==", username));
            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                // Collect all matching documents
                const foundUsers = querySnapShot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(foundUsers);
                setMessage(""); // Clear previous messages on new search
            } else {
                setUsers([]); // Clear the array if no users are found
                setMessage("No users found.");
            }
        } catch (err) {
            console.log(err);
            setMessage("Error occurred during search.");
        }
    };

    const handleAdd = async (user) => {
        const userChatsRef = collection(db, "userchats");
        const currentUserChatsDocRef = doc(userChatsRef, currentUser.id);

        try {
            // Fetch the current user's chat list
            const currentUserChatsDoc = await getDoc(currentUserChatsDocRef);
            const currentUserChats = currentUserChatsDoc.exists() ? currentUserChatsDoc.data().chats : [];

            // Check if the user is already in the chat list
            const alreadyAdded = currentUserChats.some(chat => chat.receiverId === user.id);

            if (!alreadyAdded) {
                const chatRef = collection(db, "chats");
                const newChatRef = doc(chatRef);

                await setDoc(newChatRef, {
                    createdAt: serverTimestamp(),
                    messages: [],
                });

                await updateDoc(currentUserChatsDocRef, {
                    chats: arrayUnion({
                        chatId: newChatRef.id,
                        lastMessage: "",
                        receiverId: user.id,
                        updatedAt: Date.now(),
                    }),
                });

                await updateDoc(doc(userChatsRef, user.id), {
                    chats: arrayUnion({
                        chatId: newChatRef.id,
                        lastMessage: "",
                        receiverId: currentUser.id,
                        updatedAt: Date.now(),
                    }),
                });

                setMessage("User added successfully!");
            } else {
                setMessage("User is already in the chat list.");
            }
        } catch (err) {
            console.log(err);   
        }
    };

    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>
            {message && <p className="message">{message}</p>}
            {users.length > 0 && (
                <div className="users">
                    {users.map((user) => (
                        <div className="user" key={user.id}>
                            <div className="detail">
                                <img src={user.avatar || "./avatar.png"} alt="" />
                                <span>{user.username}</span>
                            </div>
                            <button onClick={() => handleAdd(user)}>Add User</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddUser;
/*------------------------------------------*/