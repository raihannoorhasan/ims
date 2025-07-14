import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Edit2, Trash2, Users, Calendar, DollarSign, BookOpen, Clock, User, Receipt, CheckCircle, X, Eye, UserCheck, Filter, Download, Printer as Print } from 'lucide-react';
import { Course, CourseBatch, Student, Enrollment, CoursePayment, AttendanceSession } from '../types';

export function Courses() {
  const { 
    courses, courseBatches, students, enrollments, coursePayments, attendanceSessions,
    addCourse, updateCourse, deleteCourse,
    addCourseBatch, updateCourseBatch, deleteCourseBatch,
    addStudent, updateStudent, deleteStudent,
    addEnrollment, updateEnrollment, deleteEnrollment,
    addCoursePayment, updateCoursePayment, deleteCoursePayment,
    generatePaymentVoucher, addAttendanceSession, updateAttendanceRecord
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments' | 'attendance'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  
  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showAttendanceSession, setShowAttendanceSession] = useState<AttendanceSession | null>(null);
  
  // Edit states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);

  // Form data states
  const [courseForm, setCourseForm] = useState({
    name: '',
    duration: 0,
    price: 0,
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
    maxStudents: 0
  });

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: ''
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    totalFee: 0,
    initialPayment: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    receivedBy: 'Admin'
  });

  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    studentId: '',
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    description: '',
    receivedBy: 'Admin'
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
    const matchesSearch = batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course && course.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || batch.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    const batch = courseBatches.find(b => b.id === enrollment.batchId);
    
    const matchesSearch = (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (course && course.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (batch && batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || enrollment.courseId === selectedCourse;
    const matchesBatch = selectedBatch === 'all' || enrollment.batchId === selectedBatch;
    
    return matchesSearch && matchesCourse && matchesBatch;
  });

  const filteredPayments = coursePayments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
    const course = enrollment ? courses.find(c => c.id === enrollment.courseId) : null;
    
    const matchesSearch = (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (course && course.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || (enrollment && enrollment.courseId === selectedCourse);
    
    return matchesSearch && matchesCourse;
  });

  const filteredAttendanceSessions = attendanceSessions.filter(session => {
    const batch = courseBatches.find(b => b.id === session.batchId);
    const course = batch ? courses.find(c => c.id === batch.courseId) : null;
    
    const matchesSearch = (batch && batch.batchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (course && course.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || (batch && batch.courseId === selectedCourse);
    const matchesBatch = selectedBatch === 'all' || session.batchId === selectedBatch;
    
    return matchesSearch && matchesCourse && matchesBatch;
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

  const getBatchesForCourse = (courseId: string) => {
    return courseBatches.filter(batch => batch.courseId === courseId);
  };

  const getEnrollmentsForBatch = (batchId: string) => {
    return enrollments.filter(enrollment => enrollment.batchId === batchId);
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
      currentStudents: 0,
      status: 'upcoming' as CourseBatch['status']
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

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEnrollment) {
      updateEnrollment(editingEnrollment.id, {
        studentId: enrollmentForm.studentId,
        courseId: enrollmentForm.courseId,
        batchId: enrollmentForm.batchId,
        totalFee: enrollmentForm.totalFee,
        status: 'active'
      });
      setEditingEnrollment(null);
    } else {
      // Create enrollment
      const enrollmentData = {
        studentId: enrollmentForm.studentId,
        courseId: enrollmentForm.courseId,
        batchId: enrollmentForm.batchId,
        totalFee: enrollmentForm.totalFee,
        paidAmount: enrollmentForm.initialPayment,
        remainingAmount: enrollmentForm.totalFee - enrollmentForm.initialPayment,
        status: 'active' as Enrollment['status']
      };
      
      addEnrollment(enrollmentData);
      
      // Record initial payment if amount > 0
      if (enrollmentForm.initialPayment > 0) {
        setTimeout(() => {
          const newEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
          const latestEnrollment = newEnrollments[newEnrollments.length - 1];
          
          if (latestEnrollment) {
            const voucherNumber = `PV-${Date.now()}`;
            const paymentData = {
              enrollmentId: latestEnrollment.id,
              studentId: enrollmentForm.studentId,
              amount: enrollmentForm.initialPayment,
              paymentMethod: enrollmentForm.paymentMethod,
              paymentDate: new Date(),
              voucherNumber,
              description: 'Initial Payment',
              receivedBy: enrollmentForm.receivedBy
            };
            
            addCoursePayment(paymentData);
            generatePaymentVoucher(voucherNumber);
          }
        }, 100);
      }
    }
    
    resetEnrollmentForm();
    setShowEnrollmentForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get enrollment to check remaining amount
    const enrollment = enrollments.find(e => e.id === paymentForm.enrollmentId);
    if (!enrollment) {
      alert('Enrollment not found');
      return;
    }
    
    // Validate payment amount
    if (paymentForm.amount > enrollment.remainingAmount) {
      alert(`Payment amount cannot exceed remaining balance of $${enrollment.remainingAmount.toFixed(2)}`);
      return;
    }
    
    if (paymentForm.amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    
    const voucherNumber = `PV-${Date.now()}`;
    const paymentData = {
      ...paymentForm,
      paymentDate: new Date(),
      voucherNumber
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
      maxStudents: 0
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

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      batchId: '',
      totalFee: 0,
      initialPayment: 0,
      paymentMethod: 'cash',
      receivedBy: 'Admin'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      studentId: '',
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      receivedBy: 'Admin'
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
      maxStudents: batch.maxStudents
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

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setEnrollmentForm({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      totalFee: enrollment.totalFee,
      initialPayment: 0,
      paymentMethod: 'cash',
      receivedBy: 'Admin'
    });
    setShowEnrollmentForm(true);
  };

  // Material management
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

  // Attendance management
  const markAttendance = (sessionId: string, studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    updateAttendanceRecord(sessionId, studentId, status);
  };

  const getAttendanceStatus = (session: AttendanceSession, studentId: string) => {
    const record = session.attendanceRecords.find(r => r.studentId === studentId);
    return record ? record.status : 'absent';
  };

  // Print voucher function
  const printVoucher = (payment: CoursePayment) => {
    const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
    const student = students.find(s => s.id === payment.studentId);
    const course = enrollment ? courses.find(c => c.id === enrollment.courseId) : null;
    const batch = enrollment ? courseBatches.find(b => b.id === enrollment.batchId) : null;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Voucher ${payment.voucherNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #333; }
            .voucher-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .student-info, .payment-info { flex: 1; }
            .payment-info { text-align: right; }
            .amount-section { background-color: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center; }
            .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">TechFlow Training Center</div>
            <div>Professional Computer Training Institute</div>
            <div>Payment Voucher</div>
          </div>
          
          <div class="voucher-details">
            <div class="student-info">
              <h3>Student Information:</h3>
              <p><strong>Name:</strong> ${student?.name || 'Unknown'}</p>
              <p><strong>Email:</strong> ${student?.email || ''}</p>
              <p><strong>Phone:</strong> ${student?.phone || ''}</p>
              <p><strong>Course:</strong> ${course?.name || 'Unknown'}</p>
              <p><strong>Batch:</strong> ${batch?.batchName || 'Unknown'}</p>
            </div>
            <div class="payment-info">
              <h3>Payment Details:</h3>
              <p><strong>Voucher #:</strong> ${payment.voucherNumber}</p>
              <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${payment.paymentMethod.toUpperCase()}</p>
              <p><strong>Received By:</strong> ${payment.receivedBy}</p>
            </div>
          </div>

          <div class="amount-section">
            <p>Amount Received</p>
            <div class="amount">$${payment.amount.toFixed(2)}</div>
            <p>${payment.description || 'Course Fee Payment'}</p>
          </div>

          <table>
            <tr>
              <th>Course Fee</th>
              <td>$${enrollment?.totalFee.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <th>Total Paid</th>
              <td>$${enrollment?.paidAmount.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <th>Remaining Balance</th>
              <td>$${enrollment?.remainingAmount.toFixed(2) || '0.00'}</td>
            </tr>
          </table>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Student Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Authorized Signature</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            <p>Thank you for choosing TechFlow Training Center!</p>
            <p>This is a computer generated voucher.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Training Center Management</h1>
          <p className="text-gray-600 mt-2">Complete course, student, and payment management system</p>
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
              <Plus size={20} />
              <span>Add Student</span>
            </button>
          )}
          {activeTab === 'enrollments' && (
            <button
              onClick={() => setShowEnrollmentForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <Plus size={20} />
              <span>New Enrollment</span>
            </button>
          )}
          {activeTab === 'payments' && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
            >
              <Plus size={20} />
              <span>Record Payment</span>
            </button>
          )}
          {activeTab === 'attendance' && (
            <button
              onClick={() => setShowAttendanceForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Calendar },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'enrollments', label: 'Enrollments', icon: UserCheck },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle }
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {(activeTab === 'batches' || activeTab === 'enrollments' || activeTab === 'payments' || activeTab === 'attendance') && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          )}
          {(activeTab === 'enrollments' || activeTab === 'attendance') && (
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Batches</option>
              {courseBatches
                .filter(batch => selectedCourse === 'all' || batch.courseId === selectedCourse)
                .map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
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
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">{course.duration} hours</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign size={16} />
                  <span className="text-sm">${course.price}</span>
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

              <p className="text-sm text-gray-600 mb-4">{course.description}</p>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Materials:</p>
                <div className="flex flex-wrap gap-1">
                  {course.materials.map((material, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Batches</span>
                  <span className="font-medium">{getBatchesForCourse(course.id).length}</span>
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
                    <td className="py-3 px-4 font-medium text-gray-900">{batch.batchName}</td>
                    <td className="py-3 px-4">{getCourseName(batch.courseId)}</td>
                    <td className="py-3 px-4 text-sm">{batch.schedule}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {batch.currentStudents}/{batch.maxStudents}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        batch.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        batch.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        batch.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
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
                {student.address && <p className="text-sm text-gray-600">{student.address}</p>}
                {student.dateOfBirth && (
                  <p className="text-sm text-gray-600">
                    DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                {student.emergencyContact && (
                  <p className="text-sm text-gray-600">Emergency: {student.emergencyContact}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Enrollments</span>
                  <span className="font-medium">
                    {enrollments.filter(e => e.studentId === student.id && e.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {getStudentName(enrollment.studentId)}
                    </td>
                    <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                    <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                    <td className="py-3 px-4">${enrollment.totalFee.toFixed(2)}</td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      ${enrollment.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-red-600 font-medium">
                      ${enrollment.remainingAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        enrollment.status === 'dropped' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEnrollment(enrollment)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteEnrollment(enrollment.id)}
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

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Voucher #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Received By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{payment.voucherNumber}</td>
                      <td className="py-3 px-4">{getStudentName(payment.studentId)}</td>
                      <td className="py-3 px-4">
                        {enrollment ? getCourseName(enrollment.courseId) : 'Unknown'}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{payment.receivedBy}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => printVoucher(payment)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Print Voucher"
                        >
                          <Print size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Sessions */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Topic</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Present</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendanceSessions.map((session) => {
                    const batchEnrollments = getEnrollmentsForBatch(session.batchId);
                    const presentCount = session.attendanceRecords.filter(r => r.status === 'present').length;
                    
                    return (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{getBatchName(session.batchId)}</td>
                        <td className="py-3 px-4">{session.topic}</td>
                        <td className="py-3 px-4">{session.duration} min</td>
                        <td className="py-3 px-4">{session.instructor}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {presentCount}/{batchEnrollments.length}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setShowAttendanceSession(session)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark Attendance"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) || 0 })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as Course['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                  {courses.filter(c => c.status === 'active').map(course => (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
                  type="tel"
                  value={studentForm.emergencyContact}
                  onChange={(e) => setStudentForm({ ...studentForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
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

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEnrollment ? 'Edit Enrollment' : 'New Enrollment'}
            </h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={enrollmentForm.studentId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!!editingEnrollment}
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
                  value={enrollmentForm.courseId}
                  onChange={(e) => {
                    setEnrollmentForm({ 
                      ...enrollmentForm, 
                      courseId: e.target.value,
                      batchId: '',
                      totalFee: courses.find(c => c.id === e.target.value)?.price || 0
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!!editingEnrollment}
                >
                  <option value="">Select Course</option>
                  {courses.filter(c => c.status === 'active').map(course => (
                    <option key={course.id} value={course.id}>{course.name} - ${course.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={enrollmentForm.batchId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!enrollmentForm.courseId || !!editingEnrollment}
                >
                  <option value="">Select Batch</option>
                  {courseBatches
                    .filter(batch => batch.courseId === enrollmentForm.courseId && batch.currentStudents < batch.maxStudents)
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName} ({batch.currentStudents}/{batch.maxStudents})
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
              {!editingEnrollment && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Payment</label>
                    <input
                      type="number"
                      step="0.01"
                      value={enrollmentForm.initialPayment}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, initialPayment: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={enrollmentForm.totalFee}
                    />
                  </div>
                  {enrollmentForm.initialPayment > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select
                          value={enrollmentForm.paymentMethod}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, paymentMethod: e.target.value as CoursePayment['paymentMethod'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="transfer">Transfer</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Received By</label>
                        <input
                          type="text"
                          value={enrollmentForm.receivedBy}
                          onChange={(e) => setEnrollmentForm({ ...enrollmentForm, receivedBy: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    setEditingEnrollment(null);
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
                  {editingEnrollment ? 'Update Enrollment' : 'Create Enrollment'}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    const studentEnrollments = enrollments.filter(en => 
                      en.studentId === studentId && en.remainingAmount > 0
                    );
                    setPaymentForm({ 
                      ...paymentForm, 
                      studentId,
                      enrollmentId: studentEnrollments.length === 1 ? studentEnrollments[0].id : ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Student</option>
                  {students
                    .filter(student => enrollments.some(en => en.studentId === student.id && en.remainingAmount > 0))
                    .map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment</label>
                <select
                  value={paymentForm.enrollmentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, enrollmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!paymentForm.studentId}
                >
                  <option value="">Select Enrollment</option>
                  {enrollments
                    .filter(enrollment => 
                      enrollment.studentId === paymentForm.studentId && 
                      enrollment.remainingAmount > 0
                    )
                    .map(enrollment => (
                      <option key={enrollment.id} value={enrollment.id}>
                        {getCourseName(enrollment.courseId)} - {getBatchName(enrollment.batchId)} 
                        (Remaining: ${enrollment.remainingAmount.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>
              {paymentForm.enrollmentId && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Remaining Balance: </strong>
                    ${enrollments.find(e => e.id === paymentForm.enrollmentId)?.remainingAmount.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  max={enrollments.find(e => e.id === paymentForm.enrollmentId)?.remainingAmount || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as CoursePayment['paymentMethod'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Monthly installment"
                />
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
                  Record Payment
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Attendance Session</h2>
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

      {/* Attendance Session Modal */}
      {showAttendanceSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
                <p className="text-gray-600">
                  {getBatchName(showAttendanceSession.batchId)} - {showAttendanceSession.topic}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(showAttendanceSession.date).toLocaleDateString()} - {showAttendanceSession.duration} minutes
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceSession(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getEnrollmentsForBatch(showAttendanceSession.batchId).map((enrollment) => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const currentStatus = getAttendanceStatus(showAttendanceSession, enrollment.studentId);
                    
                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {student?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {student?.email || ''}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {student?.phone || ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {['present', 'absent', 'late', 'excused'].map((status) => (
                              <button
                                key={status}
                                onClick={() => markAttendance(showAttendanceSession.id, enrollment.studentId, status as any)}
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                  currentStatus === status
                                    ? status === 'present' ? 'bg-green-100 text-green-800' :
                                      status === 'absent' ? 'bg-red-100 text-red-800' :
                                      status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}