'use client';

import { Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CRMTasks() {
  const [tasks] = useState([
    {
      id: 1,
      title: 'Call John Smith - Initial consultation',
      status: 'pending',
      priority: 'high',
      due_date: '2024-01-20',
      lead_name: 'John Smith',
    },
    {
      id: 2,
      title: 'Schedule showing - 129 Cape Fear Drive',
      status: 'pending',
      priority: 'high',
      due_date: '2024-01-19',
      lead_name: 'Sarah Johnson',
    },
    {
      id: 3,
      title: 'Email offer details to Emily Chen',
      status: 'completed',
      priority: 'medium',
      due_date: '2024-01-18',
      lead_name: 'Emily Chen',
    },
    {
      id: 4,
      title: 'Follow up with Mike Davis',
      status: 'pending',
      priority: 'medium',
      due_date: '2024-01-22',
      lead_name: 'Mike Davis',
    },
  ]);

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={18} />,
    completed: <CheckCircle size={18} />,
    overdue: <AlertCircle size={18} />,
  };

  const statusColors: Record<string, string> = {
    pending: 'text-orange-600',
    completed: 'text-green-600',
    overdue: 'text-red-600',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Stay organized with your follow-up tasks</p>
        </div>
        <Link
          href="/crm/tasks/new"
          className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          <Plus size={20} />
          New Task
        </Link>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className={`${statusColors[task.status]}`}>{statusIcons[task.status]}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">{task.lead_name}</span>
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <button className="text-gray-600 hover:text-red-600 transition-colors p-2" title="Delete task">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
