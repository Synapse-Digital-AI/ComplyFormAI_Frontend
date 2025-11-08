import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  assessmentsApi,
  opportunitiesApi,
  organizationsApi,
  directoryApi,
  outreachApi
} from '../api/client';
import {
  PreBidAssessment,
  Opportunity,
  Organization,
  SubcontractorDirectory,
  SubcontractorOutreachCreate
} from '../types';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  AlertCircle,
  Mail,
  Phone,
  CheckSquare,
  Network,
  Building2
} from 'lucide-react';

const PreBidAssessmentPage: React.FC = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assessment, setAssessment] = useState<PreBidAssessment | null>(null);
  const [matchingSubcontractors, setMatchingSubcontractors] = useState<SubcontractorDirectory[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [outreachStatus, setOutreachStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [opportunityId]);

  const loadData = async () => {
    if (!opportunityId) return;

    try {
      const [oppResponse, orgsResponse] = await Promise.all([
        opportunitiesApi.getById(opportunityId),
        organizationsApi.getAll(),
      ]);

      setOpportunity(oppResponse.data);
      setOrganizations(orgsResponse.data);

      if (orgsResponse.data.length > 0) {
        setSelectedOrgId(orgsResponse.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async () => {
    if (!opportunityId || !selectedOrgId) {
      setError('Please select an organization');
      return;
    }

    setRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await assessmentsApi.perform({
        opportunity_id: opportunityId,
        organization_id: selectedOrgId,
        estimated_subcontract_percentage: 30.0,
      });

      setAssessment(response.data);
      setMatchingSubcontractors(response.data.matching_subcontractors || []);
      setRiskFactors(response.data.risk_factors || []);
      setSuccess('Assessment completed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Assessment failed');
      console.error('Assessment error:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleContactSubcontractor = async (subcontractorId: string) => {
    if (!selectedOrgId || !opportunityId) return;

    try {
      const outreachData: SubcontractorOutreachCreate = {
        organization_id: selectedOrgId,
        opportunity_id: opportunityId,
        subcontractor_id: subcontractorId,
        status: 'CONTACTED',
        notes: 'Initial contact from pre-bid assessment',
      };

      await outreachApi.create(outreachData);
      setOutreachStatus({ ...outreachStatus, [subcontractorId]: 'CONTACTED' });
      setSuccess('Outreach recorded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to record outreach:', err);
      setError('Failed to record outreach');
    }
  };

  const getRecommendationColor = (recommendation: string | null) => {
    switch (recommendation) {
      case 'BID':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'CAUTION':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'NO_BID':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string | null) => {
    switch (recommendation) {
      case 'BID':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'CAUTION':
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'NO_BID':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return null;
    }
  };

  const getRiskFactorIcon = (factor: string) => {
    if (factor.includes('CRITICAL')) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (factor.includes('WARNING')) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else if (factor.includes('GOOD') || factor.includes('EXCELLENT')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Opportunity Not Found
          </h2>
          <button
            onClick={() => navigate('/opportunities')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-Bid Assessment</h1>
          <p className="text-gray-600">{opportunity.title}</p>
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

        {/* Opportunity Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Opportunity Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Solicitation #</p>
              <p className="font-semibold">{opportunity.solicitation_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Value</p>
              <p className="font-semibold">
                ${opportunity.total_value?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">MBE Goal</p>
              <p className="font-semibold text-blue-600">{opportunity.mbe_goal}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">VSBE Goal</p>
              <p className="font-semibold text-purple-600">{opportunity.vsbe_goal}%</p>
            </div>
          </div>
        </div>

        {/* Assessment Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Run Assessment</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Organization
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRunAssessment}
              disabled={running || !selectedOrgId}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              {running ? 'Analyzing...' : 'Run Assessment'}
            </button>
            <button
              onClick={() => navigate(`/subcontractors?org=${selectedOrgId}&opportunity_id=${opportunityId}`)}
              disabled={!selectedOrgId}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Network
            </button>
          </div>
        </div>

        {/* Assessment Results */}
        {assessment && (
          <>
            {/* Overall Recommendation */}
            <div
              className={`rounded-lg p-6 mb-6 border-2 ${getRecommendationColor(
                assessment.recommendation
              )}`}
            >
              <div className="flex items-center gap-4 mb-4">
                {getRecommendationIcon(assessment.recommendation)}
                <div>
                  <h2 className="text-2xl font-bold">
                    Recommendation: {assessment.recommendation}
                  </h2>
                  <p className="text-sm mt-1">{assessment.recommendation_reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Risk Score</p>
                  <p className="text-2xl font-bold">
                    {assessment.overall_risk_score}/100
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">MBE Gap</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {assessment.mbe_gap_percentage !== null &&
                    assessment.mbe_gap_percentage < 0 ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        {Math.abs(Number(assessment.mbe_gap_percentage))}%
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Met
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">VSBE Gap</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {assessment.vsbe_gap_percentage !== null &&
                    assessment.vsbe_gap_percentage < 0 ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        {Math.abs(Number(assessment.vsbe_gap_percentage))}%
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Met
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Available Subs</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Users className="w-5 h-5" />
                    {assessment.available_subcontractors_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Network Stats - NEW SECTION */}
            {assessment.organization_network && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Network className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Your Organization's Network</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <p className="text-sm font-medium text-gray-600">Total Subcontractors</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {assessment.organization_network.total_count}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In your network</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-600">MBE Subcontractors</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {assessment.organization_network.mbe_count}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {assessment.organization_network.total_count > 0
                        ? `${((assessment.organization_network.mbe_count / assessment.organization_network.total_count) * 100).toFixed(0)}% of your network`
                        : 'No network established'}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-purple-600">VSBE Subcontractors</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {assessment.organization_network.vsbe_count}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {assessment.organization_network.total_count > 0
                        ? `${((assessment.organization_network.vsbe_count / assessment.organization_network.total_count) * 100).toFixed(0)}% of your network`
                        : 'No network established'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your organization network consists of subcontractors you've previously 
                    worked with or added to your network. The assessment considers both your existing network 
                    and available subcontractors from the directory.
                  </p>
                </div>
              </div>
            )}

            {/* Risk Factors */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
              <div className="space-y-3">
                {riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {getRiskFactorIcon(factor)}
                    <p className="text-sm text-gray-700 flex-1">{factor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Subcontractors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Available Subcontractors from Directory ({matchingSubcontractors.length})
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                These are additional certified subcontractors from the directory that match this opportunity's requirements.
              </p>

              {matchingSubcontractors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No matching subcontractors found in the directory for this opportunity.</p>
                  <p className="text-sm mt-2">
                    Consider expanding to your organization's existing network.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingSubcontractors.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {sub.legal_name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {sub.certifications?.mbe && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                MBE
                              </span>
                            )}
                            {sub.certifications?.vsbe && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                VSBE
                              </span>
                            )}
                            {sub.is_verified && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            {sub.contact_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {sub.contact_email}
                              </div>
                            )}
                            {sub.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {sub.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleContactSubcontractor(sub.id)}
                          disabled={outreachStatus[sub.id] === 'CONTACTED'}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                          {outreachStatus[sub.id] === 'CONTACTED'
                            ? 'Contacted'
                            : 'Record Contact'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreBidAssessmentPage;