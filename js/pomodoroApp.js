import { statsManager } from "./statsManager.js";

// ====================
// CONSTANTS
// ====================
const POMODORO_DAFAULT = 25 * 60;
const SHORT_BREAK_DAFAULT = 5 * 60;
const LONG_BREAK_DAFAULT = 15 * 60;
const LONG_BREAK_INTERVAL_DEFAULT = 4;

// BUTTON NAMES
const POMODORO = "Pomodoro";
const SHORT_BREAK = "Short Break";
const LONG_BREAK = "Long Break";

// MESSAGES
const POMODORO_MESSAGE = "Time to focus!";
const SHORT_BREAK_MESSAGE = "Take a break.";
const LONG_BREAK_MESSAGE = "Take a long break.";


const PomodoroApp = {
    // ====================
    // Settings
    // ====================
    pomodoroTime: POMODORO_DAFAULT,
    shortBreakTime: SHORT_BREAK_DAFAULT,
    longBreakTime: LONG_BREAK_DAFAULT,
    longBreakInterval: LONG_BREAK_INTERVAL_DEFAULT,
    soundEffects: true,
    
    isPaused: true,
    isSkipped: false,
    timer: null,
    configuredTime: null,
    remainingTime: null,
    pomodoroCount: 0,

    isProfileVisible: false,

    timerButtonActive: POMODORO,
    message: null,
    
    username: "Guest",
    
    // ====================
    // DOM ELEMENTS
    // ====================
    timerButtons: document.querySelectorAll(".timer-button"),
    displayTime: document.getElementById("timer"),
    startButton: document.getElementById("start-button"),
    startButtonText: document.getElementById("start-button").querySelector("span"),
    skipButton: document.getElementById("skip-button"),
    
    displayPomodoroCount: document.getElementById("pomodoro-count"),
    progressBar: document.getElementById("progress-bar"),

    overlay: document.getElementById("overlay"),
    settingsModal: document.getElementById("settings-modal"),
    settingsForm: document.getElementById("timer-settings"),
    settingsButton: document.getElementById("settings-button"),
    resetButton: document.getElementById("reset-button"),
    editButton: document.getElementById("edit-button"),
    saveButton: document.getElementById("save-button"),

    profileButton: document.getElementById("profile-button"),
    profileSidebar: document.getElementById("profile-sidebar"),
    editButton: document.getElementById("edit-button"),
    saveButton: document.getElementById("save-button"),
    usernameDisplay: document.getElementById("usernameDisplay"),

    // ==============================
    // INITIALIZE
    // ==============================
    init: function () {
        this.loadSettingsFromStorage();
        this.setSettings();
        this.resetTimer();        
        this.bindEvents();

        const stats = statsManager.getStats();
        if (stats) {
            this.username = stats.username;
            this.usernameDisplay.value = this.username;
        }

        const session = sessionStorage.getItem("pomopals-session");
        if (session) {
            this.loadSession(session);
        }
    },

    // ==============================
    // EVENT LISTENERS
    // ==============================
    bindEvents: function () {
        // Start button
        this.startButton.addEventListener("click", () => {
            this.playButtonSound();
            this.toggleTimer();
        });
        // Space bar
        document.addEventListener("keydown", (e) => {
            // Space bar
            if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.startButton.click();
            }
        });
        // Skip button
        this.skipButton.addEventListener("click", () => {
            this.isSkipped = true;
            this.buttonSound.play();
            this.handleTimerEnd();
            this.updateMessage();
            this.updateStartButton();
            this.saveSession();
        });
        // Timer buttons
        this.timerButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                this.setTimerMode(btn);
                this.playButtonSound();
                this.saveSession();
            });
        });

        // Overlay
        this.overlay.addEventListener("click", () => {
            this.closeSettings();
            this.settingsForm.reset();
            this.hideOverlay();
        });
        // Settings button
        this.settingsButton.addEventListener("click", () => {
            this.openSettings();
            this.showOverlay();
        });
        // Settings close
        this.settingsModal.querySelector("#settings-modal-close").addEventListener("click", () => {
            this.closeSettings();
            this.hideOverlay();
            this.settingsForm.reset();
        });
        // Settings submit
        this.settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.updateSettings();
            this.closeSettings();
            this.hideOverlay();
        });
        // Settings reset button
        this.resetButton.addEventListener("click", () => {
            this.resetSettings();
        });

        // Profile button
        this.profileButton.addEventListener("click", () => {
            this.isProfileVisible = !this.isProfileVisible;
            this.profileSidebar.classList.toggle("hidden");
            if (this.isProfileVisible) {
                this.saveButton.classList.add("hidden");
                this.editButton.classList.remove("hidden");
            }
            else {
                this.saveButton.classList.remove("hidden");
                this.editButton.classList.add("hidden");
            }
            // Reset the name if opened and closed
            this.usernameDisplay.value = this.username;
        });
        // Edit button username Click
        this.editButton.addEventListener("click", () => {
            this.usernameDisplay.removeAttribute("readonly");
            this.usernameDisplay.removeAttribute("disabled");
            this.usernameDisplay.focus();
            this.usernameDisplay.select();
            this.editButton.classList.add("hidden");
            this.saveButton.classList.remove("hidden");
        });
        // Save button username Click
        this.saveButton.addEventListener("click", () => {
            this.usernameDisplay.setAttribute("readonly", true);
            this.usernameDisplay.setAttribute("disabled", true);
            this.usernameDisplay.blur();
            this.editButton.classList.remove("hidden");
            this.saveButton.classList.add("hidden");
            this.username = this.usernameDisplay.value;
            statsManager.updateUsername(this.usernameDisplay.value);
        });
    },
    
    // ==============================
    // HELPER FUNCTIONS
    // ==============================
    timeToString: function (timeInSeconds) {
        const m = Math.floor(timeInSeconds / 60);
        const s = timeInSeconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    },
    
    // ==============================
    // SOUND
    // ==============================
    buttonSound: new Audio("../static/sounds/button.mp3"),
    alarmSound: new Audio("../static/sounds/alarm.mp3"),
    
    playButtonSound: function () {
        if (this.soundEffects) this.buttonSound.play();
    },
    startAlarm: function () {
        if (this.soundEffects) this.alarmSound.play();
    },
    
    // ==============================
    // TIMER FUNCTIONS
    // ==============================
    toggleTimer: function () {
        this.startButtonText.innerText = this.startButtonText.innerText === "Start" ? "Pause" : "Start";
        this.updateStartButton();
        this.updateTitle();
        this.updateSkipButton();

        if (this.isPaused) {
            this.timer = setInterval(() => {
                if (this.remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.startAlarm();
                    this.handleTimerEnd();
                }
                else {
                    this.remainingTime--;
                    this.updateTitle();
                    this.updateDisplayTime();
                }
                this.updateProgressBar();
                this.saveSession();
            }, 1000);
            this.isPaused = false;
        }
        else {
            clearInterval(this.timer);
            this.isPaused = true;
        }
        this.saveSession();
    },
    
    handleTimerEnd: function () {
        // Take a break
        if (this.timerButtonActive === POMODORO) {
            // Only counts as a pomodoro if atleast 60% completed
            if ((this.pomodoroTime - this.remainingTime) >= this.pomodoroTime * 0.60)
                this.pomodoroCount++;

            // Change to long break
            if (this.pomodoroCount & this.longBreakInterval === 0 && this.pomodoroCount != 0) {
                this.timerButtonActive = LONG_BREAK;
                document.title = "Take a long break!";
                alert("Good job! Time for a long break.");
            }
            // Change to short break
            else {
                this.timerButtonActive = SHORT_BREAK
                document.title = "Take a break!";
                alert("Good job! Take a short break.")
            }
            // Record Stats
            let pomodoroFullTime = this.pomodoroTime / 60;
            let pomodoroTimeMinutes = this.isSkipped
                ? (this.pomodoroTime - this.remainingTime) / 60
                : this.pomodoroTime / 60;

            statsManager.recordPomodoro(
                pomodoroFullTime,
                pomodoroTimeMinutes,
                0,
                0
            );
        }
        // Change to pomodoro
        else {
            // Record Stats
            let breakMinutes = 0;
            let longBreakMinutes = 0;

            if (this.timerButtonActive === "Short Break") {
                breakMinutes = this.isSkipped
                    ? (this.shortBreakTime - this.remainingTime) / 60
                    : this.shortBreakTime / 60;
            }
            else {
                longBreakMinutes = this.isSkipped
                    ? (this.longBreakTime - this.remainingTime) / 60
                    : this.longBreakTime / 60;
            }

            statsManager.recordPomodoro(
                0,
                0,
                breakMinutes,
                longBreakMinutes
            )

            this.timerButtonActive = POMODORO;
            document.title = "Time to focus!";
            alert("Break over! Time to focus.")
        }

        this.isSkipped = false;
        this.updateActiveTimerButton();
        this.resetTimer();
    },
    
    resetTimer: function () {
        this.isPaused = true;
        clearInterval(this.timer);
        
        this.startButtonText.innerText = "Start";
        this.updateStartButton();
        this.updateSkipButton();

        this.setConfiguredTime();
        this.remainingTime = this.configuredTime;
        
        this.updateDisplayTime()
        this.updateTitle();
        this.updateProgressBar();
        this.updateMessage();
    },

    setConfiguredTime: function () {
        if (this.timerButtonActive === POMODORO) 
            this.configuredTime = this.pomodoroTime;
        else if (this.timerButtonActive === SHORT_BREAK)
            this.configuredTime = this.shortBreakTime;
        else
            this.configuredTime = this.longBreakTime; 
    },

    setTimerMode: function (button) {
        this.timerButtonActive = button.textContent.trim();
        this.updateActiveTimerButton();
        this.resetTimer();
    },

    // ==============================
    // UPDATE UI
    // ==============================
    updateTitle: function () {
        if (this.remainingTime != this.configuredTime) {
            document.title = `${this.timeToString(this.remainingTime)} - PomoPals`;
        }
        else {
            document.title = `PomoPals`;
        }
    },

    updateDisplayTime: function () {
        this.displayTime.innerText = this.timeToString(this.remainingTime);
    },

    updateStartButton: function () {
        if (this.startButtonText.innerText === "Start") {
            this.startButton.querySelector("span").classList.remove("pressed");
        }
        else {
            this.startButton.querySelector("span").classList.add("pressed");
        }
    },

    updateSkipButton: function () {
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

    updateProgressBar: function () {
        const percent = (this.remainingTime / this.configuredTime) * 100;
        this.progressBar.style.width = (100 - percent) + "%";
    },

    updateActiveTimerButton: function () {
        this.timerButtons.forEach((btn) => {
            btn.classList.remove("pressed");
            btn.removeAttribute("disabled");
            if (btn.textContent.trim() === this.timerButtonActive) {
                btn.classList.add("pressed");
                btn.setAttribute("disabled", true);
            }
        });
    },

    updateMessage: function () {
        if (this.timerButtonActive === POMODORO) {
            this.message = POMODORO_MESSAGE;
        }
        else if (this.timerButtonActive === SHORT_BREAK) {
            this.message = SHORT_BREAK_MESSAGE;
        }
        else if (this.timerButtonActive === LONG_BREAK) {
            this.message = LONG_BREAK_MESSAGE;
        }
        // else
        //     this.message = "CLICK A BUTTON";

        this.displayPomodoroCount.innerText = `#${this.pomodoroCount + 1} - ${this.message}`;
    },

    // ==============================
    // MEMORY & STORAGE
    // ==============================
    saveSession: function () {
        const session = {
            "remainingTime": this.remainingTime,
            "timerButtonActive": this.timerButtonActive,
            "pomodoroCount": this.pomodoroCount,
            "isPaused": this.isPaused,
            "lastUpdated": Date.now()
        };
        sessionStorage.setItem("pomopals-session", JSON.stringify(session));
    },

    loadSession: function (session) {
        const {
            remainingTime,
            timerButtonActive,
            pomodoroCount,
            isPaused,
            lastUpdated
        } = JSON.parse(session);

        this.remainingTime = remainingTime;
        this.timerButtonActive = timerButtonActive;
        this.pomodoroCount = pomodoroCount;

        const now = Date.now();
        let adjustedTime = remainingTime;

        if (!isPaused && lastUpdated) {
            const elapsed = Math.floor((now - lastUpdated) / 1000);
            adjustedTime = remainingTime - elapsed;
        }

        // Check if time has ran out after reload
        if (adjustedTime <= 0) {
            this.handleTimerEnd();
        }
        else {
            this.setConfiguredTime();
            this.remainingTime = adjustedTime;
            this.updateDisplayTime();
            this.updateTitle();
            this.updateProgressBar();
            this.updateMessage();

            // Force stop so that timer does not start
            this.isPaused = true;
            this.startButtonText.innerText = "Start";
            this.updateActiveTimerButton();
        }

    },

    saveSettingsToStorage: function () {
        const getValidatedInt = (selector, minValue, fallbackValue) => {
            const value = parseInt(this.settingsForm.querySelector(selector).value, 10);
            return Number.isInteger(value) && value >= minValue ? value : fallbackValue;
        };

        const getValidatedBool = (selector) => {
            const checkbox = this.settingsForm.querySelector(selector);
            return checkbox && typeof checkbox.checked === "boolean" ? checkbox.checked : false;
        };

        const settings = {
            version: 1,
            pomodoro: getValidatedInt("#pomodoro", 10, 25),
            shortBreak: getValidatedInt("#short-break", 1, 5),
            longBreak: getValidatedInt("#long-break", 5, 15),
            longBreakInterval: getValidatedInt("#long-break-interval", 4, 4),
            soundEffects: getValidatedBool("#sound-effects")
        };

        localStorage.setItem("pomopals-settings", JSON.stringify(settings));
    },

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

            // Set the default values
            this.settingsForm.querySelector("#pomodoro").defaultValue = pomodoro;
            this.settingsForm.querySelector("#short-break").defaultValue = shortBreak;
            this.settingsForm.querySelector("#long-break").defaultValue = longBreak;
            this.settingsForm.querySelector("#long-break-interval").defaultValue = longBreakInterval;
            this.settingsForm.querySelector("#sound-effects").defaultChecked = soundEffects;
        }
    },

    setSettings: function () {
        this.pomodoroTime = parseInt(this.settingsForm.querySelector("#pomodoro").value) * 60 || (25 * 60);
        this.shortBreakTime = parseInt(this.settingsForm.querySelector("#short-break").value) * 60 || (5 * 60);
        this.longBreakTime = parseInt(this.settingsForm.querySelector("#long-break").value) * 60 || (15 * 60);
        this.longBreakInterval = parseInt(this.settingsForm.querySelector("#long-break-interval").value);
        this.soundEffects = this.settingsForm.querySelector("#sound-effects").checked;
    },

    resetSettings: function () {
        this.settingsForm.querySelector("#pomodoro").value = 25;
        this.settingsForm.querySelector("#short-break").value = 5;
        this.settingsForm.querySelector("#long-break").value = 15;
        this.settingsForm.querySelector("#long-break-interval").value = 4;
        this.settingsForm.querySelector("#sound-effects").checked = true;
    },

    updateSettings: function () {
        this.saveSettingsToStorage();
        this.loadSettingsFromStorage();
        this.setSettings();
        this.resetTimer();
    },

    // ==============================
    // MODALS
    // ==============================
    hideOverlay: function () {
        this.overlay.classList.add("hidden");
    },

    showOverlay: function () {
        this.overlay.classList.remove("hidden");
    },

    openSettings: function () {
        this.settingsModal.classList.remove("hidden");
        this.settingsModal.classList.add("flex");
    },

    closeSettings: function () {
        this.settingsModal.classList.remove("flex");
        this.settingsModal.classList.add("hidden");
    },
};


document.addEventListener('DOMContentLoaded', () => PomodoroApp.init());
