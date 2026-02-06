import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Feed from "../Feed";
import Profile from "./Profile";

import ProtectedRoute from "../ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/*   PROTECTED ROUTES   */}
        <Route 
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
              <Home/>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
