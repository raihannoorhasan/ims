import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Edit2, Trash2, Users, BookOpen, Calendar, DollarSign, User, Clock, CheckCircle, AlertCircle, Eye, CreditCard } from 'lucide-react';
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
    generatePaymentVoucher
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'courses' | 'batches' | 'students' | 'enrollments' | 'payments' | 'attendance'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<CourseBatch | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedEnrollmentForPayment, setSelectedEnrollmentForPayment] = useState<string>('');
  const [showPaymentHistory, setShowPaymentHistory] = useState<string>('');

  // Form states
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
    receivedBy: '',
    paymentDescription: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    enrollmentId: '',
    amount: 0,
    paymentMethod: 'cash' as CoursePayment['paymentMethod'],
    receivedBy: '',
    description: ''
  });

  const [newMaterial, setNewMaterial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset forms
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

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: '',
      courseId: '',
      batchId: '',
      totalFee: 0,
      initialPayment: 0,
      paymentMethod: 'cash',
      receivedBy: '',
      paymentDescription: ''
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      enrollmentId: '',
      amount: 0,
      paymentMethod: 'cash',
      receivedBy: '',
      description: ''
    });
  };

  // Handle course selection in enrollment form
  useEffect(() => {
    if (enrollmentForm.courseId) {
      const selectedCourse = courses.find(c => c.id === enrollmentForm.courseId);
      if (selectedCourse) {
        setEnrollmentForm(prev => ({
          ...prev,
          totalFee: selectedCourse.price,
          batchId: '' // Reset batch selection when course changes
        }));
      }
    }
  }, [enrollmentForm.courseId, courses]);

  // Get available batches for selected course
  const getAvailableBatches = () => {
    if (!enrollmentForm.courseId) return [];
    return courseBatches.filter(batch => 
      batch.courseId === enrollmentForm.courseId && 
      batch.currentStudents < batch.maxStudents &&
      batch.status !== 'completed' && 
      batch.status !== 'cancelled'
    );
  };

  // Form handlers
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingCourse) {
        updateCourse(editingCourse.id, courseForm);
        setEditingCourse(null);
      } else {
        addCourse(courseForm);
      }
      resetCourseForm();
      setShowCourseForm(false);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
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
      setBatchForm({
        courseId: '',
        batchName: '',
        startDate: '',
        endDate: '',
        schedule: '',
        maxStudents: 0,
        status: 'upcoming'
      });
      setShowBatchForm(false);
    } catch (error) {
      console.error('Error saving batch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
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
      setStudentForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        emergencyContact: ''
      });
      setShowStudentForm(false);
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentForm.studentId || !enrollmentForm.courseId || !enrollmentForm.batchId) {
      alert('Please fill in all required fields');
      return;
    }

    if (enrollmentForm.initialPayment > enrollmentForm.totalFee) {
      alert('Initial payment cannot be greater than total fee');
      return;
    }

    setIsSubmitting(true);
    
    try {
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

      console.log('Creating enrollment with data:', enrollmentData);
      addEnrollment(enrollmentData);

      // If there's an initial payment, record it
      if (enrollmentForm.initialPayment > 0) {
        // Wait a bit for enrollment to be created
        setTimeout(() => {
          const latestEnrollment = enrollments[enrollments.length - 1];
          if (latestEnrollment) {
            const paymentData = {
              enrollmentId: latestEnrollment.id,
              studentId: enrollmentForm.studentId,
              amount: enrollmentForm.initialPayment,
              paymentMethod: enrollmentForm.paymentMethod,
              paymentDate: new Date(),
              voucherNumber: `PAY-${Date.now()}`,
              description: enrollmentForm.paymentDescription || 'Initial enrollment payment',
              receivedBy: enrollmentForm.receivedBy || 'Admin'
            };
            
            console.log('Creating initial payment with data:', paymentData);
            addCoursePayment(paymentData);
          }
        }, 100);
      }

      resetEnrollmentForm();
      setShowEnrollmentForm(false);
      
      // Switch to enrollments tab to show the new enrollment
      setActiveTab('enrollments');
      
    } catch (error) {
      console.error('Error creating enrollment:', error);
      alert('Error creating enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const enrollment = enrollments.find(e => e.id === paymentForm.enrollmentId);
      if (!enrollment) {
        alert('Enrollment not found');
        return;
      }

      if (paymentForm.amount > enrollment.remainingAmount) {
        alert('Payment amount cannot exceed remaining amount');
        return;
      }

      const paymentData = {
        enrollmentId: paymentForm.enrollmentId,
        studentId: enrollment.studentId,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: new Date(),
        voucherNumber: `PAY-${Date.now()}`,
        description: paymentForm.description || 'Course payment',
        receivedBy: paymentForm.receivedBy || 'Admin'
      };

      addCoursePayment(paymentData);
      resetPaymentForm();
      setShowPaymentForm(false);
      setSelectedEnrollmentForPayment('');
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getEnrollmentPayments = (enrollmentId: string) => {
    return coursePayments.filter(p => p.enrollmentId === enrollmentId);
  };

  const getLastPaymentInfo = (enrollmentId: string) => {
    const payments = getEnrollmentPayments(enrollmentId);
    if (payments.length === 0) return null;
    
    const lastPayment = payments.sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )[0];
    
    return lastPayment;
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

  const openPaymentForm = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      setPaymentForm({
        ...paymentForm,
        enrollmentId: enrollmentId,
        amount: enrollment.remainingAmount
      });
      setSelectedEnrollmentForPayment(enrollmentId);
      setShowPaymentForm(true);
    }
  };

  // Filter functions
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = courseBatches.filter(batch => {
    const course = courses.find(c => c.id === batch.courseId);
    return batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (course && course.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
    
    return (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (course && course.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (batch && batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const filteredPayments = coursePayments.filter(payment => {
    const enrollment = enrollments.find(e => e.id === payment.enrollmentId);
    const student = students.find(s => s.id === payment.studentId);
    
    return payment.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           payment.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Manage courses, batches, students, and enrollments</p>
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
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {course.duration} hours
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Price:</span> ${course.price}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Instructor:</span> {course.instructor}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Max Students:</span> {course.maxStudents}
                </p>
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {student.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {student.phone}
                </p>
                {student.address && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span> {student.address}
                  </p>
                )}
                {student.dateOfBirth && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">DOB:</span> {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                {student.emergencyContact && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Emergency:</span> {student.emergencyContact}
                  </p>
                )}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Info</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => {
                  const lastPayment = getLastPaymentInfo(enrollment.id);
                  const isFullyPaid = enrollment.remainingAmount <= 0;
                  
                  return (
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
                        {lastPayment ? (
                          <div className="text-xs">
                            <p className="font-medium">{lastPayment.paymentMethod}</p>
                            <p className="text-gray-500">By: {lastPayment.receivedBy}</p>
                            <p className="text-gray-500">{new Date(lastPayment.paymentDate).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No payments</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isFullyPaid ? 'bg-green-100 text-green-800' :
                          enrollment.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {isFullyPaid ? 'Fully Paid' : enrollment.paidAmount > 0 ? 'Partially Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowPaymentHistory(enrollment.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Payment History"
                          >
                            <Eye size={16} />
                          </button>
                          {!isFullyPaid && (
                            <button
                              onClick={() => openPaymentForm(enrollment.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Add Payment"
                            >
                              <CreditCard size={16} />
                            </button>
                          )}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Received By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
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
                        {enrollment ? getCourseName(enrollment.courseId) : 'Unknown Course'}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{payment.receivedBy}</td>
                      <td className="py-3 px-4 text-sm">{payment.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Attendance Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Attendance tracking functionality will be implemented here.
            </p>
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
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course')}
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
                    setBatchForm({
                      courseId: '',
                      batchName: '',
                      startDate: '',
                      endDate: '',
                      schedule: '',
                      maxStudents: 0,
                      status: 'upcoming'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingBatch ? 'Update Batch' : 'Add Batch')}
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
                    setStudentForm({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      dateOfBirth: '',
                      emergencyContact: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingStudent ? 'Update Student' : 'Add Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Student Enrollment</h2>
            <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
              {/* Student and Course Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={enrollmentForm.studentId}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={enrollmentForm.courseId}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.filter(c => c.status === 'active').map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} - ${course.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  value={enrollmentForm.batchId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!enrollmentForm.courseId}
                >
                  <option value="">Select Batch</option>
                  {getAvailableBatches().map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchName} - {batch.schedule} ({batch.currentStudents}/{batch.maxStudents} students)
                    </option>
                  ))}
                </select>
                {enrollmentForm.courseId && getAvailableBatches().length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No available batches for this course</p>
                )}
              </div>

              {/* Fee Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Fee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Course Fee</label>
                    <input
                      type="number"
                      step="0.01"
                      value={enrollmentForm.totalFee}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, totalFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Payment</label>
                    <input
                      type="number"
                      step="0.01"
                      value={enrollmentForm.initialPayment}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, initialPayment: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={enrollmentForm.totalFee}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={enrollmentForm.totalFee - enrollmentForm.initialPayment}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details (only if initial payment > 0) */}
              {enrollmentForm.initialPayment > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Initial Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <select
                        value={enrollmentForm.paymentMethod}
                        onChange={(e) => setEnrollmentForm({ ...enrollmentForm, paymentMethod: e.target.value as CoursePayment['paymentMethod'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={enrollmentForm.receivedBy}
                        onChange={(e) => setEnrollmentForm({ ...enrollmentForm, receivedBy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Staff member name"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Description</label>
                    <input
                      type="text"
                      value={enrollmentForm.paymentDescription}
                      onChange={(e) => setEnrollmentForm({ ...enrollmentForm, paymentDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Initial enrollment payment"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    resetEnrollmentForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center space-x-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Create Enrollment</span>
                    </>
                  )}
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
            {selectedEnrollmentForPayment && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Student:</span> {getStudentName(enrollments.find(e => e.id === selectedEnrollmentForPayment)?.studentId || '')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Course:</span> {getCourseName(enrollments.find(e => e.id === selectedEnrollmentForPayment)?.courseId || '')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Remaining:</span> ${enrollments.find(e => e.id === selectedEnrollmentForPayment)?.remainingAmount.toFixed(2)}
                </p>
              </div>
            )}
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
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
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment description"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedEnrollmentForPayment('');
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <button
                onClick={() => setShowPaymentHistory('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {(() => {
              const enrollment = enrollments.find(e => e.id === showPaymentHistory);
              const payments = getEnrollmentPayments(showPaymentHistory);
              
              return (
                <div>
                  {enrollment && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Student:</span> {getStudentName(enrollment.studentId)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Course:</span> {getCourseName(enrollment.courseId)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Batch:</span> {getBatchName(enrollment.batchId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Total Fee:</span> ${enrollment.totalFee.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Paid Amount:</span> ${enrollment.paidAmount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Remaining:</span> ${enrollment.remainingAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Date</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Amount</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Method</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Received By</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Description</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-900">Voucher</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((payment) => (
                            <tr key={payment.id}>
                              <td className="py-2 px-3 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                              <td className="py-2 px-3 text-sm font-medium text-green-600">${payment.amount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-sm capitalize">{payment.paymentMethod}</td>
                              <td className="py-2 px-3 text-sm">{payment.receivedBy}</td>
                              <td className="py-2 px-3 text-sm">{payment.description}</td>
                              <td className="py-2 px-3 text-sm font-mono">{payment.voucherNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No payments recorded</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'courses' && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
          </p>
        </div>
      )}

      {activeTab === 'enrollments' && filteredEnrollments.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start by enrolling students in courses.'}
          </p>
        </div>
      )}
    </div>
  );
}