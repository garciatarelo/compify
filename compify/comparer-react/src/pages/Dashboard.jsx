import React, { useState, useEffect } from 'react';

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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm]);

  const fetchData = async (pageNo, search = '') => {
    setLoading(true);
    try {
      // Fetch unmatched products with search param
      const prodRes = await fetch(`http://localhost:8000/api/dashboard/products?unmatched=true&page=${pageNo}&search=${search}`);
      const prodData = await prodRes.json();
      setProducts(prodData.data || []);
      setTotalPages(prodData.last_page || 1);

      // Fetch groups (only on first load or separate effect, but fine here for now)
      const groupRes = await fetch('http://localhost:8000/api/dashboard/groups');
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
      const res = await fetch('http://localhost:8000/api/dashboard/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selectedProducts })
      });
      if (res.ok) {
        setSelectedProducts([]);
        fetchData(page, debouncedSearchTerm);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const ungroup = async (groupId, productIds) => {
    try {
      const res = await fetch(`http://localhost:8000/api/dashboard/groups/${groupId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds })
      });
      if (res.ok) {
        fetchData(page, debouncedSearchTerm);
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
      <h1 className="text-2xl font-bold mb-4">Dashboard de Emparejamiento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unmatched Products */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Productos Sin Agrupar</h2>
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full p-2 border rounded mb-2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={createGroup}
            disabled={selectedProducts.length === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2 disabled:bg-gray-300"
          >
            Crear Grupo ({selectedProducts.length})
          </button>
          
          <div className="h-96 overflow-y-auto">
            {loading ? <p>Cargando...</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Tienda</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Precio</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedProducts).map(([groupName, groupItems]) => (
                    <React.Fragment key={groupName}>
                      {/* Header del Grupo Visual */}
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <td colSpan="6" className="p-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">
                              {groupName} <span className="text-gray-500">({groupItems.length})</span>
                            </span>
                            <button 
                              onClick={() => handleSelectGroup(groupItems)}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                            >
                              Seleccionar todos
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Items del Grupo */}
                      {groupItems.map(product => (
                        <tr key={product.product_id} className="border-b hover:bg-gray-50">
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
                          <td className="p-2">${product.prices[0]?.price}</td>
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
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>

        </div>

        {/* Groups */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Grupos Existentes</h2>
          <div className="h-96 overflow-y-auto">
            {groups.map(group => (
              <div key={group.id} className="border rounded p-2 mb-2">
                <div className="flex justify-between items-center bg-gray-100 p-2">
                  <span className="font-bold">{group.name}</span>
                  <span className="text-xs text-gray-500">ID: {group.id}</span>
                </div>
                <div className="p-2">
                  {group.products.map(prod => (
                    <div key={prod.product_id} className="flex justify-between text-sm border-b py-1">
                      <span>
                        {prod.prices[0]?.store?.name_store}: {prod.brand} {prod.model}
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
                        className="text-red-500 text-xs"
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
