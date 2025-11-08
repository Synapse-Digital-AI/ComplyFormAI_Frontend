import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidsApi, opportunitiesApi } from '../api/client';
import { Bid, Opportunity } from '../types';
import {
  Plus,
  FileText,
  DollarSign,
  Target,
  Building2,
  Search,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bidsResponse, oppsResponse] = await Promise.all([
        bidsApi.getAll(),
        opportunitiesApi.getAll(0, 5, true),
      ]);
      setBids(bidsResponse.data);
      setOpportunities(oppsResponse.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilDue = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ComplyFormAI</h1>
            <p className="text-gray-600 text-lg">
              Your Compliance-First Platform for Government Contracting
            </p>
          </div>
          <button
            onClick={() => navigate('/compliance-rules')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
          >
            <Target className="w-4 h-4" />
            Compliance Rules
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/create-bid')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Create Bid</h3>
            </div>
            <p className="text-sm text-gray-600">
              Start a new bid with automated validation
            </p>
          </button>

          <button
            onClick={() => navigate('/opportunities')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
            </div>
            <p className="text-sm text-gray-600">
              Browse procurement opportunities
            </p>
          </button>

          <button
            onClick={() => navigate('/directory')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Directory</h3>
            </div>
            <p className="text-sm text-gray-600">
              Search certified subcontractors
            </p>
          </button>

          <button
            onClick={() => navigate('/organizations')}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-gray-500 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Manage</h3>
            </div>
            <p className="text-sm text-gray-600">
              Organizations
            </p>
          </button>
        </div>

        {/* Recent Opportunities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Opportunities</h2>
            <button
              onClick={() => navigate('/opportunities')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunities.slice(0, 4).map((opp) => {
              const daysUntilDue = calculateDaysUntilDue(opp.due_date);
              
              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/assessment/${opp.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-4">
                      {opp.title}
                    </h3>
                    {opp.relevance_score !== null && opp.relevance_score > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium whitespace-nowrap">
                        {opp.relevance_score}% Match
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {opp.total_value && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${(opp.total_value / 1000000).toFixed(1)}M
                      </div>
                    )}
                    {opp.mbe_goal && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {opp.mbe_goal}% MBE
                      </div>
                    )}
                    {daysUntilDue !== null && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span
                          className={
                            daysUntilDue < 7
                              ? 'text-red-600 font-semibold'
                              : daysUntilDue < 14
                              ? 'text-yellow-600 font-semibold'
                              : ''
                          }
                        >
                          {daysUntilDue}d
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Run Assessment
                  </button>
                </div>
              );
            })}
          </div>

          {opportunities.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No opportunities available</p>
            </div>
          )}
        </div>

        {/* Your Bids */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Bids</h2>
            <button
              onClick={() => navigate('/create-bid')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Bid
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading bids...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No bids yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first bid to get started with automated validation
              </p>
              <button
                onClick={() => navigate('/create-bid')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Bid
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bids.map((bid) => {
                const subCount = bid.bid_subcontractors?.length || 0;
                
                return (
                  <div
                    key={bid.id}
                    onClick={() => navigate(`/bid/${bid.id}`)}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {bid.solicitation_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subCount} subcontractor{subCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          Total: ${bid.total_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          MBE Goal: {bid.mbe_goal}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;