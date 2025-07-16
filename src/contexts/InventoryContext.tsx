import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  Product, Customer, Supplier, Sale, Purchase, Course, Invoice, ServiceTicket, Technician, ServiceInvoice,
  CourseBatch, Student, Admission, Enrollment, CoursePayment, PaymentVoucher, AttendanceRecord, AttendanceSession
} from '../types';

interface InventoryContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  courses: Course[];
  invoices: Invoice[];
  serviceTickets: ServiceTicket[];
  technicians: Technician[];
  serviceInvoices: ServiceInvoice[];
  courseBatches: CourseBatch[];
  students: Student[];
  admissions: Admission[];
  enrollments: Enrollment[];
  coursePayments: CoursePayment[];
  paymentVouchers: PaymentVoucher[];
  attendanceRecords: AttendanceRecord[];
  attendanceSessions: AttendanceSession[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  generateInvoice: (saleId: string) => void;
  updateStock: (productId: string, quantity: number) => void;
  addServiceTicket: (ticket: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateServiceTicket: (id: string, ticket: Partial<ServiceTicket>) => void;
  addTechnician: (technician: Omit<Technician, 'id' | 'createdAt' | 'totalTicketsCompleted' | 'averageRating'>) => void;
  generateServiceInvoice: (serviceTicketId: string) => void;
  addCourseBatch: (batch: Omit<CourseBatch, 'id' | 'createdAt'>) => void;
  updateCourseBatch: (id: string, batch: Partial<CourseBatch>) => void;
  deleteCourseBatch: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addAdmission: (admission: Omit<Admission, 'id' | 'admissionDate' | 'createdAt'>) => void;
  updateAdmission: (id: string, admission: Partial<Admission>) => void;
  addEnrollment: (enrollment: Omit<Enrollment, 'id' | 'enrollmentDate' | 'createdAt'>) => void;
  updateEnrollment: (id: string, enrollment: Partial<Enrollment>) => void;
  deleteEnrollment: (id: string) => void;
  addCoursePayment: (payment: Omit<CoursePayment, 'id' | 'createdAt'>) => void;
  updateCoursePayment: (id: string, payment: Partial<CoursePayment>) => void;
  deleteCoursePayment: (id: string) => void;
  generatePaymentVoucher: (voucherNumber: string) => void;
  addAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'createdAt'>) => void;
  updateAttendanceRecord: (sessionId: string, studentId: string, status: AttendanceRecord['status'], notes?: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [courses, setCourses] = useLocalStorage<Course[]>('courses', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [serviceTickets, setServiceTickets] = useLocalStorage<ServiceTicket[]>('serviceTickets', []);
  const [technicians, setTechnicians] = useLocalStorage<Technician[]>('technicians', []);
  const [serviceInvoices, setServiceInvoices] = useLocalStorage<ServiceInvoice[]>('serviceInvoices', []);
  const [courseBatches, setCourseBatches] = useLocalStorage<CourseBatch[]>('courseBatches', []);
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [admissions, setAdmissions] = useLocalStorage<Admission[]>('admissions', []);
  const [enrollments, setEnrollments] = useLocalStorage<Enrollment[]>('enrollments', []);
  const [coursePayments, setCoursePayments] = useLocalStorage<CoursePayment[]>('coursePayments', []);
  const [paymentVouchers, setPaymentVouchers] = useLocalStorage<PaymentVoucher[]>('paymentVouchers', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [attendanceSessions, setAttendanceSessions] = useLocalStorage<AttendanceSession[]>('attendanceSessions', []);

  // Initialize with sample data if empty
  useEffect(() => {
    if (products.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Dell Laptop XPS 13',
          category: 'laptop',
          sku: 'DL-XPS13-001',
          description: 'High-performance laptop for professionals',
          buyingPrice: 800,
          sellingPrice: 1200,
          stock: 5,
          minStock: 2,
          supplierId: '1',
          warrantyPeriod: 12,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Corsair Vengeance LPX 16GB RAM',
          category: 'component',
          sku: 'CR-RAM16-001',
          description: 'DDR4 3200MHz RAM module',
          buyingPrice: 60,
          sellingPrice: 85,
          stock: 20,
          minStock: 5,
          supplierId: '2',
          warrantyPeriod: 24,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setProducts(sampleProducts);
    }

    if (suppliers.length === 0) {
      const sampleSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'Tech Distributors Ltd',
          email: 'sales@techdist.com',
          phone: '+1-555-0123',
          address: '123 Tech Street, Silicon Valley',
          products: ['1'],
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Component World',
          email: 'orders@compworld.com',
          phone: '+1-555-0456',
          address: '456 Component Ave, Tech City',
          products: ['2'],
          createdAt: new Date()
        }
      ];
      setSuppliers(sampleSuppliers);
    }

    if (courses.length === 0) {
      const sampleCourses: Course[] = [
        {
          id: '1',
          name: 'Computer Hardware Fundamentals',
          duration: 40,
          price: 299,
          admissionFee: 50,
          registrationFee: 25,
          examFee: 30,
          description: 'Learn the basics of computer hardware components and assembly',
          materials: ['Workbooks', 'Practice Hardware', 'Online Resources'],
          instructor: 'John Smith',
          maxStudents: 15,
          status: 'active',
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Advanced Laptop Repair',
          duration: 60,
          price: 499,
          admissionFee: 75,
          registrationFee: 35,
          examFee: 50,
          description: 'Advanced techniques for laptop troubleshooting and repair',
          materials: ['Repair Tools', 'Test Equipment', 'Schematics'],
          instructor: 'Sarah Johnson',
          maxStudents: 10,
          status: 'active',
          createdAt: new Date()
        }
      ];
      setCourses(sampleCourses);
    }

    if (technicians.length === 0) {
      const sampleTechnicians: Technician[] = [
        {
          id: '1',
          name: 'Mike Johnson',
          email: 'mike@techflow.com',
          phone: '+1-555-0789',
          specializations: ['Laptop Repair', 'Hardware Diagnostics', 'Data Recovery'],
          hourlyRate: 45,
          status: 'active',
          totalTicketsCompleted: 0,
          averageRating: 0,
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Sarah Davis',
          email: 'sarah@techflow.com',
          phone: '+1-555-0890',
          specializations: ['Software Issues', 'Virus Removal', 'System Optimization'],
          hourlyRate: 40,
          status: 'active',
          totalTicketsCompleted: 0,
          averageRating: 0,
          createdAt: new Date()
        }
      ];
      setTechnicians(sampleTechnicians);
    }

    if (courseBatches.length === 0) {
      const sampleBatches: CourseBatch[] = [
        {
          id: '1',
          courseId: '1',
          batchName: 'HW-2024-01',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-28'),
          schedule: 'Mon, Wed, Fri 10:00 AM - 12:00 PM',
          maxStudents: 15,
          currentStudents: 8,
          status: 'ongoing',
          createdAt: new Date()
        },
        {
          id: '2',
          courseId: '2',
          batchName: 'LR-2024-01',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-04-15'),
          schedule: 'Tue, Thu 2:00 PM - 5:00 PM',
          maxStudents: 10,
          currentStudents: 5,
          status: 'upcoming',
          createdAt: new Date()
        }
      ];
      setCourseBatches(sampleBatches);
    }
  }, []);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, ...productData, updatedAt: new Date() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalPurchases: 0
    };
    setCustomers([...customers, newCustomer]);
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setSales([...sales, newSale]);

    // Update product stock
    saleData.items.forEach(item => {
      updateStock(item.productId, -item.quantity);
    });

    // Update customer total purchases
    const customer = customers.find(c => c.id === saleData.customerId);
    if (customer) {
      setCustomers(customers.map(c => 
        c.id === saleData.customerId
          ? { ...c, totalPurchases: c.totalPurchases + saleData.total }
          : c
      ));
    }
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setPurchases([...purchases, newPurchase]);

    // Update product stock if purchase is received
    if (purchaseData.status === 'received') {
      purchaseData.items.forEach(item => {
        updateStock(item.productId, item.quantity);
      });
    }
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, courseData: Partial<Course>) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, ...courseData } : course
    ));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const generateInvoice = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber,
      saleId: sale.id,
      customerId: sale.customerId,
      items: sale.items,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'draft',
      createdAt: new Date()
    };
    setInvoices([...invoices, newInvoice]);
  };

  const updateStock = (productId: string, quantity: number) => {
    setProducts(products.map(product => 
      product.id === productId
        ? { ...product, stock: Math.max(0, product.stock + quantity), updatedAt: new Date() }
        : product
    ));
  };

  const addServiceTicket = (ticketData: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    const ticketNumber = `ST-${Date.now()}`;
    const newTicket: ServiceTicket = {
      ...ticketData,
      id: Date.now().toString(),
      ticketNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setServiceTickets([...serviceTickets, newTicket]);
  };

  const updateServiceTicket = (id: string, ticketData: Partial<ServiceTicket>) => {
    setServiceTickets(serviceTickets.map(ticket => 
      ticket.id === id 
        ? { ...ticket, ...ticketData, updatedAt: new Date() }
        : ticket
    ));

    // Update parts stock when ticket is completed
    if (ticketData.status === 'completed') {
      const ticket = serviceTickets.find(t => t.id === id);
      if (ticket) {
        ticket.partsUsed.forEach(part => {
          updateStock(part.productId, -part.quantity);
        });
      }
    }
  };

  const addTechnician = (technicianData: Omit<Technician, 'id' | 'createdAt' | 'totalTicketsCompleted' | 'averageRating'>) => {
    const newTechnician: Technician = {
      ...technicianData,
      id: Date.now().toString(),
      totalTicketsCompleted: 0,
      averageRating: 0,
      createdAt: new Date()
    };
    setTechnicians([...technicians, newTechnician]);
  };

  const generateServiceInvoice = (serviceTicketId: string) => {
    const ticket = serviceTickets.find(t => t.id === serviceTicketId);
    if (!ticket) return;

    const invoiceNumber = `SRV-${Date.now()}`;
    const subtotal = ticket.laborCost + ticket.partsCost;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const newServiceInvoice: ServiceInvoice = {
      id: Date.now().toString(),
      invoiceNumber,
      serviceTicketId: ticket.id,
      customerId: ticket.customerId,
      laborCost: ticket.laborCost,
      partsCost: ticket.partsCost,
      subtotal,
      tax,
      discount: 0,
      total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'draft',
      createdAt: new Date()
    };
    setServiceInvoices([...serviceInvoices, newServiceInvoice]);
  };

  const addCourseBatch = (batchData: Omit<CourseBatch, 'id' | 'createdAt'>) => {
    const newBatch: CourseBatch = {
      ...batchData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCourseBatches([...courseBatches, newBatch]);
  };

  const updateCourseBatch = (id: string, batchData: Partial<CourseBatch>) => {
    setCourseBatches(courseBatches.map(batch => 
      batch.id === id ? { ...batch, ...batchData } : batch
    ));
  };

  const deleteCourseBatch = (id: string) => {
    setCourseBatches(courseBatches.filter(batch => batch.id !== id));
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setStudents([...students, newStudent]);
  };

  const updateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, ...studentData } : student
    ));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const addAdmission = (admissionData: Omit<Admission, 'id' | 'admissionDate' | 'createdAt'>) => {
    const newAdmission: Admission = {
      ...admissionData,
      id: Date.now().toString(),
      admissionDate: new Date(),
      createdAt: new Date()
    };
    setAdmissions([...admissions, newAdmission]);
  };

  const updateAdmission = (id: string, admissionData: Partial<Admission>) => {
    setAdmissions(admissions.map(admission => 
      admission.id === id ? { ...admission, ...admissionData } : admission
    ));
  };

  const addEnrollment = (enrollmentData: Omit<Enrollment, 'id' | 'enrollmentDate' | 'createdAt'>) => {
    const newEnrollment: Enrollment = {
      ...enrollmentData,
      id: Date.now().toString(),
      enrollmentDate: new Date(),
      registrationFeePaid: false,
      examFeePaid: false,
      createdAt: new Date()
    };
    setEnrollments([...enrollments, newEnrollment]);

    // Update batch current students count
    setCourseBatches(courseBatches.map(batch =>
      batch.id === enrollmentData.batchId
        ? { ...batch, currentStudents: batch.currentStudents + 1 }
        : batch
    ));
  };

  const updateEnrollment = (id: string, enrollmentData: Partial<Enrollment>) => {
    setEnrollments(enrollments.map(enrollment => 
      enrollment.id === id ? { ...enrollment, ...enrollmentData } : enrollment
    ));
  };

  const deleteEnrollment = (id: string) => {
    const enrollment = enrollments.find(e => e.id === id);
    if (enrollment) {
      // Update batch current students count
      setCourseBatches(courseBatches.map(batch =>
        batch.id === enrollment.batchId
          ? { ...batch, currentStudents: Math.max(0, batch.currentStudents - 1) }
          : batch
      ));
    }
    setEnrollments(enrollments.filter(enrollment => enrollment.id !== id));
  };

  const addCoursePayment = (paymentData: Omit<CoursePayment, 'id' | 'createdAt'>) => {
    const newPayment: CoursePayment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCoursePayments([...coursePayments, newPayment]);

    // Update payment status based on payment type
    if (paymentData.paymentType === 'admission' && paymentData.admissionId) {
      setAdmissions(admissions.map(admission =>
        admission.id === paymentData.admissionId
          ? { ...admission, paidAmount: admission.paidAmount + paymentData.amount }
          : admission
      ));
    } else if (paymentData.paymentType === 'enrollment' || paymentData.paymentType === 'installment') {
      setEnrollments(enrollments.map(enrollment =>
        enrollment.id === paymentData.enrollmentId
          ? {
              ...enrollment,
              paidAmount: enrollment.paidAmount + paymentData.amount,
              remainingAmount: enrollment.remainingAmount - paymentData.amount,
              installmentPlan: enrollment.installmentPlan && paymentData.paymentType === 'installment' 
                ? { ...enrollment.installmentPlan, paidInstallments: enrollment.installmentPlan.paidInstallments + 1 }
                : enrollment.installmentPlan
            }
          : enrollment
      ));
    } else if (paymentData.paymentType === 'registration') {
      setEnrollments(enrollments.map(enrollment =>
        enrollment.id === paymentData.enrollmentId
          ? { ...enrollment, registrationFeePaid: true }
          : enrollment
      ));
    } else if (paymentData.paymentType === 'exam') {
      setEnrollments(enrollments.map(enrollment =>
        enrollment.id === paymentData.enrollmentId
          ? { ...enrollment, examFeePaid: true }
          : enrollment
      ));
    }
  };

  const updateCoursePayment = (id: string, paymentData: Partial<CoursePayment>) => {
    setCoursePayments(coursePayments.map(payment => 
      payment.id === id ? { ...payment, ...paymentData } : payment
    ));
  };

  const deleteCoursePayment = (id: string) => {
    const payment = coursePayments.find(p => p.id === id);
    if (payment) {
      // Revert enrollment payment status
      setEnrollments(enrollments.map(enrollment =>
        enrollment.id === payment.enrollmentId
          ? {
              ...enrollment,
              paidAmount: enrollment.paidAmount - payment.amount,
              remainingAmount: enrollment.remainingAmount + payment.amount
            }
          : enrollment
      ));
    }
    setCoursePayments(coursePayments.filter(payment => payment.id !== id));
  };

  const generatePaymentVoucher = (voucherNumber: string) => {
    const payment = coursePayments.find(p => p.voucherNumber === voucherNumber);
    if (!payment) return;

    const enrollment = payment.enrollmentId ? enrollments.find(e => e.id === payment.enrollmentId) : null;
    const admission = payment.admissionId ? admissions.find(a => a.id === payment.admissionId) : null;
    const student = students.find(s => s.id === payment.studentId);
    const course = courses.find(c => c.id === (enrollment?.courseId || admission?.courseId));
    const batch = courseBatches.find(b => b.id === (enrollment?.batchId || admission?.batchId));

    let installmentInfo = '';
    if (payment.paymentType === 'installment' && payment.installmentNumber) {
      installmentInfo = `Installment ${payment.installmentNumber}`;
    }
    const newVoucher: PaymentVoucher = {
      id: Date.now().toString(),
      voucherNumber: payment.voucherNumber,
      paymentId: payment.id,
      studentName: student?.name || 'Unknown',
      courseName: course?.name || 'Unknown',
      batchName: batch?.batchName || 'Unknown',
      paymentType: payment.paymentType,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      receivedBy: payment.receivedBy,
      installmentInfo,
      createdAt: new Date()
    };
    setPaymentVouchers([...paymentVouchers, newVoucher]);
  };

  const addAttendanceSession = (sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>) => {
    const newSession: AttendanceSession = {
      ...sessionData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setAttendanceSessions([...attendanceSessions, newSession]);
  };

  const updateAttendanceRecord = (sessionId: string, studentId: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendanceSessions(attendanceSessions.map(session => {
      if (session.id === sessionId) {
        const existingRecord = session.attendanceRecords.find(r => r.studentId === studentId);
        if (existingRecord) {
          // Update existing record
          return {
            ...session,
            attendanceRecords: session.attendanceRecords.map(record =>
              record.studentId === studentId
                ? { ...record, status, notes, createdAt: new Date() }
                : record
            )
          };
        } else {
          // Create new record
          const enrollment = enrollments.find(e => e.studentId === studentId && e.batchId === session.batchId);
          if (enrollment) {
            const newRecord: AttendanceRecord = {
              id: Date.now().toString(),
              enrollmentId: enrollment.id,
              studentId,
              batchId: session.batchId,
              date: session.date,
              status,
              notes,
              markedBy: 'Admin', // You can make this dynamic
              createdAt: new Date()
            };
            return {
              ...session,
              attendanceRecords: [...session.attendanceRecords, newRecord]
            };
          }
        }
      }
      return session;
    }));
  };

  const value: InventoryContextType = {
    products,
    customers,
    suppliers,
    sales,
    purchases,
    courses,
    invoices,
    serviceTickets,
    technicians,
    serviceInvoices,
    courseBatches,
    students,
    admissions,
    enrollments,
    coursePayments,
    paymentVouchers,
    attendanceRecords,
    attendanceSessions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    addSupplier,
    addSale,
    addPurchase,
    addCourse,
    updateCourse,
    deleteCourse,
    generateInvoice,
    updateStock,
    addServiceTicket,
    updateServiceTicket,
    addTechnician,
    generateServiceInvoice,
    addCourseBatch,
    updateCourseBatch,
    deleteCourseBatch,
    addStudent,
    updateStudent,
    deleteStudent,
    addAdmission,
    updateAdmission,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    addCoursePayment,
    updateCoursePayment,
    deleteCoursePayment,
    generatePaymentVoucher,
    addAttendanceSession,
    updateAttendanceRecord
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}