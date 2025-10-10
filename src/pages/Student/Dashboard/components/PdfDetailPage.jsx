import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  if (!pdfData) {
    return <div style={{ padding: '20px' }}>No data found</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <button onClick={() => navigate('/student/dashboard')} style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <h1>PDF Details</h1>

      {/* Basic Info */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>File Information</h2>
        <p><strong>Filename:</strong> {pdfData.original_filename}</p>
        <p><strong>Size:</strong> {pdfData.file_size_kb} KB</p>
        <p><strong>Status:</strong> {pdfData.processing_status}</p>
        <p><strong>Uploaded:</strong> {new Date(pdfData.upload_date || pdfData.created_at).toLocaleString()}</p>
        {pdfData.error_message && (
          <p style={{ color: 'red' }}><strong>Error:</strong> {pdfData.error_message}</p>
        )}
      </div>

      {/* Summary */}
      {pdfData.summary && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>Summary</h2>
          <p>{pdfData.summary.summary_text}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Generated at: {new Date(pdfData.summary.generated_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Flashcards */}
      {pdfData.flashcards && pdfData.flashcards.length > 0 && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>Flashcards ({pdfData.flashcards.length})</h2>
          {pdfData.flashcards.map((card, index) => (
            <div key={card.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <p><strong>Q{index + 1}:</strong> {card.question}</p>
              <p><strong>A:</strong> {card.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Generated Quizzes */}
      {pdfData.generated_quizzes && pdfData.generated_quizzes.length > 0 && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>Generated Quizzes</h2>
          {pdfData.generated_quizzes.map((quiz) => (
            <div key={quiz.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <p><strong>Total Marks:</strong> {quiz.total_marks}</p>
              <p><strong>Questions:</strong> {quiz.questions?.length || 0}</p>
              <button onClick={() => navigate(`/student/pdf-quizzes/${quiz.id}/start`)}>
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', backgroundColor: '#f5f5f5' }}>
        <h2>Debug Info (Raw Data)</h2>
        <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
          {JSON.stringify(pdfData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PdfDetailPage;