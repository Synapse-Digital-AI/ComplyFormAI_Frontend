import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bidsApi } from '../api/client';
import { Bid } from '../types';
import SubcontractorForm from '../components/SubcontractorForm';
import SubcontractorList from '../components/SubcontractorList';
import ValidationDashboard from '../components/ValidationDashboard';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';

const BidDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBid();
    }
  }, [id]);

  const loadBid = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await bidsApi.getById(id);
      setBid(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bid');
      console.error('Failed to load bid:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubcontractor = async (bidSubId: string) => {
    if (!id || !window.confirm('Are you sure you want to remove this subcontractor?')) {
      return;
    }

    try {
      await bidsApi.removeSubcontractor(id, bidSubId);
      await loadBid(); // Reload bid data
    } catch (err) {
      console.error('Failed to remove subcontractor:', err);
      alert('Failed to remove subcontractor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !bid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bid</h2>
          <p className="text-gray-600 mb-6">{error || 'Bid not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

// --- FIX: Calculate MBE based on category_breakdown only ---
const mbeTotal = bid.bid_subcontractors?.reduce((sum, bs) => {
  if (!bs.category_breakdown || bs.category_breakdown.length === 0) return sum;

  const mbeEntry = bs.category_breakdown.find(
    (entry: any) => entry.category?.toLowerCase() === 'mbe'
  );

  if (!mbeEntry) return sum;

  // Safely handle percentage type (string or number)
  const rawPercentage = mbeEntry.percentage;
  const percentage =
    typeof rawPercentage === 'number'
      ? rawPercentage
      : parseFloat(rawPercentage || '0');

  const value = Number(bs.subcontract_value) || 0;
  const allocated = value * (percentage / 100);

  return sum + allocated;
}, 0) || 0;

// Calculate percentage of total bid amount
const mbePercentage =
  bid.total_amount > 0
    ? ((mbeTotal / bid.total_amount) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bids
        </button>

        {/* Bid Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {bid.solicitation_number}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                ${bid.total_amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">MBE Goal</p>
              <p className="text-lg font-semibold text-gray-900">{bid.mbe_goal}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current MBE</p>
              <p className={`text-lg font-semibold ${
                parseFloat(mbePercentage) >= bid.mbe_goal ? 'text-green-600' : 'text-red-600'
              }`}>
                {mbePercentage}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Subcontractors</p>
              <p className="text-lg font-semibold text-gray-900">
                {bid.bid_subcontractors?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Add Subcontractor Form */}
          <SubcontractorForm bidId={bid.id} onSuccess={loadBid} />
          
          {/* Validation Dashboard */}
          <ValidationDashboard bidId={bid.id} />
        </div>

        {/* Subcontractors List */}
        <SubcontractorList
          subcontractors={bid.bid_subcontractors || []}
          onRemove={handleRemoveSubcontractor}
        />
      </div>
    </div>
  );
};

export default BidDetailPage;