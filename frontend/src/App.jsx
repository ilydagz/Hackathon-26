import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Placeholder components to prevent crashes during Step 2
const Placeholder = ({ name }) => (
  <div className="flex items-center justify-center min-h-[60vh] text-center p-20">
    <div>
      <h1 className="text-5xl font-black tracking-tighter mb-4">{name}</h1>
      <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold">This page is under construction</p>
    </div>
  </div>
);

const Landing = () => <Placeholder name="Landing Page" />;
const Feed = () => <Placeholder name="Marketplace Feed" />;
const Chat = () => <Placeholder name="Messages & Negotiation" />;
const Profile = () => <Placeholder name="User Profile" />;
const Login = () => <Placeholder name="Login" />;
const Register = () => <Placeholder name="Sign Up" />;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/messages" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
