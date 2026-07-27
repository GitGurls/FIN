import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Receipts from "./pages/Receipts";
import Calendar from "./pages/Calendar";
import Investments from "./pages/Investments";
import Currency from "./pages/Currency";
import Reports from "./pages/Reports";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";

const withProtection = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={withProtection(<Dashboard />)} />
      <Route path="/transactions" element={withProtection(<Transactions />)} />
      <Route path="/receipts" element={withProtection(<Receipts />)} />
      <Route path="/calendar" element={withProtection(<Calendar />)} />
      <Route path="/investments" element={withProtection(<Investments />)} />
      <Route path="/currency" element={withProtection(<Currency />)} />
      <Route path="/reports" element={withProtection(<Reports />)} />
      <Route path="/groups" element={withProtection(<Groups />)} />
      <Route path="/groups/:id" element={withProtection(<GroupDetail />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/settings" element={withProtection(<Settings />)} />
    </Routes>
  );
}

export default App;
