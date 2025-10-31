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
      setPdfData(response.data);
    } catch (error) {
      console.error('Error fetching PDF details:', error);
      setError('Failed to load PDF details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard', { state: { activeTab: 'notes' } });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSummaryText = (summaryText) => {
    if (!summaryText) return 'No summary available';
    
    // Remove introductory text about JSON format and code blocks
    let cleanText = summaryText
      .replace(/Here is a comprehensive summary.*?in JSON format:\s*/i, '')
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Try to parse JSON if present
    try {
      // Find JSON object in the text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        
        // Format JSON as readable plain text
        const formatObject = (obj, level = 0) => {
          let result = [];
          
          for (const [key, value] of Object.entries(obj)) {
            // Convert key to readable Title Case
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .split(' ')
              .filter(w => w)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              // Nested object
              result.push(`${label}:`);
              Object.entries(value).forEach(([subKey, subValue]) => {
                const subLabel = subKey
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/_/g, ' ')
                  .split(' ')
                  .filter(w => w)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                
                if (Array.isArray(subValue)) {
                  result.push(`  ${subLabel}:`);
                  subValue.forEach(item => result.push(`    • ${item}`));
                } else {
                  result.push(`  ${subLabel}: ${subValue}`);
                }
              });
            } else if (Array.isArray(value)) {
              // Array
              result.push(`${label}:`);
              value.forEach(item => result.push(`  • ${item}`));
            } else {
              // Simple value
              result.push(`${label}: ${value}`);
            }
            
            result.push(''); // Add spacing between sections
          }
          
          return result.join('\n');
        };
        
        return formatObject(jsonData);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e, cleanText);
    }
    
    // Return original text if no JSON found or parsing failed
    return cleanText;
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
              onClick={handleBackToDashboard}
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* File Information */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Document Details</h1>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <span className="font-semibold text-gray-900">Filename:</span> {pdfData.original_filename}
            </div>
            <div>
              <span className="font-semibold text-gray-900">File Size:</span> {pdfData.file_size_kb} KB
            </div>
            <div>
              <span className="font-semibold text-gray-900">Status:</span> {pdfData.processing_status.charAt(0).toUpperCase() + pdfData.processing_status.slice(1)}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Uploaded:</span> {formatDate(pdfData.upload_date || pdfData.created_at)}
            </div>
          </div>
          
          {pdfData.error_message && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-semibold mb-1">Processing Error</p>
                <p className="text-gray-700">{pdfData.error_message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {pdfData.summary && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Summary</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {formatSummaryText(pdfData.summary.summary_text)}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
              Generated on {formatDate(pdfData.summary.generated_at)}
            </p>
          </div>
        )}

        {/* Flashcards */}
        {pdfData.flashcards && pdfData.flashcards.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Flashcards ({pdfData.flashcards.length})
              </h2>
            </div>
            
            <div className="space-y-6">
              {pdfData.flashcards.map((card, index) => (
                <div key={card.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                      Question {index + 1}
                    </span>
                    <p className="text-gray-900 mt-1 font-medium">
                      {card.question}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Answer
                    </span>
                    <p className="text-gray-700 mt-1">
                      {card.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Quizzes */}
        {pdfData.generated_quizzes && pdfData.generated_quizzes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generated Quizzes</h2>
            
            <div className="space-y-6">
              {pdfData.generated_quizzes.map((quiz) => (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-6 mb-4 text-sm">
                    <div className="text-gray-700">
                      <span className="font-semibold">Total Marks:</span> {quiz.total_marks}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Questions:</span> {quiz.questions?.length || 0}
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