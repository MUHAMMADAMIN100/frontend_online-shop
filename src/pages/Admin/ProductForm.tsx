import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSave as FiSaveIcon } from "react-icons/fi"; // иконка сохранения с правильным типом

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      axios
        .get(`https://backend-online-shop-vrxj.onrender.com/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error(err));
    } else {
      setProduct({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "",
      });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Нет токена авторизации");

      if (id) {
        await axios.put(
          `https://backend-online-shop-vrxj.onrender.com/products/${id}`,
          product,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Товар обновлен!");
      } else {
        await axios.post(
          "https://backend-online-shop-vrxj.onrender.com/products",
          product,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Товар создан!");
      }

      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при сохранении товара");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="bg-white shadow mx-auto mt-6 p-6 rounded-xl max-w-2xl">
      <h1 className="mb-6 font-bold text-blue-900 text-2xl md:text-3xl text-center">
        {id ? "Редактирование товара" : "Создание товара"}
      </h1>

      {message && (
        <div className="bg-green-100 mb-4 p-3 rounded-lg text-green-800 text-center animate-fadeIn">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Название</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Описание</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Цена</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">URL изображения</label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Категория</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
            required
          />
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center bg-green-600 hover:bg-green-700 shadow-lg p-3 rounded-full text-white hover:scale-110 transition transform"
          >
            <FiSaveIcon size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;