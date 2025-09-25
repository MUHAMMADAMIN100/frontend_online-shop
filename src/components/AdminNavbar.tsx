import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <nav className="bg-gray-800 p-4 w-64 h-screen text-white">
      <h2 className="mb-6 font-bold text-xl">Admin Panel</h2>
      <ul>
        <li className="mb-4">
          <Link to="/admin/">Products</Link>
        </li>
        <li>
          <Link to="/admin/add">Add Product</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
