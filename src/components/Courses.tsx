import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen,
  UserPlus,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Printer,
  Eye
} from 'lucide-react';
import { Course, CourseBatch, Student, Enrollment, CoursePayment, AttendanceSession } from '../types';

export function Courses() {
  const { 
    courses, 
    courseBatches, 
    students, 
    enrollments, 
    coursePayments,
    attendanceSessions,
    addCourse, 
    updateCourse, 
    deleteCourse,
    addCourseBatch,
    updateCourseBatch,
    deleteCourseBatch,
    addStudent,
    updateStudent,
    deleteStudent,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    addCoursePayment,
    updateCoursePayment,
    deleteCoursePayment,
    addAttendanceSession,
    updateAttendanceRecord
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments' | 'attendance'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showAttendanceReport, setShowAttendanceReport] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

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

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    totalFee: 0,
    paidAmount: 0,
    status: 'active' as Enrollment['status']
  });

  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    studentId: '',
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    voucherNumber: '',
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
    return course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch.batchName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === enrollmentForm.courseId);
    const enrollmentData = {
      ...enrollmentForm,
      totalFee: course?.price || enrollmentForm.totalFee,
      remainingAmount: (course?.price || enrollmentForm.totalFee) - enrollmentForm.paidAmount
    };
    
    addEnrollment(enrollmentData);
    
    // If there's an initial payment, create payment record
    if (enrollmentForm.paidAmount > 0) {
      const voucherNumber = `PAY-${Date.now()}`;
      const paymentData = {
        enrollmentId: '', // Will be set after enrollment is created
        studentId: enrollmentForm.studentId,
        amount: enrollmentForm.paidAmount,
        paymentMethod: 'cash' as CoursePayment['paymentMethod'],
        paymentDate: new Date(),
        voucherNumber,
        description: 'Initial payment',
        receivedBy: 'Admin'
      };
      
      // Find the newly created enrollment and add payment
      setTimeout(() => {
        const newEnrollment = enrollments.find(e => 
          e.studentId === enrollmentForm.studentId && 
          e.courseId === enrollmentForm.courseId && 
          e.batchId === enrollmentForm.batchId
        );
        if (newEnrollment) {
          addCoursePayment({ ...paymentData, enrollmentId: newEnrollment.id });
        }
      }, 100);
    }
    
    resetEnrollmentForm();
    setShowEnrollmentForm(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = {
      ...paymentForm,
      paymentDate: new Date(paymentForm.paymentDate),
      voucherNumber: paymentForm.voucherNumber || `PAY-${Date.now()}`
    };
    
    addCoursePayment(paymentData);
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

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      batchId: '',
      totalFee: 0,
      paidAmount: 0,
      status: 'active'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      studentId: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      voucherNumber: '',
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

  // Helper functions
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

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getBatchName = (batchId: string) => {
    const batch = courseBatches.find(b => b.id === batchId);
    return batch ? batch.batchName : 'Unknown Batch';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'dropped':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Attendance functions
  const markAttendance = (sessionId: string, studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    updateAttendanceRecord(sessionId, studentId, status);
  };

  const printDailyAttendance = (sessionId: string) => {
    const session = attendanceSessions.find(s => s.id === sessionId);
    if (!session) return;

    const batch = courseBatches.find(b => b.id === session.batchId);
    const course = courses.find(c => c.id === batch?.courseId);
    const batchEnrollments = enrollments.filter(e => e.batchId === session.batchId && e.status === 'active');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Attendance - ${new Date(session.date).toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .present { background-color: #d4edda; }
            .absent { background-color: #f8d7da; }
            .late { background-color: #fff3cd; }
            .excused { background-color: #d1ecf1; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature div { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TechFlow IMS - Daily Attendance Sheet</h1>
            <h2>${course?.name || 'Unknown Course'}</h2>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span><strong>Batch:</strong> ${batch?.batchName || 'Unknown'}</span>
              <span><strong>Date:</strong> ${new Date(session.date).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span><strong>Topic:</strong> ${session.topic}</span>
              <span><strong>Duration:</strong> ${session.duration} minutes</span>
            </div>
            <div class="info-row">
              <span><strong>Instructor:</strong> ${session.instructor}</span>
              <span><strong>Total Students:</strong> ${batchEnrollments.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              ${batchEnrollments.map((enrollment, index) => {
                const student = students.find(s => s.id === enrollment.studentId);
                const attendanceRecord = session.attendanceRecords.find(r => r.studentId === enrollment.studentId);
                const status = attendanceRecord?.status || 'absent';
                return `
                  <tr class="${status}">
                    <td>${index + 1}</td>
                    <td>${student?.name || 'Unknown'}</td>
                    <td style="text-transform: capitalize; font-weight: bold;">${status}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="signature">
            <div>
              <div class="signature-line"></div>
              <p>Instructor Signature</p>
            </div>
            <div>
              <div class="signature-line"></div>
              <p>Admin Signature</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const printMonthlyAttendance = (studentId: string, month: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const studentEnrollments = enrollments.filter(e => e.studentId === studentId && e.status === 'active');
    const monthStart = new Date(month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportContent = '';
    
    studentEnrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      const batch = courseBatches.find(b => b.id === enrollment.batchId);
      const batchSessions = attendanceSessions.filter(s => 
        s.batchId === enrollment.batchId &&
        new Date(s.date) >= monthStart &&
        new Date(s.date) <= monthEnd
      );

      const totalSessions = batchSessions.length;
      const attendedSessions = batchSessions.filter(s => 
        s.attendanceRecords.some(r => r.studentId === studentId && r.status === 'present')
      ).length;
      const lateSessions = batchSessions.filter(s => 
        s.attendanceRecords.some(r => r.studentId === studentId && r.status === 'late')
      ).length;
      const absentSessions = batchSessions.filter(s => 
        s.attendanceRecords.some(r => r.studentId === studentId && r.status === 'absent')
      ).length;
      const attendancePercentage = totalSessions > 0 ? ((attendedSessions + lateSessions) / totalSessions * 100).toFixed(1) : '0';

      reportContent += `
        <div class="course-section">
          <h3>${course?.name || 'Unknown Course'} - ${batch?.batchName || 'Unknown Batch'}</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total Sessions:</span>
              <span class="stat-value">${totalSessions}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Present:</span>
              <span class="stat-value present">${attendedSessions}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Late:</span>
              <span class="stat-value late">${lateSessions}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Absent:</span>
              <span class="stat-value absent">${absentSessions}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Attendance:</span>
              <span class="stat-value ${parseFloat(attendancePercentage) >= 75 ? 'good' : 'poor'}">${attendancePercentage}%</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${batchSessions.map(session => {
                const record = session.attendanceRecords.find(r => r.studentId === studentId);
                const status = record?.status || 'absent';
                return `
                  <tr class="${status}">
                    <td>${new Date(session.date).toLocaleDateString()}</td>
                    <td>${session.topic}</td>
                    <td>${session.duration} min</td>
                    <td style="text-transform: capitalize; font-weight: bold;">${status}</td>
                    <td>${record?.notes || ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Attendance Report - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .student-info { margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
            .course-section { margin-bottom: 40px; }
            .stats { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
            .stat-item { display: flex; flex-direction: column; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; min-width: 100px; }
            .stat-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .stat-value { font-size: 18px; font-weight: bold; }
            .stat-value.present { color: #28a745; }
            .stat-value.late { color: #ffc107; }
            .stat-value.absent { color: #dc3545; }
            .stat-value.good { color: #28a745; }
            .stat-value.poor { color: #dc3545; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .present { background-color: #d4edda; }
            .absent { background-color: #f8d7da; }
            .late { background-color: #fff3cd; }
            .excused { background-color: #d1ecf1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TechFlow IMS - Monthly Attendance Report</h1>
            <h2>${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${reportContent}
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
          <p className="text-gray-600 mt-2">Manage courses, batches, students, and attendance</p>
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
          {activeTab === 'enrollments' && (
            <button
              onClick={() => setShowEnrollmentForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <Users size={20} />
              <span>New Enrollment</span>
            </button>
          )}
          {activeTab === 'payments' && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            >
              <CreditCard size={20} />
              <span>Add Payment</span>
            </button>
          )}
          {activeTab === 'attendance' && (
            <>
              <button
                onClick={() => setShowAttendanceForm(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-teal-700 transition-colors"
              >
                <Calendar size={20} />
                <span>New Session</span>
              </button>
              <button
                onClick={() => setShowAttendanceReport(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
              >
                <FileText size={20} />
                <span>Reports</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Users },
            { id: 'students', label: 'Students', icon: UserPlus },
            { id: 'enrollments', label: 'Enrollments', icon: Users },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: Calendar }
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
                    onClick={() => {
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
                    }}
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
                <p className="text-sm text-gray-600">Duration: {course.duration} hours</p>
                <p className="text-sm text-gray-600">Price: ${course.price}</p>
                <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                <p className="text-sm text-gray-600">Max Students: {course.maxStudents}</p>
              </div>

              <p className="text-sm text-gray-700 mb-4">{course.description}</p>

              {course.materials.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Materials:</p>
                  <div className="flex flex-wrap gap-1">
                    {course.materials.map((material, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                          onClick={() => {
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
                          }}
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
                    onClick={() => {
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
                    }}
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
                    <td className="py-3 px-4">{getStudentName(enrollment.studentId)}</td>
                    <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                    <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                    <td className="py-3 px-4">${enrollment.totalFee.toFixed(2)}</td>
                    <td className="py-3 px-4 text-green-600">${enrollment.paidAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-red-600">${enrollment.remainingAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Received By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coursePayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{payment.voucherNumber}</td>
                    <td className="py-3 px-4">{getStudentName(payment.studentId)}</td>
                    <td className="py-3 px-4 font-medium">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                    <td className="py-3 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{payment.receivedBy}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteCoursePayment(payment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
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
          {/* Attendance Sessions */}
          <div className="bg-white rounded-lg shadow-sm border">
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
                  {attendanceSessions.map((session) => {
                    const batch = courseBatches.find(b => b.id === session.batchId);
                    const batchEnrollments = enrollments.filter(e => e.batchId === session.batchId && e.status === 'active');
                    const presentCount = session.attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                    
                    return (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(session.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{batch?.batchName || 'Unknown'}</td>
                        <td className="py-3 px-4">{session.topic}</td>
                        <td className="py-3 px-4">{session.duration} min</td>
                        <td className="py-3 px-4">{session.instructor}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{presentCount}/{batchEnrollments.length}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBatch(session.batchId);
                                // Show attendance marking interface
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Mark Attendance"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => printDailyAttendance(session.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Print Daily Attendance"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Marking Interface */}
          {selectedBatch && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
                <button
                  onClick={() => setSelectedBatch('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments
                  .filter(e => e.batchId === selectedBatch && e.status === 'active')
                  .map((enrollment) => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const todaySession = attendanceSessions.find(s => 
                      s.batchId === selectedBatch && 
                      new Date(s.date).toDateString() === new Date().toDateString()
                    );
                    const currentStatus = todaySession?.attendanceRecords.find(r => r.studentId === enrollment.studentId)?.status || 'absent';
                    
                    return (
                      <div key={enrollment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{student?.name || 'Unknown'}</h4>
                            <p className="text-sm text-gray-600">{student?.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            currentStatus === 'present' ? 'bg-green-100 text-green-800' :
                            currentStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            currentStatus === 'excused' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {currentStatus}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => todaySession && markAttendance(todaySession.id, enrollment.studentId, 'present')}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                              currentStatus === 'present' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => todaySession && markAttendance(todaySession.id, enrollment.studentId, 'late')}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                              currentStatus === 'late' 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => todaySession && markAttendance(todaySession.id, enrollment.studentId, 'absent')}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                              currentStatus === 'absent' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => todaySession && markAttendance(todaySession.id, enrollment.studentId, 'excused')}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                              currentStatus === 'excused' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={batchForm.status}
                  onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as CourseBatch['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Enrollment</h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={enrollmentForm.studentId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
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
                  value={enrollmentForm.courseId}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setEnrollmentForm({ 
                      ...enrollmentForm, 
                      courseId: e.target.value,
                      totalFee: course?.price || 0
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                >
                  <option value="">Select Batch</option>
                  {courseBatches
                    .filter(b => b.courseId === enrollmentForm.courseId && b.status !== 'completed' && b.status !== 'cancelled')
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
                  readOnly
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
                  max={enrollmentForm.totalFee}
                />
              </div>
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
                  Enroll Student
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment</label>
                <select
                  value={paymentForm.enrollmentId}
                  onChange={(e) => {
                    const enrollment = enrollments.find(en => en.id === e.target.value);
                    setPaymentForm({ 
                      ...paymentForm, 
                      enrollmentId: e.target.value,
                      studentId: enrollment?.studentId || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Enrollment</option>
                  {enrollments
                    .filter(e => e.remainingAmount > 0)
                    .map(enrollment => {
                      const student = students.find(s => s.id === enrollment.studentId);
                      const course = courses.find(c => c.id === enrollment.courseId);
                      return (
                        <option key={enrollment.id} value={enrollment.id}>
                          {student?.name} - {course?.name} (Remaining: ${enrollment.remainingAmount.toFixed(2)})
                        </option>
                      );
                    })}
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Attendance Session Form Modal */}
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
                    .filter(b => b.status === 'ongoing')
                    .map(batch => {
                      const course = courses.find(c => c.id === batch.courseId);
                      return (
                        <option key={batch.id} value={batch.id}>
                          {course?.name} - {batch.batchName}
                        </option>
                      );
                    })}
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

      {/* Attendance Report Modal */}
      {showAttendanceReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendance Reports</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAttendanceReport(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedStudent) {
                      printMonthlyAttendance(selectedStudent, selectedMonth);
                      setShowAttendanceReport(false);
                    }
                  }}
                  disabled={!selectedStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}