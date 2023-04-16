import React from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ChatProvider from "./context/ChatProvider"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ChatProvider>
      <ChakraProvider> {/* Là 1 component của chakra UI, cung cấp style và theme cho ứng dụng */}
        <App /> {/* Là 1 component React tùy chỉnh, được định nghĩa trong file App.js */}
      </ChakraProvider>
    </ChatProvider>
  </BrowserRouter>
)