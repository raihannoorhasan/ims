export interface Product {
  id: string;
  name: string;
  category: 'laptop' | 'component' | 'course' | 'accessory';
  sku: string;
  description: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplierId: string;
  warrantyPeriod: number; // in months
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  totalPurchases: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  createdAt: Date;
}

export interface Sale {
  id: string;
  customerId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  createdAt: Date;
  receivedAt?: Date;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Course {
  id: string;
  name: string;
  duration: number; // in hours
  price: number;
  admissionFee: number;
  registrationFee: number;
  examFee: number;
  description: string;
  materials: string[];
  instructor: string;
  maxStudents: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface CourseBatch {
  id: string;
  courseId: string;
  batchName: string;
  startDate: Date;
  endDate: Date;
  schedule: string; // e.g., "Mon, Wed, Fri 10:00 AM - 12:00 PM"
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: Date;
  emergencyContact?: string;
  createdAt: Date;
}

export interface Admission {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  admissionDate: Date;
  admissionFee: number;
  paidAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  admissionId: string;
  enrollmentDate: Date;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  installmentPlan?: {
    totalInstallments: number;
    installmentAmount: number;
    paidInstallments: number;
  };
  registrationFeePaid: boolean;
  examFeePaid: boolean;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  createdAt: Date;
}

export interface CoursePayment {
  id: string;
  admissionId?: string;
  enrollmentId: string;
  studentId: string;
  paymentType: 'admission' | 'enrollment' | 'installment' | 'registration' | 'exam';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'cheque';
  paymentDate: Date;
  voucherNumber: string;
  description?: string;
  receivedBy: string;
  installmentNumber?: number;
  createdAt: Date;
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  paymentId: string;
  studentName: string;
  courseName: string;
  batchName: string;
  paymentType: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  receivedBy: string;
  installmentInfo?: string;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  studentId: string;
  batchId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  markedBy: string;
  createdAt: Date;
}

export interface AttendanceSession {
  id: string;
  batchId: string;
  date: Date;
  topic: string;
  duration: number; // in minutes
  instructor: string;
  attendanceRecords: AttendanceRecord[];
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  saleId: string;
  customerId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  deviceType: 'laptop' | 'desktop' | 'tablet' | 'phone' | 'other';
  brand: string;
  model: string;
  serialNumber?: string;
  issueDescription: string;
  diagnosis?: string;
  estimatedCost: number;
  actualCost: number;
  laborCost: number;
  partsCost: number;
  status: 'received' | 'diagnosed' | 'waiting_approval' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTechnician?: string;
  partsUsed: ServicePart[];
  timeSpent: number; // in hours
  warrantyPeriod: number; // in days
  receivedDate: Date;
  estimatedCompletionDate?: Date;
  completedDate?: Date;
  deliveredDate?: Date;
  notes: string[];
  customerApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePart {
  productId: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  hourlyRate: number;
  status: 'active' | 'inactive';
  totalTicketsCompleted: number;
  averageRating: number;
  createdAt: Date;
}

export interface ServiceInvoice {
  id: string;
  invoiceNumber: string;
  serviceTicketId: string;
  customerId: string;
  laborCost: number;
  partsCost: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
}