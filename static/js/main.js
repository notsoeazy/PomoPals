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
    message: null,
    pomodoroCount: 0,
    isSkipped: false,
    username: "",

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
    resetButton: document.getElementById("reset-button"),
    progressBar: document.getElementById("progress-bar"),
    overlay: document.getElementById("overlay"),

    profileSidebar: document.getElementById("profile-sidebar"),
    editButton: document.getElementById("edit-button"),
    saveButton: document.getElementById("save-button"),
    usernameDisplay: document.getElementById("usernameDisplay"),

    // === Sound ===
    buttonSound: new Audio("/static/sounds/button.mp3"),
    alarmSound: new Audio("/static/sounds/alarm.mp3"),

    // === Initialization ===
    init: function () {
        this.loadSettingsFromStorage();
        this.setSettings();
        this.resetTimer();
        this.bindEvents();

        const session = sessionStorage.getItem("pomopals-session");
        if (session) {
            this.loadSession(session);
        }

        // this.alarmSound.load = true;
    },

    // === Events ===
    bindEvents: function () {
        // Start Button Click
        this.startButton.addEventListener("click", () => {
            this.playButtonSound();
            this.toggleTimer();
        });
        // Keyboard Shortcuts
        document.addEventListener("keydown", (e) => {
            // Space bar
            if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.startButton.click();
            }
        });
        // Skip Button Click
        this.skipButton.addEventListener("click", () => {
            this.isSkipped = true;
            this.buttonSound.play();
            this.handleTimerEnd();
            this.updateMessage();
            this.updateStartButtonState();
            this.saveSession();
        });
        // Timer buttons Click
        this.timerButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                this.changeTimerMode(btn);
                this.playButtonSound();
                this.saveSession();
            });
        });


        // Settings button Click
        this.settingsButton.addEventListener("click", () => {
            this.openSettings();
            this.showOverlay();
        });
        // Overlay clicks
        this.overlay.addEventListener("click", () => {
            this.closeSettings();
            this.settingsForm.reset();
            this.hideOverlay();
        });
        // Close settings Click
        this.settingsModal.querySelector("#settings-modal-close").addEventListener("click", () => {
            this.closeSettings();
            this.hideOverlay();
            this.settingsForm.reset();
        });
        // On submit of settings form
        this.settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.updateSettings();
            this.closeSettings();
            this.hideOverlay();
        });
        // Reset button Click
        this.resetButton.addEventListener("click", () => {
            this.resetSettings();
        });


        // Stats button Click
        this.statsButton.addEventListener("click", () => {
            alert("To be implemented...");
        });


        // Profile button Click
        this.profileButton.addEventListener("click", () => {
            modalManager.openModal("profile-sidebar");
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
        this.updateStartButtonState();

        this.setConfiguredTime();

        this.remainingTime = this.configuredTime;
        this.displayTime.innerText = this.calculateTime(this.remainingTime);
        this.toggleSkipButton();
        this.updateProgressBar();
        this.updateMessage();
        this.updateTitle();
    },

    setConfiguredTime: function () {
        if (this.timerButtonActive === "Pomodoro")
            this.configuredTime = this.pomodoroTime
        else if (this.timerButtonActive === "Short Break")
            this.configuredTime = this.shortBreakTime
        else if (this.timerButtonActive === "Long Break")
            this.configuredTime = this.longBreakTime
    },

    toggleTimer: function () {
        this.startButtonText.innerText = this.startButtonText.innerText === "Start" ? "Pause" : "Start";
        this.updateStartButtonState();
        this.updateTitle();
        this.toggleSkipButton();
        // Start the timer if its paused.
        if (this.isPaused) {
            this.timer = setInterval(() => {
                if (this.remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.startAlarm();
                    this.handleTimerEnd();
                }
                else {
                    this.remainingTime--;
                    this.updateTitle();
                    this.displayTime.innerText = this.calculateTime(this.remainingTime);
                }
                this.updateProgressBar();
                this.saveSession();
            }, 1000);
            this.isPaused = false
        }
        // Stop the timer if its running.
        else {
            clearInterval(this.timer);
            this.timer = null;
            this.isPaused = true;
        }
        this.saveSession();
    },

    changeTimerMode: function (button) {
        this.timerButtonActive = button.textContent.trim();
        this.updateTimerButtonStates();
        this.resetTimer();
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

    updateStartButtonState: function () {
        if (this.startButtonText.innerText === "Start") {
            this.startButton.querySelector("span").classList.remove("pressed");
        }
        else {
            this.startButton.querySelector("span").classList.add("pressed");
        }
    },

    handleTimerEnd: function () {
        if (this.timerButtonActive === "Pomodoro") {
            // Only counts as a pomodoro if atleast 60% completed
            if ((this.pomodoroTime - this.remainingTime) >= this.pomodoroTime * 0.60)
                this.pomodoroCount++;

            // Change to long break
            if (this.pomodoroCount % this.longBreakInterval === 0 && this.pomodoroCount != 0) {
                this.timerButtonActive = "Long Break";
                document.title = "Take a long break!";
                alert("Good job! Time for a long break.");
            }
            // Change to short break
            else {
                this.timerButtonActive = "Short Break";
                document.title = "Take a break!";
                alert("Good job! Take a short break.");
            }

            // Record stats
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
            // Record stats
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

            this.timerButtonActive = "Pomodoro";
            document.title = "Time to focus!";
            alert("Break over! Time to focus.");
        }
        
        this.isSkipped = false;
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

    updateMessage: function () {
        if (this.timerButtonActive === "Pomodoro")
            this.message = "Time to Focus!"
        else if (this.timerButtonActive === "Short Break")
            this.message = "Take a break!"
        else if (this.timerButtonActive === "Long Break")
            this.message = "Take a long break!"

        this.displayPomodoroCount.innerText = `#${this.pomodoroCount + 1} - ${this.message}`;
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
    },

    hideOverlay: function () {
        this.overlay.classList.add("hidden");
     },

    showOverlay: function () {
        this.overlay.classList.remove("hidden");
     },

    updateTitle: function () {
        if (this.remainingTime != this.configuredTime) {
            document.title = `${this.calculateTime(this.remainingTime)} - PomoPals`;
        }
        else {
            document.title = `PomoPals`;
        }
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

        const getValidatedInt = (selector, minValue, fallbackValue) => {
            const value = parseInt(this.settingsForm.querySelector(selector).value, 10);
            return Number.isInteger(value) && value >= minValue ? value : fallbackValue;
        };

        const getValidatedBool = (selector) => {
            const checkbox = this.settingsForm.querySelector(selector);
            return checkbox && typeof checkbox.checked === "boolean" ? checkbox.checked : false;
        };
        // REMINDER: Removed min for testing
        const settings = {
            version: 1,
            pomodoro: getValidatedInt("#pomodoro", 1, 25),
            shortBreak: getValidatedInt("#short-break", 1, 5),
            longBreak: getValidatedInt("#long-break", 1, 15),
            longBreakInterval: getValidatedInt("#long-break-interval", 4, 4),
            soundEffects: getValidatedBool("#sound-effects")
        };
        
        localStorage.setItem("pomopals-settings", JSON.stringify(settings));
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
            
            // Set the default values
            this.settingsForm.querySelector("#pomodoro").defaultValue = pomodoro;
            this.settingsForm.querySelector("#short-break").defaultValue = shortBreak;
            this.settingsForm.querySelector("#long-break").defaultValue = longBreak;
            this.settingsForm.querySelector("#long-break-interval").defaultValue = longBreakInterval;
            this.settingsForm.querySelector("#sound-effects").defaultChecked = soundEffects;
        }
    },
    
    resetSettings: function () {
        this.settingsForm.querySelector("#pomodoro").value = 25;
        this.settingsForm.querySelector("#short-break").value = 5;
        this.settingsForm.querySelector("#long-break").value = 15;
        this.settingsForm.querySelector("#long-break-interval").value = 4;
        this.settingsForm.querySelector("#sound-effects").checked = true;
    },

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
            this.displayTime.innerText = this.calculateTime(this.remainingTime);
            this.updateProgressBar();
            this.updateMessage();
            this.updateTitle();

            // Force stop so that timer does not start
            this.isPaused = true;
            this.startButtonText.innerText = "Start";
            this.updateTimerButtonStates();
        }

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

};

 const statsManager = {
    getStats: function () {
        const stats = localStorage.getItem("pomopals-stats");

        // If there is a record return it, else return default.
        if (stats) {
            return JSON.parse(stats);
        }
        else {
            const today = getToday();
            return { 
                username: "Guest", 
                totalPomodoros: 0,
                totalFocusMinutes: 0,
                totalBreakMinutes: 0, 
                sessionsCompleted: [], 
                dailyStreak: 0, 
                lastActiveDate: null, 
                longestStreak: 0, 
                firstUsedDate: today
            };
        }
    },

    saveStats: function(stats) {
        localStorage.setItem("pomopals-stats", JSON.stringify(stats));
    },

    recordPomodoro: function(pomodoroFullTime = 25, pomodoroTimeMinutes = 25, breakTimeMinutes = 5, longBreakTimeMinutes = 15) {
        const stats = this.getStats();
        const today = getToday();

        if (
            pomodoroTimeMinutes >= (pomodoroFullTime * 0.60)
            && pomodoroFullTime > 0
            && pomodoroTimeMinutes > 0
        ) {
            stats.totalPomodoros += 1;
        }
        
        stats.totalFocusMinutes += pomodoroFullTime;
        stats.totalBreakMinutes += (breakTimeMinutes + longBreakTimeMinutes);
        
        // Update today's session or create a new one.
        let session = stats.sessionsCompleted.find(s => s.date === today);
        if(session) {
            // Only count when finished 60% of configured time.
            if (
                pomodoroTimeMinutes >= (pomodoroFullTime * 0.60)
                && pomodoroFullTime > 0
                && pomodoroTimeMinutes > 0
            ) {
                session.pomodoros += 1;
            }

            session.focusMinutes += pomodoroTimeMinutes;
            session.breakMinutes += (breakTimeMinutes + longBreakTimeMinutes);
        }
        else {
            stats.sessionsCompleted.push({
                date: today,
                pomodoros: pomodoroTimeMinutes >= (pomodoroFullTime * 0.60) ? 1 : 0,
                focusMinutes: pomodoroTimeMinutes,
                breakMinutes: breakTimeMinutes + longBreakTimeMinutes
            });
        }

        // Update streak
        this.updateStreak(stats, today);

        stats.lastActiveDate = today;
        this.saveStats(stats);
    },

    updateStreak: function (stats, today) {
        // Convert the today to timestamp and then subtract a whole day.
        const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().slice(0, 10);

        // Already updated.
        if (stats.lastActiveDate === today) {
            return;
        }

        // Updates the daily streak or reset it.
        if (stats.lastActiveDate === yesterday) {
            stats.dailyStreak += 1;
        }
        else {
            stats.dailyStreak = 1;
        }

        // Update the longest streak if needed.
        if (stats.dailyStreak > stats.longestStreak) {
            stats.longestStreak = stats.dailyStreak;
        }
    },

    updateUsername(newName) {
        const stats = this.getStats();
        stats.username = newName;
        this.saveStats(stats);
    }


 };

 function getToday() {
    // Returns date in this format YYYY-MM-DD
    return new Date().toISOString().slice(0, 10);
 };

document.addEventListener('DOMContentLoaded', () => PomodoroApp.init());