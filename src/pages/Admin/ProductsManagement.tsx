import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  FiEdit as FiEditIcon,
  FiTrash2 as FiTrash2Icon,
  FiPlus as FiPlusIcon,
  FiCheck as FiCheckIcon,
  FiX as FiXIcon
} from "react-icons/fi"; // иконки с корректной типизацией

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
  createdAt: string;
  category: string;
}

const ProductsManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://backend-online-shop-vrxj.onrender.com/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
      showDialog("Ошибка при загрузке товаров");
    } finally {
      setLoading(false);
    }
  };

  const showDialog = (msg: string) => {
    setModalMessage(msg);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProductId(null);
    setName("");
    setPrice("");
    setDescription("");
    setImageUrl("");
    setCategory("");
  };

  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description);
    setImageUrl(product.image || "");
    setCategory(product.category);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      showDialog("Введите название, цену и категорию");
      return;
    }

    const body = { name, price: Number(price), description, image: imageUrl, category };

    try {
      let response: Response;
      if (editingProductId) {
        response = await fetch(`https://backend-online-shop-vrxj.onrender.com/admin/products/${editingProductId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch("https://backend-online-shop-vrxj.onrender.com/admin/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (response.ok) {
        const updatedProduct = await response.json();
        if (editingProductId) {
          setProducts(products.map((p) => (p.id === editingProductId ? updatedProduct : p)));
        } else {
          setProducts([...products, updatedProduct]);
        }
        resetForm();
        setShowForm(false);
        showDialog(editingProductId ? "Товар обновлен" : "Товар добавлен");
      } else {
        const err = await response.text();
        console.error(err);
        showDialog("Ошибка при сохранении товара");
      }
    } catch (err) {
      console.error(err);
      showDialog("Ошибка при сохранении товара");
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`https://backend-online-shop-vrxj.onrender.com/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        showDialog("Товар удален");
      } else {
        showDialog("Ошибка при удалении товара");
      }
    } catch (err) {
      console.error(err);
      showDialog("Ошибка при удалении товара");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <div className="py-8 text-center">Загрузка товаров...</div>;

  return (
    <div className="relative bg-white shadow p-6 rounded-xl">
      <h2 className="mb-4 font-semibold text-gray-900 text-xl">Управление товарами</h2>

      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 mb-4 px-4 py-2 rounded-lg text-white"
        >
          <FiPlusIcon /> Добавить
        </button>
      )}

      {showForm && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/30">
          <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-lg scale-95 animate-scaleUp">
            <h3 className="mb-4 font-semibold text-blue-800 text-2xl text-center">
              {editingProductId ? "Редактирование товара" : "Добавление товара"}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input type="text" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded w-full" />
              <input type="number" placeholder="Цена" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border rounded w-full" />
              <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 border rounded w-full" />
              <input type="text" placeholder="URL картинки" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="p-2 border rounded w-full" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded w-full">
                <option value="">Выберите категорию</option>
                <option value="Футболки">Футболки</option>
                <option value="Кроссовки">Кроссовки</option>
                <option value="Шорты">Шорты</option>
              </select>
              <div className="flex justify-between gap-2">
                <button type="submit" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white">
                  <FiCheckIcon /> {editingProductId ? "Сохранить" : "Добавить"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-lg text-white">
                  <FiXIcon /> Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалки */}
      {showModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/20">
          <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-sm text-center scale-95 animate-scaleUp">
            <p className="text-gray-800">{modalMessage}</p>
            <button onClick={() => setShowModal(false)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-lg text-white">
              <FiCheckIcon /> Ок
            </button>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/20">
          <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-sm text-center scale-95 animate-scaleUp">
            <p className="mb-4 text-gray-800">Вы уверены, что хотите удалить этот товар?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => deleteProduct(confirmDeleteId)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white">
                <FiTrash2Icon /> Да
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-lg text-white">
                <FiXIcon /> Нет
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Название</th>
              <th className="px-6 py-3 text-left">Цена</th>
              <th className="px-6 py-3 text-left">Описание</th>
              <th className="px-6 py-3 text-left">Категория</th>
              <th className="px-6 py-3 text-left">Картинка</th>
              <th className="px-6 py-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">{product.id}</td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.price}₽</td>
                <td className="px-6 py-4 max-w-xs truncate">{product.description}</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">
                  {product.image ? <img src={product.image} alt={product.name} className="rounded w-16 h-16 object-cover" /> : "—"}
                </td>
                <td className="flex gap-2 px-6 py-4">
                  <button onClick={() => startEditing(product)} className="flex items-center gap-1 text-blue-600 hover:text-blue-900 cursor-pointer">
                    <FiEditIcon />
                  </button>
                  <button onClick={() => setConfirmDeleteId(product.id)} className="flex items-center gap-1 text-red-600 hover:text-red-900 cursor-pointer">
                    <FiTrash2Icon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsManagement;