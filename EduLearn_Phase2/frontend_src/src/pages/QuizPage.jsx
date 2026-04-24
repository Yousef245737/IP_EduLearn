// src/pages/QuizPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy, RotateCcw, BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { quizzesApi } from '../hooks/useApi';

export default function QuizPage({ isDarkMode, toggleTheme }) {
  const [quizzes,     setQuizzes]     = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData,    setQuizData]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers,          setUserAnswers]          = useState([]);
  const [timeRemaining,        setTimeRemaining]        = useState(0);
  const [isQuizStarted,        setIsQuizStarted]        = useState(false);
  const [isQuizCompleted,      setIsQuizCompleted]      = useState(false);
  const [quizResult,           setQuizResult]           = useState(null);
  const [startTime,            setStartTime]            = useState(0);
  const [submitting,           setSubmitting]           = useState(false);
  const submitHandlerRef = useRef(null);

  useEffect(() => {
    quizzesApi.getAll()
      .then(setQuizzes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadQuiz = (quiz) => {
    setLoadingQuiz(true);
    quizzesApi.getById(quiz._id)
      .then(data => {
        setQuizData(data);
        setSelectedQuiz(quiz);
        setTimeRemaining(data.timeLimit || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingQuiz(false));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (submitting || !quizData) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answers = quizData.questions.map(q => ({
      questionId: q.questionId,
      answer: userAnswers.find(a => a.questionId === q.questionId)?.answer || '',
    }));
    try {
      const result = await quizzesApi.submitAttempt(quizData._id, { answers, timeTaken });
      setQuizResult(result);
      setIsQuizCompleted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [startTime, quizData, userAnswers, submitting]);

  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted && quizData?.timeLimit) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isQuizStarted, isQuizCompleted, quizData?.timeLimit]);

  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted && timeRemaining === 0 && quizData?.timeLimit) {
      submitHandlerRef.current?.();
    }
  }, [timeRemaining, isQuizStarted, isQuizCompleted, quizData?.timeLimit]);

  useEffect(() => { submitHandlerRef.current = handleSubmitQuiz; }, [handleSubmitQuiz]);

  const handleStartQuiz = () => { setIsQuizStarted(true); setStartTime(Date.now()); };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      return [...prev, { questionId, answer }];
    });
  };

  const getCurrentAnswer = (questionId) => userAnswers.find(a => a.questionId === questionId)?.answer || '';

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeRemaining(quizData?.timeLimit || 0);
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setQuizResult(null);
    setStartTime(0);
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
    setQuizData(null);
    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setQuizResult(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
  };

  const shell = (children, title, subtitle) => (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );

  // Quiz List
  if (!selectedQuiz) {
    return shell(
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quizzes available</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later for new quizzes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <Card key={quiz._id} className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="text-gray-500 dark:text-gray-400">{quiz.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{quiz.questions?.length || 0} questions</span>
                    {quiz.timeLimit > 0 && <span>{formatTime(quiz.timeLimit)} limit</span>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => loadQuiz(quiz)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loadingQuiz}>
                    {loadingQuiz ? 'Loading...' : 'Start Quiz'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>,
      'Quizzes', 'Test your knowledge'
    );
  }

  if (!quizData) return shell(<div className="p-6 text-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>, 'Quiz', 'Loading...');

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // Start Screen
  if (!isQuizStarted) {
    return shell(
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-73px)]">
        <Card className="max-w-2xl w-full bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-3xl text-gray-900 dark:text-white">{quizData.title}</CardTitle>
            {quizData.description && (
              <CardDescription className="text-gray-500 dark:text-gray-400 text-base mt-2">{quizData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizData.questions.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Limit</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{quizData.timeLimit ? formatTime(quizData.timeLimit) : '∞'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleBackToList} variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300">Back</Button>
            <Button onClick={handleStartQuiz} size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">Start Quiz</Button>
          </CardFooter>
        </Card>
      </div>,
      quizData.title, 'Ready to start?'
    );
  }

  // Results Screen
  if (isQuizCompleted && quizResult) {
    return shell(
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-3xl text-gray-900 dark:text-white">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-500 mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{quizResult.percentage}%</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">{quizResult.score} out of {quizResult.totalQuestions} correct</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Score',      value: `${quizResult.score}/${quizResult.totalQuestions}` },
                { label: 'Percentage', value: `${quizResult.percentage}%` },
                { label: 'Time Taken', value: formatTime(quizResult.timeTaken) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
            <Separator className="dark:bg-gray-800" />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Answer Review</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {quizResult.answers.map((result, index) => {
                  const question = quizData.questions.find(q => q.questionId === result.questionId);
                  return (
                    <div key={result.questionId} className={`p-4 rounded-lg border-2 ${result.isCorrect ? 'bg-green-50 dark:bg-green-950/20 border-green-500' : 'bg-red-50 dark:bg-red-950/20 border-red-500'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {result.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-gray-900 dark:text-white">Q{index + 1}: {question?.question}</p>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Your answer: </span>
                              <span className={result.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                                {result.userAnswer || 'Not answered'}
                              </span>
                            </p>
                            {!result.isCorrect && (
                              <p>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Correct: </span>
                                <span className="text-green-700 dark:text-green-400">{result.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleBackToList} variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300">All Quizzes</Button>
            <Button onClick={handleRetake} className="flex-1 bg-blue-600 hover:bg-blue-700" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake
            </Button>
          </CardFooter>
        </Card>
      </div>,
      'Quiz Results', 'See how you did'
    );
  }

  // Quiz Screen
  return shell(
    <div className="p-6 max-w-3xl mx-auto">
      {quizData.timeLimit > 0 && (
        <div className="flex justify-end mb-4">
          <Badge className={`text-lg px-4 py-2 ${timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
            <Clock className="w-4 h-4 mr-2" />{formatTime(timeRemaining)}
          </Badge>
        </div>
      )}
      <div className="mb-6"><Progress value={progress} className="h-2" /></div>
      <Card className="shadow-xl bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">{currentQuestion.question}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {currentQuestion.type === 'multiple-choice' && 'Select one answer'}
            {currentQuestion.type === 'true-false'      && 'Select True or False'}
            {currentQuestion.type === 'short-answer'    && 'Type your answer below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && currentQuestion.options && (
            <RadioGroup value={getCurrentAnswer(currentQuestion.questionId)} onValueChange={v => handleAnswerChange(currentQuestion.questionId, v)}>
              <div className={currentQuestion.type === 'true-false' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                {currentQuestion.options.map((option, index) => (
                  <label key={index} htmlFor={`option-${index}`}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      getCurrentAnswer(currentQuestion.questionId) === option
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 bg-white dark:bg-gray-900'
                    }`}>
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span className="flex-1 text-gray-900 dark:text-white">{option}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          )}
          {currentQuestion.type === 'short-answer' && (
            <Input type="text" placeholder="Type your answer here..."
              value={getCurrentAnswer(currentQuestion.questionId)}
              onChange={e => handleAnswerChange(currentQuestion.questionId, e.target.value)}
              className="text-lg p-6 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => setCurrentQuestionIndex(i => i - 1)}
            disabled={currentQuestionIndex === 0} className="flex-1 dark:border-gray-700 dark:text-gray-300">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          {currentQuestionIndex === quizData.questions.length - 1 ? (
            <Button onClick={handleSubmitQuiz} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex(i => i + 1)} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {quizData.questions.map((q, index) => {
          const isAnswered = userAnswers.some(a => a.questionId === q.questionId);
          const isCurrent  = index === currentQuestionIndex;
          return (
            <button key={q.questionId} onClick={() => setCurrentQuestionIndex(index)}
              className={`aspect-square rounded-lg border-2 font-semibold transition-all text-sm ${
                isCurrent  ? 'bg-blue-600 text-white border-blue-600 scale-110'
                : isAnswered ? 'bg-green-100 dark:bg-green-950 border-green-500 text-green-700 dark:text-green-400'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
              }`}>
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>,
    quizData.title,
    `Question ${currentQuestionIndex + 1} of ${quizData.questions.length}`
  );
}
