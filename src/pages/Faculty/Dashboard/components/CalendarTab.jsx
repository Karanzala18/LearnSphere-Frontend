import React from 'react';
import { Calendar } from 'lucide-react';

const CalendarTab = React.memo(() => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Calendar</h2>
    <div className="text-center text-gray-600">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
      <p>Calendar component will be implemented here</p>
      <p className="text-sm mt-2 text-gray-500">
        Show upcoming quizzes, assignment deadlines, and other important dates
      </p>
    </div>
  </div>
));

CalendarTab.displayName = 'CalendarTab';
export default CalendarTab;