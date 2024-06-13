import React, { useContext, useState } from 'react';
import Attach from '../img/attach-file.png';
import Images from '../img/images.png';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { v4 as uuid } from 'uuid';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  // Function to handle sending messages
  const handleSend = async () => {
    try {
      if (img) {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Handle upload progress or states if needed
          },
          (error) => {
            console.error('Error uploading image:', error);
          },
          () => {
            // Image uploaded successfully, get download URL
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
              // Update Firestore with message including image
              await updateFirestoreMessages(text, downloadURL);
            });
          }
        );
      } else {
        // Update Firestore with message text only
        await updateFirestoreMessages(text);
      }

      // Update userChats for current user and recipient
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [`${data.chatId}.lastMessage`]: {
          text,
        },
        [`${data.chatId}.date`]: serverTimestamp(),
      });
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [`${data.chatId}.lastMessage`]: {
          text,
        },
        [`${data.chatId}.date`]: serverTimestamp(),
      });

      // Clear input fields
      setText("");
      setImg(null);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Function to update Firestore messages
  const updateFirestoreMessages = async (messageText, imageURL = null) => {
    const newMessage = {
      id: uuid(),
      text: messageText,
      senderId: currentUser.uid,
      date: Timestamp.now(),
    };

    if (imageURL) {
      newMessage.img = imageURL;
    }

    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion(newMessage),
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImg(e.target.files[0]);
    }
  };

  return (
    <div className='input'>
      <input 
        type="text" 
        placeholder='Type something...' 
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        <label htmlFor="file">
          <img src={Attach} alt="Attach file" />
        </label>
        <input 
          type="file" 
          style={{ display: 'none' }} 
          id='file' 
          onChange={handleFileChange} 
        />
        <img src={Images} alt="Upload image" />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Input;
