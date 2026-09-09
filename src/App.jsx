import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ClimatePage from "./pages/ClimatePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";
import RegisterFarmer from "./pages/RegisterFarmer.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RegisterFarmer />} />
          <Route path="/programs/:programId" element={<ProgramDetail />} />
          <Route path="/clima" element={<ClimatePage />} />
        </Routes>
      </main>
    </div>
  );
}
