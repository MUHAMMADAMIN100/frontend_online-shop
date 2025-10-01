import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
  });

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3001/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (id) {
        // Редактируем
        await axios.put(`http://localhost:3001/products/${id}`, product, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Создаём
        await axios.post('http://localhost:3001/products', product, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">{id ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="px-2 py-1 border w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="px-2 py-1 border w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="px-2 py-1 border w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Image URL</label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleChange}
            className="px-2 py-1 border w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="px-2 py-1 border w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          {id ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
