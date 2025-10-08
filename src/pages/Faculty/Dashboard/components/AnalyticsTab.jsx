import React, { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const getSemesterText = (semester) => {
  const semesterMap = {
    1: '1st Semester', 2: '2nd Semester', 3: '3rd Semester', 4: '4th Semester',
    5: '5th Semester', 6: '6th Semester', 7: '7th Semester', 8: '8th Semester'
  };
  return semesterMap[semester] || `Semester ${semester}`;
};

const AnalyticsTab = React.memo(({ subjects, analytics }) => {
  // Memoized semester distribution calculation
  const semesterDistribution = useMemo(() => {
    return Object.entries(
      subjects.reduce((semesters, subject) => {
        const sem = subject.semester;
        semesters[sem] = (semesters[sem] || 0) + 1;
        return semesters;
      }, {})
    );
  }, [subjects]);

  // Memoized average students calculation
  const avgStudents = useMemo(() => {
    return subjects.length > 0 ? Math.round(analytics.totalStudents / subjects.length) : 0;
  }, [subjects.length, analytics.totalStudents]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
          <div className="text-center text-gray-600">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
            <p>Performance charts will be implemented here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Analytics</h3>
          <div className="text-center text-gray-600">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
            <p>Subject analytics will be implemented here</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Subjects by Semester</h4>
          <div className="space-y-2">
            {semesterDistribution.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              semesterDistribution.map(([semester, count]) => (
                <div key={semester} className="flex justify-between items-center">
                  <span className="text-gray-600">{getSemesterText(parseInt(semester))}</span>
                  <span className="text-blue-600 font-semibold">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Students per Subject</h4>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{avgStudents}</p>
            <p className="text-gray-500 text-sm">students per subject</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Content Distribution</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quizzes</span>
              <span className="text-blue-600 font-semibold">{analytics.totalQuizzes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Assignments</span>
              <span className="text-blue-600 font-semibold">{analytics.totalAssignments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsTab.displayName = 'AnalyticsTab';
export default AnalyticsTab;
