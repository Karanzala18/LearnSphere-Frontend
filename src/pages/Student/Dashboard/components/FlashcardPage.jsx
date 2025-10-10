import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    return <div style={{ padding: '20px' }}>Loading flashcards...</div>;
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

  if (flashcards.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>No Flashcards Available</h2>
        <p>No flashcards have been generated for this PDF yet.</p>
        <button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/student/dashboard')} style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <h1>Flashcards</h1>
      <p>Card {currentIndex + 1} of {flashcards.length}</p>

      <div style={{ 
        border: '2px solid #333', 
        padding: '40px', 
        marginBottom: '20px', 
        minHeight: '200px',
        cursor: 'pointer',
        backgroundColor: showAnswer ? '#f0f0f0' : '#fff'
      }} onClick={handleFlip}>
        {!showAnswer ? (
          <div>
            <h2>Question:</h2>
            <p style={{ fontSize: '18px' }}>{currentCard.question}</p>
            <p style={{ marginTop: '20px', color: '#666' }}>Click to see answer</p>
          </div>
        ) : (
          <div>
            <h2>Answer:</h2>
            <p style={{ fontSize: '18px' }}>{currentCard.answer}</p>
            <p style={{ marginTop: '20px', color: '#666' }}>Click to see question</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          ← Previous
        </button>
        <button 
          onClick={handleFlip}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Flip Card
        </button>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === flashcards.length - 1}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Next →
        </button>
      </div>

      {/* All Cards List */}
      <div style={{ marginTop: '40px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>All Flashcards</h3>
        {flashcards.map((card, index) => (
          <div 
            key={card.id} 
            style={{ 
              border: '1px solid #ddd', 
              padding: '10px', 
              marginBottom: '10px',
              backgroundColor: index === currentIndex ? '#e6f7ff' : '#fff',
              cursor: 'pointer'
            }}
            onClick={() => { setCurrentIndex(index); setShowAnswer(false); }}
          >
            <p><strong>Q{index + 1}:</strong> {card.question}</p>
            <p><strong>A:</strong> {card.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardsPage;