import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Support API (extend existing purchase API)
const supportAPI = {
  getTickets: async (page = 1, limit = 10, filters = {}) => {
    const response = await fetch(`/api/support/tickets?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getTicketDetail: async (ticketId) => {
    const response = await fetch(`/api/support/tickets/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  createTicket: async (data) => {
    const response = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  replyTicket: async (ticketId, message) => {
    const response = await fetch(`/api/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  closeTicket: async (ticketId) => {
    const response = await fetch(`/api/support/tickets/${ticketId}/close`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  reopenTicket: async (ticketId) => {
    const response = await fetch(`/api/support/tickets/${ticketId}/reopen`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },
};

function TicketCard({ ticket, onSelect }) {
  const priorityColors = {
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  };

  const statusIcons = {
    open: <AlertCircle className="h-4 w-4" />,
    in_progress: <Clock className="h-4 w-4" />,
    resolved: <CheckCircle className="h-4 w-4" />,
    closed: <CheckCircle className="h-4 w-4" />,
  };

  const statusColors = {
    open: 'text-red-600 dark:text-red-400',
    in_progress: 'text-yellow-600 dark:text-yellow-400',
    resolved: 'text-green-600 dark:text-green-400',
    closed: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <button
      onClick={() => onSelect(ticket)}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-primary dark:border-gray-700 dark:bg-gray-900 dark:hover:border-accent"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            #{ticket.id} - {ticket.subject}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {ticket.listing?.title || 'N/A'}
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <div className={`${statusColors[ticket.status]}`}>
            {statusIcons[ticket.status]}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
        </p>
      </div>
    </button>
  );
}

function TicketDetail({ ticket, onClose, onReply }) {
  const [message, setMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const replyMutation = useMutation({
    mutationFn: (msg) => supportAPI.replyTicket(ticket.id, msg),
    onSuccess: () => {
      toast.success('Reply sent');
      setMessage('');
      setIsReplying(false);
      onReply?.();
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const closeMutation = useMutation({
    mutationFn: () => supportAPI.closeTicket(ticket.id),
    onSuccess: () => {
      toast.success('Ticket closed');
      onClose?.();
    },
    onError: () => toast.error('Failed to close ticket'),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              #{ticket.id} - {ticket.subject}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Created {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
            ${ticket.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
            ${ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
            ${ticket.priority === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
          `}>
            {ticket.priority} priority
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
            ${ticket.status === 'open' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
            ${ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
            ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
            ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' : ''}
          `}>
            {ticket.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Listing Info */}
      {ticket.listing && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Related Listing:</p>
          <p className="font-semibold text-gray-900 dark:text-white">{ticket.listing.title}</p>
          <p className="text-sm text-gray-500">₹{ticket.listing.price?.toLocaleString('en-IN')}</p>
        </div>
      )}

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description:</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Messages */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conversation:</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {ticket.messages && ticket.messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs rounded-lg p-3 ${
                msg.isSupport
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'bg-primary text-white dark:bg-accent'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="mt-1 text-xs opacity-75">
                  {new Date(msg.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Reply:</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => replyMutation.mutate(message)}
              disabled={!message.trim() || replyMutation.isPending}
              className="flex-1 rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90 disabled:opacity-50 dark:bg-accent dark:hover:bg-accent/90"
            >
              {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {ticket.status !== 'closed' && (
        <button
          onClick={() => closeMutation.mutate()}
          disabled={closeMutation.isPending}
          className="w-full rounded-lg border border-red-600 px-4 py-2 font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          {closeMutation.isPending ? 'Closing...' : 'Close Ticket'}
        </button>
      )}
    </div>
  );
}

export function SupportTickets() {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    listingId: '',
  });

  const ticketsQuery = useQuery({
    queryKey: ['support-tickets', statusFilter],
    queryFn: () => supportAPI.getTickets(1, 20, { status: statusFilter !== 'all' ? statusFilter : undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => supportAPI.createTicket(data),
    onSuccess: () => {
      toast.success('Support ticket created');
      setShowCreateForm(false);
      setFormData({ subject: '', description: '', priority: 'medium', listingId: '' });
      ticketsQuery.refetch();
    },
    onError: () => toast.error('Failed to create ticket'),
  });

  const tickets = ticketsQuery.data?.tickets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your support requests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
        >
          <Plus className="h-5 w-5" />
          New Ticket
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Support Ticket</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <textarea
              placeholder="Describe your issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.subject || !formData.description || createMutation.isPending}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90 disabled:opacity-50 dark:bg-accent dark:hover:bg-accent/90"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium capitalize transition ${
              statusFilter === status
                ? 'bg-primary text-white dark:bg-accent'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onReply={() => ticketsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Tickets List */}
          <div className="space-y-3">
            {ticketsQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No tickets found</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                />
              ))
            )}
          </div>

          {/* Empty State */}
          <div className="hidden lg:block rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-900">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Select a ticket to view details
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
