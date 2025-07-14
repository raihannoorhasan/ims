import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Edit2, Trash2, Users, Calendar, DollarSign, BookOpen, Clock, User, CreditCard, Receipt, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { Course, CourseBatch, Student, Enrollment, CoursePayment } from '../types';

export function Courses() {
  const { 
    courses, 
    courseBatches, 
    students, 
    enrollments, 
    coursePayments,
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
    generatePaymentVoucher
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [selectedEnrollmentForPayment, setSelectedEnrollmentForPayment] = useState<string>('');

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
    initialPayment: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    status: 'active' as Enrollment['status']
  });

  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    description: '',
    receivedBy: 'Admin'
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

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    const batch = courseBatches.find(b => b.id === enrollment.batchId);
    
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           batch?.batchName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredPayments = coursePayments.filter(payment => {
    const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
    const student = students.find(s => s.id === payment.studentId);
    const course = courses.find(c => c.id === enrollment?.courseId);
    
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Helper functions
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

  const getEnrollmentPayments = (enrollmentId: string) => {
    return coursePayments.filter(p => p.enrollmentId === enrollmentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'dropped':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
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

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const enrollmentData = {
      studentId: enrollmentForm.studentId,
      courseId: enrollmentForm.courseId,
      batchId: enrollmentForm.batchId,
      totalFee: enrollmentForm.totalFee,
      paidAmount: enrollmentForm.initialPayment,
      remainingAmount: enrollmentForm.totalFee - enrollmentForm.initialPayment,
      status: enrollmentForm.status
    };

    if (editingEnrollment) {
      updateEnrollment(editingEnrollment.id, enrollmentData);
      setEditingEnrollment(null);
    } else {
      // Add enrollment
      addEnrollment(enrollmentData);
      
      // Add initial payment if amount > 0
      if (enrollmentForm.initialPayment > 0) {
        setTimeout(() => {
          const latestEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
          const newEnrollment = latestEnrollments[latestEnrollments.length - 1];
          
          if (newEnrollment) {
            const voucherNumber = `PAY-${Date.now()}`;
            const paymentData = {
              enrollmentId: newEnrollment.id,
              studentId: enrollmentForm.studentId,
              amount: enrollmentForm.initialPayment,
              paymentMethod: enrollmentForm.paymentMethod,
              paymentDate: new Date(),
              voucherNumber,
              description: 'Initial enrollment payment',
              receivedBy: 'Admin'
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
    const voucherNumber = `PAY-${Date.now()}`;
    const enrollment = enrollments.find(e => e.id === paymentForm.enrollmentId);
    
    if (enrollment) {
      const paymentData = {
        enrollmentId: paymentForm.enrollmentId,
        studentId: enrollment.studentId,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: new Date(),
        voucherNumber,
        description: paymentForm.description || 'Course fee payment',
        receivedBy: paymentForm.receivedBy
      };
      
      addCoursePayment(paymentData);
      generatePaymentVoucher(voucherNumber);
    }
    
    resetPaymentForm();
    setShowPaymentForm(false);
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
      initialPayment: 0,
      paymentMethod: 'cash',
      status: 'active'
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      amount: 0,
      paymentMethod: 'cash',
      description: '',
      receivedBy: 'Admin'
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

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setEnrollmentForm({
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      totalFee: enrollment.totalFee,
      initialPayment: enrollment.paidAmount,
      paymentMethod: 'cash',
      status: enrollment.status
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

  // Auto-populate batch max students when course is selected
  const handleCourseSelection = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setBatchForm({
        ...batchForm,
        courseId,
        maxStudents: course.maxStudents
      });
    }
  };

  // Auto-populate enrollment fee when course is selected
  const handleEnrollmentCourseSelection = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEnrollmentForm({
        ...enrollmentForm,
        courseId,
        totalFee: course.price
      });
    }
  };

  // Filter batches by selected course for enrollment
  const getAvailableBatches = (courseId: string) => {
    return courseBatches.filter(batch => 
      batch.courseId === courseId && 
      batch.status !== 'cancelled' &&
      batch.currentStudents < batch.maxStudents
    );
  };

  // Get enrollment details for payment
  const getEnrollmentDetails = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return null;
    
    const student = students.find(s => s.id === enrollment.studentId);
    const course = courses.find(c => c.id === enrollment.courseId);
    const batch = courseBatches.find(b => b.id === enrollment.batchId);
    
    return {
      enrollment,
      student,
      course,
      batch
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage courses, batches, students, enrollments, and payments</p>
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Payment</span>
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
            { id: 'enrollments', label: 'Enrollments', icon: User },
            { id: 'payments', label: 'Payments', icon: DollarSign }
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
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
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

              {course.materials.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Materials</p>
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
                    Student since {new Date(student.createdAt).toLocaleDateString()}
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Enrollments</span>
                  <span className="font-medium text-blue-600">
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
                {filteredEnrollments.map((enrollment) => {
                  const payments = getEnrollmentPayments(enrollment.id);
                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{getStudentName(enrollment.studentId)}</td>
                      <td className="py-3 px-4">{getCourseName(enrollment.courseId)}</td>
                      <td className="py-3 px-4">{getBatchName(enrollment.batchId)}</td>
                      <td className="py-3 px-4 font-medium">${enrollment.totalFee.toFixed(2)}</td>
                      <td className="py-3 px-4 text-green-600 font-medium">${enrollment.paidAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${enrollment.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${enrollment.remainingAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                          {enrollment.remainingAmount === 0 && (
                            <CheckCircle size={16} className="text-green-500" title="Fully Paid" />
                          )}
                          {enrollment.remainingAmount > 0 && (
                            <AlertCircle size={16} className="text-orange-500" title="Payment Pending" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEnrollmentForPayment(enrollment.id);
                              setPaymentForm({
                                ...paymentForm,
                                enrollmentId: enrollment.id,
                                amount: enrollment.remainingAmount
                              });
                              setShowPaymentForm(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Add Payment"
                            disabled={enrollment.remainingAmount <= 0}
                          >
                            <CreditCard size={16} />
                          </button>
                          <button
                            onClick={() => setShowPaymentDetails(enrollment.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Payments"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditEnrollment(enrollment)}
                            className="text-orange-600 hover:text-orange-800"
                            title="Edit Enrollment"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteEnrollment(enrollment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Enrollment"
                          >
                            <Trash2 size={16} />
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
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
                      <td className="py-3 px-4">{enrollment ? getCourseName(enrollment.courseId) : 'Unknown'}</td>
                      <td className="py-3 px-4 font-medium text-green-600">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{payment.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Print receipt functionality can be added here
                              console.log('Print receipt for payment:', payment.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Print Receipt"
                          >
                            <Receipt size={16} />
                          </button>
                          <button
                            onClick={() => deleteCoursePayment(payment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Payment"
                          >
                            <Trash2 size={16} />
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={batchForm.courseId}
                    onChange={(e) => handleCourseSelection(e.target.value)}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEnrollment ? 'Edit Enrollment' : 'New Enrollment'}
            </h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => handleEnrollmentCourseSelection(e.target.value)}
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
                    disabled={!enrollmentForm.courseId}
                  >
                    <option value="">Select Batch</option>
                    {getAvailableBatches(enrollmentForm.courseId).map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchName} ({batch.currentStudents}/{batch.maxStudents})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={enrollmentForm.status}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, status: e.target.value as Enrollment['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={enrollmentForm.totalFee}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, totalFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    readOnly={!!enrollmentForm.courseId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Payment ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={enrollmentForm.initialPayment}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, initialPayment: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max={enrollmentForm.totalFee}
                  />
                </div>
              </div>

              {enrollmentForm.initialPayment > 0 && (
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
              )}

              {enrollmentForm.totalFee > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Fee:</span>
                      <p className="font-medium">${enrollmentForm.totalFee.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Initial Payment:</span>
                      <p className="font-medium text-green-600">${enrollmentForm.initialPayment.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining:</span>
                      <p className="font-medium text-orange-600">
                        ${(enrollmentForm.totalFee - enrollmentForm.initialPayment).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment</label>
                <select
                  value={paymentForm.enrollmentId}
                  onChange={(e) => {
                    const enrollmentId = e.target.value;
                    const enrollment = enrollments.find(en => en.id === enrollmentId);
                    setPaymentForm({ 
                      ...paymentForm, 
                      enrollmentId,
                      amount: enrollment ? enrollment.remainingAmount : 0
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Enrollment</option>
                  {enrollments.filter(e => e.remainingAmount > 0).map(enrollment => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const course = courses.find(c => c.id === enrollment.courseId);
                    return (
                      <option key={enrollment.id} value={enrollment.id}>
                        {student?.name} - {course?.name} (${enrollment.remainingAmount.toFixed(2)} due)
                      </option>
                    );
                  })}
                </select>
              </div>

              {paymentForm.enrollmentId && (
                <>
                  {(() => {
                    const details = getEnrollmentDetails(paymentForm.enrollmentId);
                    return details ? (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Student:</span> {details.student?.name}</p>
                          <p><span className="font-medium">Course:</span> {details.course?.name}</p>
                          <p><span className="font-medium">Batch:</span> {details.batch?.batchName}</p>
                          <p><span className="font-medium">Total Fee:</span> ${details.enrollment.totalFee.toFixed(2)}</p>
                          <p><span className="font-medium">Paid:</span> ${details.enrollment.paidAmount.toFixed(2)}</p>
                          <p><span className="font-medium">Remaining:</span> ${details.enrollment.remainingAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                      placeholder="Payment description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </>
              )}

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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  disabled={!paymentForm.enrollmentId || paymentForm.amount <= 0}
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <button
                onClick={() => setShowPaymentDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {(() => {
              const enrollment = enrollments.find(e => e.id === showPaymentDetails);
              const payments = getEnrollmentPayments(showPaymentDetails);
              const student = students.find(s => s.id === enrollment?.studentId);
              const course = courses.find(c => c.id === enrollment?.courseId);
              const batch = courseBatches.find(b => b.id === enrollment?.batchId);

              return enrollment ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Student:</span> {student?.name}</p>
                        <p><span className="font-medium">Course:</span> {course?.name}</p>
                        <p><span className="font-medium">Batch:</span> {batch?.batchName}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Total Fee:</span> ${enrollment.totalFee.toFixed(2)}</p>
                        <p><span className="font-medium">Paid Amount:</span> <span className="text-green-600">${enrollment.paidAmount.toFixed(2)}</span></p>
                        <p><span className="font-medium">Remaining:</span> <span className="text-red-600">${enrollment.remainingAmount.toFixed(2)}</span></p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Records</h3>
                    {payments.length > 0 ? (
                      <div className="space-y-2">
                        {payments.map((payment) => (
                          <div key={payment.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">${payment.amount.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">{payment.description}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod} • {payment.receivedBy}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-mono text-gray-600">{payment.voucherNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No payments recorded yet.</p>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}