'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Star,
  Shield,
  Award,
  Clock,
  CheckCircle,
  MoreVertical,
  FileText,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { UserRole, UserStatus, ServiceCategory, ContractorTier, VerificationStatus } from '@/lib/types/firestore-models';

interface ContractorListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoURL?: string;
  status: UserStatus;
  businessInfo: {
    companyName: string;
    licenseNumber?: string;
  };
  services: {
    categories: ServiceCategory[];
    serviceRadius: number;
  };
  verification: {
    identity: VerificationStatus;
    license: VerificationStatus;
    insurance: VerificationStatus;
    background: VerificationStatus;
  };
  tier: ContractorTier;
  ratings: {
    overall: number;
    totalReviews: number;
  };
  performance: {
    completionRate: number;
    responseTime: number;
  };
  analytics: {
    totalBookings: number;
    totalSpent: number;
  };
  metadata: {
    createdAt: any;
  };
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<ContractorListItem[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<ContractorListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get contractors from users collection
    const contractorsQuery = query(
      collection(db, 'users'),
      where('role', '==', UserRole.CONTRACTOR),
      orderBy('metadata.createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(contractorsQuery, async (snapshot) => {
      const contractorData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata?.createdAt || Timestamp.now()
          }
        } as ContractorListItem;
      });

      setContractors(contractorData);
      setFilteredContractors(contractorData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Filter contractors based on search and filters
    let filtered = contractors;

    if (searchTerm) {
      filtered = filtered.filter(contractor =>
        contractor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.businessInfo.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(contractor => contractor.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(contractor => 
        contractor.services.categories.includes(filterCategory as ServiceCategory)
      );
    }

    if (filterVerification !== 'all') {
      filtered = filtered.filter(contractor => {
        const verifications = contractor.verification;
        if (filterVerification === 'verified') {
          return verifications.identity === VerificationStatus.VERIFIED &&
                 verifications.license === VerificationStatus.VERIFIED &&
                 verifications.insurance === VerificationStatus.VERIFIED;
        } else if (filterVerification === 'pending') {
          return verifications.identity === VerificationStatus.PENDING ||
                 verifications.license === VerificationStatus.PENDING ||
                 verifications.insurance === VerificationStatus.PENDING;
        }
        return true;
      });
    }

    setFilteredContractors(filtered);
  }, [searchTerm, filterStatus, filterCategory, filterVerification, contractors]);

  const getVerificationIcon = (contractor: ContractorListItem) => {
    const v = contractor.verification;
    if (v.identity === VerificationStatus.VERIFIED && 
        v.license === VerificationStatus.VERIFIED && 
        v.insurance === VerificationStatus.VERIFIED) {
      return <Shield className="w-5 h-5 text-green-600" />;
    } else if (v.identity === VerificationStatus.PENDING || 
               v.license === VerificationStatus.PENDING || 
               v.insurance === VerificationStatus.PENDING) {
      return <Shield className="w-5 h-5 text-yellow-600" />;
    }
    return <Shield className="w-5 h-5 text-gray-400" />;
  };

  const getTierColor = (tier: ContractorTier) => {
    switch (tier) {
      case ContractorTier.PLATINUM:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ContractorTier.GOLD:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ContractorTier.SILVER:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contractors...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Contractors</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage contractor profiles, verifications, and performance</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, company, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Services</option>
                {Object.values(ServiceCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Verification</option>
                <option value="verified">Fully Verified</option>
                <option value="pending">Pending Verification</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Status</option>
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.INACTIVE}>Inactive</option>
                <option value={UserStatus.SUSPENDED}>Suspended</option>
                <option value={UserStatus.PENDING_VERIFICATION}>Pending</option>
              </select>

              <Link
                href="/admin/crm/contractors/new"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contractor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Contractors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{contractors.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {contractors.filter(c => c.status === UserStatus.ACTIVE).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {contractors.filter(c => 
                c.verification.identity === VerificationStatus.VERIFIED &&
                c.verification.license === VerificationStatus.VERIFIED &&
                c.verification.insurance === VerificationStatus.VERIFIED
              ).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. Rating</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(contractors.reduce((sum, c) => sum + c.ratings.overall, 0) / contractors.length || 0).toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {contractors.reduce((sum, c) => sum + c.analytics.totalBookings, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-purple-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/admin/crm/contractors/${contractor.id}`} className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {contractor.photoURL ? (
                          <img className="h-10 w-10 rounded-full" src={contractor.photoURL} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-medium">
                              {contractor.firstName.charAt(0)}{contractor.lastName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contractor.firstName} {contractor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contractor.businessInfo.companyName}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTierColor(contractor.tier)}`}>
                            {contractor.tier}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {contractor.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {contractor.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contractor.services.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {category.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {contractor.services.categories.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{contractor.services.categories.length - 2} more
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {contractor.services.serviceRadius} mi radius
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getVerificationIcon(contractor)}
                      <div>
                        <div className="text-sm font-medium">
                          {contractor.verification.identity === VerificationStatus.VERIFIED &&
                           contractor.verification.license === VerificationStatus.VERIFIED &&
                           contractor.verification.insurance === VerificationStatus.VERIFIED
                            ? 'Fully Verified'
                            : 'Partial'}
                        </div>
                        {contractor.businessInfo.licenseNumber && (
                          <div className="text-xs text-gray-500">
                            Lic: {contractor.businessInfo.licenseNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{contractor.ratings.overall.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({contractor.ratings.totalReviews})</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {contractor.performance.completionRate}% completion
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {contractor.performance.responseTime}min response
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contractor.status === UserStatus.ACTIVE 
                        ? 'bg-green-100 text-green-800'
                        : contractor.status === UserStatus.INACTIVE
                        ? 'bg-gray-100 text-gray-800'
                        : contractor.status === UserStatus.SUSPENDED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contractor.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContractors.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No contractors found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}