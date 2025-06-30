'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Upload, FileText, AlertTriangle, Check, Calendar } from 'lucide-react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Document {
  id: string;
  name: string;
  type: 'license' | 'insurance' | 'certification';
  url: string;
  uploadedAt: Date;
  verified: boolean;
  expiryDate?: Date;
}

interface ContractorData {
  id: string;
  documents: Document[];
}

export default function ContractorDocuments() {
  const { user } = useAuth();
  const [contractorData, setContractorData] = useState<ContractorData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<'license' | 'insurance' | 'certification'>('license');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadContractorData();
    }
  }, [user]);

  const loadContractorData = async () => {
    if (!user?.uid) return;
    
    try {
      const contractorRef = doc(db, 'users', user.uid);
      const contractorSnap = await getDoc(contractorRef);
      
      if (contractorSnap.exists()) {
        const data = contractorSnap.data();
        setContractorData({
          id: user.uid,
          documents: data.documents || []
        });
      } else {
        setContractorData({
          id: user.uid,
          documents: []
        });
      }
    } catch (error) {
      console.error('Error loading contractor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `contractors/${user.uid}/documents/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create document record
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: selectedType,
        url: downloadURL,
        uploadedAt: new Date(),
        verified: false
      };

      // Update contractor data in Firestore
      const contractorRef = doc(db, 'users', user.uid);
      await updateDoc(contractorRef, {
        documents: arrayUnion(newDoc)
      });

      // Reload data
      await loadContractorData();
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (!doc.expiryDate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        No Expiry
      </span>;
    }

    const now = new Date();
    const expiry = new Date(doc.expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" /> Expired
      </span>;
    } else if (daysUntilExpiry <= 30) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3 mr-1" /> Expiring Soon
      </span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Check className="w-3 h-3 mr-1" /> Valid
      </span>;
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Documents</h1>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="license">License</option>
              <option value="insurance">Insurance</option>
              <option value="certification">Certification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* All Documents */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Documents</h2>
        <div className="space-y-3">
          {contractorData?.documents?.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-500">
                      Type: {doc.type} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                  {getStatusBadge(doc)}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
          {(!contractorData?.documents || contractorData.documents.length === 0) && (
            <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}