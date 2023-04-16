import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from "axios"
import { useHistory } from "react-router-dom"
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const Login = () => {
    const [show, setShow] = useState(false) /* Trạng thái ban đầu là false -> ẩn pass */
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [loading, setLoading] = useState(false) // Quản lý trạng thái
    const toast = useToast() // Hiển thị thông báo
    const history = useHistory() // Lịch sử điều hướng

    const handleClick = () => setShow(!show)

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please Fill all the Feilds",
                status: "warning",
                duration: 5000, // Thời gian hiển thị (tức 5s)
                isClosable: true, // Cho phép người dùng nhấn nút x để đóng thông báo
                position: "bottom", // Vị trí hiển thị thông báo
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            }

            const { data } = await axios.post("/api/user/login", { email, password }, config)

            toast({
                title: "Login Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            // Lưu đối tượng data trả về vào localStorage
            localStorage.setItem("userInfo", JSON.stringify(data))
            setLoading(false)
            window.location.reload()
            history.push('/chats') // Chuyển hướng đến trang /chats
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    }
    return (
        <VStack spacing={'5px'}>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Enter your password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width={'4.5rem'}>
                        <Button h={'1.75rem'} size="sm" onClick={handleClick}>
                            {show ? <ViewOffIcon/> : <ViewIcon/>}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            //isLoading={picLoading}
            >
                Login
            </Button>
            {/* <Button
                variant="solid"
                colorScheme="red"
                width="100%"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
            >
                Get Guest User Credentials
            </Button> */}
        </VStack>
    )
}

export default Login