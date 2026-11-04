import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Shield,
  Users,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Mail,
  Lock,
  Building,
} from 'lucide-react';
import { userService } from '../services/userService';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../hooks/useAuth';

const AdminPage = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useOutletContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Knowledge Owner',
    department: 'Operations',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userService.createUser(newUser);
      showToast(`User ${newUser.name} created successfully!`);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Knowledge Owner',
        department: 'Operations',
      });
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    setIsSubmitting(true);
    try {
      await userService.updateUser(editUserModal._id, {
        name: editUserModal.name,
        role: editUserModal.role,
        department: editUserModal.department,
        status: editUserModal.status,
      });
      showToast('User updated successfully!');
      setEditUserModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await userService.updateUser(user._id, { status: nextStatus });
      showToast(`User account ${nextStatus === 'active' ? 'enabled' : 'disabled'}.`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserModal) return;
    setIsSubmitting(true);
    try {
      await userService.deleteUser(deleteUserModal._id);
      showToast(`User ${deleteUserModal.name} removed successfully.`);
      setDeleteUserModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              User & Access Administration
            </h1>
            <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              Admin Exclusive
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Provision team members, assign knowledge governance roles, and manage system permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Articles Owned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => {
                  const isSelf = u._id === currentAdmin?._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs ring-1 ring-indigo-500/20">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] text-indigo-600 font-semibold">
                                (You / Current Admin)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {u.email}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            u.role === 'Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'Knowledge Owner'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {u.department || 'Operations'}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                          {u.articlesOwned || 0}
                          <span className="text-[10px] font-normal text-slate-400">articles</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          disabled={isSelf}
                          onClick={() => handleToggleUserStatus(u)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          title={isSelf ? 'Cannot disable self' : 'Click to toggle status'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.status === 'active' ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditUserModal(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user details or role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setDeleteUserModal(u)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Anand Sen"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="anand@knowledgetrack.io"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                  >
                    <option value="Knowledge Owner">Knowledge Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Engineering, HR..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit User Profile & Role</h3>
              <button
                onClick={() => setEditUserModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUserModal.name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={editUserModal.role}
                  onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                >
                  <option value="Admin">Admin</option>
                  <option value="Knowledge Owner">Knowledge Owner</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editUserModal.department || ''}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, department: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editUserModal.status}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={!!deleteUserModal}
        onClose={() => setDeleteUserModal(null)}
        onConfirm={handleDeleteUser}
        title="Remove User Account"
        message={`Are you sure you want to remove ${deleteUserModal?.name}? Their authored articles will remain safely preserved in the database.`}
        confirmText="Remove User"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminPage;
