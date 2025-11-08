export interface Organization {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  cert_number: string | null;
  cert_type: string | null;
  naics_codes: string[] | null;
}

export interface Subcontractor {
  id: string;
  organization_id: string;
  legal_name: string;
  certification_number: string | null;
  is_mbe: boolean;
  certifications?: Certification[];
}

export interface BidSubcontractor {
  id: string;
  bid_id: string;
  subcontractor_id: string;
  work_description: string;
  naics_code: string;
  subcontract_value: number;
  counts_toward_mbe: boolean;
  subcontractor?: Subcontractor;
}

export interface Bid {
  id: string;
  organization_id: string;
  solicitation_number: string;
  total_amount: number;
  mbe_goal: number;
  bid_subcontractors?: BidSubcontractor[];
}

export interface ValidationResult {
  id: string;
  bid_id: string;
  rule_name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  error_message: string;
  created_at: string;
}

export interface ValidationResponse {
  bid_id: string;
  overall_status: string;
  total_validations: number;
  passed: number;
  failed: number;
  warnings: number;
  validations: ValidationResult[];
}

// Request types
export interface BidCreateRequest {
  organization_id: string;
  solicitation_number: string;
  total_amount: number;
  mbe_goal: number;
}

export interface BidSubcontractorCreateRequest {
  subcontractor_id: string;
  work_description: string;
  naics_code: string;
  subcontract_value: number;
  counts_toward_mbe: boolean;
}

export interface OrganizationCreateRequest {
  name: string;
}

// NEW: Jurisdiction types
export interface Jurisdiction {
  id: string;
  code: string;
  name: string;
  mbe_goal_typical: number | null;
  vsbe_goal_typical: number | null;
}

export interface JurisdictionCreateRequest {
  code: string;
  name: string;
  mbe_goal_typical?: number;
  vsbe_goal_typical?: number;
}

// NEW: Subcontractor Directory types
export interface SubcontractorDirectory {
  id: string;
  legal_name: string;
  federal_id: string | null;
  certifications: {
    mbe?: boolean;
    vsbe?: boolean;
    dbe?: boolean;
    [key: string]: boolean | undefined;
  } | null;
  jurisdiction_codes: string[] | null;
  naics_codes: string[] | null;
  capabilities: string | null;
  contact_email: string | null;
  phone: string | null;
  location_city: string | null;
  rating: number;
  projects_completed: number;
  is_verified: boolean;
  created_at: string;
}

export interface SubcontractorDirectoryCreate {
  legal_name: string;
  federal_id?: string;
  certifications?: {
    mbe?: boolean;
    vsbe?: boolean;
    dbe?: boolean;
    [key: string]: boolean | undefined;
  };
  jurisdiction_codes?: string[];
  naics_codes?: string[];
  capabilities?: string;
  contact_email?: string;
  phone?: string;
  location_city?: string;
  rating?: number;
  projects_completed?: number;
  is_verified?: boolean;
}

export interface SubcontractorDirectoryUpdate {
  legal_name?: string;
  federal_id?: string;
  certifications?: {
    mbe?: boolean;
    vsbe?: boolean;
    dbe?: boolean;
    [key: string]: boolean | undefined;
  };
  jurisdiction_codes?: string[];
  naics_codes?: string[];
  capabilities?: string;
  contact_email?: string;
  phone?: string;
  location_city?: string;
  rating?: number;
  projects_completed?: number;
  is_verified?: boolean;
}

export interface SubcontractorSearchFilters {
  query?: string;
  jurisdiction_codes?: string[];
  naics_codes?: string[];
  is_mbe?: boolean;
  is_vsbe?: boolean;
  is_verified?: boolean;
  min_rating?: number;
}

// NEW: Opportunity types
export interface Opportunity {
  id: string;
  solicitation_number: string;
  title: string;
  jurisdiction_id: string;
  agency: string;
  mbe_goal: number | null;
  vsbe_goal: number | null;
  total_value: number | null;
  naics_codes: string[] | null;
  due_date: string | null;
  posted_date: string;
  opportunity_url: string | null;
  is_active: boolean;
  relevance_score: number | null;
  jurisdiction?: Jurisdiction;
}

export interface OpportunityCreate {
  solicitation_number: string;
  title: string;
  jurisdiction_id: string;
  agency: string;
  mbe_goal?: number;
  vsbe_goal?: number;
  total_value?: number;
  naics_codes?: string[];
  due_date?: string;
  posted_date?: string;
  opportunity_url?: string;
  is_active?: boolean;
  relevance_score?: number;
}

export interface OpportunitySearchFilters {
  jurisdiction_codes?: string[];
  naics_codes?: string[];
  min_value?: number;
  max_value?: number;
  is_active?: boolean;
  days_until_due?: number;
}

// NEW: Pre-Bid Assessment types
export interface PreBidAssessment {
  id: string;
  organization_id: string;
  opportunity_id: string;
  overall_risk_score: number | null;
  mbe_gap_percentage: number | null;
  vsbe_gap_percentage: number | null;
  available_subcontractors_count: number | null;
  recommendation: string | null;
  recommendation_reason: string | null;
  assessed_at: string;
  opportunity?: Opportunity;
  matching_subcontractors?: SubcontractorDirectory[];
  risk_factors?: string[];
  organization_network?: {
    total_count: number;
    mbe_count: number;
    vsbe_count: number;
  };
}

export interface AssessmentRequest {
  opportunity_id: string;
  organization_id: string;
  estimated_subcontract_percentage?: number;
}

// NEW: Subcontractor Outreach types
export interface SubcontractorOutreach {
  id: string;
  organization_id: string;
  opportunity_id: string;
  subcontractor_id: string;
  contact_date: string;
  status: 'CONTACTED' | 'RESPONDED' | 'COMMITTED' | 'DECLINED';
  notes: string | null;
  subcontractor?: SubcontractorDirectory;
  opportunity?: Opportunity;
}

export interface SubcontractorOutreachCreate {
  organization_id: string;
  opportunity_id: string;
  subcontractor_id: string;
  status: 'CONTACTED' | 'RESPONDED' | 'COMMITTED' | 'DECLINED';
  notes?: string;
  contact_date?: string;
}

export interface SubcontractorOutreachUpdate {
  status?: 'CONTACTED' | 'RESPONDED' | 'COMMITTED' | 'DECLINED';
  notes?: string;
}

// NEW: Compliance Rule types
export interface ComplianceRule {
  id: string;
  jurisdiction_id: string;
  rule_name: string;
  rule_type: string; // 'MBE', 'VSBE', 'LOCAL_PREF', etc.
  rule_definition: {
    threshold?: number;
    description?: string;
    [key: string]: any;
  };
  severity: 'ERROR' | 'WARNING' | 'INFO';
  jurisdiction?: Jurisdiction;
}

export interface ComplianceRuleCreate {
  jurisdiction_id: string;
  rule_name: string;
  rule_type: string;
  rule_definition: {
    threshold?: number;
    description?: string;
    [key: string]: any;
  };
  severity?: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ComplianceRuleUpdate {
  rule_name?: string;
  rule_type?: string;
  rule_definition?: {
    threshold?: number;
    description?: string;
    [key: string]: any;
  };
  severity?: 'ERROR' | 'WARNING' | 'INFO';
}