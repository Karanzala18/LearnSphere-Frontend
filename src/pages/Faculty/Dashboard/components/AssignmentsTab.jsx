import React from 'react';
import { Plus, Eye, Download, Trash2 } from 'lucide-react';

const AssignmentsTab = React.memo(({ assignments, onCreateAssignment }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
      <button
        onClick={onCreateAssignment}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Create Assignment</span>
      </button>
    </div>
    
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Assignment Title</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Subject</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Due Date</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Submissions</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Graded</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                  No assignments available
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{assignment.title}</td>
                  <td className="px-6 py-4 text-gray-600">{assignment.subject}</td>
                  <td className="px-6 py-4 text-gray-600">{assignment.dueDate}</td>
                  <td className="px-6 py-4 text-gray-600">{assignment.submissions}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      assignment.graded === assignment.submissions 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {assignment.graded}/{assignment.submissions}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

AssignmentsTab.displayName = 'AssignmentsTab';
export default AssignmentsTab;
