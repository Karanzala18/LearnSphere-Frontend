import React from 'react';
import { Calendar, Users, FileText, Edit, Trash2, Copy } from 'lucide-react';

const getSemesterText = (semester) => {
  const semesterMap = {
    1: '1st Semester', 2: '2nd Semester', 3: '3rd Semester', 4: '4th Semester',
    5: '5th Semester', 6: '6th Semester', 7: '7th Semester', 8: '8th Semester'
  };
  return semesterMap[semester] || `Semester ${semester}`;
};

const SubjectCard = React.memo(({ subject, onDelete, onView}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
       
      </div>
      <div className="flex space-x-2">
        <button onClick={() => onDelete(subject.id)} className="text-gray-600 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div className="space-y-2 mb-4">
      <p className="text-gray-600 text-sm">
        <Calendar className="w-4 h-4 inline mr-1" />
        {getSemesterText(subject.semester)}
      </p>
      <p className="text-gray-600 text-sm">
        <Users className="w-4 h-4 inline mr-1" />
        {subject.student_count || 0} Students
      </p>
      <p className="text-gray-600 text-sm">
        <FileText className="w-4 h-4 inline mr-1" />
        {subject.quiz_count || 0} Quizzes • {subject.assignment_count || 0} Assignments
      </p>
      {subject.department && (
        <p className="text-gray-600 text-sm">Department: {subject.department}</p>
      )}
      {subject.credits && (
        <p className="text-gray-600 text-sm">Credits: {subject.credits}</p>
      )}
    </div>
    
    <div className="flex space-x-2">
      <button 
        onClick={() => onView(subject.id)}
        className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-all"
      >
        View Details
      </button>

    </div>
  </div>
));

SubjectCard.displayName = 'SubjectCard';
export default SubjectCard;
