import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, AlertCircle, BookOpen, Brain } from 'lucide-react';
import pdfService from '../../services/pdfService';

const PdfDetailPage = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPdfDetails();
  }, [pdfId]);

  const fetchPdfDetails = async () => {
    try {
      setLoading(true);
      const response = await pdfService.getPdfById(pdfId);
      console.log('PDF Details Response:', response);
      setPdfData(response.data);
    } catch (error) {
      console.error('Error fetching PDF details:', error);
      setError('Failed to load PDF details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading PDF details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">No data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF Details</h1>

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">File Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Filename</p>
              <p className="text-gray-900 font-medium">{pdfData.original_filename}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Size</p>
              <p className="text-gray-900 font-medium">{pdfData.file_size_kb} KB</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                pdfData.processing_status === 'completed' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : pdfData.processing_status === 'processing'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {pdfData.processing_status}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Uploaded</p>
              <p className="text-gray-900 font-medium">
                {new Date(pdfData.upload_date || pdfData.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          {pdfData.error_message && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium mb-1">Error</p>
                <p className="text-gray-700">{pdfData.error_message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {pdfData.summary && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{pdfData.summary.summary_text}</p>
            <p className="text-gray-500 text-sm">
              Generated at: {new Date(pdfData.summary.generated_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Flashcards */}
        {pdfData.flashcards && pdfData.flashcards.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Flashcards ({pdfData.flashcards.length})
                </h2>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pdfData.flashcards.map((card, index) => (
                <div key={card.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <p className="text-gray-900 mb-2">
                    <span className="text-blue-600 font-semibold">Q{index + 1}:</span> {card.question}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="text-gray-700 font-semibold">A:</span> {card.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Quizzes */}
        {pdfData.generated_quizzes && pdfData.generated_quizzes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Quizzes</h2>
            
            <div className="space-y-4">
              {pdfData.generated_quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-3">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div>
                      <span className="text-gray-600 text-sm">Total Marks: </span>
                      <span className="text-gray-900 font-medium">{quiz.total_marks}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Questions: </span>
                      <span className="text-gray-900 font-medium">{quiz.questions?.length || 0}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/student/pdf-quizzes/${quiz.id}/start`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfDetailPage;