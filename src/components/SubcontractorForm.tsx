import React, { useState, useEffect } from 'react';
import { directoryApi, bidsApi } from '../api/client';
import { SubcontractorDirectory } from '../types';
import { Search, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface SubcontractorFormProps {
  bidId: string;
  onSuccess: () => void;
}

interface BreakdownEntry {
  category: string;
  percentage: string;
}

const SubcontractorForm: React.FC<SubcontractorFormProps> = ({ bidId, onSuccess }) => {
  const [subcontractors, setSubcontractors] = useState<SubcontractorDirectory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subcontractor_id: '',
    work_description: '',
    naics_code: '',
    subcontract_value: '',
    counts_toward_mbe: false,
  });

  const [breakdownEntries, setBreakdownEntries] = useState<BreakdownEntry[]>([]);
  const [newBreakdown, setNewBreakdown] = useState<BreakdownEntry>({
    category: 'MBE',
    percentage: '',
  });

  useEffect(() => {
    loadSubcontractors();
  }, []);

  const loadSubcontractors = async () => {
    try {
      const response = await directoryApi.getAll();
      setSubcontractors(response.data);
    } catch (err) {
      console.error('Failed to load subcontractors:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSubcontractors();
      return;
    }

    try {
      const response = await directoryApi.simpleSearch({ q: searchQuery });
      setSubcontractors(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleAddBreakdown = () => {
    if (!newBreakdown.percentage || parseFloat(newBreakdown.percentage) <= 0) {
      return;
    }

    // Check if category already exists
    if (breakdownEntries.some(entry => entry.category === newBreakdown.category)) {
      setError(`${newBreakdown.category} already added to breakdown`);
      return;
    }

    setBreakdownEntries([...breakdownEntries, { ...newBreakdown }]);
    setNewBreakdown({ category: 'MBE', percentage: '' });
    setError(null);
  };

  const handleRemoveBreakdown = (index: number) => {
    setBreakdownEntries(breakdownEntries.filter((_, i) => i !== index));
  };

  const getTotalPercentage = () => {
    return breakdownEntries.reduce((sum, entry) => sum + parseFloat(entry.percentage || '0'), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate NAICS code format (2-6 digits)
    const naicsCode = formData.naics_code.trim();
    if (naicsCode && (!/^\d{2,6}$/.test(naicsCode))) {
      setError('Invalid NAICS code. NAICS codes must be 2-6 digits (e.g., 236220).');
      setLoading(false);
      return;
    }

    // Validate breakdown percentages don't exceed 100
    const totalPercentage = getTotalPercentage();
    if (breakdownEntries.length > 0 && totalPercentage > 100) {
      setError(`Breakdown percentages cannot exceed 100%. Current total: ${totalPercentage.toFixed(2)}%`);
      setLoading(false);
      return;
    }

    // Determine counts_toward_mbe based on breakdown entries
    const countsTowardMbe = breakdownEntries.some(entry =>
      ['MBE', 'VSBE', 'WBE', 'SBE'].includes(entry.category));

    try {
      // Prepare breakdown data for API - backend expects array format and exactly 100%
      let breakdown = null;
      if (breakdownEntries.length > 0) {
        const mappedBreakdown = breakdownEntries.map(entry => ({
          category: entry.category,
          percentage: parseFloat(entry.percentage)
        }));

        // If total is less than 100%, add "Non-MBE" category with the remaining percentage
        if (totalPercentage < 100) {
          const remaining = parseFloat((100 - totalPercentage).toFixed(2));
          mappedBreakdown.push({
            category: 'Non-MBE',
            percentage: remaining
          });
        }

        breakdown = mappedBreakdown;
      }

      await bidsApi.addSubcontractor(bidId, {
        subcontractor_id: formData.subcontractor_id,
        work_description: formData.work_description,
        naics_code: formData.naics_code,
        subcontract_value: parseFloat(formData.subcontract_value),
        counts_toward_mbe: countsTowardMbe,
        category_breakdown: breakdown,
      });

      setSuccess(true);
      setFormData({
        subcontractor_id: '',
        work_description: '',
        naics_code: '',
        subcontract_value: '',
        counts_toward_mbe: false,
      });
      setBreakdownEntries([]);

      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1500);
    } catch (err: any) {
      // Handle different error response formats
      let errorMessage = 'Failed to add subcontractor';

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        // If detail is a string, use it directly
        if (typeof detail === 'string') {
          errorMessage = detail;
        }
        // If detail is an array of validation errors (FastAPI format)
        else if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => {
            const field = e.loc ? e.loc.join('.') : 'field';
            return `${field}: ${e.msg}`;
          }).join(', ');
        }
        // If detail is an object, try to extract a meaningful message
        else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Add Subcontractor</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">Subcontractor added successfully!</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Subcontractors
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or certification..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcontractor
          </label>
          <select
            value={formData.subcontractor_id}
            onChange={(e) => {
              const selected = subcontractors.find(s => s.id === e.target.value);
              setFormData({
                ...formData,
                subcontractor_id: e.target.value,
                counts_toward_mbe: selected?.certifications?.mbe || false,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Subcontractor</option>
            {subcontractors.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.legal_name} {sub.certifications?.mbe && '(MBE)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Description
          </label>
          <textarea
            value={formData.work_description}
            onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
            rows={3}
            placeholder="Describe the work to be performed..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NAICS Code
          </label>
          <input
            type="text"
            value={formData.naics_code}
            onChange={(e) => setFormData({ ...formData, naics_code: e.target.value })}
            placeholder="e.g., 236220"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcontract Value ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.subcontract_value}
            onChange={(e) => setFormData({ ...formData, subcontract_value: e.target.value })}
            placeholder="e.g., 50000.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Breakdown Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Category Breakdown
            </label>
            {breakdownEntries.length > 0 && (
              <span className={`text-sm font-medium ${
                getTotalPercentage() > 100 ? 'text-red-600' : 'text-gray-700'
              }`}>
                Total: {getTotalPercentage().toFixed(2)}%
                {getTotalPercentage() < 100 && (
                  <span className="text-gray-500 ml-1">
                    (Non-MBE: {(100 - getTotalPercentage()).toFixed(2)}%)
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Existing breakdown entries */}
          {breakdownEntries.length > 0 && (
            <div className="space-y-2 mb-3">
              {breakdownEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {entry.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {entry.percentage}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBreakdown(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new breakdown entry */}
          <div className="flex gap-2">
            <select
              value={newBreakdown.category}
              onChange={(e) => setNewBreakdown({ ...newBreakdown, category: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="MBE">MBE</option>
              <option value="WBE">WBE</option>
              <option value="SBE">SBE</option>
              <option value="VSBE">VSBE</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={newBreakdown.percentage}
              onChange={(e) => setNewBreakdown({ ...newBreakdown, percentage: e.target.value })}
              placeholder="%"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddBreakdown}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Add categories that apply to this subcontractor. Any remaining percentage is considered non-MBE allocation.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.subcontractor_id}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Subcontractor'}
        </button>
      </form>
    </div>
  );
};

export default SubcontractorForm;