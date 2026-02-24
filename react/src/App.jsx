import { Routes, Route } from "react-router-dom";
import Login from './auth/login.jsx'
import Register from './auth/register.jsx'
import Homepage from "./page/homepage.jsx";
import Chatbot from "./page/mainpage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mainpage" element={<Chatbot />} />
    </Routes>
  )
}

export default App