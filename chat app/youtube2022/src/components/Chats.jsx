import React, { useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Chats = () => {
  const [chats, setChats] = useState({});
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    let unsub;
    if (currentUser?.uid) {
      unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data() || {}); // Set to empty object if data is null
      });
    } else {
      setChats({}); // Clear chats if no currentUser
    }

    return () => {
      if (unsub) unsub(); // Unsubscribe when component unmounts
      setChats({}); // Reset chats state on cleanup
    };
  }, [currentUser]);

  const handleSelect = (u) => {
    dispatch({ type: 'CHANGE_USER', payload: u });
  };

  // Sort chats based on date
  const sortedChats = Object.entries(chats)
    .sort((a, b) => b[1].date - a[1].date);

  return (
    <div className='chats'>
      {sortedChats.map(([chatId, chat]) => (
        <div className='userChat' key={chatId} onClick={() => handleSelect(chat.userInfo)}>
          <img src={chat.userInfo.photoURL} alt='' />
          <div className='userChatInfo'>
            <span>{chat.userInfo.displayName}</span>
            <p>{chat.lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
