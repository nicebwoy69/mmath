let currentAnswer;
let score = 0;
let totalQuestions = 0;
let correctStreak = 0;
let timer;
let timeLeft = 10;
let startTime;

// Sound effects for feedback
const correctSound = new Audio('correct.wav');
const incorrectSound = new Audio('incorrect.wav');

let tips = {};

// Load tips.json on app load
fetch('tips.json')
  .then(response => response.json())
  .then(data => {
    tips = data;
  })
  .catch(error => console.error('Error loading tips:', error));


// Event listener for Enter key submission directly on the answer input
document.getElementById('answer').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    checkAnswer();
  }
});

function startGame() {
  const gameMode = document.getElementById('game-mode').value;
  const difficulty = document.getElementById('difficulty-level').value;

  if (gameMode === 'timed') {
    timeLeft = 10;
    document.getElementById('timer').style.display = 'block';
    startTimer();
  } else {
    document.getElementById('timer').style.display = 'none';
  }

  generateQuestion(difficulty);
  clearFeedback();
  score = 0;
  totalQuestions = 0;
  correctStreak = 0;
  updateProgress();
}

function getRandomOperation() {
  const operations = [];
  if (document.getElementById('add').checked) operations.push('+');
  if (document.getElementById('subtract').checked) operations.push('-');
  if (document.getElementById('multiply').checked) operations.push('*');
  if (document.getElementById('divide').checked) operations.push('/');

  return operations.length > 0 ? operations[Math.floor(Math.random() * operations.length)] : null;
}

function clearFeedback() {
  const feedbackElement = document.getElementById('feedback');
  feedbackElement.textContent = "";
  feedbackElement.className = 'feedback'; // Reset feedback styling to default
}

function generateQuestion(difficulty) {
  clearFeedback();
  if (document.getElementById('game-mode').value === 'timed') resetTimer();

  const operation = getRandomOperation();
  if (!operation) {
    document.getElementById('question').textContent = "Select at least one operation.";
    currentAnswer = undefined;
    return;
  }

  let num1, num2;
  switch(difficulty) {
    case 'easy':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case 'medium':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 20) + 1;
      break;
    case 'hard':
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 1;
      break;
  }

  let question;
  switch(operation) {
    case '+':
      question = `${num1} + ${num2}`;
      currentAnswer = num1 + num2;
      break;
    case '-':
      question = `${num1} - ${num2}`;
      currentAnswer = num1 - num2;
      break;
    case '*':
      question = `${num1} * ${num2}`;
      currentAnswer = num1 * num2;
      break;
    case '/':
      if (num2 === 0) num2 = 1; // Avoid division by zero
      question = `${num1 * num2} / ${num2}`;
      currentAnswer = (num1 * num2) / num2;
      break;
  }

  document.getElementById('question').textContent = question;
  startTime = Date.now();
}

function checkAnswer() {
  const gameMode = document.getElementById('game-mode').value;
  const answerInput = document.getElementById('answer').value.trim();
  const userAnswer = parseFloat(answerInput);

  if (isNaN(userAnswer) || answerInput === "") {
    document.getElementById('feedback').textContent = "Please enter a valid number.";
    return;
  }

  if (typeof currentAnswer === 'undefined') {
    document.getElementById('feedback').textContent = "Please start the game first.";
    return;
  }

  totalQuestions++;
  const timeTaken = (Date.now() - startTime) / 1000;

  if (userAnswer === currentAnswer) {
    score++;
    correctStreak++;
    correctSound.play();
    document.getElementById('feedback').textContent = "Correct!";
    document.getElementById('feedback').classList.add('correct');
    setTimeout(nextQuestion, 1000);
    if (correctStreak >= 3 && timeTaken < 5) levelUp();
  } else {
    correctStreak = 0;
    incorrectSound.play();
    document.getElementById('feedback').textContent = `Incorrect. The correct answer was ${currentAnswer}.`;
    document.getElementById('feedback').classList.add('incorrect');
    setTimeout(nextQuestion, 2000);
  }

  if (gameMode === 'timed') clearInterval(timer);
  updateProgress();
  document.getElementById('answer').value = "";
  document.getElementById('answer').focus();
}

function levelUp() {
  const difficultySelect = document.getElementById('difficulty-level');
  if (difficultySelect.value === 'easy') {
    difficultySelect.value = 'medium';
    document.getElementById('feedback').textContent += " Leveling up to Medium!";
  } else if (difficultySelect.value === 'medium') {
    difficultySelect.value = 'hard';
    document.getElementById('feedback').textContent += " Leveling up to Hard!";
  }
  correctStreak = 0;
}

function nextQuestion() {
  const difficulty = document.getElementById('difficulty-level').value;
  generateQuestion(difficulty);
}

function updateProgress() {
  const accuracy = (score / totalQuestions * 100).toFixed(2);
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
  document.getElementById('progress').style.width = `${accuracy}%`;
}

function startTimer() {
  timeLeft = 10;
  document.getElementById('timer').textContent = `Time: ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById('feedback').textContent = `Time's up! The correct answer was ${currentAnswer}.`;
      totalQuestions++;
      updateProgress();
      setTimeout(nextQuestion, 2000);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 10;
  document.getElementById('timer').textContent = `Time: ${timeLeft}`;
}

 function showHint() {
  const operation = getSelectedOperation();
  const difficulty = document.getElementById('difficulty-level').value;

  // Ensure tips are loaded before trying to access them
  if (tips[operation] && tips[operation][difficulty]) {
    const hint = tips[operation][difficulty][Math.floor(Math.random() * tips[operation][difficulty].length)];
    document.getElementById('hint').textContent = hint;
  } else {
    document.getElementById('hint').textContent = "No tips available for this level.";
  }

  document.getElementById('hintModal').style.display = 'block';
}


function getSelectedOperation() {
  if (document.getElementById('add').checked) return "addition";
  if (document.getElementById('subtract').checked) return "subtraction";
  if (document.getElementById('multiply').checked) return "multiplication";
  if (document.getElementById('divide').checked) return "division";
  return "addition";
}
