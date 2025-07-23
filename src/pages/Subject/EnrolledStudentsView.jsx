import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { ArrowLeft, Users, Search, User, Mail, Trash2, AlertTriangle } from 'lucide-react';

const EnrolledStudentsView = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}`)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Subject</span>
          </button>
          <div className="text-gray-400">|</div>
          <h1 className="text-xl font-semibold">Enrolled Students - {subjectName}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Students ({filteredStudents.length})
            </h2>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student, index) => (
                <div key={student.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{student.name || 'N/A'}</h3>
                        <p className="text-cyan-400 text-sm">ID: {student.student_id || 'N/A'}</p>
                        <p className="text-gray-400 text-sm flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{student.email || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDeleteStudent(student)}
                      disabled={deleteLoading === student.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove student from subject"
                    >
                      {deleteLoading === student.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{searchTerm ? 'No students found matching your search' : 'No students enrolled'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Remove Student</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove <span className="font-semibold text-white">{showDeleteConfirm.name}</span> from this subject? 
              This action cannot be undone and the student will lose access to all subject materials.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm.id, showDeleteConfirm.name)}
                disabled={deleteLoading === showDeleteConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === showDeleteConfirm.id ? 'Removing...' : 'Remove Student'}
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
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