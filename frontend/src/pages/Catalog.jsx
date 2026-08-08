import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, ChevronRight } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  // Read active category from URL query parameters (e.g. ?category=Eggs)
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?sort=${sort}`;
        if (activeCategory) url += `&category=${activeCategory}`;
        if (search) url += `&search=${search}`;
        
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (err) {
        console.error('Error loading catalog products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input to avoid hitting database on every keystroke
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [activeCategory, search, sort]);

  const handleCategorySelect = (category) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <span>Home</span> <ChevronRight className="w-3.5 h-3.5" /> <span className="text-gray-900 font-medium">Shop Catalog</span>
      </div>
      
      <div>
        <h1 className="text-3xl font-black text-gray-900">Farm Fresh Store</h1>
        <p className="text-gray-500 mt-1">Order organic harvests directly from our local barns and fishing ports.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search dry fish, grade A eggs, chicken cuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-farm-green text-sm"
          />
        </div>

        {/* Categories (Desktop tabs) */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-center">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === ''
                ? 'bg-farm-green text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => handleCategorySelect('Dry Fish')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'Dry Fish'
                ? 'bg-farm-green text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dry Fish
          </button>
          <button
            onClick={() => handleCategorySelect('Eggs')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'Eggs'
                ? 'bg-farm-green text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Farm Eggs
          </button>
          <button
            onClick={() => handleCategorySelect('Chicken')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'Chicken'
                ? 'bg-farm-green text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chicken Cuts
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 w-full lg:w-auto justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-0 focus:ring-2 focus:ring-farm-green rounded-2xl text-xs font-bold text-gray-700 cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {(search || activeCategory || sort !== 'newest') && (
            <button
              onClick={clearFilters}
              className="p-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-2xl transition-colors cursor-pointer"
              title="Clear Filters"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="text-4xl">🌾</div>
          <h3 className="text-xl font-bold text-gray-900">No Products Found</h3>
          <p className="text-sm text-gray-500">We couldn't find matches. Try adjusting your search query or selecting another filter category.</p>
          <button
            onClick={clearFilters}
            className="bg-farm-green hover:bg-farm-green-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
