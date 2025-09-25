import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:3001/products');
    setProducts(res.data);
  };

  const deleteProduct = async (id: number) => {
    await axios.delete(`http://localhost:3001/products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Products</h1>
      <table className="border w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 border">{p.name}</td>
              <td className="px-4 py-2 border">{p.price}</td>
              <td className="px-4 py-2 border">{p.category}</td>
              <td className="px-4 py-2 border">
                <Link
                  to={`/admin/edit/${p.id}`}
                  className="bg-blue-500 mr-2 px-2 py-1 rounded text-white"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="bg-red-500 px-2 py-1 rounded text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
