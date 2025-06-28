'use client';

import { useState } from 'react';
import { migrateImagesToFirebase, generateFirebaseUrlsMapping } from '@/scripts/migrate-images-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MigrateImagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  // Only allow admin access
  if (!user || user.email !== 'pure.leila@gmail.com') {
    router.push('/');
    return null;
  }
  
  const handleMigration = async () => {
    if (!confirm('Are you sure you want to migrate all images to Firebase Storage?')) {
      return;
    }
    
    setMigrating(true);
    try {
      const migrationResults = await migrateImagesToFirebase();
      setResults(migrationResults);
      
      // Generate mapping
      const mapping = generateFirebaseUrlsMapping(migrationResults);
      console.log('Mapping:', mapping);
      
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Migration Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Migrate Images to Firebase Storage</h2>
          <p className="text-gray-600 mb-4">
            This will migrate all service images from the public folder to Firebase Storage.
          </p>
          
          <button
            onClick={handleMigration}
            disabled={migrating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Start Migration'}
          </button>
        </div>
        
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Migration Results</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{results.total}</div>
                <div className="text-gray-600">Total Images</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{results.success.length}</div>
                <div className="text-gray-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{results.failed.length}</div>
                <div className="text-gray-600">Failed</div>
              </div>
            </div>
            
            {results.success.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Successfully Migrated:</h4>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                  {results.success.map((item: any, idx: number) => (
                    <div key={idx} className="py-1">
                      ✓ {item.path}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.failed.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Failed Migrations:</h4>
                <div className="max-h-60 overflow-y-auto bg-red-50 p-3 rounded text-sm">
                  {results.failed.map((item: any, idx: number) => (
                    <div key={idx} className="py-1">
                      ✗ {item.path}: {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}