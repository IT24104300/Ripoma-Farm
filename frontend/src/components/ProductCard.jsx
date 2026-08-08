import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';
import { ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { showToast } = useContext(NotificationContext);

  const discountPercent = product.discount || 0;
  const originalPrice = product.basePrice;
  const finalPrice = discountPercent > 0 
    ? originalPrice - (originalPrice * (discountPercent / 100)) 
    : originalPrice;

  // Stock status checks
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  // Sourcing tags based on product specifications or category
  const getSourcingTag = () => {
    if (product.category === 'Dry Fish') {
      return product.specifications?.Origin || 'Coastal Harvest';
    }
    if (product.category === 'Eggs') {
      return 'Laid this morning';
    }
    return product.specifications?.Freshness || 'Pasture-raised';
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop click propagating to the card Link
    
    // Use first variant name if variants exist
    const variantName = product.variants && product.variants.length > 0 
      ? product.variants[0].name 
      : '';

    addToCart(product, variantName, 1);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  // Determine category thematic color
  const getCategoryColor = () => {
    if (product.category === 'Dry Fish') return 'text-[#3E6B6B] bg-[#3E6B6B]/5 border-[#3E6B6B]/15';
    if (product.category === 'Eggs') return 'text-[#C99A3A] bg-[#C99A3A]/5 border-[#C99A3A]/15';
    return 'text-[#2F4B3C] bg-[#2F4B3C]/10 border-[#2F4B3C]/20';
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full hover:shadow-lg hover:-translate-y-1 text-left font-sans">
      
      {/* Product Image Panel on a texturized background */}
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden pb-[75%] shrink-0 bg-texture-linen">
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Discount Tag */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#A65D3D] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        )}

        {/* Category Themed Sourcing Tag */}
        <span className={`absolute bottom-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider backdrop-blur-md ${getCategoryColor()}`}>
          {getSourcingTag()}
        </span>
      </Link>

      {/* Product Info Block */}
      <div className="p-4 flex flex-col grow justify-between space-y-4">
        <div className="space-y-1">
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#A65D3D]">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((x) => (
                <Star 
                  key={x} 
                  className={`w-2.5 h-2.5 ${x <= Math.round(product.rating || 5) ? 'fill-current' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">({product.reviews?.length || 0})</span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-semibold text-gray-900 group-hover:text-[#2F4B3C] transition-colors text-sm line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Product Sourcing Detail */}
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="space-y-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between">
            {/* Price tag */}
            <div>
              {discountPercent > 0 ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-[#2F4B3C]">${finalPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-gray-900">${originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Stock status indicator */}
            <div>
              {isOutOfStock ? (
                <span className="text-[9px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider">Sold Out</span>
              ) : isLowStock ? (
                <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wider">Only {product.stock} Left</span>
              ) : (
                <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Fresh</span>
              )}
            </div>
          </div>

          {/* Cart action */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-medium shadow-sm hover:shadow'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
