'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Building, Key, Plus, Check, MapPin, 
  Edit2, Trash2, Star, ChevronRight, Search,
  Copy, Settings, Info
} from 'lucide-react';
import { PropertyProfile } from '@/lib/types/property-profile';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyProfileManagerProps {
  onSelectProfile: (profile: PropertyProfile) => void;
  currentProfileId?: string;
  isCompact?: boolean;
}

export default function PropertyProfileManager({ 
  onSelectProfile, 
  currentProfileId,
  isCompact = false 
}: PropertyProfileManagerProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PropertyProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load user's property profiles
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    // In production, this would fetch from Firestore
    // For now, using mock data
    const mockProfiles: PropertyProfile[] = [
      {
        id: '1',
        userId: user?.uid || '',
        name: 'Main Home',
        type: 'home',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        details: {
          squareFeet: 2000,
          bedrooms: 3,
          bathrooms: 2,
          yearBuilt: 2010,
          propertyType: 'single_family'
        },
        preferences: {
          preferredServiceTimes: ['weekday_mornings'],
          petFriendly: true
        },
        isDefault: true,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Check localStorage for saved profiles
    const savedProfiles = localStorage.getItem('userProfiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      setProfiles(mockProfiles);
    }
  };

  const quickAddTemplates = [
    { 
      icon: Home, 
      label: 'Home', 
      type: 'home' as const,
      color: 'from-purple-500 to-indigo-500',
      fields: ['address', 'bedrooms', 'special_instructions']
    },
    { 
      icon: Building, 
      label: 'Office', 
      type: 'business' as const,
      color: 'from-blue-500 to-cyan-500',
      fields: ['business_name', 'address', 'access_hours']
    },
    { 
      icon: Key, 
      label: 'Rental', 
      type: 'rental' as const,
      color: 'from-green-500 to-emerald-500',
      fields: ['property_name', 'address', 'check_in_instructions']
    }
  ];

  const handleQuickAdd = async (template: typeof quickAddTemplates[0]) => {
    // In production, this would show a quick form based on template
    // For now, create a basic profile
    const newProfile: PropertyProfile = {
      id: Date.now().toString(),
      userId: user?.uid || '',
      name: `New ${template.label}`,
      type: template.type,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      details: {},
      preferences: {},
      isDefault: profiles.length === 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    setShowQuickAdd(false);
    
    // Auto-select if first profile
    if (profiles.length === 0) {
      onSelectProfile(newProfile);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
  };

  const handleDuplicateProfile = (profile: PropertyProfile) => {
    const duplicated: PropertyProfile = {
      ...profile,
      id: Date.now().toString(),
      name: `${profile.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedProfiles = [...profiles, duplicated];
    setProfiles(updatedProfiles);
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCompact) {
    const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">{currentProfile?.name || 'Select Property'}</span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showQuickAdd ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20"
            >
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onSelectProfile(profile);
                    setShowQuickAdd(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    profile.id === currentProfileId ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                    profile.type === 'home' ? 'from-purple-500 to-indigo-500' :
                    profile.type === 'business' ? 'from-blue-500 to-cyan-500' :
                    'from-green-500 to-emerald-500'
                  } flex items-center justify-center text-white`}>
                    {profile.type === 'home' ? <Home className="w-5 h-5" /> :
                     profile.type === 'business' ? <Building className="w-5 h-5" /> :
                     <Key className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.address.city}</p>
                  </div>
                  {profile.isDefault && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                </button>
              ))}
              
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Add New Property</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Properties</h3>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Search */}
      {profiles.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Property List */}
      <div className="space-y-2">
        {filteredProfiles.map((profile) => (
          <motion.div
            key={profile.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              profile.id === currentProfileId 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectProfile(profile)}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                  profile.type === 'home' ? 'from-purple-500 to-indigo-500' :
                  profile.type === 'business' ? 'from-blue-500 to-cyan-500' :
                  'from-green-500 to-emerald-500'
                } flex items-center justify-center text-white`}>
                  {profile.type === 'home' ? <Home className="w-6 h-6" /> :
                   profile.type === 'business' ? <Building className="w-6 h-6" /> :
                   <Key className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{profile.name}</h4>
                    {profile.isDefault && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile.address.street}, {profile.address.city}
                  </p>
                  {profile.details.squareFeet && (
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.details.squareFeet} sq ft • 
                      {profile.details.bedrooms} bed • 
                      {profile.details.bathrooms} bath
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateProfile(profile);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                {!profile.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickAdd(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add New Property</h3>
              <p className="text-gray-600 mb-6">Choose a property type to get started quickly</p>
              
              <div className="grid grid-cols-3 gap-4">
                {quickAddTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => handleQuickAdd(template)}
                    className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center text-white`}>
                      <template.icon className="w-8 h-8" />
                    </div>
                    <span className="font-medium">{template.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}