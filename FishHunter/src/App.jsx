import React from "react"
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Platform from "./pages/Platform";
import Private from "./pages/Private";

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="*" element={<Landing />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="platform" element={<Platform />} />
      <Route path="private" element={<Private />} />
    </Routes>
  </HashRouter>
);

export default App