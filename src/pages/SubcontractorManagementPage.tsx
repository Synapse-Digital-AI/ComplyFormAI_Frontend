import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subcontractorsApi, organizationsApi } from '../api/client';
import { Subcontractor, Organization } from '../types';
import { ArrowLeft, Users, Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';

const SubcontractorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get('org');
  const opportunityId = searchParams.get('opportunity_id');

  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    legal_name: '',
    certification_number: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mbeFilter, setMbeFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [orgFilter]);

  const loadData = async () => {
    try {
      const [subsResponse, orgsResponse] = await Promise.all([
        subcontractorsApi.getAll(),
        organizationsApi.getAll(),
      ]);

      let filteredSubs = subsResponse.data;

      // Filter by organization if orgFilter is present
      if (orgFilter) {
        filteredSubs = subsResponse.data.filter(sub => sub.organization_id === orgFilter);
      }

      setSubcontractors(filteredSubs);
      setOrganizations(orgsResponse.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subcontractorsApi.search(searchQuery || undefined, mbeFilter);
      let filteredSubs = response.data;

      // Apply organization filter if present
      if (orgFilter) {
        filteredSubs = response.data.filter(sub => sub.organization_id === orgFilter);
      }

      setSubcontractors(filteredSubs);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery('');
    setMbeFilter(undefined);
    setLoading(true);

    try {
      const response = await subcontractorsApi.getAll();
      let filteredSubs = response.data;

      // Apply organization filter if present
      if (orgFilter) {
        filteredSubs = response.data.filter(sub => sub.organization_id === orgFilter);
      }

      setSubcontractors(filteredSubs);
    } catch (err) {
      console.error('Failed to load subcontractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const response = await subcontractorsApi.getById(id);
      console.log('Subcontractor details:', response.data);
      
      const org = organizations.find(o => o.id === response.data.organization_id);
      
      alert(
        `Subcontractor Details:\n\n` +
        `Name: ${response.data.legal_name}\n` +
        `Organization: ${org?.name || 'Unknown'}\n` +
        `Certification #: ${response.data.certification_number || 'N/A'}\n` +
        `MBE Status: ${response.data.is_mbe ? 'Yes' : 'No'}\n` +
        `ID: ${response.data.id}`
      );
    } catch (err) {
      console.error('Failed to fetch subcontractor:', err);
      setError('Failed to fetch subcontractor details');
    }
  };

  const handleStartEdit = (sub: Subcontractor) => {
    setEditingId(sub.id);
    setEditForm({
      legal_name: sub.legal_name,
      certification_number: sub.certification_number || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ legal_name: '', certification_number: '' });
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    setSuccess(null);

    try {
      await subcontractorsApi.update(id, editForm);
      setSuccess('Subcontractor updated successfully!');
      setEditingId(null);
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update subcontractor');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await subcontractorsApi.delete(id);
      setSuccess('Subcontractor deleted successfully!');
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete subcontractor');
    }
  };

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || 'Unknown';
  };

  if (loading && subcontractors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(opportunityId ? `/assessment/${opportunityId}` : '/opportunities')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {orgFilter ? 'Network' : 'Subcontractor Management'}
          </h1>
          <p className="text-gray-600">
            {orgFilter
              ? `Subcontractors for ${organizations.find(o => o.id === orgFilter)?.name || 'selected organization'}`
              : 'View, edit, and delete subcontractors'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Search Subcontractors</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by name or certification
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter search term..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MBE Filter
              </label>
              <select
                value={mbeFilter === undefined ? 'all' : mbeFilter ? 'true' : 'false'}
                onChange={(e) => {
                  const val = e.target.value;
                  setMbeFilter(val === 'all' ? undefined : val === 'true');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="true">MBE Only</option>
                <option value="false">Non-MBE Only</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Subcontractors List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Subcontractors ({subcontractors.length})
            </h2>
          </div>

          {subcontractors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No subcontractors found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subcontractors.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {editingId === sub.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Legal Name
                        </label>
                        <input
                          type="text"
                          value={editForm.legal_name}
                          onChange={(e) => setEditForm({ ...editForm, legal_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certification Number
                        </label>
                        <input
                          type="text"
                          value={editForm.certification_number}
                          onChange={(e) => setEditForm({ ...editForm, certification_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(sub.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{sub.legal_name}</h3>
                          {sub.is_mbe && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              MBE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Organization:</strong> {getOrganizationName(sub.organization_id)}
                          </p>
                          <p>
                            <strong>Certification:</strong> {sub.certification_number || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">ID: {sub.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(sub.id)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleStartEdit(sub)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.legal_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcontractorManagementPage;