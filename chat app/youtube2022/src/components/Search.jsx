import React, { useContext, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, serverTimestamp, getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const handleSearch = async () => {
    setErr(false);
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setUser(null);
        setErr(true);
      } else {
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setErr(false);
      }
    } catch (err) {
      setErr(true);
      setUser(null);
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = async () => {
    if (!user) return;

    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    dispatch({ type: "CHANGE_USER", payload: user }); // Ensure dispatch is correctly used

    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [`${combinedId}.userInfo`]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [`${combinedId}.userInfo`]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [`${combinedId}.date`]: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    }

    setUser(null);
    setUsername("");
  };

  return (
    <div className='search'>
      <div className='searchForm'>
        <input 
          type="text" 
          placeholder='Find a user' 
          onKeyDown={handleKey} 
          onChange={e => setUsername(e.target.value)} 
          value={username}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className='userChat' onClick={handleSelect}>
          <img
            src={user.photoURL || '/default-avatar.png'}
            alt={user.displayName || 'User Avatar'}
          />
          <div className='userChatInfo'>
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
