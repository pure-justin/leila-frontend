'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Calendar, Bell,
  Target, Award, AlertCircle, ChevronRight, Brain,
  BarChart3, MapPin, Clock, Star, Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userProfileService } from '@/lib/user-profile-service';

interface Lead {
  id: string;
  customerName: string;
  service: string;
  urgency: 'immediate' | 'soon' | 'exploring';
  value: number;
  intentScore: number;
  location: string;
  lastActive: Date;
  propertySize: string;
  budget: string;
}

interface Insight {
  type: 'opportunity' | 'improvement' | 'alert' | 'tip';
  title: string;
  description: string;
  impact: string;
  action?: () => void;
  priority: 'high' | 'medium' | 'low';
}

export default function ContractorAIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leads' | 'insights' | 'performance'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContractorData();
    }
  }, [user]);

  const loadContractorData = async () => {
    setLoading(true);
    
    // Load hot leads
    const hotLeads = await getHotLeads();
    setLeads(hotLeads);
    
    // Get AI insights
    const contractorInsights = await getContractorInsights();
    setInsights(contractorInsights);
    
    // Load performance data
    const perfData = await getPerformanceData();
    setPerformance(perfData);
    
    setLoading(false);
  };

  const getHotLeads = async (): Promise<Lead[]> => {
    // This would fetch from Firebase
    return [
      {
        id: '1',
        customerName: 'Sarah Johnson',
        service: 'HVAC Maintenance',
        urgency: 'immediate',
        value: 450,
        intentScore: 92,
        location: '2.3 miles away',
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        propertySize: 'Large (3500 sq ft)',
        budget: 'Flexible'
      },
      {
        id: '2',
        customerName: 'Mike Chen',
        service: 'AC Repair',
        urgency: 'immediate',
        value: 850,
        intentScore: 88,
        location: '4.1 miles away',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        propertySize: 'Medium (2200 sq ft)',
        budget: '$500-$1000'
      },
      {
        id: '3',
        customerName: 'Emily Rodriguez',
        service: 'Annual Maintenance',
        urgency: 'soon',
        value: 350,
        intentScore: 75,
        location: '1.8 miles away',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        propertySize: 'Small (1500 sq ft)',
        budget: 'Budget conscious'
      }
    ];
  };

  const getContractorInsights = async (): Promise<Insight[]> => {
    return [
      {
        type: 'opportunity',
        title: 'High Solar Interest in Your Area',
        description: '15 customers in your service area have viewed solar content this week. Consider adding solar services or partnering.',
        impact: '+$50k potential revenue',
        priority: 'high',
        action: () => console.log('Explore solar opportunities')
      },
      {
        type: 'improvement',
        title: 'Response Time Optimization',
        description: 'Your average response time is 45 minutes. Top performers respond in under 15 minutes.',
        impact: '+30% conversion rate',
        priority: 'high',
        action: () => console.log('Set up auto-responses')
      },
      {
        type: 'alert',
        title: 'License Renewal Due',
        description: 'Your HVAC license expires in 45 days. Renew now to avoid service interruption.',
        impact: 'Compliance required',
        priority: 'high',
        action: () => console.log('Start renewal process')
      },
      {
        type: 'tip',
        title: 'Weekend Availability = More Business',
        description: 'Contractors offering weekend service see 40% more bookings. You currently don\'t show weekend availability.',
        impact: '+$800/weekend average',
        priority: 'medium',
        action: () => console.log('Update availability')
      }
    ];
  };

  const getPerformanceData = async () => {
    return {
      revenue: {
        mtd: 12500,
        lastMonth: 18200,
        ytd: 145000,
        growth: 15
      },
      jobs: {
        completed: 42,
        upcoming: 8,
        conversionRate: 68,
        avgValue: 420
      },
      ratings: {
        average: 4.8,
        total: 127,
        recent: [5, 5, 4, 5, 5]
      },
      ranking: {
        overall: 3,
        category: 2,
        improvement: 'up'
      }
    };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600 bg-red-50';
      case 'soon': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'improvement': return <Target className="w-5 h-5 text-blue-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'tip': return <Brain className="w-5 h-5 text-purple-600" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI Business Assistant</h1>
            <p className="opacity-90">
              {loading ? 'Analyzing your business...' : `${leads.length} hot leads • ${insights.filter(i => i.priority === 'high').length} urgent items`}
            </p>
          </div>
          <Brain className="w-12 h-12 opacity-50" />
        </div>
      </div>

      {/* Quick Stats */}
      {performance && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MTD Revenue</p>
                <p className="text-2xl font-bold">${performance.revenue.mtd.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{performance.revenue.growth}% growth</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{performance.jobs.conversionRate}%</p>
                <p className="text-xs text-gray-500">Industry avg: 45%</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold">{performance.ratings.average}</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(performance.ratings.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <Award className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Area Ranking</p>
                <p className="text-2xl font-bold">#{performance.ranking.overall}</p>
                <p className="text-xs text-green-600">↑ Moving up</p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {(['leads', 'insights', 'performance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 text-center font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'leads' && <Users className="w-5 h-5 inline mr-2" />}
                {tab === 'insights' && <Brain className="w-5 h-5 inline mr-2" />}
                {tab === 'performance' && <BarChart3 className="w-5 h-5 inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Hot Leads - Respond Quickly!</h3>
                <span className="text-sm text-gray-500">Sorted by intent score</span>
              </div>
              
              {leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{lead.customerName}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(lead.urgency)}`}>
                          {lead.urgency}
                        </span>
                        <span className="text-xs text-gray-500">{getTimeAgo(lead.lastActive)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{lead.service}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {lead.location}
                        </span>
                        <span className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {lead.propertySize}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {lead.budget}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">${lead.value}</div>
                      <div className="text-sm text-gray-500">Est. value</div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">Intent Score</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full"
                            style={{ width: `${lead.intentScore}%` }}
                          />
                        </div>
                        <div className="text-xs text-right mt-1">{lead.intentScore}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Contact Now
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                View All Leads ({leads.length + 12} total)
              </button>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">AI-Powered Business Insights</h3>
                <p className="text-sm text-gray-600">Personalized recommendations to grow your business</p>
              </div>
              
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    insight.priority === 'high' ? 'border-red-200 bg-red-50' : 'hover:shadow-md'
                  } transition-shadow`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-600">{insight.impact}</span>
                        {insight.action && (
                          <button 
                            onClick={insight.action}
                            className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                          >
                            Take Action
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Contractors who respond to leads within 5 minutes are 9x more likely to convert them. 
                  Enable push notifications to never miss a hot lead!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
                
                {/* Revenue Chart */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium mb-4">Revenue Trend</h4>
                  <div className="h-48 flex items-end justify-between space-x-2">
                    {[65, 72, 68, 85, 79, 92, 88].map((height, i) => (
                      <div key={i} className="flex-1">
                        <div 
                          className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs text-center mt-1 text-gray-600">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-3">Job Metrics</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed this month</span>
                        <span className="font-medium">{performance?.jobs.completed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average job value</span>
                        <span className="font-medium">${performance?.jobs.avgValue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Repeat customers</span>
                        <span className="font-medium">38%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-3">Growth Opportunities</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Missed calls</span>
                        <span className="font-medium text-red-600">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quote follow-ups</span>
                        <span className="font-medium text-yellow-600">8 pending</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service expansion</span>
                        <span className="font-medium text-green-600">+$5k/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">🤖 AI Analysis</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Based on your performance data, here are the top 3 actions to increase revenue:
                  </p>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">1.</span>
                      <span>Enable weekend availability - potential +$3,200/month</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">2.</span>
                      <span>Follow up on 8 pending quotes - potential +$3,360</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">3.</span>
                      <span>Add preventive maintenance plans - recurring revenue +$1,500/month</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}