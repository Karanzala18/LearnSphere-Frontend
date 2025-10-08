import React from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const QuizzesTab = React.memo(({ quizzes, onCreateQuiz }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
      <button
        onClick={onCreateQuiz}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Create Quiz</span>
      </button>
    </div>
    
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Quiz Title</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Subject</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Due Date</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Submissions</th>
              <th className="px-6 py-4 text-left text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                  No quizzes available
                </td>
              </tr>
            ) : (
              quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{quiz.title}</td>
                  <td className="px-6 py-4 text-gray-600">{quiz.subject}</td>
                  <td className="px-6 py-4 text-gray-600">{quiz.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      quiz.status === 'active' ? 'bg-blue-100 text-blue-600' :
                      quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{quiz.submissions}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
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

QuizzesTab.displayName = 'QuizzesTab';
export default QuizzesTab;
