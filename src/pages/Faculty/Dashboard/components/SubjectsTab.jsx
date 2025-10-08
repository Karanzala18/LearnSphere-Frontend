import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import SubjectCard from './SubjectCard';

const SubjectsTab = React.memo(({ 
  subjects, 
  onCreateSubject, 
  onDeleteSubject, 
  onViewDetails, 
  onCopyTeamCode 
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">My Subjects</h2>
      <button
        onClick={onCreateSubject}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Add Subject</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">No subjects available</p>
          <p className="text-gray-500 text-sm">Create your first subject to get started</p>
        </div>
      ) : (
        subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onDelete={onDeleteSubject}
            onView={onViewDetails}
            onCopyCode={onCopyTeamCode}
          />
        ))
      )}
    </div>
  </div>
));

SubjectsTab.displayName = 'SubjectsTab';
export default SubjectsTab;
