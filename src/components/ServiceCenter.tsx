import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Clock, User, AlertCircle, CheckCircle, Wrench, Eye, Edit2 } from 'lucide-react';
import { ServiceTicket, Technician } from '../types';

export function ServiceCenter() {
  const { 
    serviceTickets, 
    customers, 
    technicians, 
    products,
    addServiceTicket, 
    updateServiceTicket, 
    addTechnician,
    generateServiceInvoice 
  } = useInventory();
  
  const [activeTab, setActiveTab] = useState<'tickets' | 'technicians'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showTechnicianForm, setShowTechnicianForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ServiceTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState<ServiceTicket | null>(null);

  const [ticketForm, setTicketForm] = useState({
    customerId: '',
    deviceType: 'laptop' as ServiceTicket['deviceType'],
    brand: '',
    model: '',
    serialNumber: '',
    issueDescription: '',
    diagnosis: '',
    estimatedCost: 0,
    actualCost: 0,
    laborCost: 0,
    partsCost: 0,
    status: 'received' as ServiceTicket['status'],
    priority: 'medium' as ServiceTicket['priority'],
    assignedTechnician: '',
    partsUsed: [],
    timeSpent: 0,
    warrantyPeriod: 30,
    estimatedCompletionDate: '',
    notes: [] as string[],
    customerApproved: false
  });

  const [technicianForm, setTechnicianForm] = useState({
    name: '',
    email: '',
    phone: '',
    specializations: [] as string[],
    hourlyRate: 0,
    status: 'active' as Technician['status']
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newNote, setNewNote] = useState('');

  const filteredTickets = serviceTickets.filter(ticket => {
    const customer = customers.find(c => c.id === ticket.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.includes(searchTerm.toLowerCase()) ||
                         ticket.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketData = {
      ...ticketForm,
      receivedDate: new Date(),
      estimatedCompletionDate: ticketForm.estimatedCompletionDate ? new Date(ticketForm.estimatedCompletionDate) : undefined
    };

    if (editingTicket) {
      updateServiceTicket(editingTicket.id, ticketData);
      setEditingTicket(null);
    } else {
      addServiceTicket(ticketData);
    }
    
    resetTicketForm();
    setShowTicketForm(false);
  };

  const handleTechnicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnician(technicianForm);
    setTechnicianForm({
      name: '',
      email: '',
      phone: '',
      specializations: [],
      hourlyRate: 0,
      status: 'active'
    });
    setShowTechnicianForm(false);
  };

  const resetTicketForm = () => {
    setTicketForm({
      customerId: '',
      deviceType: 'laptop',
      brand: '',
      model: '',
      serialNumber: '',
      issueDescription: '',
      diagnosis: '',
      estimatedCost: 0,
      actualCost: 0,
      laborCost: 0,
      partsCost: 0,
      status: 'received',
      priority: 'medium',
      assignedTechnician: '',
      partsUsed: [],
      timeSpent: 0,
      warrantyPeriod: 30,
      estimatedCompletionDate: '',
      notes: [],
      customerApproved: false
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setTechnicianForm({
        ...technicianForm,
        specializations: [...technicianForm.specializations, newSpecialization.trim()]
      });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setTechnicianForm({
      ...technicianForm,
      specializations: technicianForm.specializations.filter((_, i) => i !== index)
    });
  };

  const addNote = () => {
    if (newNote.trim()) {
      setTicketForm({
        ...ticketForm,
        notes: [...ticketForm.notes, newNote.trim()]
      });
      setNewNote('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'diagnosed':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_approval':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getTechnicianName = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.name : 'Unassigned';
  };

  const handleEditTicket = (ticket: ServiceTicket) => {
    setEditingTicket(ticket);
    setTicketForm({
      customerId: ticket.customerId,
      deviceType: ticket.deviceType,
      brand: ticket.brand,
      model: ticket.model,
      serialNumber: ticket.serialNumber || '',
      issueDescription: ticket.issueDescription,
      diagnosis: ticket.diagnosis || '',
      estimatedCost: ticket.estimatedCost,
      actualCost: ticket.actualCost,
      laborCost: ticket.laborCost,
      partsCost: ticket.partsCost,
      status: ticket.status,
      priority: ticket.priority,
      assignedTechnician: ticket.assignedTechnician || '',
      partsUsed: ticket.partsUsed,
      timeSpent: ticket.timeSpent,
      warrantyPeriod: ticket.warrantyPeriod,
      estimatedCompletionDate: ticket.estimatedCompletionDate ? 
        new Date(ticket.estimatedCompletionDate).toISOString().split('T')[0] : '',
      notes: ticket.notes,
      customerApproved: ticket.customerApproved
    });
    setShowTicketForm(true);
  };

  const completeTicket = (ticketId: string) => {
    const ticket = serviceTickets.find(t => t.id === ticketId);
    if (ticket) {
      updateServiceTicket(ticketId, { 
        status: 'completed', 
        completedDate: new Date(),
        actualCost: ticket.laborCost + ticket.partsCost
      });
      generateServiceInvoice(ticketId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Center</h1>
          <p className="text-gray-600 mt-2">Manage computer and laptop repair services</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTechnicianForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <User size={20} />
            <span>Add Technician</span>
          </button>
          <button
            onClick={() => setShowTicketForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Service Ticket</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'tickets'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Service Tickets
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'technicians'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Technicians
          </button>
        </div>
      </div>

      {activeTab === 'tickets' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="diagnosed">Diagnosed</option>
                <option value="waiting_approval">Waiting Approval</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Service Tickets Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Device</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Issue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Technician</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4">{getCustomerName(ticket.customerId)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{ticket.brand} {ticket.model}</p>
                          <p className="text-sm text-gray-600 capitalize">{ticket.deviceType}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">
                          {ticket.issueDescription}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getTechnicianName(ticket.assignedTechnician || '')}</td>
                      <td className="py-3 px-4">${ticket.estimatedCost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowTicketDetails(ticket)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit Ticket"
                          >
                            <Edit2 size={16} />
                          </button>
                          {ticket.status === 'in_progress' && (
                            <button
                              onClick={() => completeTicket(ticket.id)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Mark Complete"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((technician) => (
            <div key={technician.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{technician.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    technician.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {technician.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{technician.email}</p>
                <p className="text-sm text-gray-600">{technician.phone}</p>
                <p className="text-sm text-gray-600">Rate: ${technician.hourlyRate}/hour</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {technician.specializations.map((spec, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Tickets</span>
                  <span className="font-medium">{technician.totalTicketsCompleted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTicket ? 'Edit Service Ticket' : 'New Service Ticket'}
            </h2>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={ticketForm.customerId}
                    onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                  <select
                    value={ticketForm.deviceType}
                    onChange={(e) => setTicketForm({ ...ticketForm, deviceType: e.target.value as ServiceTicket['deviceType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="phone">Phone</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={ticketForm.brand}
                    onChange={(e) => setTicketForm({ ...ticketForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={ticketForm.model}
                    onChange={(e) => setTicketForm({ ...ticketForm, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={ticketForm.serialNumber}
                    onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as ServiceTicket['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={ticketForm.status}
                    onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value as ServiceTicket['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="received">Received</option>
                    <option value="diagnosed">Diagnosed</option>
                    <option value="waiting_approval">Waiting Approval</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Technician</label>
                  <select
                    value={ticketForm.assignedTechnician}
                    onChange={(e) => setTicketForm({ ...ticketForm, assignedTechnician: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {technicians.filter(t => t.status === 'active').map(technician => (
                      <option key={technician.id} value={technician.id}>{technician.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ticketForm.estimatedCost}
                    onChange={(e) => setTicketForm({ ...ticketForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labor Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ticketForm.laborCost}
                    onChange={(e) => setTicketForm({ ...ticketForm, laborCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parts Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ticketForm.partsCost}
                    onChange={(e) => setTicketForm({ ...ticketForm, partsCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Period (days)</label>
                  <input
                    type="number"
                    value={ticketForm.warrantyPeriod}
                    onChange={(e) => setTicketForm({ ...ticketForm, warrantyPeriod: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                <textarea
                  value={ticketForm.issueDescription}
                  onChange={(e) => setTicketForm({ ...ticketForm, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={ticketForm.diagnosis}
                  onChange={(e) => setTicketForm({ ...ticketForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNote();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {ticketForm.notes.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {ticketForm.notes.map((note, index) => (
                      <div key={index} className="text-sm text-gray-700 mb-1">
                        • {note}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTicketForm(false);
                    setEditingTicket(null);
                    resetTicketForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technician Form Modal */}
      {showTechnicianForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Technician</h2>
            <form onSubmit={handleTechnicianSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={technicianForm.name}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={technicianForm.email}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={technicianForm.phone}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={technicianForm.hourlyRate}
                  onChange={(e) => setTechnicianForm({ ...technicianForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add specialization..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialization();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSpecialization}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {technicianForm.specializations.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    {technicianForm.specializations.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">• {spec}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialization(index)}
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
                  onClick={() => setShowTechnicianForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Service Ticket Details</h2>
              <button
                onClick={() => setShowTicketDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Ticket Number</p>
                  <p className="text-gray-900">{showTicketDetails.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer</p>
                  <p className="text-gray-900">{getCustomerName(showTicketDetails.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Device</p>
                  <p className="text-gray-900">{showTicketDetails.brand} {showTicketDetails.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(showTicketDetails.status)}`}>
                    {showTicketDetails.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Issue Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{showTicketDetails.issueDescription}</p>
              </div>
              
              {showTicketDetails.diagnosis && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{showTicketDetails.diagnosis}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Labor Cost</p>
                  <p className="text-gray-900">${showTicketDetails.laborCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Parts Cost</p>
                  <p className="text-gray-900">${showTicketDetails.partsCost.toFixed(2)}</p>
                </div>
              </div>
              
              {showTicketDetails.notes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {showTicketDetails.notes.map((note, index) => (
                      <p key={index} className="text-sm text-gray-700 mb-1">• {note}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}