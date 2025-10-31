import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import pdfService from '../../services/pdfService';

const FlashcardsPage = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlashcards();
  }, [pdfId]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const cards = await pdfService.getFlashcards(pdfId);
      console.log('Flashcards:', cards);
      setFlashcards(cards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
            onClick={() => navigate('/student/dashboard', { state: { activeTab: 'notes' } })}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
          </div>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Flashcards Available</h2>
            <p className="text-gray-600 mb-6">No flashcards have been generated for this PDF yet.</p>
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

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Card {currentIndex + 1} of {flashcards.length}</p>
        </div>

        {/* Flashcard */}
        <div 
          onClick={handleFlip}
          className={`${showAnswer ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'} border-2 rounded-2xl p-12 mb-6 min-h-[300px] cursor-pointer transition-all hover:shadow-xl flex flex-col justify-center`}
        >
          {!showAnswer ? (
            <div>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Question:</h2>
              <p className="text-2xl text-gray-900 leading-relaxed">{currentCard.question}</p>
              <p className="mt-8 text-gray-500 text-sm flex items-center space-x-2">
                <RotateCw className="w-4 h-4" />
                <span>Click to see answer</span>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">Answer:</h2>
              <p className="text-2xl text-gray-900 leading-relaxed">{currentCard.answer}</p>
              <p className="mt-8 text-gray-500 text-sm flex items-center space-x-2">
                <RotateCw className="w-4 h-4" />
                <span>Click to see question</span>
              </p>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          <button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentIndex === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <button 
            onClick={handleFlip}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <RotateCw className="w-5 h-5" />
            <span>Flip Card</span>
          </button>
          
          <button 
            onClick={handleNext} 
            disabled={currentIndex === flashcards.length - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentIndex === flashcards.length - 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* All Cards List */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">All Flashcards</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {flashcards.map((card, index) => (
              <div 
                key={card.id} 
                onClick={() => { setCurrentIndex(index); setShowAnswer(false); }}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  index === currentIndex 
                    ? 'bg-blue-50 border-blue-600 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
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
      </div>
    </div>
  );
};

export default FlashcardsPage;