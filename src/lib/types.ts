import type {
  AuthorizationStatus,
  BillingMatchStatus,
  BillingProcessingStatus,
  ExpenseStatus,
  ReimbursementStatus,
  Role,
} from "./status";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  employeeNumber: string;
  departmentId: string;
  managerId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Department = {
  id: string;
  name: string;
  code: string;
  managerId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  clientId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReceiptFile = {
  id: string;
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
};

export type DocumentNumberCandidate = {
  value: string;
  normalized: string;
  confidence: number;
  source: string;
};

export type Expense = {
  id: string;
  userId: string;
  documentNumber: string;
  ocrDocumentNumber: string | null;
  confirmedDocumentNumber: string;
  ocrConfidence: number | null;
  ocrRawText: string;
  ocrCandidates: DocumentNumberCandidate[];
  receiptFileId: string | null;
  ocrTotal: number | null;
  confirmedTotal: number;
  ocrDate: string | null;
  confirmedDate: string;
  ocrVendor: string | null;
  confirmedVendor: string;
  ocrCurrency: string | null;
  confirmedCurrency: string;
  departmentId: string;
  clientId: string;
  projectId: string;
  notes: string;
  expenseStatus: ExpenseStatus;
  authorizationStatus: AuthorizationStatus;
  authorizedBy: string | null;
  authorizedAt: string | null;
  authorizationNotes: string;
  billingMatchStatus: BillingMatchStatus;
  matchedBillingDocumentId: string | null;
  reimbursementStatus: ReimbursementStatus;
  approvedAmount: number;
  reimbursedAmount: number;
  reimbursementDate: string | null;
  reimbursementReference: string | null;
  duplicateOfIds: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
};

export type BillingDocumentFile = {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type BillingDocument = {
  id: string;
  batchId: string;
  file: BillingDocumentFile;
  documentType: string | null;
  documentNumber: string | null;
  normalizedDocumentNumber: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  issuer: string | null;
  recipient: string | null;
  processingStatus: BillingProcessingStatus;
  matchStatus: BillingMatchStatus;
  matchedExpenseId: string | null;
  matchConfidence: number | null;
  candidateExpenseIds: string[];
  processingError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthorizationRecord = {
  id: string;
  expenseId: string;
  actorId: string;
  action: "approve" | "reject" | "needs_review";
  notes: string;
  createdAt: string;
};

export type ReimbursementRecord = {
  id: string;
  expenseId: string;
  employeeId: string;
  amount: number;
  date: string;
  reference: string;
  recordedBy: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  before: unknown;
  after: unknown;
};

export type AppStore = {
  users: User[];
  departments: Department[];
  clients: Client[];
  projects: Project[];
  expenses: Expense[];
  receiptFiles: ReceiptFile[];
  billingDocuments: BillingDocument[];
  authorizations: AuthorizationRecord[];
  reimbursements: ReimbursementRecord[];
  auditLogs: AuditLog[];
};

export type OcrParseResult = {
  rawText: string;
  documentNumber: string | null;
  candidates: DocumentNumberCandidate[];
  total: number | null;
  date: string | null;
  vendor: string | null;
  currency: string | null;
  confidence: number;
  documentNumberFound: boolean;
};

export type DashboardFilters = {
  from?: string;
  to?: string;
  month?: string;
  employeeId?: string;
  departmentId?: string;
  clientId?: string;
  projectId?: string;
  expenseStatus?: ExpenseStatus;
  authorizationStatus?: AuthorizationStatus;
  billingMatchStatus?: BillingMatchStatus;
};

export type NamedTotal = { id: string; name: string; total: number };

export type DashboardData = {
  totalExpenditure: number;
  currentMonthExpenditure: number;
  previousMonthExpenditure: number;
  approved: number;
  pendingAuthorization: number;
  outstandingReimbursement: number;
  matchedBillingDocuments: number;
  unmatchedBillingDocuments: number;
  needsReview: number;
  activeEmployees: number;
  activeClients: number;
  activeProjects: number;
  byDepartment: NamedTotal[];
  byClient: NamedTotal[];
  byProject: NamedTotal[];
  byEmployee: NamedTotal[];
  monthlyTrend: { month: string; total: number }[];
  outstandingByEmployee: NamedTotal[];
  billingMatchSplit: { matched: number; unmatched: number; needsReview: number };
  topProjects: NamedTotal[];
  topEmployees: NamedTotal[];
};

export type EmployeeHomeData = {
  outstanding: number;
  submitted: number;
  pendingAuthorization: number;
  approved: number;
  reimbursed: number;
  unmatched: number;
  needsReview: number;
};

export const EMPTY_STORE: AppStore = {
  users: [],
  departments: [],
  clients: [],
  projects: [],
  expenses: [],
  receiptFiles: [],
  billingDocuments: [],
  authorizations: [],
  reimbursements: [],
  auditLogs: [],
};
