import App from './App'
import ReactDOM from "react-dom/client"
import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
