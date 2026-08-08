import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../context/NotificationContext';
import { Shield, PlusCircle, Edit2, Trash2, ShieldAlert, Loader, Check, X, AlertTriangle } from 'lucide-react';

const AdminRoles = () => {
  const { showToast } = useContext(NotificationContext);

  const [roles, setRoles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal triggers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState({
    Catalog: { view: false, create: false, edit: false, delete: false },
    Inventory: { view: false, create: false, edit: false, delete: false },
    Orders: { view: false, create: false, edit: false, delete: false },
    Customers: { view: false, create: false, edit: false, delete: false },
    Workers: { view: false, create: false, edit: false, delete: false },
    Financials: { view: false, create: false, edit: false, delete: false }
  });

  const modules = ['Catalog', 'Inventory', 'Orders', 'Customers', 'Workers', 'Financials'];
  const actions = ['view', 'create', 'edit', 'delete'];

  // Default protected system roles
  const systemRoles = ['Admin', 'Manager', 'Worker'];

  const fetchData = async () => {
    try {
      // Load workers to check active role assignments
      const { data: workersList } = await axios.get('/api/workers');
      setWorkers(workersList);

      // Load custom roles from local storage or mock state to persist custom ones
      const storedRoles = localStorage.getItem('ripoma_roles');
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      } else {
        // Seed default roles
        const initial = [
          {
            name: 'Admin',
            description: 'System administrator with full operations permissions across all farm modules.',
            isSystem: true,
            permissions: {
              Catalog: { view: true, create: true, edit: true, delete: true },
              Inventory: { view: true, create: true, edit: true, delete: true },
              Orders: { view: true, create: true, edit: true, delete: true },
              Customers: { view: true, create: true, edit: true, delete: true },
              Workers: { view: true, create: true, edit: true, delete: true },
              Financials: { view: true, create: true, edit: true, delete: true }
            }
          },
          {
            name: 'Manager',
            description: 'Operational manager with catalog, inventory, and fulfillment editing rights.',
            isSystem: true,
            permissions: {
              Catalog: { view: true, create: true, edit: true, delete: false },
              Inventory: { view: true, create: true, edit: true, delete: false },
              Orders: { view: true, create: true, edit: true, delete: false },
              Customers: { view: true, create: true, edit: true, delete: false },
              Workers: { view: true, create: false, edit: false, delete: false },
              Financials: { view: true, create: false, edit: false, delete: false }
            }
          },
          {
            name: 'Worker',
            description: 'Field workers with view privileges and tasks update controls.',
            isSystem: true,
            permissions: {
              Catalog: { view: true, create: false, edit: false, delete: false },
              Inventory: { view: true, create: false, edit: false, delete: false },
              Orders: { view: true, create: false, edit: false, delete: false },
              Customers: { view: false, create: false, edit: false, delete: false },
              Workers: { view: true, create: false, edit: true, delete: false },
              Financials: { view: false, create: false, edit: false, delete: false }
            }
          }
        ];
        localStorage.setItem('ripoma_roles', JSON.stringify(initial));
        setRoles(initial);
      }
    } catch (err) {
      showToast('Could not fetch workers or roles registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveRoles = (newRoles) => {
    localStorage.setItem('ripoma_roles', JSON.stringify(newRoles));
    setRoles(newRoles);
  };

  const handleOpenAdd = () => {
    setRoleName('');
    setRoleDescription('');
    // Reset permissions
    const clean = {};
    modules.forEach(m => {
      clean[m] = { view: false, create: false, edit: false, delete: false };
    });
    setPermissions(clean);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setPermissions(JSON.parse(JSON.stringify(role.permissions)));
    setIsEditOpen(true);
  };

  const handleOpenDelete = (role) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const handlePermissionChange = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Role title is required.', 'error');
      return;
    }
    const nameLower = roleName.trim().toLowerCase();
    if (roles.some(r => r.name.toLowerCase() === nameLower)) {
      showToast('A role with this name already exists.', 'error');
      return;
    }

    const newRole = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      isSystem: false,
      permissions
    };

    saveRoles([...roles, newRole]);
    showToast(`Role "${newRole.name}" created successfully.`, 'success');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedRole.isSystem && selectedRole.name !== roleName) {
      showToast('Cannot rename default system roles.', 'error');
      return;
    }

    const updated = roles.map(r => {
      if (r.name === selectedRole.name) {
        return {
          ...r,
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions
        };
      }
      return r;
    });

    saveRoles(updated);
    showToast(`Role permissions for "${roleName}" saved.`, 'success');
    setIsEditOpen(false);
    setSelectedRole(null);
  };

  const confirmDeleteRole = () => {
    if (!selectedRole) return;
    if (selectedRole.isSystem || systemRoles.includes(selectedRole.name)) {
      showToast('Default system roles are protected and cannot be deleted.', 'error');
      setIsDeleteOpen(false);
      return;
    }

    // Check if workers are actively assigned this role
    const parsedWorkers = workers.map(w => {
      const parts = w.role?.split(' | ');
      return parts ? parts[0] : '';
    });

    const isAssigned = parsedWorkers.some(role => role.toLowerCase() === selectedRole.name.toLowerCase());
    
    if (isAssigned) {
      showToast(`Cannot delete role "${selectedRole.name}" because it is actively assigned to workers in the directory.`, 'error');
      setIsDeleteOpen(false);
      return;
    }

    const updated = roles.filter(r => r.name !== selectedRole.name);
    saveRoles(updated);
    showToast(`Role "${selectedRole.name}" removed from registry.`, 'success');
    setIsDeleteOpen(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6 text-left font-sans print:hidden">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-lg font-serif font-semibold text-[#2F4B3C]">Roles & Permission Matrices</h2>
          <p className="text-[10px] text-gray-400 font-light">Define security access groups, configure checklist matrices, lock credential deletions.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold text-[10px] uppercase tracking-widest py-3 px-5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-gray-400 text-xs"><Loader className="w-5 h-5 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left: Role List Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-serif font-black text-[#A65D3D] uppercase tracking-widest border-b border-gray-50 pb-2">Configured Roles</h3>
            {roles.map((r, rIdx) => (
              <div 
                key={rIdx} 
                className="bg-white border border-gray-200 hover:border-[#2F4B3C] p-4 rounded shadow-sm space-y-3 relative group transition-all"
              >
                <div className="flex justify-between items-center select-none">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4.5 h-4.5 text-[#2F4B3C]" />
                    <span className="font-bold text-gray-900 text-xs leading-none">{r.name}</span>
                  </div>
                  {r.isSystem ? (
                    <span className="bg-[#2F4B3C]/5 text-[#2F4B3C] border border-[#2F4B3C]/10 font-bold px-1.5 py-0.2 rounded text-[7.5px] uppercase tracking-wider">System Role</span>
                  ) : (
                    <span className="bg-[#A65D3D]/5 text-[#A65D3D] border border-[#A65D3D]/10 font-bold px-1.5 py-0.2 rounded text-[7.5px] uppercase tracking-wider">Custom</span>
                  )}
                </div>

                <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                  {r.description || 'No custom description provided for this security group.'}
                </p>

                {/* Edit / Delete inline controls */}
                <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity select-none border-t border-gray-50 pt-2">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="text-[#2F4B3C] hover:text-[#A65D3D] flex items-center gap-0.5 text-[8.5px] font-bold uppercase cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Adjust Matrix
                  </button>
                  {!r.isSystem && (
                    <button
                      onClick={() => handleOpenDelete(r)}
                      className="text-red-500 hover:text-red-750 flex items-center gap-0.5 text-[8.5px] font-bold uppercase cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Detailed matrices summary grid */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded p-5 shadow-sm space-y-6">
            <h3 className="text-sm font-serif font-semibold text-[#2F4B3C] border-b border-gray-50 pb-3 flex items-center gap-1.5 select-none">
              <Shield className="w-4.5 h-4.5 text-[#A65D3D]" /> Active Security Matrices View
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((r, rIdx) => (
                <div key={rIdx} className="border border-gray-150 p-4 rounded space-y-3 font-sans">
                  <div className="flex justify-between items-center select-none">
                    <span className="font-bold text-gray-900 text-xs">{r.name} Modules</span>
                    <span className="text-[8px] text-gray-400 font-mono">Matrix Checklist</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[10px]">
                    {modules.map(mod => {
                      const modPerms = r.permissions[mod] || { view: false, create: false, edit: false, delete: false };
                      const activeList = Object.entries(modPerms)
                        .filter(([_, v]) => v)
                        .map(([k]) => k.toUpperCase());
                      
                      return (
                        <div key={mod} className="flex justify-between items-center border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-bold text-gray-550">{mod}</span>
                          <div className="flex gap-1">
                            {activeList.length === 0 ? (
                              <span className="text-gray-400 font-light italic">None</span>
                            ) : (
                              activeList.map(a => (
                                <span key={a} className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1 rounded text-[7px] uppercase tracking-wider">
                                  {a}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-serif text-sm font-bold text-[#2F4B3C]">Create Security Role</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 overflow-y-auto pr-1 text-xs text-gray-606 flex-1 select-text">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourcing Supervisor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full border border-gray-250/80 outline-none rounded py-2 px-3 text-xs focus:border-[#2F4B3C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Role Description</label>
                <input
                  type="text"
                  placeholder="Describe scope of tasks..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full border border-gray-250/80 outline-none rounded py-2 px-3 text-xs focus:border-[#2F4B3C]"
                />
              </div>

              {/* Checklist Permission Matrix */}
              <div className="space-y-3">
                <h4 className="font-serif font-black text-[#A65D3D] uppercase tracking-wider text-[9px]">Checklist Permission Matrix</h4>
                
                <div className="border border-gray-150 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-450 uppercase text-[8px] font-bold tracking-wider select-none">
                        <th className="p-2.5">System Module</th>
                        <th className="p-2.5 text-center">View</th>
                        <th className="p-2.5 text-center">Create</th>
                        <th className="p-2.5 text-center">Edit</th>
                        <th className="p-2.5 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map(mod => (
                        <tr key={mod} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-2.5 font-bold text-gray-900">{mod}</td>
                          {actions.map(act => (
                            <td key={act} className="p-2.5 text-center select-none">
                              <input
                                type="checkbox"
                                checked={permissions[mod][act]}
                                onChange={() => handlePermissionChange(mod, act)}
                                className="cursor-pointer h-3.5 w-3.5 rounded border-gray-300 text-[#2F4B3C] focus:ring-[#2F4B3C]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 select-none">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {isEditOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-gray-150/60 shadow-2xl relative animate-fade-in-up flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-serif text-sm font-bold text-[#2F4B3C]">Edit Permission Matrix</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto pr-1 text-xs text-gray-605 flex-1 select-text">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Role Title</label>
                <input
                  type="text"
                  required
                  disabled={selectedRole.isSystem}
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full border border-gray-250/80 outline-none rounded py-2 px-3 text-xs focus:border-[#2F4B3C] disabled:bg-gray-50 disabled:text-gray-400 disabled:font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Role Description</label>
                <input
                  type="text"
                  placeholder="Describe scope of tasks..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full border border-gray-250/80 outline-none rounded py-2 px-3 text-xs focus:border-[#2F4B3C]"
                />
              </div>

              {/* Checklist Permission Matrix */}
              <div className="space-y-3">
                <h4 className="font-serif font-black text-[#A65D3D] uppercase tracking-wider text-[9px]">Checklist Permission Matrix</h4>
                
                <div className="border border-gray-150 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-150 text-gray-450 uppercase text-[8px] font-bold tracking-wider select-none">
                        <th className="p-2.5">System Module</th>
                        <th className="p-2.5 text-center">View</th>
                        <th className="p-2.5 text-center">Create</th>
                        <th className="p-2.5 text-center">Edit</th>
                        <th className="p-2.5 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map(mod => (
                        <tr key={mod} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-2.5 font-bold text-gray-900">{mod}</td>
                          {actions.map(act => (
                            <td key={act} className="p-2.5 text-center select-none">
                              <input
                                type="checkbox"
                                checked={permissions[mod][act]}
                                onChange={() => handlePermissionChange(mod, act)}
                                className="cursor-pointer h-3.5 w-3.5 rounded border-gray-300 text-[#2F4B3C] focus:ring-[#2F4B3C]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  className="bg-[#2F4B3C] hover:bg-[#A65D3D] text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
                >
                  Save Matrix Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ROLE DELETION MODAL */}
      {isDeleteOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl border border-gray-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#2F4B3C] flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-[#A65D3D]" /> Confirm Role Removal
            </h3>
            
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Are you sure you want to delete custom role **{selectedRole.name}**? This action is permanent and cannot be undone. System checks will prevent deletion if this role is currently assigned to workers in the registry.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsDeleteOpen(false); setSelectedRole(null); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-755 font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={confirmDeleteRole}
                className="bg-red-650 hover:bg-red-700 text-white font-bold py-2 px-4 rounded uppercase text-[9px] tracking-wider cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRoles;
