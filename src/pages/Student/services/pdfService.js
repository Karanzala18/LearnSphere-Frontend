import api from '../../../services/api';

// PDF and Quiz Service
const pdfService = {
  // Upload a PDF
  uploadPdf(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post('/student/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Fetch all uploaded PDFs with their details
  getPdfs() {
    return api.get('/student/pdfs');
  },

  // Fetch details of a single PDF
  getPdf(id) {
    return api.get(`/student/pdfs/${id}`);
  },

  // Start an AI-generated quiz attempt
  startPdfQuiz(quizId) {
    return api.get(`/student/pdf-quizzes/${quizId}/start`);
  },

  // Submit an AI-generated quiz attempt
  submitPdfQuiz(quizId, answers) {
    return api.post(`/student/pdf-quizzes/${quizId}/submit`, { answers });
  },

  // Start a subject quiz attempt (assuming this endpoint exists)
  startSubjectQuiz(quizId) {
    return api.post(`/student/quizzes/${quizId}/start`, { }); // Adjust endpoint based on your API
  },

  // Submit a subject quiz attempt
  submitSubjectQuiz(attemptId, answers) {
    return api.post(`/student/quiz-attempts/${attemptId}/submit`, { answers }); // Adjust endpoint
  },

  // Utility to calculate remaining time (example implementation)
  getRemainingTime(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return { expired: true, minutes: 0, seconds: 0 };
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { expired: false, minutes, seconds };
  },
};

export default pdfService;