import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/formatters';

// Función helper para normalizar nombres y agrupar visualmente
const normalizeName = (brand, model) => {
  let text = `${brand} ${model}`.toLowerCase();
  // Palabras a eliminar para limpiar el nombre
  const stopWords = [
    "gaming", "notebook", "laptop", "pc", "computadora", "portatil", 
    "windows", "win10", "win11", "home", "pro", 
    "fhd", "hd", "uhd", "4k", "touch",
    "ssd", "hdd", "nvme", "gb", "tb", "ram"
  ];
  
  stopWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, '');
  });

  // Eliminar tamaños de pantalla y patrones comunes (ej: 15.6", 14)
  text = text.replace(/\b\d+(\.\d+)?\s*("|'|inch|pulgadas)\b/g, '');
  text = text.replace(/\b(14|15\.6|17\.3|13\.3|16)\b/g, '');

  // Limpiar caracteres especiales y espacios extra
  text = text.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  
  return text || "Otros";
};

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productType, setProductType] = useState('laptops'); // 'laptops' or 'components'

  const [selectedGroupToAdd, setSelectedGroupToAdd] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(page, debouncedSearchTerm, productType);
  }, [page, debouncedSearchTerm, productType]);

  const fetchData = async (pageNo, search = '', type = 'laptops') => {
    setLoading(true);
    try {
      // Fetch unmatched products with search param
      const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/products?unmatched=true&page=${pageNo}&search=${search}&type=${type}`);
      const prodData = await prodRes.json();
      setProducts(prodData.data || []);
      setTotalPages(prodData.last_page || 1);

      // Fetch groups (only on first load or separate effect, but fine here for now)
      const groupRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/groups?type=${type}`);
      const groupData = await groupRes.json();
      setGroups(groupData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const createGroup = async () => {
    if (selectedProducts.length === 0) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selectedProducts })
      });
      if (res.ok) {
        setSelectedProducts([]);
        fetchData(page, debouncedSearchTerm, productType);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const addToExistingGroup = async () => {
    if (selectedProducts.length === 0 || !selectedGroupToAdd) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/groups/${selectedGroupToAdd}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selectedProducts })
      });
      if (res.ok) {
        setSelectedProducts([]);
        setSelectedGroupToAdd('');
        fetchData(page, debouncedSearchTerm, productType);
        alert('Productos añadidos al grupo correctamente');
      } else {
        alert('Error al añadir productos al grupo');
      }
    } catch (error) {
      console.error('Error adding to group:', error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Remove from local state
        setProducts(products.filter(p => p.product_id !== id));
        setSelectedProducts(selectedProducts.filter(pid => pid !== id));
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const ungroup = async (groupId, productIds) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/groups/${groupId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds })
      });
      if (res.ok) {
        fetchData(page, debouncedSearchTerm, productType);
      }
    } catch (error) {
      console.error('Error ungrouping:', error);
    }
  };

  // Use products directly as they are now filtered by backend
  const displayProducts = products;

  const handleSelectGroup = (groupItems) => {
    const ids = groupItems.map(p => p.product_id);
    setSelectedProducts(prev => {
      const newSet = new Set([...prev, ...ids]);
      return Array.from(newSet);
    });
  };

  // Agrupar productos por nombre normalizado
  const groupedProducts = displayProducts.reduce((acc, product) => {
    const key = normalizeName(product.brand, product.model);
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-8 text-center">Dashboard de Emparejamiento</h1>

      <div className="mb-6 flex gap-4">
        <button 
          onClick={() => setProductType('laptops')}
          className={`px-5 py-2 rounded-lg shadow font-semibold transition-colors duration-150 ${productType === 'laptops' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-700'}`}
        >
          Laptops
        </button>
        <button 
          onClick={() => setProductType('components')}
          className={`px-5 py-2 rounded-lg shadow font-semibold transition-colors duration-150 ${productType === 'components' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-700'}`}
        >
          Componentes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Unmatched Products: ocupa 3/5 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 md:col-span-3">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">Productos Sin Agrupar</h2>
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-3 mb-4">
            <button 
              onClick={createGroup}
              disabled={selectedProducts.length === 0}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-300"
            >
              Crear Nuevo Grupo ({selectedProducts.length})
            </button>

            <div className="flex gap-2 items-center">
              <select 
                className="border rounded-lg p-2 shadow"
                value={selectedGroupToAdd}
                onChange={(e) => setSelectedGroupToAdd(e.target.value)}
                disabled={selectedProducts.length === 0}
              >
                <option value="">-- Añadir a Grupo Existente --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} (ID: {g.id})
                  </option>
                ))}
              </select>
              <button 
                onClick={addToExistingGroup}
                disabled={selectedProducts.length === 0 || !selectedGroupToAdd}
                className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-300"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="h-96 overflow-y-auto rounded-lg border border-gray-100">
            {loading ? <p className="text-center text-blue-500 font-semibold">Cargando...</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-2">Select</th>
                    <th className="p-2">Tienda</th>
                    <th className="p-2">Marca</th>
                    <th className="p-2">Modelo</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Link</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedProducts).map(([groupName, groupItems]) => (
                    <React.Fragment key={groupName}>
                      {/* Header del Grupo Visual */}
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <td colSpan="7" className="p-2 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-700 uppercase text-xs tracking-wider">
                              {groupName} <span className="text-gray-500">({groupItems.length})</span>
                            </span>
                            <button 
                              onClick={() => handleSelectGroup(groupItems)}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-200"
                            >
                              Seleccionar todos
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Items del Grupo */}
                      {groupItems.map(product => (
                        <tr key={product.product_id} className="border-b hover:bg-blue-50 transition-all">
                          <td className="p-2 pl-4">
                            <input 
                              type="checkbox" 
                              checked={selectedProducts.includes(product.product_id)}
                              onChange={() => handleSelectProduct(product.product_id)}
                            />
                          </td>
                          <td className="p-2">{product.prices[0]?.store?.name_store}</td>
                          <td className="p-2">{product.brand}</td>
                          <td className="p-2">{product.model}</td>
                          <td className="p-2">{formatPrice(product.prices[0]?.price)}</td>
                          <td className="p-2">
                            {product.prices[0]?.product_url && (
                              <a 
                                href={product.prices[0].product_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver
                              </a>
                            )}
                          </td>
                          <td className="p-2">
                            <button 
                              onClick={() => deleteProduct(product.product_id)}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                              title="Eliminar producto"
                            >
                              <span className="text-black">🗑️</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-300"
            >
              Anterior
            </button>
            <span className="font-semibold text-blue-700">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-300"
            >
              Siguiente
            </button>
          </div>

        </div>

        {/* Groups: ocupa 2/5 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">Grupos Existentes</h2>
          <div className="h-96 overflow-y-auto rounded-lg border border-gray-100">
            {groups.map(group => (
              <div key={group.id} className="border rounded-xl p-3 mb-4 shadow hover:shadow-lg transition-all bg-blue-50">
                <div className="flex justify-between items-center bg-blue-100 p-3 rounded-t-xl">
                  <span className="font-bold text-blue-700 text-lg">{group.name}</span>
                  <span className="text-xs text-blue-600">ID: {group.id}</span>
                </div>
                <div className="p-3">
                  {group.products.map(prod => (
                    <div key={prod.product_id} className="flex justify-between text-sm border-b py-2 hover:bg-blue-200 transition-all rounded">
                      <span>
                        {prod.prices[0]?.store?.name_store}: <span className="font-semibold">{prod.brand} {prod.model}</span>
                        {prod.prices[0]?.product_url && (
                          <a 
                            href={prod.prices[0].product_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            (Ver)
                          </a>
                        )}
                      </span>
                      <button 
                        onClick={() => ungroup(group.id, [prod.product_id])}
                        className="text-red-500 text-xs font-bold px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
