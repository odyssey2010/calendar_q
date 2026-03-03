import { useState, useEffect, useRef } from 'react';
import './QuizView.css';

type QuizType = '2+2' | '3+3' | '2x2' | '3x2' | 'mix';

function QuizView() {
  const [quizType, setQuizType] = useState<QuizType>('2+2');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState<'+' | '×'>('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [quizError, setQuizError] = useState('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect'>('correct');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [showAbacusModal, setShowAbacusModal] = useState(false);
  const [abacusSteps, setAbacusSteps] = useState<
    Array<{
      description: string;
      num1: number;
      num2: number;
      carry: number;
      digit: number;
    }>
  >([]);
  const [currentManualStep, setCurrentManualStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const lastDigitTimeRef = useRef(0);
  const lastAnswerWasWrongRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize quiz
  useEffect(() => {
    generateNewQuestion();
  }, [quizType]);

  const generateRandomTwoDigit = () => {
    return Math.floor(Math.random() * 90) + 10;
  };

  const generateRandomThreeDigit = () => {
    return Math.floor(Math.random() * 900) + 100;
  };

  const getMaxAnswerDigits = (type: QuizType): number => {
    switch (type) {
      case '2+2':
        return 3; // max 99 + 99 = 198
      case '3+3':
        return 4; // max 999 + 999 = 1998
      case '2x2':
        return 4; // max 99 × 99 = 9801
      case '3x2':
        return 5; // max 999 × 99 = 98901
      case 'mix':
        return 5; // max for mix is 3x2
      default:
        return 3;
    }
  };

  const generateNewQuestion = () => {
    if (quizType === 'mix') {
      const randomType = ['2+2', '3+3', '2x2', '3x2'][Math.floor(Math.random() * 4)] as QuizType;
      generateQuestionByType(randomType);
      return;
    }

    generateQuestionByType(quizType);
  };

  const generateQuestionByType = (type: QuizType) => {
    let n1 = 0;
    let n2 = 0;
    let op: '+' | '×' = '+';
    let answer = 0;

    switch (type) {
      case '2+2':
        n1 = generateRandomTwoDigit();
        n2 = generateRandomTwoDigit();
        op = '+';
        answer = n1 + n2;
        break;
      case '3+3':
        n1 = generateRandomThreeDigit();
        n2 = generateRandomThreeDigit();
        op = '+';
        answer = n1 + n2;
        break;
      case '2x2':
        n1 = generateRandomTwoDigit();
        n2 = generateRandomTwoDigit();
        op = '×';
        answer = n1 * n2;
        break;
      case '3x2':
        n1 = generateRandomThreeDigit();
        n2 = generateRandomTwoDigit();
        op = '×';
        answer = n1 * n2;
        break;
    }

    setNum1(n1);
    setNum2(n2);
    setOperation(op);
    setCorrectAnswer(answer);
    setUserAnswer('');
    lastDigitTimeRef.current = 0;
    lastAnswerWasWrongRef.current = false;
    setQuizError('');
  };

  const handleQuizTypeChange = (newType: QuizType) => {
    setQuizType(newType);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTotalCount(0);
    setUserAnswer('');
    setQuizError('');
  };

  const appendDigit = (digit: string) => {
    const now = Date.now();
    if (now - lastDigitTimeRef.current < 100) return;
    lastDigitTimeRef.current = now;

    if (lastAnswerWasWrongRef.current) {
      setUserAnswer('');
      lastAnswerWasWrongRef.current = false;
    }

    const maxDigits = getMaxAnswerDigits(quizType);
    if (userAnswer.length >= maxDigits) return;

    const newAnswer = userAnswer + digit;
    setUserAnswer(newAnswer);
    setQuizError('');

    const expectedDigits = correctAnswer.toString().length;
    if (newAnswer.length === expectedDigits) {
      setTimeout(() => {
        if (!isProcessingAnswer && newAnswer.length === expectedDigits) {
          checkAnswer(newAnswer);
        }
      }, 120);
    }
  };

  const clearInput = () => {
    if (userAnswer.length > 0) {
      setUserAnswer(userAnswer.slice(0, -1));
      setQuizError('');
    }
    lastAnswerWasWrongRef.current = false;
  };

  const clearAll = () => {
    setUserAnswer('');
    lastDigitTimeRef.current = 0;
    lastAnswerWasWrongRef.current = false;
    setQuizError('');
  };

  const checkAnswer = (answer: string) => {
    if (isProcessingAnswer) return;

    const expectedDigits = correctAnswer.toString().length;
    if (answer.length !== expectedDigits) {
      setQuizError(`Enter exactly ${expectedDigits} digits.`);
      return;
    }

    setIsProcessingAnswer(true);
    setQuizError('');

    const parsedAnswer = parseInt(answer);
    const isCorrect = parsedAnswer === correctAnswer;

    setTotalCount(totalCount + 1);
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
    } else {
      setIncorrectCount(incorrectCount + 1);
    }

    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setFeedbackVisible(true);

    setTimeout(() => {
      setFeedbackVisible(false);
    }, 800);

    if (isCorrect) {
      lastAnswerWasWrongRef.current = false;
      setTimeout(() => {
        generateNewQuestion();
        setIsProcessingAnswer(false);
      }, 1000);
    } else {
      lastAnswerWasWrongRef.current = true;
      setIsProcessingAnswer(false);
    }
  };

  const generateCalculationSteps = (n1: number, n2: number, op: '+' | '×') => {
    // For addition, we will show the steps of adding tens and ones separately, including any carries.
    // For multiplication, we will show the partial products for each digit of the second number, and then the final result.
    const stepsArray = [];

    if (op === '×') {
      const result = n1 * n2;
      const n2Str = n2.toString();
      
      stepsArray.push({
        description: `Multiplying ${n1} × ${n2}`,
        num1: 0,
        num2: 0,
        carry: 0,
        digit: -1,
      });

      // Generate partial products for each digit of n2
      let cumulativeResult = 0;
      const partialProducts: number[] = [];
      
      for (let i = 0; i < n2Str.length; i++) {
        const digit = parseInt(n2Str[n2Str.length - 1 - i]);
        const multiplier = Math.pow(10, i);
        const partialProduct = n1 * digit * multiplier;
        partialProducts.push(partialProduct);
        
        const digitPosition = ['ones', 'tens', 'hundreds'][i];
        stepsArray.push({
          description: `${n1} × ${digit} (${digitPosition} place) = ${n1 * digit}`,
          num1: cumulativeResult,
          num2: n1 * digit,
          carry: 0,
          digit: i,
        });
        
        cumulativeResult += partialProduct;
      }

      stepsArray.push({
        description: `Result: ${result}`,
        num1: 0,
        num2: result,
        carry: 0,
        digit: -1,
      });

      return stepsArray;
    }

    const num1Str = n1.toString().padStart(2, '0');
    const num2Str = n2.toString().padStart(2, '0');

    stepsArray.push({
      description: `Adding ${n1} + ${n2}`,
      num1: 0,
      num2: 0,
      carry: 0,
      digit: -1,
    });

    stepsArray.push({
      description: `Set ${n1} on abacus`,
      num1: n1,
      num2: 0,
      carry: 0,
      digit: -1,
    });

    const tens1 = parseInt(num1Str[0]);
    const tens2 = parseInt(num2Str[0]);
    const tensSum = tens1 + tens2;
    const carry = Math.floor(tensSum / 10);

    stepsArray.push({
      description: `Tens: ${tens1} + ${tens2} = ${tensSum}${carry > 0 ? ' (carry ' + carry + ')' : ''}`,
      num1: n1,
      num2: tens2 * 10,
      carry: 0,
      digit: 1,
    });

    const ones1 = parseInt(num1Str[1]);
    const ones2 = parseInt(num2Str[1]);
    const onesSum = ones1 + ones2;
    const onesCarry = Math.floor(onesSum / 10);

    stepsArray.push({
      description: `Ones: ${ones1} + ${ones2} = ${onesSum}${onesCarry > 0 ? ' (carry ' + onesCarry + ')' : ''}`,
      num1: n1,
      num2: tens2 * 10 + ones2,
      carry: 0,
      digit: 0,
    });

    stepsArray.push({
      description: `Result: ${n1 + n2}`,
      num1: n1,
      num2: n2,
      carry: 0,
      digit: -1,
    });

    return stepsArray;
  };

  const showAbacus = () => {
    setQuizError('');
    const steps = generateCalculationSteps(num1, num2, operation);
    setAbacusSteps(steps);
    setCurrentManualStep(0);
    setIsAutoPlaying(true);
    setShowAbacusModal(true);
  };

  const closeAbacus = () => {
    setShowAbacusModal(false);
    checkAnswer(userAnswer);
  };

  const previousStep = () => {
    setIsAutoPlaying(false);
    if (currentManualStep > 0) {
      setCurrentManualStep(currentManualStep - 1);
    }
  };

  const nextStep = () => {
    setIsAutoPlaying(false);
    if (currentManualStep < abacusSteps.length - 1) {
      setCurrentManualStep(currentManualStep + 1);
    }
  };

  // Abacus auto-play effect
  useEffect(() => {
    if (isAutoPlaying && currentManualStep < abacusSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentManualStep(currentManualStep + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, currentManualStep, abacusSteps.length]);

  // Draw abacus
  useEffect(() => {
    if (showAbacusModal && canvasRef.current && abacusSteps.length > 0) {
      const step = abacusSteps[currentManualStep];
      drawAbacus(canvasRef.current, step.num1, step.num2, step.carry, step.digit, quizType);
    }
  }, [showAbacusModal, abacusSteps, currentManualStep, quizType]);

  const drawAbacus = (
    canvas: HTMLCanvasElement,
    num1Val: number,
    num2Val: number,
    carry: number,
    currentDigit: number,
    type: QuizType
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxDigits = getMaxAnswerDigits(type);
    const columnCount = Math.min(maxDigits, 6);
    const frameWidth = 50 + columnCount * 50;
    const frameHeight = 350;
    const frameX = 25;
    const frameY = 25;

    // Draw frame
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    // Calculate rod positions dynamically
    const rodPositions: number[] = [];
    for (let i = 0; i < columnCount; i++) {
      rodPositions.push(50 + i * 50);
    }

    // Draw rods
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#654321';

    for (let rod of rodPositions) {
      ctx.beginPath();
      ctx.moveTo(frameX + rod, frameY + 20);
      ctx.lineTo(frameX + rod, frameY + frameHeight - 20);
      ctx.stroke();
    }

    // Draw center bar
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(frameX + 10, frameY + frameHeight / 2 - 35);
    ctx.lineTo(frameX + frameWidth - 10, frameY + frameHeight / 2 - 35);
    ctx.stroke();

    // Labels for each column
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    const placeValues = ['1s', '10s', '100s', '1000s', '10000s', '100000s'];
    for (let i = 0; i < columnCount; i++) {
      ctx.fillText(placeValues[columnCount - 1 - i], frameX + rodPositions[i], frameY + frameHeight + 15);
    }

    // Draw beads for result
    const result = num1Val + num2Val + carry;
    const resultStr = result.toString().padStart(columnCount, '0');
    const digits: number[] = [];
    for (let i = 0; i < columnCount; i++) {
      digits.push(parseInt(resultStr[i]));
    }

    for (let i = 0; i < columnCount; i++) {
      const rodX = frameX + rodPositions[i];
      const value = digits[i];
      const fiveBeadY = value >= 5 ? frameY + frameHeight / 2 - 55 : frameY + 80;
      const onesCount = value % 5;

      // Draw five-bead (top)
      if (value >= 5) {
        ctx.fillStyle = '#FF6B6B';
      } else {
        ctx.fillStyle = '#ccc';
      }
      ctx.beginPath();
      ctx.arc(rodX, fiveBeadY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw one-beads (bottom)
      for (let j = 0; j < 4; j++) {
        const beadY =
          j < onesCount
            ? frameY + frameHeight / 2 - 15 + j * 35
            : frameY + frameHeight - 60 - (3 - j) * 35;

        ctx.fillStyle = j < onesCount ? '#4AF' : '#ccc';
        ctx.beginPath();
        ctx.arc(rodX, beadY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Highlight current digit
    if (currentDigit >= 0 && currentDigit < columnCount) {
      const highlightIndexMap: number[] = [];
      for (let i = 0; i < columnCount; i++) {
        highlightIndexMap.push(columnCount - 1 - i);
      }
      const highlightIndex = highlightIndexMap[currentDigit];
      if (highlightIndex >= 0 && highlightIndex < columnCount) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(frameX + rodPositions[highlightIndex], frameY + frameHeight / 2, 40, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  return (
    <div className="quiz-view-container">
      <div className="content-card" style={{ position: 'relative' }}>
        <div className="quiz-header">
          <h2>
            <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>🧮</span> Quiz
          </h2>
          <select 
            className="quiz-type-select" 
            value={quizType} 
            onChange={(e) => handleQuizTypeChange(e.target.value as QuizType)}
          >
            <option value="2+2">2+2</option>
            <option value="3+3">3+3</option>
            <option value="2x2">2x2</option>
            <option value="3x2">3x2</option>
            <option value="mix">mix</option>
          </select>
        </div>

        {/* Quiz Stats */}
        <div className="quiz-stats">
          <div className="stat-item">
            <div className="stat-label">Correct</div>
            <div className="stat-value correct">{correctCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Incorrect</div>
            <div className="stat-value incorrect">{incorrectCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total</div>
            <div className="stat-value">{totalCount}</div>
          </div>
        </div>

        {/* Quiz Display */}
        <div className="calculator-display">
          <div className="quiz-question">
            {num1} {operation} {num2}
          </div>
          <div className="quiz-input">{userAnswer || '_'}</div>
          <div className="quiz-error">{quizError}</div>
        </div>

        {/* Feedback */}
        <div
          className={`quiz-feedback ${feedbackVisible ? 'show' : ''} ${feedbackType}`}
        >
          {feedbackType === 'correct' ? '✓' : '✗'}
        </div>

        {/* Keypad */}
        <div className="keypad">
          <button className="key number" onClick={() => appendDigit('7')}>
            7
          </button>
          <button className="key number" onClick={() => appendDigit('8')}>
            8
          </button>
          <button className="key number" onClick={() => appendDigit('9')}>
            9
          </button>
          <button className="key clear" onClick={clearInput}>
            ⌫
          </button>

          <button className="key number" onClick={() => appendDigit('4')}>
            4
          </button>
          <button className="key number" onClick={() => appendDigit('5')}>
            5
          </button>
          <button className="key number" onClick={() => appendDigit('6')}>
            6
          </button>
          <button className="key function" onClick={generateNewQuestion}>
            Skip
          </button>

          <button className="key number" onClick={() => appendDigit('1')}>
            1
          </button>
          <button className="key number" onClick={() => appendDigit('2')}>
            2
          </button>
          <button className="key number" onClick={() => appendDigit('3')}>
            3
          </button>
          <button className="key submit" onClick={showAbacus} style={{ gridRow: 'span 2' }}>
            <span style={{ display: 'inline-block', transform: 'rotate(-90deg) scale(1.5)' }}>
              🧮
            </span>
            <br />
            Abacus
          </button>

          <button className="key number zero" onClick={() => appendDigit('0')}>
            0
          </button>
          <button className="key function" onClick={clearAll}>
            C
          </button>
        </div>
      </div>

      {/* Abacus Modal */}
      {showAbacusModal && (
        <div className="abacus-modal show">
          <div className="abacus-container">
            <div className="abacus-title">
              {num1} {operation} {num2} = ?
            </div>
            <div className="abacus-step">
              {abacusSteps.length > 0 && abacusSteps[currentManualStep]?.description}
            </div>
            <canvas
              ref={canvasRef}
              className="abacus-canvas"
              width={350}
              height={400}
            />
            <div className="abacus-button-group">
              <button
                className="abacus-nav-button"
                onClick={previousStep}
                disabled={currentManualStep <= 0}
              >
                &lt;
              </button>
              <button
                className="abacus-nav-button"
                onClick={nextStep}
                disabled={currentManualStep >= abacusSteps.length - 1}
              >
                &gt;
              </button>
              <button className="abacus-close" onClick={closeAbacus}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizView;
