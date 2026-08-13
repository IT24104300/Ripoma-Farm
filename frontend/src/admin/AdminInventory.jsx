import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../context/NotificationContext';
import { Package, Calendar, User, Search, PlusCircle, ArrowUpDown, Loader, ShieldAlert, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { QuantityStepper } from '../components/FormFields';

// Bespoke Freshness Countdown Micro-Component
const FreshnessCountdown = ({ harvestDate, expiryDate }) => {
  const harvest = new Date(harvestDate);
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  const totalDuration = Math.max(1, expiry - harvest);
  const remainingDuration = Math.max(0, expiry - today);
  const daysRemaining = Math.ceil(remainingDuration / (1000 * 60 * 60 * 24));
  const percent = Math.max(0, Math.min(100, Math.round((remainingDuration / totalDuration) * 100)));
  
  let strokeColor = 'stroke-emerald-600';
  let textColor = 'text-[#2F4B3C]';
  if (daysRemaining <= 0) {
    strokeColor = 'stroke-[#A65D3D]';
    textColor = 'text-[#A65D3D]';
  } else if (daysRemaining <= 5) {
    strokeColor = 'stroke-[#C99A3A]';
    textColor = 'text-[#C99A3A]';
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
        <circle className="stroke-gray-100" fill="none" strokeWidth="3" r="16" cx="18" cy="18" />
        <circle
          className={`${strokeColor} transition-all duration-350`}
          fill="none"
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset={100 - percent}
          strokeLinecap="round"
          r="16"
          cx="18"
          cy="18"
        />
      </svg>
      <div className="text-[10px] text-left">
        {daysRemaining <= 0 ? (
          <span className={`${textColor} font-bold uppercase tracking-wider block text-[8px]`}>Expired</span>
        ) : (
          <>
            <span className={`font-bold ${textColor} block`}>{daysRemaining} days left</span>
            <span className="text-gray-400 block text-[8px] uppercase tracking-wide">Freshness Window</span>
          </>
        )}
      </div>
    </div>
  );
};

const AdminInventory = () => {
  const { showToast } = useContext(NotificationContext);
  
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Restock modal state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  
  // Sourcing batch tracker states
  const [restockQty, setRestockQty] = useState('');
  const [restockDesc, setRestockDesc] = useState('');
  const [batchId, setBatchId] = useState('');
  const [batchOrigin, setBatchOrigin] = useState('Pasture Barn A');
  const [batchHarvestDate, setBatchHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchExpiryDate, setBatchExpiryDate] = useState('');
  
  // Inline validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Edit / Update Batch simulation state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editOrigin, setEditOrigin] = useState('Pasture Barn A');
  const [editHarvestDate, setEditHarvestDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});

  // Remove / Soft-Delete batch state
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [removingLog, setRemovingLog] = useState(null);
  const [removeReason, setRemoveReason] = useState('Spoilage');
  const [removeNotes, setRemoveNotes] = useState('');

  // Sourcing origins dropdowns
  const registeredSources = [
    'Pasture Barn A',
    'Pasture Barn B',
    'Boat Ocean Breeze',
    'Boat Deep Blue',
    'Grassland Coop #4',
    'Grassland Coop #7',
    'Coastal Sourcing Dock'
  ];

  const fetchData = async () => {
    try {
      const prodRes = await axios.get('/api/products');
      setProducts(prodRes.data);

      const logsRes = await axios.get('/api/inventory/logs');
      setLogs(logsRes.data);
    } catch (err) {
      showToast('Could not load inventory database logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper parser for serialized batch descriptions
  const parseBatchInfo = (desc) => {
    if (!desc) return null;
    
    // Ignore updates/removals if they have different keywords
    if (desc.includes('Removed:') || desc.includes('Update:')) {
      // Still extract the original batch details to display, but mark special status
      const match = desc.match(/\[Batch:\s*(.*?)\s*\|\s*Origin:\s*(.*?)\s*\|\s*Expires:\s*(.*?)\s*\|\s*Harvested:\s*(.*?)\]/);
      if (match) {
        return {
          batchId: match[1],
          origin: match[2],
          expiry: match[3],
          harvestDate: match[4] || new Date().toISOString().split('T')[0],
          isArchived: desc.includes('Removed:'),
          isUpdated: desc.includes('Update:'),
          fullText: desc
        };
      }
      return null;
    }

    const match = desc.match(/\[Batch:\s*(.*?)\s*\|\s*Origin:\s*(.*?)\s*\|\s*Expires:\s*(.*?)\s*\|\s*Harvested:\s*(.*?)\]/) ||
                  desc.match(/\[Batch:\s*(.*?)\s*\|\s*Origin:\s*(.*?)\s*\|\s*Expires:\s*(.*?)\]/);
    if (match) {
      return {
        batchId: match[1],
        origin: match[2],
        expiry: match[3],
        harvestDate: match[4] || new Date().toISOString().split('T')[0],
        isArchived: false,
        isUpdated: false,
        fullText: desc
      };
    }
    return null;
  };

  const handleOpenRestock = (prod, varName = '') => {
    setSelectedProduct(prod);
    setSelectedVariant(varName);
    setRestockQty('');
    setRestockDesc('');
    
    const categoryPrefix = prod.category.substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const defaultBatchCode = `BAT-${categoryPrefix}-${dateStr}-${randomSuffix}`;
    setBatchId(defaultBatchCode);
    
    const todayStr = new Date().toISOString().split('T')[0];
    setBatchHarvestDate(todayStr);
    
    let expiryDays = 30;
    if (prod.category === 'Dry Fish') {
      setBatchOrigin('Boat Ocean Breeze');
      expiryDays = 90;
    } else if (prod.category === 'Eggs') {
      setBatchOrigin('Pasture Barn A');
      expiryDays = 30;
    } else {
      setBatchOrigin('Grassland Coop #4');
      expiryDays = 14;
    }
    
    const exp = new Date();
    exp.setDate(exp.getDate() + expiryDays);
    setBatchExpiryDate(exp.toISOString().split('T')[0]);
    
    setErrors({});
    setTouched({});
    setIsRestockOpen(true);
  };

  // Sourcing Edit Batch triggers
  const handleOpenEditBatch = (log, batch) => {
    setEditingLog(log);
    setEditQty(Math.abs(log.quantityChanged).toString());
    setEditOrigin(batch.origin);
    setEditHarvestDate(batch.harvestDate);
    setEditExpiryDate(batch.expiry);
    setEditReason('');
    setEditErrors({});
    setEditTouched({});
    setIsEditOpen(true);
  };

  const handleOpenRemoveBatch = (log) => {
    setRemovingLog(log);
    setRemoveReason('Spoilage');
    setRemoveNotes('');
    setIsRemoveOpen(true);
  };

  // Validation Logic
  const validateField = (name, value, prefix = 'create', category = selectedProduct?.category) => {
    let err = '';
    switch (name) {
      case 'quantity':
        const qtyVal = Number(value);
        if (!value) err = 'Quantity is required';
        else if (isNaN(qtyVal) || !Number.isInteger(qtyVal) || qtyVal <= 0) err = 'Must be an integer greater than 0';
        break;
      case 'batchId':
        if (!value.trim()) err = 'Batch code is required';
        else if (!/^[A-Z0-9-]+$/.test(value)) err = 'Must be alphanumeric uppercase';
        break;
      case 'origin':
        if (!registeredSources.includes(value)) err = 'Must select a registered location';
        break;
      case 'harvestDate':
        if (!value) err = 'Harvest date is required';
        else if (new Date(value) > new Date()) err = 'Harvest date cannot be in the future';
        break;
      case 'expiryDate':
        if (!value) err = 'Expiry date is required';
        else {
          const hd = prefix === 'create' ? batchHarvestDate : editHarvestDate;
          const harvest = new Date(hd);
          const expiry = new Date(value);
          if (expiry <= harvest) err = 'Expiry date must be after harvest date';
          
          const diffTime = Math.abs(expiry - harvest);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const maxLife = category === 'Dry Fish' ? 90 : category === 'Eggs' ? 30 : 14;
          if (diffDays > maxLife) {
            err = `${category} shelf life cannot exceed ${maxLife} days from harvest`;
          }
        }
        break;
      case 'reason':
        if (!value.trim()) err = 'Reason is required for auditing';
        break;
      default:
        break;
    }
    return err;
  };

  const handleInputChange = (name, val) => {
    if (name === 'quantity') setRestockQty(val);
    if (name === 'batchId') setBatchId(val.toUpperCase());
    if (name === 'origin') setBatchOrigin(val);
    if (name === 'harvestDate') setBatchHarvestDate(val);
    if (name === 'expiryDate') setBatchExpiryDate(val);

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleInputBlur = (name, val) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, val);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleEditChange = (name, val) => {
    if (name === 'quantity') setEditQty(val);
    if (name === 'origin') setEditOrigin(val);
    if (name === 'harvestDate') setEditHarvestDate(val);
    if (name === 'expiryDate') setEditExpiryDate(val);
    if (name === 'reason') setEditReason(val);

    const logProduct = products.find(p => p._id === editingLog.productId);

    if (editTouched[name]) {
      const err = validateField(name, val, 'edit', logProduct?.category);
      setEditErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleEditBlur = (name, val) => {
    setEditTouched(prev => ({ ...prev, [name]: true }));
    const logProduct = products.find(p => p._id === editingLog.productId);
    const err = validateField(name, val, 'edit', logProduct?.category);
    setEditErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {
      quantity: validateField('quantity', restockQty),
      batchId: validateField('batchId', batchId),
      origin: validateField('origin', batchOrigin),
      harvestDate: validateField('harvestDate', batchHarvestDate),
      expiryDate: validateField('expiryDate', batchExpiryDate)
    };

    setErrors(allErrors);
    setTouched({ quantity: true, batchId: true, origin: true, harvestDate: true, expiryDate: true });

    if (Object.values(allErrors).some(err => err !== '')) {
      showToast('Please fix all batch validation warnings.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const serializedDescription = `${restockDesc} [Batch: ${batchId} | Origin: ${batchOrigin} | Expires: ${batchExpiryDate} | Harvested: ${batchHarvestDate}]`;

      const payload = {
        productId: selectedProduct._id,
        variantName: selectedVariant,
        quantityChanged: Number(restockQty),
        description: serializedDescription
      };

      await axios.post('/api/inventory/restock', payload);
      showToast(`Batch "${batchId}" registered successfully.`, 'success');
      setIsRestockOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to restock product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Batch Update
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const logProduct = products.find(p => p._id === editingLog.productId);
    const allErrors = {
      quantity: validateField('quantity', editQty),
      origin: validateField('origin', editOrigin),
      harvestDate: validateField('harvestDate', editHarvestDate),
      expiryDate: validateField('expiryDate', editExpiryDate),
      reason: validateField('reason', editReason)
    };

    setEditErrors(allErrors);
    setEditTouched({ quantity: true, origin: true, harvestDate: true, expiryDate: true, reason: true });

    if (Object.values(allErrors).some(err => err !== '')) {
      showToast('Please fix validation warnings.', 'error');
      return;
    }

    const currentBatch = parseBatchInfo(editingLog.description);
    const originalQty = Math.abs(editingLog.quantityChanged);
    const updatedQty = Number(editQty);
    const diff = updatedQty - originalQty;

    setSubmitting(true);
    try {
      // Log correction transaction
      const desc = `[Batch: ${currentBatch.batchId} | Origin: ${editOrigin} | Expires: ${editExpiryDate} | Harvested: ${editHarvestDate}] Update: ${editReason} (Correction diff: ${diff})`;
      const payload = {
        productId: editingLog.productId,
        variantName: editingLog.variantName,
        quantityChanged: diff,
        description: desc
      };

      await axios.post('/api/inventory/restock', payload);
      showToast(`Batch "${currentBatch.batchId}" updated successfully.`, 'success');
      setIsEditOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to modify batch logs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Soft-Delete / Remove Spoilage
  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    if (!removeNotes.trim()) {
      showToast('Notes/Audit reason is required.', 'error');
      return;
    }

    const currentBatch = parseBatchInfo(removingLog.description);
    const batchQty = Math.abs(removingLog.quantityChanged);

    setSubmitting(true);
    try {
      const desc = `[Batch: ${currentBatch.batchId} | Origin: ${currentBatch.origin} | Expires: ${currentBatch.expiry} | Harvested: ${currentBatch.harvestDate}] Removed: ${removeReason} - ${removeNotes}`;
      
      const payload = {
        productId: removingLog.productId,
        variantName: removingLog.variantName,
        quantityChanged: -batchQty, // Subtract quantity completely
        description: desc
      };

      await axios.post('/api/inventory/restock', payload);
      showToast(`Batch "${currentBatch.batchId}" soft-deleted (Status: Removed).`, 'success');
      setIsRemoveOpen(false);
      fetchData();
    } catch (err) {
      showToast('Failed to record spoilage removal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border outline-none rounded py-2 px-3 text-gray-800 input-field text-xs ";
    if (!touched[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return errors[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  const getEditInputClass = (fieldName) => {
    const baseClass = "w-full border outline-none rounded py-2 px-3 text-gray-800 input-field text-xs ";
    if (!editTouched[fieldName]) return baseClass + "border-gray-200 focus:border-[#2F4B3C]";
    return editErrors[fieldName] ? baseClass + "input-invalid" : baseClass + "input-valid";
  };

  return (
    <div className="space-y-6 text-left font-sans print:hidden">
      
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-[#2F4B3C]">Inventory & Harvest Batches</h2>
        <p className="text-[10px] text-gray-400 font-light">Track stock volumes, manage expiry windows, log boat/barn sources, and review batch histories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Active Stock Levels Grid */}
        <div className="bg-white border border-gray-150/60 rounded p-5 shadow-sm lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
            <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-[#A65D3D]" /> Warehouse Stock Levels
            </h3>
            
            <div className="relative w-full sm:max-w-xs text-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-[#2F4B3C] focus:ring-1 focus:ring-[#2F4B3C] outline-none rounded text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center text-gray-400 text-xs gap-1.5"><Loader className="w-5 h-5 animate-spin" /> <span>Loading...</span></div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-150/60 text-gray-400 font-bold uppercase tracking-wider text-[9px] bg-gray-50/50">
                    <th className="p-3">SKU</th>
                    <th className="p-3">Harvest Item</th>
                    <th className="p-3">Option</th>
                    <th className="p-3">Units</th>
                    <th className="p-3 text-right">Operation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    if (p.variants && p.variants.length > 0) {
                      return p.variants.map((v, vIdx) => (
                        <tr key={`${p._id}-${vIdx}`} className="border-b border-gray-50 hover:bg-[#F6EFE3]/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-gray-400">{v.sku}</td>
                          <td className="p-3 font-semibold text-gray-900">{vIdx === 0 ? p.name : ''}</td>
                          <td className="p-3">
                            <span className="bg-[#2F4B3C]/5 text-[#2F4B3C] border border-[#2F4B3C]/10 font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                              {v.name}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                              v.stock === 0 ? 'bg-red-50 text-red-700 border border-red-100' :
                              v.stock < 10 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }`}>
                              {v.stock} units
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenRestock(p, v.name)}
                              className="text-[#2F4B3C] hover:text-[#A65D3D] font-bold text-[9px] uppercase tracking-widest cursor-pointer flex gap-1 items-center justify-end ml-auto"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      ));
                    }

                    return (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-[#F6EFE3]/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-gray-400">{p.sku}</td>
                        <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="p-3 text-gray-400">N/A</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                            p.stock === 0 ? 'bg-red-50 text-red-700 border border-red-100' :
                            p.stock < 10 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-800 border-emerald-100'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenRestock(p)}
                            className="text-[#2F4B3C] hover:text-[#A65D3D] font-bold text-[9px] uppercase tracking-widest cursor-pointer flex gap-1 items-center justify-end ml-auto"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: History Logs / Batch audit & Freshness Countdown */}
        <div className="bg-white border border-gray-150/60 rounded p-5 shadow-sm lg:col-span-5 space-y-6">
          <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] border-b border-gray-50 pb-3 flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-[#A65D3D]" /> Batch Registry Feed & Audits
          </h3>

          {loading ? (
            <div className="py-12 flex justify-center text-gray-400"><Loader className="w-5 h-5 animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No stock audits logged.</div>
          ) : (
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 text-xs">
              {logs.map((log) => {
                const batchInfo = parseBatchInfo(log.description);
                return (
                  <div key={log._id} className="border-b border-gray-50 pb-3.5 space-y-2 group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 leading-tight truncate">{log.productName}</h4>
                        {log.variantName && <span className="text-[9px] text-gray-400 font-semibold uppercase block pt-0.5">{log.variantName}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider shrink-0 ${
                          log.quantityChanged > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-805'
                        }`}>
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                        </span>
                      </div>
                    </div>

                    {/* Render Batch Meta & Visual countdown */}
                    {batchInfo ? (
                      <div className="bg-[#F6EFE3] border border-[#8A6A4B]/10 p-3 rounded text-[10px] space-y-2 font-sans relative overflow-hidden">
                        
                        {/* Cadjan thread twine root details */}
                        <div className="harvest-thread-line-h w-full absolute top-0 left-0"></div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Batch ID:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-800">{batchInfo.batchId}</span>
                            {batchInfo.isArchived && <span className="bg-red-50 text-red-700 font-black px-1.5 py-0.2 rounded text-[7.5px] uppercase tracking-wider">Removed</span>}
                            {batchInfo.isUpdated && <span className="bg-amber-50 text-amber-700 font-black px-1.5 py-0.2 rounded text-[7.5px] uppercase tracking-wider">Updated</span>}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Origin Source:</span>
                          <span className="font-bold text-gray-700">{batchInfo.origin}</span>
                        </div>

                        {/* Freshness Countdown component */}
                        {!batchInfo.isArchived && (
                          <div className="pt-1 flex items-center justify-between border-t border-gray-200">
                            <span className="text-gray-400">Freshness Ring:</span>
                            <FreshnessCountdown harvestDate={batchInfo.harvestDate} expiryDate={batchInfo.expiry} />
                          </div>
                        )}
                        
                        {/* Edit/Delete batch controls visible on hover */}
                        {!batchInfo.isArchived && (
                          <div className="pt-2 border-t border-gray-150/40 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                            <button
                              onClick={() => handleOpenEditBatch(log, batchInfo)}
                              className="text-[#2F4B3C] hover:text-[#A65D3D] flex items-center gap-0.5 font-bold text-[8.5px] uppercase cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit Batch
                            </button>
                            <button
                              onClick={() => handleOpenRemoveBatch(log)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold text-[8.5px] uppercase cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove/Spoil
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic">"{log.description}"</p>
                    )}
                    
                    <div className="flex justify-between items-center text-[9px] text-gray-400 pt-1">
                      <span className="flex items-center gap-0.5"><User className="w-3 h-3 text-[#A65D3D]" /> {log.performedBy}</span>
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3 text-[#A65D3D]" /> {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* RESTOCK CREATE MODAL */}
      {isRestockOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-serif text-sm font-bold text-[#2F4B3C]">Sourcing Restock & Batch Registry</h3>
              <button onClick={() => setIsRestockOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs text-gray-605">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Harvest Item</label>
                <div className="font-bold text-gray-800 bg-gray-50 rounded py-2 px-3 border border-gray-100">
                  {selectedProduct.name}
                </div>
              </div>

              {selectedVariant && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Variant Option</label>
                  <div className="font-bold text-[#2F4B3C] bg-[#2F4B3C]/5 border border-[#2F4B3C]/10 rounded px-2.5 py-1 inline-block uppercase text-[10px] tracking-wider font-semibold">
                    {selectedVariant}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Quantity Adjusted</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 100"
                  value={restockQty}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  onBlur={(e) => handleInputBlur('quantity', e.target.value)}
                  className={getInputClass('quantity')}
                />
                {touched.quantity && errors.quantity && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.quantity}
                  </span>
                )}
              </div>

              {/* Batch-level fields */}
              <div className="border-t border-gray-50 pt-3 space-y-3">
                <h4 className="text-[10px] font-bold text-[#A65D3D] uppercase tracking-wider">Harvest Batch Tracking</h4>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Harvest Batch ID</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => handleInputChange('batchId', e.target.value)}
                    onBlur={(e) => handleInputBlur('batchId', e.target.value)}
                    className={getInputClass('batchId')}
                  />
                  {touched.batchId && errors.batchId && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.batchId}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Origin (Registered)</label>
                    <select
                      value={batchOrigin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      onBlur={(e) => handleInputBlur('origin', e.target.value)}
                      className={getInputClass('origin')}
                    >
                      {registeredSources.map((src, sIdx) => (
                        <option key={sIdx} value={src}>{src}</option>
                      ))}
                    </select>
                    {touched.origin && errors.origin && (
                      <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.origin}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Harvest Date</label>
                    <input
                      type="date"
                      value={batchHarvestDate}
                      onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                      onBlur={(e) => handleInputBlur('harvestDate', e.target.value)}
                      className={getInputClass('harvestDate')}
                    />
                    {touched.harvestDate && errors.harvestDate && (
                      <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.harvestDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Expiry Date</label>
                  <input
                    type="date"
                    value={batchExpiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    onBlur={(e) => handleInputBlur('expiryDate', e.target.value)}
                    className={getInputClass('expiryDate')}
                  />
                  {touched.expiryDate && errors.expiryDate && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {errors.expiryDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Adjustments notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Harvest Audit Notes</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regular morning collection, tide haul stock"
                  value={restockDesc}
                  onChange={(e) => setRestockDesc(e.target.value)}
                  className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-gray-800 text-xs"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 select-none">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded cursor-pointer uppercase text-[9px] tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Object.values(errors).some(e => e !== '')}
                  className="bg-[#2F4B3C] disabled:bg-gray-300 disabled:text-gray-550 hover:bg-[#A65D3D] text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer uppercase text-[9px] tracking-wider"
                >
                  {submitting ? 'Registering...' : 'Register Batch'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT BATCH MODAL */}
      {isEditOpen && editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4 select-none">
              <h3 className="font-serif text-sm font-bold text-[#2F4B3C]">Edit Batch Specifications</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-gray-605">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Product Name</label>
                <div className="font-bold text-gray-800 bg-gray-50 rounded py-2 px-3 border border-gray-100">
                  {editingLog.productName}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Corrected Batch Volume</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => handleEditChange('quantity', e.target.value)}
                  onBlur={(e) => handleEditBlur('quantity', e.target.value)}
                  className={getEditInputClass('quantity')}
                />
                {editTouched.quantity && editErrors.quantity && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {editErrors.quantity}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Origin Source</label>
                  <select
                    value={editOrigin}
                    onChange={(e) => handleEditChange('origin', e.target.value)}
                    className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-xs bg-white cursor-pointer"
                  >
                    {registeredSources.map((src, sIdx) => (
                      <option key={sIdx} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Harvest Date</label>
                  <input
                    type="date"
                    value={editHarvestDate}
                    onChange={(e) => handleEditChange('harvestDate', e.target.value)}
                    onBlur={(e) => handleEditBlur('harvestDate', e.target.value)}
                    className={getEditInputClass('harvestDate')}
                  />
                  {editTouched.harvestDate && editErrors.harvestDate && (
                    <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" /> {editErrors.harvestDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Expiry Date</label>
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => handleEditChange('expiryDate', e.target.value)}
                  onBlur={(e) => handleEditBlur('expiryDate', e.target.value)}
                  className={getEditInputClass('expiryDate')}
                />
                {editTouched.expiryDate && editErrors.expiryDate && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {editErrors.expiryDate}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Reason for Audit Correction</label>
                <input
                  type="text"
                  placeholder="e.g. Typo fix, recalculation, scale offset"
                  value={editReason}
                  onChange={(e) => handleEditChange('reason', e.target.value)}
                  onBlur={(e) => handleEditBlur('reason', e.target.value)}
                  className={getEditInputClass('reason')}
                />
                {editTouched.reason && editErrors.reason && (
                  <span className="text-red-500 font-bold text-[9px] tracking-wide flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> {editErrors.reason}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 select-none">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-755 font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Object.values(editErrors).some(e => e !== '')}
                  className="bg-[#2F4B3C] disabled:bg-gray-300 disabled:text-gray-500 hover:bg-[#A65D3D] text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Save Corrections'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE / SPOILAGE LOG MODAL */}
      {isRemoveOpen && removingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up space-y-4">
            
            <h3 className="font-serif text-sm font-bold text-[#2F4B3C] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#A65D3D]" /> Spoilage & Removal Audit
            </h3>

            <p className="text-xs text-gray-500 font-light">
              Record spoilage or write-off for **{removingLog.productName}** ({Math.abs(removingLog.quantityChanged)} units).
            </p>

            <form onSubmit={handleRemoveSubmit} className="space-y-4 text-xs text-gray-600">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Removal Category</label>
                <select
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-xs bg-white cursor-pointer"
                >
                  <option value="Spoilage">Spoilage (Expired)</option>
                  <option value="Damage">Damage (Cracked/Torn)</option>
                  <option value="Correction">Audit Check Correction</option>
                  <option value="Other">Other Discard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider">Detailed Removal Notes</label>
                <input
                  type="text"
                  required
                  placeholder="Explain write-off details..."
                  value={removeNotes}
                  onChange={(e) => setRemoveNotes(e.target.value)}
                  className="w-full border border-gray-200 outline-none rounded py-2 px-3 text-xs text-gray-800 focus:border-[#2F4B3C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 select-none">
                <button
                  type="button"
                  onClick={() => setIsRemoveOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Record Spoilage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventory;
