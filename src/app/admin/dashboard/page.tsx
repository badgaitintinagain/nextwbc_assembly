"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  newUsersThisMonth: number;
}

interface PredictionHistory {
  id: string;
  timestamp: string;
  imageCount: number;
  detections: any[];
  thumbnail?: string;
}

interface UserPredictionStats {
  user: User;
  stats: {
    totalPredictions: number;
    thisMonthPredictions: number;
    lastMonthPredictions: number;
    growthRate: number;
  };
  recentPredictions: PredictionHistory[];
  monthlyStats: any[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPredictions: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPredictionStats, setUserPredictionStats] = useState<UserPredictionStats | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [loadingUserStats, setLoadingUserStats] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchData();
      }
    } else if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, session, router]);

  const fetchData = async (retryCount = 0) => {
    try {
      setError(null);
      
      // Sequential fetch with error handling for database connection issues
      let usersData = { users: [] };
      let statsData = { totalUsers: 0, totalPredictions: 0, newUsersThisMonth: 0 };
      
      try {
        const usersResponse = await fetch("/api/admin/users");
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else {
          console.warn('Failed to fetch users:', usersResponse.status);
        }
      } catch (userError) {
        console.error('Error fetching users:', userError);
        if (retryCount < 2) {
          console.log(`Retrying fetchData (attempt ${retryCount + 1})`);
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
      }

      try {
        const statsResponse = await fetch("/api/admin/stats");
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        } else {
          console.warn('Failed to fetch stats:', statsResponse.status);
          // Use fallback calculation
          const usersList = usersData.users || [];
          statsData = {
            totalUsers: usersList.length,
            totalPredictions: 0,
            newUsersThisMonth: usersList.filter((user: User) => {
              const userDate = new Date(user.createdAt);
              const currentDate = new Date();
              return userDate.getMonth() === currentDate.getMonth() && 
                     userDate.getFullYear() === currentDate.getFullYear();
            }).length
          };
        }
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Use fallback calculation
        const usersList = usersData.users || [];
        statsData = {
          totalUsers: usersList.length,
          totalPredictions: 0,
          newUsersThisMonth: usersList.filter((user: User) => {
            const userDate = new Date(user.createdAt);
            const currentDate = new Date();
            return userDate.getMonth() === currentDate.getMonth() && 
                   userDate.getFullYear() === currentDate.getFullYear();
          }).length
        };
      }
      
      setUsers(usersData.users || []);
      setStats(statsData);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      if (retryCount < 2) {
        console.log(`Retrying fetchData (attempt ${retryCount + 1})`);
        setError(`Connection error. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setError('Failed to load dashboard data. Please check your database connection.');
        setLoading(false);
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleViewPredictions = async (user: User) => {
    setSelectedUser(user);
    setLoadingUserStats(true);
    setShowPredictionModal(true);
    setModalError(null);
    setUserPredictionStats(null);
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/predictions`);
      if (response.ok) {
        const data = await response.json();
        setUserPredictionStats(data);
      } else {
        const errorData = await response.json();
        setModalError(errorData.error || 'Failed to load user prediction data');
      }
    } catch (error) {
      console.error('Error fetching user predictions:', error);
      setModalError('Failed to load user prediction data. Please try again.');
    } finally {
      setLoadingUserStats(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            className="fixed top-0 left-0 w-full h-full object-cover object-center blur-md brightness-50"
          >
            <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md"></div>

        <main className="relative z-20 flex flex-col flex-1">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8">
              <div className="flex items-center space-x-3">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-white text-lg">Loading dashboard...</p>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative flex flex-col h-screen overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            className="fixed top-0 left-0 w-full h-full object-cover object-center blur-md brightness-50"
          >
            <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md"></div>

        <main className="relative z-20 flex flex-col h-full overflow-hidden">
          <Header />
          <div className="px-2 sm:px-4 md:px-6 py-4 mx-auto max-w-7xl flex-1 overflow-auto">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-6"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-white/80 text-sm md:text-base">Manage users and monitor system activity</p>
              </motion.div>
              
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-4 md:mb-6 bg-red-500/20 backdrop-blur-lg border border-red-500/30 text-red-100 px-4 py-3 rounded-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <div className="flex items-start flex-1">
                        <div className="py-1 flex-shrink-0">
                          <svg className="fill-current h-5 w-5 md:h-6 md:w-6 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm md:text-base">Error</p>
                          <p className="text-xs md:text-sm break-words">{error}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-start">
                        <button 
                          className="text-red-300 hover:text-red-100 transition-colors"
                          onClick={() => fetchData()}
                          title="Retry"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-300 hover:text-red-100 transition-colors"
                          onClick={() => setError(null)}
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
        
            {/* Main Content Layout */}
            <div className="space-y-4">
              {/* Stats Cards - Responsive Layout */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full"
              >
                {/* Two cards in one row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 lg:p-6 hover:bg-blue-500/25 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="p-3 lg:p-3 bg-blue-500/30 rounded-lg lg:rounded-xl backdrop-blur-sm flex-shrink-0">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="ml-4 lg:ml-4 min-w-0 flex-1">
                          <p className="text-sm lg:text-sm font-medium text-blue-100 leading-tight">Total Users</p>
                          <p className="text-xl lg:text-2xl font-semibold text-white leading-tight">{stats.totalUsers}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="bg-green-500/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 lg:p-6 hover:bg-green-500/25 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="p-3 lg:p-3 bg-green-500/30 rounded-lg lg:rounded-xl backdrop-blur-sm flex-shrink-0">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="ml-4 lg:ml-4 min-w-0 flex-1">
                          <p className="text-sm lg:text-sm font-medium text-green-100 leading-tight">Total Predictions</p>
                          <p className="text-xl lg:text-2xl font-semibold text-white leading-tight">{stats.totalPredictions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* User Management Table */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-white/20">
                  <h2 className="text-xl font-semibold text-white">User Management</h2>
                  <p className="text-white/70 text-sm mt-1">Manage user accounts and view prediction history</p>
                </div>
            
                <div className="flex-1 overflow-auto">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="min-w-full">
                      <thead className="bg-white/10 backdrop-blur-sm sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-white/60">
                              <div className="flex flex-col items-center space-y-2">
                                <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>No users found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          users.map((user, index) => (
                            <motion.tr 
                              key={user.id} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{user.name || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white/80">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingUser === user.id ? (
                                  <select 
                                    className="text-xs px-2 py-1 rounded border bg-white/20 backdrop-blur-sm text-white border-white/30"
                                    defaultValue={user.role}
                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                  >
                                    <option value="USER" className="text-black">USER</option>
                                    <option value="ADMIN" className="text-black">ADMIN</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                                    user.role === "ADMIN" 
                                      ? 'bg-purple-500/30 text-purple-100 border border-purple-500/50' 
                                      : 'bg-green-500/30 text-green-100 border border-green-500/50'
                                  }`}>
                                    {user.role}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-blue-300 hover:text-blue-100 transition-colors"
                                    onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                                  >
                                    {editingUser === user.id ? 'Cancel' : 'Edit'}
                                  </button>
                                  <button 
                                    className="text-green-300 hover:text-green-100 transition-colors"
                                    onClick={() => handleViewPredictions(user)}
                                  >
                                    Predictions
                                  </button>
                                  <button 
                                    className="text-red-300 hover:text-red-100 transition-colors"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                    {users.length === 0 ? (
                      <div className="text-center py-8 text-white/60">
                        <div className="flex flex-col items-center space-y-2">
                          <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p>No users found</p>
                        </div>
                      </div>
                    ) : (
                      users.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                        >
                          <div className="space-y-3">
                            {/* User Info */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-medium text-sm">{user.name || 'N/A'}</h3>
                                <p className="text-white/70 text-xs mt-1">{user.email}</p>
                                <p className="text-white/60 text-xs mt-1">
                                  Created: {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="ml-4">
                                {editingUser === user.id ? (
                                  <select 
                                    className="text-xs px-2 py-1 rounded border bg-white/20 backdrop-blur-sm text-white border-white/30"
                                    defaultValue={user.role}
                                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                  >
                                    <option value="USER" className="text-black">USER</option>
                                    <option value="ADMIN" className="text-black">ADMIN</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                                    user.role === "ADMIN" 
                                      ? 'bg-purple-500/30 text-purple-100 border border-purple-500/50' 
                                      : 'bg-green-500/30 text-green-100 border border-green-500/50'
                                  }`}>
                                    {user.role}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                              <button 
                                className="text-blue-300 hover:text-blue-100 transition-colors text-xs px-3 py-1 bg-blue-500/20 rounded-md border border-blue-500/30"
                                onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                              >
                                {editingUser === user.id ? 'Cancel' : 'Edit'}
                              </button>
                              <button 
                                className="text-green-300 hover:text-green-100 transition-colors text-xs px-3 py-1 bg-green-500/20 rounded-md border border-green-500/30"
                                onClick={() => handleViewPredictions(user)}
                              >
                                Predictions
                              </button>
                              <button 
                                className="text-red-300 hover:text-red-100 transition-colors text-xs px-3 py-1 bg-red-500/20 rounded-md border border-red-500/30"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Prediction History Modal */}
        <AnimatePresence>
          {showPredictionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowPredictionModal(false);
                setSelectedUser(null);
                setUserPredictionStats(null);
                setModalError(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-4 md:px-6 py-4 border-b border-white/20 flex items-start md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-white break-words">
                      Prediction History - {selectedUser?.name || selectedUser?.email}
                    </h3>
                    <p className="text-white/70 text-xs md:text-sm">View user's prediction statistics and history</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPredictionModal(false);
                      setSelectedUser(null);
                      setUserPredictionStats(null);
                      setModalError(null);
                    }}
                    className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0 self-start md:self-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-80px)] md:max-h-[calc(80vh-80px)]">
                  {loadingUserStats ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-white">Loading prediction data...</p>
                      </div>
                    </div>
                  ) : modalError ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 text-red-100 px-6 py-4 rounded-xl max-w-md text-center">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="font-bold">Error Loading Data</p>
                        <p className="text-sm mt-1">{modalError}</p>
                      </div>
                      <button
                        onClick={() => selectedUser && handleViewPredictions(selectedUser)}
                        className="bg-blue-500/20 backdrop-blur-lg border border-blue-500/30 text-blue-100 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : userPredictionStats ? (
                    <div className="space-y-6">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                          <div className="text-lg md:text-2xl font-bold text-white">{userPredictionStats.stats.totalPredictions}</div>
                          <div className="text-white/70 text-xs md:text-sm">Total Predictions</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                          <div className="text-lg md:text-2xl font-bold text-white">{userPredictionStats.stats.thisMonthPredictions}</div>
                          <div className="text-white/70 text-xs md:text-sm">This Month</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                          <div className="text-lg md:text-2xl font-bold text-white">{userPredictionStats.stats.lastMonthPredictions}</div>
                          <div className="text-white/70 text-xs md:text-sm">Last Month</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                          <div className={`text-lg md:text-2xl font-bold ${userPredictionStats.stats.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {userPredictionStats.stats.growthRate >= 0 ? '+' : ''}{userPredictionStats.stats.growthRate}%
                          </div>
                          <div className="text-white/70 text-xs md:text-sm">Growth Rate</div>
                        </div>
                      </div>

                      {/* Recent Predictions */}
                      <div>
                        <h4 className="text-base md:text-lg font-semibold text-white mb-4">Recent Predictions</h4>
                        {userPredictionStats.recentPredictions.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                            {userPredictionStats.recentPredictions.map((prediction, index) => (
                              <motion.div
                                key={prediction.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
                              >
                                {prediction.thumbnail && (
                                  <div className="aspect-square bg-white/5 rounded-lg mb-3 overflow-hidden">
                                    <img 
                                      src={prediction.thumbnail} 
                                      alt="Prediction" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <div className="text-white font-medium text-sm">
                                    {prediction.imageCount} image{prediction.imageCount !== 1 ? 's' : ''}
                                  </div>
                                  <div className="text-white/70 text-xs">
                                    {new Date(prediction.timestamp).toLocaleString()}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {prediction.detections.slice(0, 3).map((detection: any, idx: number) => (
                                      <span 
                                        key={idx}
                                        className="inline-block bg-blue-500/20 text-blue-200 rounded-full px-2 py-1 text-xs border border-blue-500/30"
                                      >
                                        {detection.class}
                                      </span>
                                    ))}
                                    {prediction.detections.length > 3 && (
                                      <span className="inline-block bg-gray-500/20 text-gray-200 rounded-full px-2 py-1 text-xs border border-gray-500/30">
                                        +{prediction.detections.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-white/60">
                            <svg className="w-16 h-16 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>No predictions found for this user</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </main>
    </div>
    </ErrorBoundary>
  );
}