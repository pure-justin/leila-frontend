'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, MapPin, Calendar, Award, Shield, CheckCircle, 
  ThumbsUp, Clock, DollarSign, TrendingUp, AlertTriangle,
  X, Home, Briefcase, BarChart3, Users, MessageSquare,
  Phone, Mail, Globe, Verified, Ban
} from 'lucide-react';
import { format } from 'date-fns';
import ScoreDisplay, { MiniScoreDisplay, ScoreMeter } from './ScoreDisplay';
import { leilaScoringAlgorithm } from '@/lib/leila-scoring-algorithm';

interface CompletedJob {
  id: string;
  address: string;
  serviceType: string;
  completionDate: Date;
  duration: string;
  cost: number;
  rating?: number; // Old star rating
  userScore: number; // New user score 1-100
  leilaScore: number; // New AI score 1-100
  review?: string;
  photos: { url: string; type: string }[];
  aiQualityScore: number;
}

interface UserProfileProps {
  contractor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    website?: string;
    avatar?: string;
    bio: string;
    yearsExperience: number;
    certifications: string[];
    specialties: string[];
    rating?: number; // Old star rating
    userScore: number; // New user score 1-100 
    leilaScore: number; // New AI score 1-100
    completedJobs: number;
    responseTime: string;
    verified: boolean;
    joinDate: Date;
    // Algorithm scoring factors
    algorithmScore: number;
    customerApprovalRate: number;
    onTimeRate: number;
    qualityScore: number;
    disputeRate: number;
    blacklisted: boolean;
    blacklistReason?: string;
    // Performance metrics
    monthlyVolume: number;
    monthlyRevenue: number;
    commissionTier: string;
  };
  completedJobs: CompletedJob[];
  onClose?: () => void;
  isModal?: boolean;
}

export default function UserProfile({ contractor, completedJobs, onClose, isModal = true }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'metrics' | 'reviews'>('overview');
  const [selectedJob, setSelectedJob] = useState<CompletedJob | null>(null);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCommissionColor = (tier: string) => {
    switch (tier) {
      case 'Enterprise': return 'text-purple-600 bg-purple-50';
      case 'Professional': return 'text-blue-600 bg-blue-50';
      case 'Established': return 'text-green-600 bg-green-50';
      case 'Growing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const content = (
    <>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        {isModal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              {contractor.avatar ? (
                <Image
                  src={contractor.avatar}
                  alt={contractor.name}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <span className="text-3xl font-bold">{contractor.name.charAt(0)}</span>
              )}
            </div>
            {contractor.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                <Verified className="w-5 h-5 text-white" />
              </div>
            )}
            {contractor.blacklisted && (
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1">
                <Ban className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{contractor.name}</h1>
            <div className="flex items-center gap-4 text-white/90 text-sm mb-2">
              <span>{contractor.completedJobs} jobs</span>
              <span>•</span>
              <span>{contractor.yearsExperience} years exp</span>
              <span>•</span>
              <span className="capitalize">{contractor.commissionTier} tier</span>
            </div>
            {/* New scoring display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
              <MiniScoreDisplay 
                userScore={contractor.userScore} 
                leilaScore={contractor.leilaScore}
              />
            </div>
            <p className="mt-3 text-white/80 text-sm">{contractor.bio}</p>
          </div>

          <div className="text-right">
            <div className="text-white/80 text-sm mb-2">
              Algorithm Score: <span className="font-bold text-white">{contractor.algorithmScore}%</span>
            </div>
            {leilaScoringAlgorithm.getRating(contractor.leilaScore).label && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-xs text-white/80">Leila Rating</p>
                <p className="text-sm font-bold">{leilaScoringAlgorithm.getRating(contractor.leilaScore).label}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-6 mt-4 text-sm text-white/80">
          <a href={`mailto:${contractor.email}`} className="flex items-center hover:text-white">
            <Mail className="w-4 h-4 mr-1" />
            {contractor.email}
          </a>
          <a href={`tel:${contractor.phone}`} className="flex items-center hover:text-white">
            <Phone className="w-4 h-4 mr-1" />
            {contractor.phone}
          </a>
          {contractor.website && (
            <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white">
              <Globe className="w-4 h-4 mr-1" />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Blacklist Warning */}
      {contractor.blacklisted && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h4 className="font-semibold text-red-900">This contractor has been blacklisted</h4>
              <p className="text-red-700 text-sm mt-1">{contractor.blacklistReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b">
        {['overview', 'portfolio', 'metrics', 'reviews'].map((tab) => (
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
      <div className="overflow-y-auto max-h-[calc(90vh-400px)] p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Algorithm Score Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Algorithm Performance Score
                </h3>
                <div className="space-y-3">
                  <ScoreBar label="Customer Approval Rate" value={contractor.customerApprovalRate} />
                  <ScoreBar label="On-Time Completion" value={contractor.onTimeRate} />
                  <ScoreBar label="Quality Score" value={contractor.qualityScore} />
                  <ScoreBar label="Low Dispute Rate" value={100 - contractor.disputeRate} />
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>Overall Algorithm Score: {contractor.algorithmScore}%</strong>
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    This score determines job assignment priority and visibility to customers
                  </p>
                </div>
              </div>

              {/* Specialties & Certifications */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-gray-600" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contractor.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={Clock}
                  label="Response Time"
                  value={contractor.responseTime}
                  color="blue"
                />
                <StatCard
                  icon={Calendar}
                  label="Member Since"
                  value={format(contractor.joinDate, 'MMM yyyy')}
                  color="green"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Monthly Volume"
                  value={`$${contractor.monthlyVolume.toLocaleString()}`}
                  color="purple"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {completedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <PerformanceMetrics contractor={contractor} jobs={completedJobs} />
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {completedJobs.filter(job => job.review).map((job) => (
                <ReviewCard key={job.id} job={job} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </>
  );

  if (isModal) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return <div className="bg-white rounded-2xl shadow-xl overflow-hidden">{content}</div>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const getColor = () => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full transition-all ${getColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function JobCard({ job, onClick }: { job: CompletedJob; onClick: () => void }) {
  return (
    <motion.div
      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
        {job.photos[0] && (
          <Image
            src={job.photos[0].url}
            alt="Job photo"
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <h4 className="font-medium mb-1">{job.serviceType}</h4>
      <p className="text-sm text-gray-600 mb-2">{job.address}</p>
      <div className="flex items-center justify-between text-sm">
        <MiniScoreDisplay userScore={job.userScore} leilaScore={job.leilaScore} />
        <span className="text-gray-500">{format(job.completionDate, 'MMM d, yyyy')}</span>
      </div>
    </motion.div>
  );
}

function ReviewCard({ job }: { job: CompletedJob }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium">{job.serviceType}</h4>
          <p className="text-sm text-gray-600">{job.address}</p>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < job.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700">{job.review}</p>
      <p className="text-xs text-gray-500 mt-2">{format(job.completionDate, 'MMMM d, yyyy')}</p>
    </div>
  );
}

function PerformanceMetrics({ contractor, jobs }: { contractor: any; jobs: CompletedJob[] }) {
  const avgUserScore = jobs.reduce((sum, job) => sum + job.userScore, 0) / jobs.length;
  const avgLeilaScore = jobs.reduce((sum, job) => sum + job.leilaScore, 0) / jobs.length;
  const avgQualityScore = jobs.reduce((sum, job) => sum + job.aiQualityScore, 0) / jobs.length;
  const totalRevenue = jobs.reduce((sum, job) => sum + job.cost, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Revenue Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold text-lg">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Average</span>
              <span className="font-medium">${contractor.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Tier</span>
              <span className="font-medium">
                {contractor.commissionTier}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Quality Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Scores</span>
              <MiniScoreDisplay userScore={Math.round(avgUserScore)} leilaScore={Math.round(avgLeilaScore)} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI Quality Score</span>
              <span className="font-medium">{avgQualityScore.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">98%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold mb-4">Job Assignment Algorithm</h4>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium mb-2">How jobs are assigned:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Algorithm score determines priority (currently: {contractor.algorithmScore}%)</li>
              <li>• Higher scores get first choice of jobs</li>
              <li>• Factors: approval rate, on-time delivery, quality, disputes</li>
              <li>• Blacklisted contractors receive no new jobs</li>
            </ul>
          </div>
          
          {contractor.algorithmScore < 70 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Performance Warning</p>
              <p className="text-sm text-yellow-700">
                Your algorithm score is below 70%. Improve your metrics to receive more job assignments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({ job, onClose }: { job: CompletedJob; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{job.serviceType}</h3>
              <p className="text-gray-600">{job.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {job.photos.map((photo, index) => (
              <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  alt={`Job photo ${index + 1}`}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Completion Date</span>
              <span className="font-medium">{format(job.completionDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{job.duration}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-medium text-lg">${job.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">AI Quality Score</span>
              <span className="font-medium">{job.aiQualityScore}%</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Customer Rating</span>
              <MiniScoreDisplay userScore={job.userScore} leilaScore={job.leilaScore} />
            </div>
          </div>

          {job.review && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Customer Review</h4>
              <p className="text-gray-700">{job.review}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}