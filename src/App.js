import './App.css';
import axios from "axios";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";


import Landing from './pages/landing';
import Footer from './components/footer';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import Profile from './pages/profile';
import Invitation from "./pages/invitation";

const App = () => {

  useEffect(() => {
    axios.get("/api").then(r => {
      console.log(r.data);
    }).catch(e => {
      console.log(e);
    })
  }, [])

  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/email/accept-invitation" element={<Invitation />} />
      </Routes>
      <Footer />
    </div>

  )

}


export default App;
