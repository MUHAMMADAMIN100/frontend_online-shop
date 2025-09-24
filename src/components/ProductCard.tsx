import React from 'react';
import type { Product } from '../features/products/productsSlice';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd }: { product: Product; onAdd?: () => void }) {
  return (
    <div className="flex flex-col bg-white p-3 border rounded">
      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="mb-3 rounded h-40 object-cover" />
      <h3 className="font-medium">{product.name}</h3>
      <div className="mb-2 text-gray-600 text-sm">{product.category}</div>
      <div className="flex justify-between items-center mt-auto">
        <div className="font-bold">{product.price} $</div>
        <div className="flex space-x-2">
          <Link to={`/product/${product.id}`} className="text-sm underline">View</Link>
          <button
            onClick={onAdd}
            className="bg-blue-600 px-3 py-1 rounded text-white text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
