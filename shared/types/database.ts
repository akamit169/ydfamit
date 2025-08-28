// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'student' | 'admin' | 'reviewer' | 'donor';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_data?: any;
  // Computed properties for backward compatibility
  firstName?: string;
  lastName?: string;
  userType?: 'student' | 'admin' | 'reviewer' | 'donor';
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  profileData?: any;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'student' | 'admin' | 'reviewer' | 'donor';
  profileData?: any;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: string;
}

// Scholarship types
export interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  eligibility_criteria: any;
  required_documents: any;
  application_deadline: string;
  selection_deadline?: string;
  max_applications?: number;
  current_applications: number;
  status: 'active' | 'inactive' | 'closed';
  created_by?: string;
  created_at: string;
  updated_at: string;
  tags?: any;
}

export interface CreateScholarshipInput {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  eligibility_criteria: any;
  required_documents: any;
  application_deadline: string;
  selection_deadline?: string;
  max_applications?: number;
  tags?: any;
}

// Application types
export interface Application {
  id: string;
  student_id: string;
  scholarship_id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  application_data: any;
  documents?: any;
  score?: number;
  review_notes?: string;
  reviewed_by?: string;
  submitted_at: string;
  reviewed_at?: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  scholarshipId: string;
  applicationData: any;
  documents?: any;
}

export interface UpdateApplicationStatusInput {
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  score?: string;
  reviewNotes?: string;
  reviewedBy?: number;
}

// Review types
export interface Review {
  id: number;
  applicationId: number;
  reviewerId: number;
  criteria: any;
  overallScore: string;
  comments?: string;
  recommendation: 'approve' | 'reject' | 'conditionally_approve';
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  applicationId: number;
  criteria: any;
  overallScore: string;
  comments?: string;
  recommendation: 'approve' | 'reject' | 'conditionally_approve';
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'application' | 'deadline' | 'announcement' | 'message';
  isRead: boolean;
  relatedId?: number;
  relatedType?: string;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  type: 'application' | 'deadline' | 'announcement' | 'message';
  relatedId?: number;
  relatedType?: string;
}

// Document types
export interface Document {
  id: number;
  userId: number;
  applicationId?: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  documentType: string;
  isVerified: boolean;
  verificationNotes?: string;
  uploadedAt: Date;
}

export interface UploadDocumentInput {
  userId: number;
  applicationId?: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  documentType: string;
}

// Announcement types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'deadline' | 'result' | 'maintenance';
  targetAudience?: any;
  isActive: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  validFrom: Date;
  validTo?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  type?: 'general' | 'deadline' | 'result' | 'maintenance';
  targetAudience?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  validFrom?: Date;
  validTo?: Date;
}

// Contribution types
export interface Contribution {
  id: number;
  donorId: number;
  scholarshipId?: number;
  amount: string;
  currency: string;
  paymentMethod?: string;
  paymentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  contributionType: 'one_time' | 'recurring';
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateContributionInput {
  donorId: number;
  scholarshipId?: number;
  amount: string;
  currency?: string;
  paymentMethod?: string;
  contributionType?: 'one_time' | 'recurring';
  notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Query types
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: any;
}

export interface UserQueryParams extends QueryParams {
  userType?: 'student' | 'admin' | 'reviewer' | 'donor';
  isActive?: boolean;
}

export interface ScholarshipQueryParams extends QueryParams {
  status?: 'active' | 'inactive' | 'closed';
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApplicationQueryParams extends QueryParams {
  status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  studentId?: number;
  scholarshipId?: number;
  reviewerId?: number;
}
