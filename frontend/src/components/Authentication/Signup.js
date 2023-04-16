import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from "axios"
import { useHistory } from "react-router-dom"
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const Signup = () => {

    const [show, setShow] = useState(false) /* Trạng thái ban đầu là false -> ẩn pass */

    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [confirmpassword, setConfirmpassword] = useState()
    const [password, setPassword] = useState()
    const [pic, setPic] = useState()
    const [loading, setLoading] = useState(false) // Quản lý trạng thái
    const toast = useToast() // Hiển thị thông báo
    const history = useHistory() // Lịch sử điều hướng

    // Hàm thay đổi hành dộng ẩn hiện pass
    const handleClick = () => setShow(!show)

    // Hàm thực hiện việc upload ảnh
    const postDetails = (pics) => {
        setLoading(true)

        // Không xác định được image
        if (pics === undefined) {
            // Show thông báo
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            return
        }

        // Ảnh thuộc jpeg or png
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData() // Tạo đối tượng FormData để tải hỉnh ảnh lên cloudinary
            data.append("file", pics)
            data.append("upload_preset", "chat-app")
            data.append("cloud_name", "dalzq0hln")
            fetch("https://api.cloudinary.com/v1_1/dalzq0hln/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json()) // Gọi dữ liệu trả về từ cloudinary
                .then((data) => {
                    setPic(data.url.toString())
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                })
        } else {
            // Show thông báo thất bại
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
            setLoading(false)
            return
        }

    }

    // Xử lý khi bấm sumit 
    const submitHandler = async() => {
        setLoading(true)

        // Kiểm tra các trường có được điền đầy đủ hay không
        if (!name || !email || !password || !confirmpassword) {
            toast({
                title: "Please Fill all the Feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false)
            return
        }

        // Kiểm tra pass và xác nhận pass có giống nhau hay không
        if (password !== confirmpassword) {
            toast({
                title: "Passwords Do Not Match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        /* Tiến hành thêm người dùng vào db thông qua api /api/user */
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            }

            // Gửi yêu cầu đến /api/user để đăng ký người dùng mới. Phương thức này trả về 1 Promise
            const { data } = await axios.post("/api/user", { name, email, password, pic }, config)

            // Show thông báo đăng ký thành công
            toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })

            // Lưu đối tượng data trả về vào localStorage
            localStorage.setItem("userInfo", JSON.stringify(data))
            setLoading(false)
            history.push('/chats') // Chuyển hướng đến trang /chats
        } catch (error) {

            // Show thông báo đăng ký không thành công
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false)
        }
    }

    return (
        <VStack spacing={'5px'}>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder='Enter your name'
                    // onChange là một sự kiện xảy ra khi giá trị của một phần tử nhập liệu (input element) thay đổi.
                    // Giá trị nhập vào được truyền vào biến sự kiện và truy xuất qua target.value
                    onChange={(e) => setName(e.target.value)}
                />
            </FormControl>
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
            <FormControl id='password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Confirm password'
                        onChange={(e) => setConfirmpassword(e.target.value)}
                    />
                    <InputRightElement width={'4.5rem'}>
                        <Button h={'1.75rem'} size="sm" onClick={handleClick}>
                            {show ? <ViewOffIcon/> : <ViewIcon/>}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id="pic">
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>

            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default Signup