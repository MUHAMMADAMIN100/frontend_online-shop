import { Route, Routes } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <AdminNavbar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<ProductForm />} />
          <Route path="/edit/:id" element={<ProductForm />} />
        </Routes>
      </div>
    </div>
  );
}