import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom"

// Tạo 1 context để lưu trữ các biến state và các hàm setter cho các thành phần khác trong ứng dụng có thể 
// truy cập và cập nhật
const ChatContext = createContext() 

// Cho phép truy cập mọi thành phần trong ứng dụng
const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const history = useHistory()


  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) // chuyển đổi từ đối tượng json sang đối tượng js
    setUser(userInfo)
    
    if (!userInfo) {
      history.push("/")
    }
  }, [history])
    

  // Trả về 1 ChatContext.Provider với giá context được cung cấp là state và hàm setter cho user
  return (
    <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification }}>
      {children}
    </ChatContext.Provider>
  )
};

// Xuất ra hook chatstate được sử dụng để truy cập vào state và hàm setter của user
export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider