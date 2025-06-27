'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Star, MapPin, Calendar, Clock, DollarSign, CheckCircle, 
  AlertCircle, Camera, Maximize2, X, Shield, Award, 
  ThumbsUp, MessageSquare, Home, User
} from 'lucide-react';
import { format } from 'date-fns';

interface ProjectPhoto {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after';
  timestamp: Date;
  aiApproved: boolean;
  aiNotes?: string;
}

interface ProjectProfileProps {
  project: {
    id: string;
    address: string;
    serviceType: string;
    contractor: {
      id: string;
      name: string;
      avatar?: string;
      rating: number;
      completedJobs: number;
    };
    customer: {
      name: string;
      avatar?: string;
    };
    startDate: Date;
    completionDate: Date;
    duration: string;
    cost: number;
    status: 'completed' | 'in_progress' | 'pending_approval';
    description: string;
    photos: ProjectPhoto[];
    rating?: number;
    review?: string;
    aiQualityScore?: number;
    paymentStatus: 'pending' | 'approved' | 'released';
  };
  onClose: () => void;
}

export default function ProjectProfile({ project, onClose }: ProjectProfileProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'details' | 'verification'>('photos');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending_approval': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPhotosByType = (type: 'before' | 'during' | 'after') => {
    return project.photos.filter(photo => photo.type === type);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{project.serviceType}</h2>
              <div className="flex items-center text-white/90 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{project.address}</span>
              </div>
              <div className="flex items-center text-white/90">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {format(project.completionDate, 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b">
          {['photos', 'details', 'verification'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'photos' && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Before Photos */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-gray-600" />
                    Before Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {getPhotosByType('before').map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => setSelectedPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>

                {/* During Photos */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-blue-600" />
                    During Progress
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {getPhotosByType('during').map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => setSelectedPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>

                {/* After Photos */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-green-600" />
                    Completed Work
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {getPhotosByType('after').map((photo) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onClick={() => setSelectedPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Contractor Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Contractor</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-6 h-6 text-purple-700" />
                      </div>
                      <div>
                        <p className="font-medium">{project.contractor.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{project.contractor.rating}</span>
                          <span className="mx-2">•</span>
                          <span>{project.contractor.completedJobs} jobs</span>
                        </div>
                      </div>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{project.duration}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-medium text-lg">${project.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">AI Quality Score</span>
                    <div className="flex items-center">
                      <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${project.aiQualityScore || 0}%` }}
                        />
                      </div>
                      <span className="font-medium">{project.aiQualityScore || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Work Description</h4>
                  <p className="text-gray-600">{project.description}</p>
                </div>

                {/* Customer Review */}
                {project.review && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                      Customer Review
                    </h4>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < (project.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{project.review}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <AIVerificationStatus project={project} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoLightbox
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhotoCard({ photo, onClick }: { photo: ProjectPhoto; onClick: () => void }) {
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={photo.url}
          alt="Project photo"
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* AI Approval Badge */}
      {photo.aiApproved && (
        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}

      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <Maximize2 className="w-6 h-6 text-white" />
      </div>
    </motion.div>
  );
}

function PhotoLightbox({ photo, onClose }: { photo: ProjectPhoto; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-4xl w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt="Project photo"
          width={1200}
          height={800}
          className="w-full h-auto rounded-lg"
        />
        
        {photo.aiNotes && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-4">
            <p className="text-sm font-medium mb-1">AI Analysis:</p>
            <p className="text-sm text-gray-600">{photo.aiNotes}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
}

function AIVerificationStatus({ project }: { project: any }) {
  const verificationSteps = [
    {
      title: 'Photo Submission',
      status: 'completed',
      description: 'Contractor submitted required photos',
      icon: Camera,
    },
    {
      title: 'AI Quality Check',
      status: project.aiQualityScore >= 80 ? 'completed' : 'pending',
      description: 'AI verified work quality and cleanliness',
      icon: Shield,
    },
    {
      title: 'Customer Approval',
      status: project.rating ? 'completed' : 'pending',
      description: 'Customer reviewed and approved work',
      icon: ThumbsUp,
    },
    {
      title: 'Payment Release',
      status: project.paymentStatus === 'released' ? 'completed' : 'pending',
      description: 'Payment released to contractor',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          AI-Powered Verification Process
        </h4>
        <p className="text-blue-700 text-sm">
          Our AI system ensures quality work and protects both customers and contractors
          through automated photo verification and dispute resolution.
        </p>
      </div>

      <div className="space-y-4">
        {verificationSteps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className={`p-3 rounded-full mr-4 ${
              step.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <step.icon className={`w-5 h-5 ${
                step.status === 'completed' ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h5 className="font-medium mb-1">{step.title}</h5>
              <p className="text-sm text-gray-600">{step.description}</p>
              {step.status === 'pending' && (
                <span className="text-xs text-yellow-600 mt-1 inline-block">Pending</span>
              )}
            </div>
            {step.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            )}
          </div>
        ))}
      </div>

      {project.aiQualityScore < 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            AI Recommendations
          </h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Clean up debris visible in photos</li>
            <li>• Ensure all surfaces are properly finished</li>
            <li>• Take clearer "after" photos showing completed work</li>
          </ul>
        </div>
      )}
    </div>
  );
}