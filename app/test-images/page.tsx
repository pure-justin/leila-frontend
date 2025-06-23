'use client';

import { useState } from 'react';
import { COMPREHENSIVE_SERVICE_CATALOG } from '@/lib/comprehensive-services-catalog';
import { ServiceImage } from '@/components/ServiceImage';
import OptimizedServiceImage from '@/components/OptimizedServiceImage';
import { getServiceImage } from '@/lib/service-images-local';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestImagesPage() {
  const [testComponent, setTestComponent] = useState<'ServiceImage' | 'OptimizedServiceImage'>('ServiceImage');
  const [loadStatus, setLoadStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const handleImageLoad = (serviceId: string) => {
    setLoadStatus(prev => ({ ...prev, [serviceId]: 'success' }));
  };

  const handleImageError = (serviceId: string) => {
    setLoadStatus(prev => ({ ...prev, [serviceId]: 'error' }));
  };

  const stats = {
    total: 0,
    success: 0,
    error: 0,
    loading: 0
  };

  Object.values(loadStatus).forEach(status => {
    stats.total++;
    stats[status]++;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Service Image Loading Test</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Component:</label>
              <select
                value={testComponent}
                onChange={(e) => setTestComponent(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ServiceImage">ServiceImage</option>
                <option value="OptimizedServiceImage">OptimizedServiceImage</option>
              </select>
            </div>
            
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-2">Load Status</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{stats.success} Loaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>{stats.error} Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span>{stats.loading} Loading</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Images Grid */}
        {COMPREHENSIVE_SERVICE_CATALOG.map(category => (
          <div key={category.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.subcategories.map(service => {
                const status = loadStatus[service.id] || 'loading';
                const imageInfo = getServiceImage(service.id);
                
                return (
                  <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="relative h-32 bg-gray-100">
                      {testComponent === 'ServiceImage' ? (
                        <ServiceImage
                          serviceName={service.name}
                          category={service.category || category.id}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <OptimizedServiceImage
                          src={imageInfo.url}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      
                      {/* Status indicator */}
                      <div className="absolute top-2 right-2">
                        {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />}
                        {status === 'error' && <XCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />}
                        {status === 'loading' && <AlertCircle className="w-6 h-6 text-yellow-500 bg-white rounded-full animate-pulse" />}
                      </div>
                      
                      {/* Hidden image element to track load status */}
                      <img
                        src={imageInfo.url}
                        alt=""
                        className="hidden"
                        onLoad={() => handleImageLoad(service.id)}
                        onError={() => handleImageError(service.id)}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{service.name}</p>
                      <p className="text-xs text-gray-500 truncate">{service.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}