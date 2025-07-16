import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { 
  Plus, Search, BookOpen, Users, Calendar, DollarSign, 
  GraduationCap, Clock, User, Eye, Edit2, Trash2, 
  CheckCircle, XCircle, FileText, Download, UserPlus,
  CreditCard, Receipt, ClipboardList
} from 'lucide-react';
import { Course, CourseBatch, Student, Admission, Enrollment } from '../types';

export function Courses() {
  const { 
    courses, courseBatches, students, admissions, enrollments, coursePayments, paymentVouchers,
    addCourse, updateCourse, deleteCourse,
    addCourseBatch, updateCourseBatch, deleteCourseBatch,
    addStudent, updateStudent, deleteStudent,
    addAdmission, updateAdmission,
    addEnrollment, updateEnrollment, deleteEnrollment,
    addCoursePayment, updateCoursePayment, deleteCoursePayment,
    generatePaymentVoucher,
    addAttendanceSession, updateAttendanceRecord, attendanceSessions
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'admissions' | 'enrollments' | 'payments' | 'attendance'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  // Form states
  const [courseForm, setCourseForm] = useState({
    name: '',
    duration: 0,
    price: 0,
    admissionFee: 0,
    registrationFee: 0,
    examFee: 0,
    description: '',
    materials: [] as string[],
    instructor: '',
    maxStudents: 0,
    status: 'active' as Course['status']
  });

  const [batchForm, setBatchForm] = useState({
    courseId: '',
    batchName: '',
    startDate: '',
    endDate: '',
    schedule: '',
    maxStudents: 0,
    status: 'upcoming' as CourseBatch['status']
  });

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: ''
  });

  const [admissionForm, setAdmissionForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    admissionFee: 0,
    paidAmount: 0
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    admissionId: '',
    totalFee: 0,
    paidAmount: 0,
    hasInstallments: false,
    totalInstallments: 1,
    installmentAmount: 0
  });

  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    admissionId: '',
    enrollmentId: '',
    paymentType: 'admission' as 'admission' | 'enrollment' | 'installment' | 'registration' | 'exam',
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'cheque',
    description: '',
    receivedBy: '',
    installmentNumber: 1
  });

  const [attendanceForm, setAttendanceForm] = useState({
    batchId: '',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    duration: 120,
    instructor: ''
  });

  const [newMaterial, setNewMaterial] = useState('');

  // Filter functions
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = courseBatches.filter(batch => {
    const course = courses.find(c => c.id === batch.courseId);
    return course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch.batchName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const filteredAdmissions = admissions.filter(admission => {
    const student = students.find(s => s.id === admission.studentId);
    const course = courses.find(c => c.id === admission.courseId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPayments = coursePayments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper functions
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getBatchName = (batchId: string) => {
    const batch = courseBatches.find(b => b.id === batchId);
    return batch ? batch.batchName : 'Unknown Batch';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Form handlers
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, courseForm);
      setEditingCourse(null);
    } else {
      addCourse(courseForm);
    }
    resetCourseForm();
    setShowCourseForm(false);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batchData = {
      ...batchForm,
      startDate: new Date(batchForm.startDate),
      endDate: new Date(batchForm.endDate),
      currentStudents: 0
    };
    
    if (editingBatch) {
      updateCourseBatch(editingBatch.id, batchData);
      setEditingBatch(null);
    } else {
      addCourseBatch(batchData);
    }
    resetBatchForm();
    setShowBatchForm(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = {
      ...studentForm,
      dateOfBirth: studentForm.dateOfBirth ? new Date(studentForm.dateOfBirth) : undefined
    };
    
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      setEditingStudent(null);
    } else {
      addStudent(studentData);
    }
    resetStudentForm();
    setShowStudentForm(false);
  };

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === admissionForm.courseId);
    if (course) {
      const admissionData = {
        ...admissionForm,
        admissionFee: course.admissionFee,
        status: 'pending' as const
      };
      addAdmission(admissionData);
    }
    resetAdmissionForm();
    setShowAdmissionForm(false);
  };

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const admission = admissions.find(a => a.id === enrollmentForm.admissionId);
    if (admission) {
      const enrollmentData = {
        studentId: admission.studentId,
        courseId: admission.courseId,
        batchId: admission.batchId,
        admissionId: admission.id,
        totalFee: enrollmentForm.totalFee,
        paidAmount: enrollmentForm.paidAmount,
        remainingAmount: enrollmentForm.totalFee - enrollmentForm.paidAmount,
        installmentPlan: enrollmentForm.hasInstallments ? {
          totalInstallments: enrollmentForm.totalInstallments,
          installmentAmount: enrollmentForm.installmentAmount,
          paidInstallments: 0
        } : undefined,
        status: 'active' as const
      };
      addEnrollment(enrollmentData);
    }
    resetEnrollmentForm();
    setShowEnrollmentForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const voucherNumber = `PAY-${Date.now()}`;
    const paymentData = {
      ...paymentForm,
      voucherNumber,
      paymentDate: new Date()
    };
    addCoursePayment(paymentData);
    generatePaymentVoucher(voucherNumber);
    resetPaymentForm();
    setShowPaymentForm(false);
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionData = {
      ...attendanceForm,
      date: new Date(attendanceForm.date),
      attendanceRecords: []
    };
    addAttendanceSession(sessionData);
    resetAttendanceForm();
    setShowAttendanceForm(false);
  };

  // Reset form functions
  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      duration: 0,
      price: 0,
      admissionFee: 0,
      registrationFee: 0,
      examFee: 0,
      description: '',
      materials: [],
      instructor: '',
      maxStudents: 0,
      status: 'active'
    });
  };

  const resetBatchForm = () => {
    setBatchForm({
      courseId: '',
      batchName: '',
      startDate: '',
      endDate: '',
      schedule: '',
      maxStudents: 0,
      status: 'upcoming'
    });
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      emergencyContact: ''
    });
  };

  const resetAdmissionForm = () => {
    setAdmissionForm({
      studentId: '',
      courseId: '',
      batchId: '',
      admissionFee: 0,
      paidAmount: 0
    });
  };

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      admissionId: '',
      totalFee: 0,
      paidAmount: 0,
      hasInstallments: false,
      totalInstallments: 1,
      installmentAmount: 0
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      studentId: '',
      admissionId: '',
      enrollmentId: '',
      paymentType: 'admission',
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      receivedBy: '',
      installmentNumber: 1
    });
  };

  const resetAttendanceForm = () => {
    setAttendanceForm({
      batchId: '',
      date: new Date().toISOString().split('T')[0],
      topic: '',
      duration: 120,
      instructor: ''
    });
  };

  // Edit handlers
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      duration: course.duration,
      price: course.price,
      admissionFee: course.admissionFee,
      registrationFee: course.registrationFee,
      examFee: course.examFee,
      description: course.description,
      materials: course.materials,
      instructor: course.instructor,
      maxStudents: course.maxStudents,
      status: course.status
    });
    setShowCourseForm(true);
  };

  const handleEditBatch = (batch: CourseBatch) => {
    setEditingBatch(batch);
    setBatchForm({
      courseId: batch.courseId,
      batchName: batch.batchName,
      startDate: new Date(batch.startDate).toISOString().split('T')[0],
      endDate: new Date(batch.endDate).toISOString().split('T')[0],
      schedule: batch.schedule,
      maxStudents: batch.maxStudents,
      status: batch.status
    });
    setShowBatchForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      emergencyContact: student.emergencyContact || ''
    });
    setShowStudentForm(true);
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setCourseForm({
        ...courseForm,
        materials: [...courseForm.materials, newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    setCourseForm({
      ...courseForm,
      materials: courseForm.materials.filter((_, i) => i !== index)
    });
  };

  const approveAdmission = (admissionId: string) => {
    updateAdmission(admissionId, { status: 'approved' });
  };

  const rejectAdmission = (admissionId: string) => {
    updateAdmission(admissionId, { status: 'rejected' });
  };

  const printVoucher = (voucherNumber: string) => {
    const voucher = paymentVouchers.find(v => v.voucherNumber === voucherNumber);
    if (!voucher) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Voucher ${voucher.voucherNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #333; }
            .voucher-details { margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
            .amount-box { border: 2px solid #333; padding: 15px; text-align: center; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Hi Tech Computer</div>
            <div>Course Payment Voucher</div>
          </div>
          
          <div class="voucher-details">
            <div class="detail-row">
              <span class="label">Voucher Number:</span>
              <span>${voucher.voucherNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span>${new Date(voucher.paymentDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Student Name:</span>
              <span>${voucher.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Course:</span>
              <span>${voucher.courseName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Batch:</span>
              <span>${voucher.batchName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Type:</span>
              <span>${voucher.paymentType.charAt(0).toUpperCase() + voucher.paymentType.slice(1)}</span>
            </div>
            ${voucher.installmentInfo ? `
            <div class="detail-row">
              <span class="label">Installment:</span>
              <span>${voucher.installmentInfo}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span>${voucher.paymentMethod.charAt(0).toUpperCase() + voucher.paymentMethod.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Received By:</span>
              <span>${voucher.receivedBy}</span>
            </div>
          </div>

          <div class="amount-box">
            <div>Amount Paid</div>
            <div class="amount">$${voucher.amount.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Generated by Hi Tech Computer Course Management System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage courses, students, admissions, enrollments, and payments</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'courses' && (
            <button
              onClick={() => setShowCourseForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Course</span>
            </button>
          )}
          {activeTab === 'batches' && (
            <button
              onClick={() => setShowBatchForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Batch</span>
            </button>
          )}
          {activeTab === 'students' && (
            <button
              onClick={() => setShowStudentForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>Add Student</span>
            </button>
          )}
          {activeTab === 'admissions' && (
            <button
              onClick={() => setShowAdmissionForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <GraduationCap size={20} />
              <span>New Admission</span>
            </button>
          )}
          {activeTab === 'enrollments' && (
            <button
              onClick={() => setShowEnrollmentForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            >
              <BookOpen size={20} />
              <span>New Enrollment</span>
            </button>
          )}
          {activeTab === 'payments' && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition-colors"
            >
              <CreditCard size={20} />
              <span>Add Payment</span>
            </button>
          )}
          {activeTab === 'attendance' && (
            <button
              onClick={() => setShowAttendanceForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700 transition-colors"
            >
              <ClipboardList size={20} />
              <span>Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Calendar },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'admissions', label: 'Admissions', icon: GraduationCap },
            { id: 'enrollments', label: 'Enrollments', icon: User },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">{course.duration} hours</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <User size={16} />
                  <span className="text-sm">{course.instructor}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users size={16} />
                  <span className="text-sm">Max {course.maxStudents} students</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Course Fee:</span>
                    <span className="font-medium ml-1">${(course.price || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Admission:</span>
                    <span className="font-medium ml-1">${(course.admissionFee || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Registration:</span>
                    <span className="font-medium ml-1">${(course.registrationFee || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Exam:</span>
                    <span className="font-medium ml-1">${(course.examFee || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{batch.batchName}</td>
                    <td className="py-3 px-4">{getCourseName(batch.courseId)}</td>
                    <td className="py-3 px-4 text-sm">{batch.schedule}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{batch.currentStudents}/{batch.maxStudents}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBatch(batch)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCourseBatch(batch.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">
                    Joined {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{student.email}</p>
                <p className="text-sm text-gray-600">{student.phone}</p>
                <p className="text-sm text-gray-600">{student.address}</p>
                {student.emergencyContact && (
                  <p className="text-sm text-gray-600">Emergency: {student.emergencyContact}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'admissions' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Admission Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Paid Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{getStudentName(admission.studentId)}</td>
                    <td className="py-3 px-4">{getCourseName(admission.courseId)}</td>
                    <td className="py-3 px-4">{getBatchName(admission.batchId)}</td>
                    <td className="py-3 px-4">${(admission.admissionFee || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">${(admission.paidAmount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {admission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveAdmission(admission.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => rejectAdmission(admission.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Paid</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Remaining</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Installments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{getStudentName(enrollment.studentId)}</td>
                    <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                    <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                    <td className="py-3 px-4">${(enrollment.totalFee || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">${(enrollment.paidAmount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">${(enrollment.remainingAmount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {enrollment.installmentPlan ? 
                        `${enrollment.installmentPlan.paidInstallments}/${enrollment.installmentPlan.totalInstallments}` : 
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Voucher #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Received By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{payment.voucherNumber}</td>
                    <td className="py-3 px-4">{getStudentName(payment.studentId)}</td>
                    <td className="py-3 px-4 capitalize">
                      {payment.paymentType}
                      {payment.installmentNumber && ` (${payment.installmentNumber})`}
                    </td>
                    <td className="py-3 px-4 font-medium">${(payment.amount || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{payment.receivedBy}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => printVoucher(payment.voucherNumber)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Print Voucher"
                      >
                        <Receipt size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Batch Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a batch</option>
              {courseBatches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchName} - {getCourseName(batch.courseId)}
                </option>
              ))}
            </select>
          </div>

          {selectedBatch && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Sessions</h3>
              </div>
              <div className="p-4">
                {attendanceSessions
                  .filter(session => session.batchId === selectedBatch)
                  .map(session => (
                    <div key={session.id} className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.topic}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(session.date).toLocaleDateString()} - {session.duration} minutes
                          </p>
                          <p className="text-sm text-gray-600">Instructor: {session.instructor}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrollments
                          .filter(enrollment => enrollment.batchId === selectedBatch)
                          .map(enrollment => {
                            const student = students.find(s => s.id === enrollment.studentId);
                            const attendanceRecord = session.attendanceRecords.find(r => r.studentId === enrollment.studentId);
                            
                            return (
                              <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-900">{student?.name}</span>
                                <div className="flex space-x-2">
                                  {['present', 'absent', 'late', 'excused'].map(status => (
                                    <button
                                      key={status}
                                      onClick={() => updateAttendanceRecord(session.id, enrollment.studentId, status as any)}
                                      className={`px-2 py-1 text-xs rounded ${
                                        attendanceRecord?.status === status
                                          ? status === 'present' ? 'bg-green-500 text-white' :
                                            status === 'absent' ? 'bg-red-500 text-white' :
                                            status === 'late' ? 'bg-yellow-500 text-white' :
                                            'bg-blue-500 text-white'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                    >
                                      {status.charAt(0).toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.admissionFee}
                    onChange={(e) => setCourseForm({ ...courseForm, admissionFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.registrationFee}
                    onChange={(e) => setCourseForm({ ...courseForm, registrationFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.examFee}
                    onChange={(e) => setCourseForm({ ...courseForm, examFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="Add material..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMaterial();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {courseForm.materials.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    {courseForm.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">• {material}</span>
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    resetCourseForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Form Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={batchForm.courseId}
                  onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                <input
                  type="text"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={batchForm.endDate}
                  onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <input
                  type="text"
                  value={batchForm.schedule}
                  onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
                  placeholder="e.g., Mon, Wed, Fri 10:00 AM - 12:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                <input
                  type="number"
                  value={batchForm.maxStudents}
                  onChange={(e) => setBatchForm({ ...batchForm, maxStudents: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchForm(false);
                    setEditingBatch(null);
                    resetBatchForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBatch ? 'Update Batch' : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={studentForm.dateOfBirth}
                  onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <input
                  type="text"
                  value={studentForm.emergencyContact}
                  onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentForm(false);
                    setEditingStudent(null);
                    resetStudentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admission Form Modal */}
      {showAdmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Admission</h2>
            <form onSubmit={handleAdmissionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={admissionForm.studentId}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={admissionForm.courseId}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setAdmissionForm({ 
                      ...admissionForm, 
                      courseId: e.target.value,
                      admissionFee: course ? course.admissionFee : 0
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.filter(c => c.status === 'active').map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={admissionForm.batchId}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Batch</option>
                  {courseBatches
                    .filter(batch => batch.courseId === admissionForm.courseId && batch.status !== 'completed')
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={admissionForm.admissionFee}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={admissionForm.paidAmount}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdmissionForm(false);
                    resetAdmissionForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Enrollment</h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approved Admission</label>
                <select
                  value={enrollmentForm.admissionId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, admissionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Admission</option>
                  {admissions
                    .filter(admission => admission.status === 'approved')
                    .map(admission => (
                      <option key={admission.id} value={admission.id}>
                        {getStudentName(admission.studentId)} - {getCourseName(admission.courseId)}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={enrollmentForm.totalFee}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, totalFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={enrollmentForm.paidAmount}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasInstallments"
                  checked={enrollmentForm.hasInstallments}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, hasInstallments: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasInstallments" className="text-sm font-medium text-gray-700">
                  Enable Installment Plan
                </label>
              </div>
              {enrollmentForm.hasInstallments && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Installments</label>
                    <input
                      type="number"
                      value={enrollmentForm.totalInstallments}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, totalInstallments: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Installment Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={enrollmentForm.installmentAmount}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, installmentAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    resetEnrollmentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="admission">Admission Fee</option>
                  <option value="enrollment">Enrollment Fee</option>
                  <option value="installment">Installment Payment</option>
                  <option value="registration">Registration Fee</option>
                  <option value="exam">Exam Fee</option>
                </select>
              </div>
              {paymentForm.paymentType === 'admission' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission</label>
                  <select
                    value={paymentForm.admissionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, admissionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Admission</option>
                    {admissions
                      .filter(admission => admission.studentId === paymentForm.studentId)
                      .map(admission => (
                        <option key={admission.id} value={admission.id}>
                          {getCourseName(admission.courseId)} - {getBatchName(admission.batchId)}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {(paymentForm.paymentType === 'enrollment' || paymentForm.paymentType === 'installment' || 
                paymentForm.paymentType === 'registration' || paymentForm.paymentType === 'exam') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment</label>
                  <select
                    value={paymentForm.enrollmentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Enrollment</option>
                    {enrollments
                      .filter(enrollment => enrollment.studentId === paymentForm.studentId)
                      .map(enrollment => (
                        <option key={enrollment.id} value={enrollment.id}>
                          {getCourseName(enrollment.courseId)} - {getBatchName(enrollment.batchId)}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {paymentForm.paymentType === 'installment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Installment Number</label>
                  <input
                    type="number"
                    value={paymentForm.installmentNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, installmentNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
                <input
                  type="text"
                  value={paymentForm.receivedBy}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receivedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Attendance Session</h2>
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={attendanceForm.batchId}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Batch</option>
                  {courseBatches
                    .filter(batch => batch.status === 'ongoing')
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName} - {getCourseName(batch.courseId)}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  value={attendanceForm.topic}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={attendanceForm.duration}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                <input
                  type="text"
                  value={attendanceForm.instructor}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttendanceForm(false);
                    resetAttendanceForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}