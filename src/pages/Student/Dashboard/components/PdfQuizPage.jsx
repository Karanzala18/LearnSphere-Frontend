import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pdfService from '../../services/pdfService';

const PdfQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await pdfService.startPdfQuiz(quizId);
      console.log('Quiz Start Response:', response);
      setQuizData(response.data);
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question');
      return;
    }

    if (!window.confirm('Are you sure you want to submit?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await pdfService.submitPdfQuiz(quizId, answers);
      console.log('Quiz Submit Response:', response);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz: ' + error.message);
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

  if (submitted && result) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Quiz Results</h1>
        <div style={{ border: '2px solid #4CAF50', padding: '20px', marginBottom: '20px', backgroundColor: '#f0f9ff' }}>
          <h2>Score: {result.score || result.attempt?.total_marks_obtained}/{result.attempt?.total_marks || quizData.quiz.total_marks}</h2>
          <p>Percentage: {result.percentage || pdfService.calculatePercentage(result.score, result.attempt?.total_marks)}%</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Your Answers</h3>
          {quizData.quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const correctAnswer = question.options.find(opt => opt.is_correct);
            const isCorrect = userAnswer === correctAnswer.id;

            return (
              <div key={question.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px',
                backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee'
              }}>
                <p><strong>Q{index + 1}:</strong> {question.question_text}</p>
                <p style={{ color: isCorrect ? 'green' : 'red' }}>
                  {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </p>
                <p><strong>Your answer:</strong> {question.options.find(opt => opt.id === userAnswer)?.option_text || 'No answer'}</p>
                {!isCorrect && (
                  <p><strong>Correct answer:</strong> {correctAnswer.option_text}</p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate('/student/dashboard')} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!quizData || !quizData.quiz) {
    return <div style={{ padding: '20px' }}>No quiz data available</div>;
  }

  const quiz = quizData.quiz;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/student/dashboard')} style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
      <p><strong>Total Marks:</strong> {quiz.total_marks}</p>
      <hr />

      <div style={{ marginTop: '20px' }}>
        {quiz.questions && quiz.questions.map((question, index) => (
          <div key={question.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
            <p><strong>Question {index + 1}:</strong> {question.question_text}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>Marks: {question.marks}</p>

            <div style={{ marginTop: '10px' }}>
              {question.options && question.options.map((option) => (
                <div key={option.id} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleAnswerChange(question.id, option.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <span>{option.option_text}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={handleSubmit}
          style={{ 
            padding: '15px 30px', 
            fontSize: '16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Submit Quiz
        </button>
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '40px', border: '1px solid #ccc', padding: '15px', backgroundColor: '#f5f5f5' }}>
        <h3>Debug Info</h3>
        <p><strong>Answered:</strong> {Object.keys(answers).length}/{quiz.questions?.length || 0}</p>
        <pre style={{ overflow: 'auto', maxHeight: '200px', fontSize: '12px' }}>
          {JSON.stringify(answers, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PdfQuizPage;