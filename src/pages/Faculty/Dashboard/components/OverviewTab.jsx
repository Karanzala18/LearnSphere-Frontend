import React from 'react';
import { Plus } from 'lucide-react';

const quickActions = [
  {
    type: 'subject',
    title: 'Create Subject',
    description: 'Add a new subject for the semester'
  },
  {
    type: 'quiz',
    title: 'Create Quiz',
    description: 'Design a new quiz for your students'
  },
  {
    type: 'assignment',
    title: 'Create Assignment',
    description: 'Add a new assignment with auto-grading'
  }
];

const OverviewTab = React.memo(({ openCreateModal }) => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h3>
      <div className="space-y-4">
        <p className="text-gray-600">No recent activity available</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quickActions.map(({ type, title, description }) => (
        <button
          key={type}
          onClick={() => openCreateModal(type)}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </button>
      ))}
    </div>
  </div>
));

OverviewTab.displayName = 'OverviewTab';
export default OverviewTab;
