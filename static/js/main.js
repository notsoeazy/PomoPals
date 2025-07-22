// Preset time
let pomodoroTime = 25 * 60;
let shortBreakTime = 5 * 60;
let longBreakTime = 15 * 60;

// Start with pomodoro for now
let configuredTime = pomodoroTime;

// let timeElapsed = 0;
let remainingTime = configuredTime;
let timer = null;
let isPaused = true;

const displayTime = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const startButtonText = startButton.querySelector('span');

// Calculate Time - Returns time in MM:SS format
function calculateTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Reset Timer
function resetTimer() {
    timeElapsed = 0;
    isPaused = true;
    clearInterval(timer);
    timer = null;
    startButtonText.innerText = 'Start';
    remainingTime = configuredTime;
    displayTime.innerText = calculateTime(configuredTime);
}

// Run default
resetTimer();

// Button onclick
startButton.addEventListener('click', function () {
    // Change button text
    startButtonText.innerText = startButtonText.innerText === 'Start' ? 'Pause' : 'Start';

    // Start the timer
    if (isPaused) {
        timer = setInterval(function () {
            if (remainingTime <= 0) {
                clearInterval(timer);
                interval = null;
                alert('Timer ends!');
                return;
            }
            remainingTime--;
            displayTime.innerText = calculateTime(remainingTime);
        }, 1000);
    
        isPaused = false;
    }
    // Pause the timer
    else {
        clearInterval(timer);
        timer = null;
        isPaused = true;
    }
});

// Timer buttons
const timerButtons = document.querySelectorAll('.timer-button');
let timerButtonActive = 'Pomodoro';

timerButtons.forEach(function (button) {
    button.addEventListener('click', function () {   
        // Remobe active-button class and disabled state of the others
        timerButtons.forEach((btn) => {
            btn.classList.remove('active-button');
            btn.removeAttribute('disabled');
        });  
        
        // Add active class  
        button.classList.add('active-button');
        // Add disabled attribute
        button.setAttribute('disabled', true);
        
        // Get the button text
        buttonText = button.textContent.trim();
        
        if (buttonText === 'Pomodoro') {
            configuredTime = pomodoroTime;
        } 
        else if (buttonText === 'Short Break') {
            configuredTime = shortBreakTime;
        } 
        else if (buttonText === 'Long Break') {
            configuredTime = longBreakTime;
        }

        resetTimer();
    });
});