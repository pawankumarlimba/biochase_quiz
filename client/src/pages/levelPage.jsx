import axios from 'axios';
import React, { useState, useEffect } from 'react';
import CountdownTimer from '../components/Timer';
import { Quize1 } from '../data/question';

const LevelPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const currentQuestion = Quize1[currentQuestionIndex];

  // Duration for quiz (7 hours in seconds)
  const durationInSeconds = 7*24*3600; // 7 hours

  // Set start time and end time for the quiz
  const initialStartTime =
    parseInt(localStorage.getItem('quizStartTime'), 10) || Date.now();
  const endTime = initialStartTime + durationInSeconds * 1000;

  useEffect(() => {
    // Check if the quiz is already completed
    const quizCompleted = localStorage.getItem('quizCompleted');
    if (quizCompleted === 'true') {
      setIsQuizCompleted(true);
    }

    // Set quiz start time if not already set
    if (!localStorage.getItem('quizStartTime')) {
      localStorage.setItem('quizStartTime', Date.now().toString());
    }

    // Detect if the user is on a mobile device
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize); // Add listener for window resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup listener
    };
  }, []);

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = (event) => {
    const updatedAnswer = event.target.value;
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = updatedAnswer;
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, Quize1.length - 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (isTimeUp || isQuizCompleted) {
      alert('Quiz already submitted or time is up.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token is missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        'https://biochase-backend-xeqq.vercel.app/api/v1/response',
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Response from server:', response.data);
      alert('Quiz submitted successfully!');
      setIsQuizCompleted(true); // Mark the quiz as completed
      localStorage.setItem('quizCompleted', 'true'); // Save completion status
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Error submitting your answers. Please try again.');
    }
  };

  const handleAutoSubmit = () => {
    setIsTimeUp(true); // Mark time as up
    handleSubmit(); // Trigger submission
  };

  // Show message if quiz is completed
  if (isQuizCompleted) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          You have already completed your quiz.
        </h1>
      </div>
    );
  }

  // Show message if on mobile
  if (isMobile) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Please use a laptop to take the quiz.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Subjective Quiz</h1>
        <CountdownTimer handleSubmit={handleAutoSubmit} endTime={endTime} />
      </header>

      <div className="min-h-[50vh] flex">
        {/* Sidebar */}
        <aside className="min-h-[50vh] w-1/4 bg-gray-100 p-6 border-r border-gray-300">
          <h2 className="text-xl font-bold mb-4">Questions</h2>
          <ul>
            {Quize1.map((question, index) => (
              <li
                key={index}
                className={`mb-2 p-2 cursor-pointer rounded-lg ${
                  currentQuestionIndex === index
                    ? 'bg-[#04091b] text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-200'
                }`}
                onClick={() => handleQuestionClick(index)}
              >
                {question.title}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <div className="min-h-[50vh] w-3/4 flex-grow p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            {/* Question */}
            <h2 className="text-2xl font-bold mb-4">
              Question {currentQuestionIndex + 1}:
            </h2>
            <p className="text-lg mb-6">{currentQuestion.paragraph}</p>
            {currentQuestion.src && (
              <div className="mt-2 text-sm text-gray-600">
                <img src={currentQuestion.src} alt="" />
              </div>
            )}
             {currentQuestion.options && (
              <ul className="list-disc pl-5 mb-6">
                {currentQuestion.options.map((option, i) => (
                  <li key={i} className="mb-2">
                    {option}
                  </li>
                ))}
              </ul>
            )}
            {currentQuestion.questions && (
              <ul className="list-disc pl-5 mb-6">
                {currentQuestion.questions.map((question, i) => (
                  <li key={i} className="mb-2">
                    {question}
                  </li>
                ))}
              </ul>
            )}

            {/* Textarea for Answer */}
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04091b] mb-6"
              rows="6"
              value={answers[currentQuestionIndex] || ''}
              onChange={handleAnswerChange}
              placeholder="Write your answer here..."
              aria-label="Answer the current question"
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                className={`bg-gray-600 text-white px-4 py-2 rounded ${
                  currentQuestionIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-700'
                }`}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              {currentQuestionIndex < Quize1.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="bg-[#04091b] text-white px-4 py-2 rounded hover:bg-[#04091b]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelPage;
