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
    remainingTime = configuredTime;
    displayTime.innerText = calculateTime(configuredTime);
}

// Button onclick
startButton.addEventListener('click', function () {
    // Change button text
    startButtonText.innerText = startButtonText.innerText === "Start" ? "Pause" : "Start";

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

