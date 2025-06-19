// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   TrendingUp, 
//   Users, 
//   Calendar, 
//   DollarSign,
//   Activity,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Bot,
//   BarChart3,
//   ArrowUpRight,
//   ArrowDownRight
// } from 'lucide-react';
// import { userService, bookingService } from '@/lib/services/firestore.service';
// import { activityLogService } from '@/lib/services/activity-log.service';
// import { SystemMetrics } from '@/lib/types/activity-log';
// import { formatCurrency } from '@/lib/utils/currency';
// import Link from 'next/link';

// export default function CRMDashboard() {
//   const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     activeBookings: 0,
//     totalRevenue: 0,
//     contractorsOnline: 0,
//     newUsersToday: 0,
//     bookingsToday: 0,
//     revenueToday: 0,
//     avgResponseTime: 0
//   });
//   const [recentActivities, setRecentActivities] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardData();

//     // Subscribe to real-time metrics
//     const unsubscribe = activityLogService.subscribeToMetrics((newMetrics) => {
//       setMetrics(newMetrics);
//     });

//     return () => unsubscribe();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Load various stats
//       const [users, bookings, contractors] = await Promise.all([
//         userService.getAllUsers(),
//         bookingService.getRecentBookings(10),
//         userService.searchContractors()
//       ]);

//       // Calculate stats
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const newUsersToday = users.filter(u => 
//         new Date(u.metadata.createdAt).getTime() >= today.getTime()
//       ).length;

//       const bookingsToday = bookings.filter(b => 
//         new Date(b.metadata.createdAt).getTime() >= today.getTime()
//       ).length;

//       const activeBookings = bookings.filter(b => 
//         ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
//       ).length;

//       const contractorsOnline = contractors.filter((c: any) => 
//         c.availability?.isOnline
//       ).length;

//       setStats({
//         totalUsers: users.length,
//         activeBookings,
//         totalRevenue: 54320.50, // This would come from payment data
//         contractorsOnline,
//         newUsersToday,
//         bookingsToday,
//         revenueToday: 3420.00,
//         avgResponseTime: 12.5
//       });

//       setLoading(false);
//     } catch (error) {
//       console.error('Error loading dashboard data:', error);
//       setLoading(false);
//     }
//   };

//   const StatCard = ({ title, value, icon: Icon, change, changeType }: any) => (
//     <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
//           <p className="text-2xl font-semibold mt-2">{value}</p>
//           {change && (
//             <div className={`flex items-center mt-2 text-sm ${
//               changeType === 'positive' ? 'text-green-600' : 'text-red-600'
//             }`}>
//               {changeType === 'positive' ? (
//                 <ArrowUpRight className="w-4 h-4 mr-1" />
//               ) : (
//                 <ArrowDownRight className="w-4 h-4 mr-1" />
//               )}
//               <span>{change}</span>
//             </div>
//           )}
//         </div>
//         <div className={`p-3 rounded-lg ${
//           Icon === DollarSign ? 'bg-green-100 dark:bg-green-900' :
//           Icon === Users ? 'bg-blue-100 dark:bg-blue-900' :
//           Icon === Calendar ? 'bg-purple-100 dark:bg-purple-900' :
//           'bg-gray-100 dark:bg-gray-800'
//         }`}>
//           <Icon className={`w-6 h-6 ${
//             Icon === DollarSign ? 'text-green-600 dark:text-green-400' :
//             Icon === Users ? 'text-blue-600 dark:text-blue-400' :
//             Icon === Calendar ? 'text-purple-600 dark:text-purple-400' :
//             'text-gray-600 dark:text-gray-400'
//           }`} />
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="p-8">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 lg:p-8 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">CRM Dashboard</h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Welcome back! Here's what's happening with Leila today.
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
//             Export Report
//           </button>
//           <button className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200">
//             Add New User
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Total Revenue"
//           value={formatCurrency(stats.totalRevenue)}
//           icon={DollarSign}
//           change="+12.5% from last month"
//           changeType="positive"
//         />
//         <StatCard
//           title="Active Users"
//           value={stats.totalUsers.toLocaleString()}
//           icon={Users}
//           change={`+${stats.newUsersToday} today`}
//           changeType="positive"
//         />
//         <StatCard
//           title="Active Bookings"
//           value={stats.activeBookings}
//           icon={Calendar}
//           change={`${stats.bookingsToday} new today`}
//           changeType="positive"
//         />
//         <StatCard
//           title="Contractors Online"
//           value={stats.contractorsOnline}
//           icon={Activity}
//           change="Normal activity"
//           changeType="positive"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Activity */}
//         <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
//           <div className="p-6 border-b border-gray-200 dark:border-gray-800">
//             <div className="flex justify-between items-center">
//               <h2 className="text-lg font-semibold">Recent Activity</h2>
//               <Link 
//                 href="/admin/monitoring" 
//                 className="text-sm text-blue-600 hover:text-blue-700"
//               >
//                 View all →
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="space-y-4">
//               {/* Sample activities */}
//               <div className="flex items-start space-x-3">
//                 <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
//                   <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium">New booking completed</p>
//                   <p className="text-xs text-gray-500">John D. - Plumbing service</p>
//                 </div>
//                 <span className="text-xs text-gray-500">2m ago</span>
//               </div>

//               <div className="flex items-start space-x-3">
//                 <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                   <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium">New contractor registered</p>
//                   <p className="text-xs text-gray-500">Mike's Electric - Verified</p>
//                 </div>
//                 <span className="text-xs text-gray-500">15m ago</span>
//               </div>

//               <div className="flex items-start space-x-3">
//                 <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
//                   <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium">AI scheduled appointment</p>
//                   <p className="text-xs text-gray-500">Cleaning service for tomorrow 2PM</p>
//                 </div>
//                 <span className="text-xs text-gray-500">1h ago</span>
//               </div>

//               <div className="flex items-start space-x-3">
//                 <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
//                   <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium">Payment pending</p>
//                   <p className="text-xs text-gray-500">Invoice #1234 - $450.00</p>
//                 </div>
//                 <span className="text-xs text-gray-500">2h ago</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
//           <div className="p-6 border-b border-gray-200 dark:border-gray-800">
//             <h2 className="text-lg font-semibold">Quick Actions</h2>
//           </div>
//           <div className="p-6 space-y-3">
//             <Link
//               href="/crm/users/new"
//               className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
//             >
//               <span className="text-sm font-medium">Add New User</span>
//               <Users className="w-4 h-4 text-gray-400" />
//             </Link>
            
//             <Link
//               href="/crm/bookings/new"
//               className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
//             >
//               <span className="text-sm font-medium">Create Booking</span>
//               <Calendar className="w-4 h-4 text-gray-400" />
//             </Link>
            
//             <Link
//               href="/crm/contractors/invite"
//               className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
//             >
//               <span className="text-sm font-medium">Invite Contractor</span>
//               <Activity className="w-4 h-4 text-gray-400" />
//             </Link>
            
//             <Link
//               href="/crm/analytics"
//               className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
//             >
//               <span className="text-sm font-medium">View Analytics</span>
//               <BarChart3 className="w-4 h-4 text-gray-400" />
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* AI Agents Status */}
//       {metrics?.ai && (
//         <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
//           <div className="p-6 border-b border-gray-200 dark:border-gray-800">
//             <div className="flex justify-between items-center">
//               <h2 className="text-lg font-semibold">AI Agents Status</h2>
//               <Link 
//                 href="/crm/ai-agents" 
//                 className="text-sm text-blue-600 hover:text-blue-700"
//               >
//                 Manage agents →
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="text-center">
//                 <p className="text-3xl font-bold">{metrics.ai.activeAgents.length}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-3xl font-bold">{metrics.ai.totalDecisions}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Decisions Today</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-3xl font-bold">{metrics.ai.automationRate.toFixed(0)}%</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Automation Rate</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }