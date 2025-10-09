import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  User, 
  Mail, 
  Trash2, 
  AlertTriangle,
  BookOpen,
  RefreshCw,
  UserMinus
} from 'lucide-react';

const EnrolledStudentsView = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [subjectId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const details = await subjectService.getFacultySubjectDetails(subjectId);
      console.log('Fetched subject details:', details);
      setStudents(details.students || []);
      setSubjectName(details.name || 'Subject');
      setSubjectCode(details.code || '');
    } catch (error) {
      console.error('Error fetching students:', error);
      alert(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    try {
      setDeleteLoading(studentId);
      console.log('Attempting to remove student:', { studentId, subjectId, studentName });
      
      const response = await subjectService.removeStudentFromSubject(subjectId, studentId);
      console.log('API response:', response);
      
      setStudents(prev => {
        console.log('Current students before filter:', prev);
        const updatedStudents = prev.filter(student => student.id !== studentId);
        console.log('Updated students after filter:', updatedStudents);
        return updatedStudents;
      });
      
      console.log(`Successfully removed ${studentName} from the subject`);
      alert(`Successfully removed ${studentName} from the subject`);
    } catch (error) {
      console.error('Error removing student:', error.response || error.message);
      alert(error.response?.data?.message || error.message || 'Failed to remove student');
    } finally {
      setDeleteLoading(null);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDeleteStudent = (student) => {
    setShowDeleteConfirm(student);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <button
          onClick={() => navigate(`/faculty/subjects/${subjectId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Subject</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subjectName}</h1>
              {subjectCode && <p className="text-gray-600">{subjectCode}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 mt-4">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Enrolled Students : {filteredStudents.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <div 
                key={student.id || index} 
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {student.name || 'N/A'}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">
                        ID: {student.student_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDeleteStudent(student)}
                    disabled={deleteLoading === student.id}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Remove student from subject"
                  >
                    {deleteLoading === student.id ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{student.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No students found' : 'No students enrolled'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Students will appear here once they enroll in this subject'}
            </p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserMinus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Remove Student</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-gray-900">{showDeleteConfirm.name}</span>{' '}
              from this subject? This action cannot be undone and the student will lose access to all subject materials.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm.id, showDeleteConfirm.name)}
                disabled={deleteLoading === showDeleteConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleteLoading === showDeleteConfirm.id ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </span>
                ) : (
                  'Remove Student'
                )}
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudentsView;