import React, { useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModal from '../components/miscellaneous/ProfileModal'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import axios from 'axios'
import "./style.css"
import ScrollableChat from './ScrollableChat'
import { useEffect } from 'react'


import io from 'socket.io-client'
const ENDPOINT = "http://localhost:5000"
var socket, selectedChatCompare



const SingleChat = ({ fetchAgain, setFetchAgain }) => {

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [istyping, setIsTyping] = useState(false)
  const toast = useToast()

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState()


  const fetchMessages = async () => {
    if (!selectedChat) return

    try {
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      setLoading(true)

      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config)
      console.log(messages);
      setMessages(data)
      setLoading(false)

      socket.emit("join chat", selectedChat._id) // Phát sự kiện "join chat" và dữ liệu là id đoạn chat
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      })
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit("setup", user) // Máy khách phát sự kiện "setup" với dữ liệu user đang login để đk kết nối với máy chủ
    socket.on("connected", () => setSocketConnected(true)) // kết nối thành công
    socket.on("typing", () => setIsTyping(true))
    socket.on("stop typing", () => setIsTyping(false))
  }, [])

  useEffect(() => {
    fetchMessages()

    selectedChatCompare = selectedChat // Lưu tạm thời giá trị của selectedChat
  }, [selectedChat])
  

  useEffect(() => {
    // Nhận sự kiện 'message recieved' từ máy chủ và dữ liệu newMessageRecieved
    socket.on('message recieved', (newMessageRecieved) => {

      // selectedChatCompare không tồn tại hoặc không trùng với phòng chat mà tin nhắn mới được gửi đến
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        // đưa ra thông báo
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        // Thêm tin nhắn vào ds tin nhắn của phòng chat đó
        setMessages([...messages, newMessageRecieved])
      }
    })
  })
  


  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit('stop typing', selectedChat._id)
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }

        setNewMessage("")

        const { data } = await axios.post("/api/message", {
          content: newMessage,
          chatId: selectedChat._id,
        }, config)

        // console.log(data);
        socket.emit('new message', data) // Gửi sự kiện "new message" và data(message) đến máy chủ
        setMessages([...messages, data])
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        })
      }
    }
  }
  

  const typingHandler = (e) => {
    setNewMessage(e.target.value)

    // Typing logic
    if (!socketConnected) return

    if (!typing) {
      setTyping(true)
      socket.emit('typing', selectedChat._id)
    }

    let lastTypingTime = new Date().getTime()
    var timerLength = 3000; // 3s

    setTimeout(() => {
      var timenow = new Date().getTime()
      var timeDiff = timenow - lastTypingTime

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id)
        setTyping(false)
      }
    }, timerLength);
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={'100%'}
            fontFamily={'Work sans'}
            display={'flex'}
            justifyContent={{ base: 'space-between' }}
            alignItems={'center'}
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>{getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>{selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
                
            )}
          </Text>
          <Box
            display={'flex'}
            flexDir={'column'}
            justifyContent={'flex-end'}
            p={3}
            bg={'#E8E8E8'}
            w={'100%'}
            h={'100%'}
            borderRadius={'lg'}
            overflow={'hidden'}
          >
            {loading ? (
              <Spinner
                size={'xl'}
                w={20}
                h={20}
                alignSelf={'center'}
                margin={'auto'}
              />
            ) : (
              <div className='messages'>
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {istyping ? (<div>
                Đang soạn tin ...
              </div>) : (<></>)}
              <Input
                variant={'filled'}
                bg={'E0E0E0'}
                placeholder='Enter a message'
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat