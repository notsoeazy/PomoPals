// TODO: Fix bug - when pressing timer buttons the message doesnt change


// Preset time
let pomodoroTime = 25 * 60
let shortBreakTime = 5 * 60
let longBreakTime = 15 * 60

// Start with pomodoro for now
let configuredTime = pomodoroTime

let remainingTime = configuredTime
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

// Calculate Time - Returns time in MM:SS format
function calculateTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2,"0")}`
}

// Reset Timer
function resetTimer() {
    isPaused = true;
    clearInterval(timer);
    timer = null;
    startButtonText.innerText = "Start";
    remainingTime = configuredTime;
    displayTime.innerText = calculateTime(configuredTime);
    toggleSkipButton();
    updateSessionMessage();
}

// Run default
resetTimer()

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
                interval = null
                handleTimerEnd()
            } else {
                remainingTime--
                displayTime.innerText = calculateTime(remainingTime)
            }
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

        // Change the configured time
        if (buttonText === "Pomodoro") {
            configuredTime = pomodoroTime;
        } else if (buttonText === "Short Break") {
            configuredTime = shortBreakTime
        } else if (buttonText === "Long Break") {
            configuredTime = longBreakTime
        }

        resetTimer()
    })
})

// Timer end logic
function handleTimerEnd() {
    // Check after timer ends if pomodoro
    if (timerButtonActive === "Pomodoro") {
        pomodoroCount++
        // Take long break
        if (pomodoroCount % 4 === 0) {
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


// Modal logic

const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');

// Show modal when setting icon is clicked
settingsButton.addEventListener('click', function() {
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex');
});

// Close modal when close icon is clicked
settingsModal.querySelector('.modal-close').addEventListener('click', function () {
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
});