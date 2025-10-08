import React from 'react';
import { BookOpen, Users, Clock, FileText } from 'lucide-react';

const StatsCards = React.memo(({ analytics }) => {
  const stats = [
    { label: 'Total Subjects', value: analytics.totalSubjects, icon: BookOpen },
    { label: 'Total Students', value: analytics.totalStudents, icon: Users },
    { label: 'Total Quizzes', value: analytics.totalQuizzes, icon: Clock },
    { label: 'Total Assignments', value: analytics.totalAssignments, icon: FileText }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{label}</p>
              <p className="text-3xl font-bold text-blue-600">{value}</p>
            </div>
            <Icon className="w-8 h-8 text-blue-600/50" />
          </div>
        </div>
      ))}
    </div>
  );
});

StatsCards.displayName = 'StatsCards';
export default StatsCards;
