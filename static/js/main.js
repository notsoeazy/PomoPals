// TODO: Refactor the whole file to not pollute global scope
const PomodoroApp = {
    // === State ===
    pomodoroTime: 25 * 60,
    shortBreakTime: 5 * 60,
    longBreakTime: 15 * 60,
    longBreakInterval: 4,
    soundEffects: true,

    configuredTime: null,
    remainingTime: null,
    timer: null,
    isPaused: true,
    timerButtonActive: "Pomodoro",
    sessionMessage: null,
    pomodoroCount: 0,
    sessionCount: 1,

    // === DOM ===
    displayTime: document.getElementById("timer"),
    startButton: document.getElementById("start-button"),
    startButtonText: document.getElementById("start-button").querySelector("span"),
    timerButtons: document.querySelectorAll(".timer-button"),
    skipButton: document.getElementById("skip-button"),
    displayPomodoroCount: document.getElementById("pomodoro-count"),
    settingsModal: document.getElementById("settings-modal"),
    settingsForm: document.getElementById("timer-settings"),
    settingsButton: document.getElementById("settings-button"),
    statsButton: document.getElementById("stats-button"),
    profileButton: document.getElementById("profile-button"),
    saveSettingsButton: document.getElementById("save-settings-button"),
    progressBar: document.getElementById("progress-bar"),

    // === Sound ===
    buttonSound: new Audio("/static/sounds/button.mp3"),
    alarmSound: new Audio("/static/sounds/alarm.mp3"),

    // === Initialization ===
    init: function () {
        this.loadSettingsFromStorage();
        this.setSettings();
        this.resetTimer();
        this.bindEvents();

        // this.alarmSound.load = true;
    },

    // === Events ===
    bindEvents: function () {
        // Start Button Click
        this.startButton.addEventListener("click", () => {
            this.playButtonSound();
            this.toggleTimer();
        });
        
        // Skip Button Click
        this.skipButton.addEventListener("click", () => {
            this.buttonSound.play();
            this.handleTimerEnd();
            this.updateSessionMessage();
        });

        // Timer buttons Click
        this.timerButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                this.changeTimerMode(btn);
                this.playButtonSound();
            });
        });

        // Settings button Click
        this.settingsButton.addEventListener("click", () => {
            this.openSettings();
        });
        
        // Close settings Click
        this.settingsModal.querySelector(".modal-close").addEventListener("click", () => {
            this.closeSettings();
            this.settingsForm.reset();
        });
        
        // Save settings Click
        this.saveSettingsButton.addEventListener("click", () => {
            this.updateSettings();
        });

        // Stats button Click
        this.statsButton.addEventListener("click", () => {
            alert("To be implemented...");
        });
        
        this.profileButton.addEventListener("click", () => {
            alert("To be implemented...");
        });
    },

    // === Functions ===
    calculateTime: function (timeInSeconds) {
        const m = Math.floor(timeInSeconds / 60);
        const s = timeInSeconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    },

    resetTimer: function () {
        this.isPaused = true;
        clearInterval(this.timer);
        this.timer = null;
        this.startButtonText.innerText = "Start";

        if (this.timerButtonActive === "Pomodoro")
            this.configuredTime = this.pomodoroTime;
        else if (this.timerButtonActive === "Short Break")
            this.configuredTime = this.shortBreakTime;
        else if (this.timerButtonActive === "Long Break")
            this.configuredTime = this.longBreakTime;

        this.remainingTime = this.configuredTime;
        this.displayTime.innerText = this.calculateTime(this.remainingTime);
        this.toggleSkipButton();
        this.updateProgressBar();
        this.updateSessionMessage();
    },

    toggleTimer: function () {
        this.startButtonText.innerText = this.startButtonText.innerText === "Start" ? "Pause" : "Start";

        this.toggleSkipButton();
        // Start the timer if its paused.
        if (this.isPaused) {
            this.timer = setInterval(() => {
                if (this.remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.handleTimerEnd()
                }
                else {
                    this.remainingTime--;
                    this.displayTime.innerText = this.calculateTime(this.remainingTime);
                }
                this.updateProgressBar();
            }, 1000);
            this.isPaused = false
        }
        // Stop the timer if its running.
        else {
            clearInterval(this.timer);
            this.timer = null;
            this.isPaused = true;
        }
    },

    changeTimerMode: function (button) {
        this.timerButtonActive = button.textContent.trim();
        this.updateTimerButtonStates();
        this.resetTimer()
    },

    updateTimerButtonStates: function () {
        this.timerButtons.forEach((btn) => {
            btn.classList.remove("active-button");
            btn.removeAttribute("disabled");
            if (btn.textContent.trim() === this.timerButtonActive) {
                btn.classList.add("active-button");
                btn.setAttribute("disabled", true);
            }
        });
    },

    handleTimerEnd: function () {
        this.startAlarm();

        if (this.timerButtonActive === "Pomodoro") {
            this.pomodoroCount++;
            if (this.pomodoroCount % this.longBreakInterval === 0) {
                this.timerButtonActive = "Long Break";
                alert("Good job! Time for a long break.");
            }
            else {
                this.timerButtonActive = "Short Break";
                alert("Good job! Take a short break.");
            }
        }
        else {
            this.timerButtonActive = "Pomodoro";
            alert("Break over! Time to focus.");
            if (this.pomodoroCount >= this.sessionCount)
                this.sessionCount++;
        }

        this.updateTimerButtonStates();
        this.resetTimer();
    },

    toggleSkipButton: function () {
        if (this.startButtonText.innerText.trim() === "Start") {
            this.skipButton.classList.remove("opacity-100");
            this.skipButton.classList.add("opacity-0");
            this.skipButton.classList.remove("cursor-pointer");
            this.skipButton.setAttribute("disabled", true);
        }
        else {
            this.skipButton.classList.remove("opacity-0");
            this.skipButton.classList.add("opacity-100");
            this.skipButton.classList.add("cursor-pointer");
            this.skipButton.removeAttribute("disabled");
        }
    },

    updateSessionMessage: function () {
        if (this.timerButtonActive === "Pomodoro")
            this.sessionMessage = "Time to Focus!"
        else if (this.timerButtonActive === "Short Break")
            this.sessionMessage = "Take a break!"
        else if (this.timerButtonActive === "Long Break")
            this.sessionMessage = "Take a long break!"

        this.displayPomodoroCount.innerText = `#${this.sessionCount} - ${this.sessionMessage}`;
    },

    updateProgressBar: function () {
        const percent = (this.remainingTime / this.configuredTime) * 100;
        this.progressBar.style.width = (100 - percent) + "%";
    },

    closeSettings: function () {
        this.settingsModal.classList.remove("flex");
        this.settingsModal.classList.add("hidden");
    },
    
    openSettings: function () {
        this.settingsModal.classList.remove("hidden");
        this.settingsModal.classList.add("flex");
    },
    
    updateSettings: function () {
        this.saveSettingsToStorage();
        this.loadSettingsFromStorage();
        this.setSettings();
        this.resetTimer();
        this.closeSettings();
    },

    // Set the setting values
    setSettings: function () {
        this.pomodoroTime = parseInt(this.settingsForm.querySelector("#pomodoro").value) * 60 || (25 * 60);
        this.shortBreakTime = parseInt(this.settingsForm.querySelector("#short-break").value) * 60 || (5 * 60);
        this.longBreakTime = parseInt(this.settingsForm.querySelector("#long-break").value) * 60 || (15 * 60);
        this.longBreakInterval = parseInt(this.settingsForm.querySelector("#long-break-interval").value);
        this.soundEffects = this.settingsForm.querySelector("#sound-effects").checked;
    },

    // Get the values from the form and store in the storage
    saveSettingsToStorage: function () {
        localStorage.setItem(
            "pomopals-settings",
            JSON.stringify({
                version: 1,
                pomodoro: this.settingsForm.querySelector("#pomodoro").value,
                shortBreak: this.settingsForm.querySelector("#short-break").value,
                longBreak: this.settingsForm.querySelector("#long-break").value,
                longBreakInterval: this.settingsForm.querySelector("#long-break-interval").value,
                soundEffects: this.settingsForm.querySelector("#sound-effects").checked
            })
        )
    },

    // Get the settings from the localstorage
    loadSettingsFromStorage: function () {
        const saved = localStorage.getItem("pomopals-settings");
        if (saved) {
            const { pomodoro, shortBreak, longBreak, longBreakInterval, soundEffects } = JSON.parse(saved);
            // Update the displayed values
            this.settingsForm.querySelector("#pomodoro").value = pomodoro;
            this.settingsForm.querySelector("#short-break").value = shortBreak;
            this.settingsForm.querySelector("#long-break").value = longBreak;
            this.settingsForm.querySelector("#long-break-interval").value = longBreakInterval;
            this.settingsForm.querySelector("#sound-effects").checked = soundEffects;
        }
    },
    
    resetSettings: function () {
        this.settingsForm.querySelector("#pomodoro").value = 25;
        this.settingsForm.querySelector("#short-break").value = 5;
        this.settingsForm.querySelector("#long-break").value = 15;
        this.settingsForm.querySelector("#long-break-interval").value = 4;
        this.settingsForm.querySelector("#sound-effects").checked = true;
        this.setSettings();
    },


    // To be used/improved in the future when alert modal is implemented
    startAlarm: function () {
        if (this.soundEffects)
            this.alarmSound.play();
    },
    playButtonSound: function () {
          if (this.soundEffects)
            this.buttonSound.play();
    },
    // stopAlarm: function () {
    //     this.alarmSound.pause();
    //     this.alarmSound.currentTime = 0;
    // }

}

document.addEventListener('DOMContentLoaded', () => PomodoroApp.init());