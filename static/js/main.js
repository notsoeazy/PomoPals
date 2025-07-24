// Preset time
let pomodoroTime = 25 * 60
let shortBreakTime = 5 * 60
let longBreakTime = 15 * 60
let longBreakInterval = 4

// TODO: Refactor the whole file to not pollute global scope
const PomodoroApp = {

}

let configuredTime = null
let remainingTime = null
let timer = null
let isPaused = true
let timerButtonActive = "Pomodoro"
let sessionMessage = null
let pomodoroCount = 0
let sessionCount = 1

const displayTime = document.getElementById("timer");
const startButton = document.getElementById("start-button");
const startButtonText = startButton.querySelector("span");
const timerButtons = document.querySelectorAll(".timer-button");
const skipButton = document.getElementById("skip-button");
const displayPomodoroCount = document.getElementById("pomodoro-count");
const settingsForm = document.getElementById("timer-settings")
const settingsButton = document.getElementById("settings-button")
const settingsModal = document.getElementById("settings-modal")




// Initiation
function main() {
    // Get the preset time
    setTimerPresets()

    // Reset the timer
    resetTimer()
}

// Calculate Time - Returns time in MM:SS format
function calculateTime(timeInSeconds) {
    minutes = Math.floor(timeInSeconds / 60);
    seconds = timeInSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2,"0")}`;
}

// Reset Timer
function resetTimer() {
    isPaused = true;
    clearInterval(timer);
    timer = null;
    startButtonText.innerText = "Start";
    setTimerPresets()

    // Change configured time
    if (timerButtonActive === 'Pomodoro')
        configuredTime = pomodoroTime
    else if (timerButtonActive === 'Short Break')
        configuredTime = shortBreakTime
    else if (timerButtonActive === 'Long Break')
        configuredTime = longBreakTime
        
    remainingTime = configuredTime;
    displayTime.innerText = calculateTime(remainingTime);
    updateProgressBar();
    toggleSkipButton();
    updateSessionMessage();
}

// TIMER
startButton.addEventListener("click", function () {
    // Change button text
    startButtonText.innerText =
        startButtonText.innerText === "Start" ? "Pause" : "Start";

    toggleSkipButton();

    // Start the timer
    if (isPaused) {
        timer = setInterval(function () {
            // Timer ends
            if (remainingTime <= 0) {
                clearInterval(timer)
                timer = null
                handleTimerEnd()
            } else {
                remainingTime--
                displayTime.innerText = calculateTime(remainingTime)
            }
            updateProgressBar();
        }, 1000)

        isPaused = false
    }
    // Pause the timer
    else {
        clearInterval(timer)
        timer = null
        isPaused = true
    }
})

// Timer buttons on click events
timerButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // Reset buttons
        timerButtons.forEach((btn) => {
            btn.classList.remove("active-button")
            btn.removeAttribute("disabled")
        })
        // Set active button
        button.classList.add("active-button")
        button.setAttribute("disabled", true)

        // Get the button text
        buttonText = button.textContent.trim();
        timerButtonActive = buttonText;

        resetTimer()
    })
})

// Timer end logic
function handleTimerEnd() {
    // Check after timer ends if pomodoro
    if (timerButtonActive === "Pomodoro") {
        pomodoroCount++
        // Take long break
        if (pomodoroCount % longBreakInterval === 0) {
            configuredTime = longBreakTime
            timerButtonActive = "Long Break"
            alert("Good job! Time for a long break.")
        }
        // Take short break
        else {
            configuredTime = shortBreakTime;
            timerButtonActive = "Short Break";
            alert("Good job! Time for a short break.");
        }
    }
    // After the breaks, reset to pomodoro time
    else {
        configuredTime = pomodoroTime;
        timerButtonActive = "Pomodoro";
        alert("Break over! Time to focus.");
        // Only increment session if pomodoro timer is used
        if (pomodoroCount >= sessionCount)
            sessionCount++;
    }
    resetTimer()
    // Update buttons and UI
    timerButtons.forEach((btn) => {
        btn.classList.remove("active-button");
        btn.removeAttribute("disabled")
        if (btn.textContent.trim() === timerButtonActive) {
            btn.classList.add("active-button");
            btn.setAttribute("disabled", true);
        }
    })
}

// Skip button onclick
skipButton.addEventListener("click", function () {
    handleTimerEnd();
    updateSessionMessage();
})

// Show or hide skip button
function toggleSkipButton() {
    if (startButtonText.innerText === "Start") {
        skipButton.classList.remove("opacity-100");
        skipButton.classList.add("opacity-0");
        skipButton.classList.remove("cursor-pointer");
        skipButton.setAttribute("disabled", true);
    } else {
        skipButton.classList.remove("opacity-0");
        skipButton.classList.add("opacity-100");
        skipButton.classList.add("cursor-pointer");
        skipButton.removeAttribute("disabled");
    }
}

function updateSessionMessage() {
    if (timerButtonActive === "Pomodoro") {
        sessionMessage = "Time to Focus!"
    } else if (timerButtonActive === "Short Break") {
        sessionMessage = "Take a break!";
    } else if (timerButtonActive === "Long Break") {
        sessionMessage = "Take a long break!"
    }
    displayPomodoroCount.innerText = `#${sessionCount} - ${sessionMessage}`
}

// Update the progress bar
function updateProgressBar() {
    progressBar = document.getElementById('progress-bar');
    percent = (remainingTime / configuredTime) * 100;
    progressBar.style.width = (100 - percent) + "%";
}

// Modal logic
function closeSettings() {
    settingsModal.classList.remove('flex');
    settingsModal.classList.add('hidden');
}

// Show modal when setting icon is clicked
settingsButton.addEventListener('click', function() {
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex');
});

// Close modal when close icon is clicked
settingsModal.querySelector('.modal-close').addEventListener('click', closeSettings);


function setTimerPresets() {
    pomodoroTime = settingsForm.querySelector('#pomodoro').value * 60;
    shortBreakTime = settingsForm.querySelector('#short-break').value * 60;
    longBreakTime = settingsForm.querySelector('#long-break').value * 60;
    longBreakInterval = settingsForm.querySelector('#long-break-interval').value;
}

// Save settings
document.getElementById('save-settings-button').addEventListener('click', function () {
    setTimerPresets()
    resetTimer()
    closeSettings()
});

// Store settings in local storage




document.addEventListener('DOMContentLoaded', main());