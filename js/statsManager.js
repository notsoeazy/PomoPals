export const statsManager = {
    getStats: function () {
        const stats = localStorage.getItem("pomopals-stats");

        // If there is a record return it, else return default.
        if (stats) {
            return JSON.parse(stats);
        }
        else {
            const today = this.getToday();
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

    saveStats: function (stats) {
        localStorage.setItem("pomopals-stats", JSON.stringify(stats));
    },

    recordPomodoro: function (pomodoroFullTime = 25, pomodoroTimeMinutes = 25, breakTimeMinutes = 5, longBreakTimeMinutes = 15) {
        const stats = this.getStats();
        const today = this.getToday();

        if (
            pomodoroTimeMinutes >= (pomodoroFullTime * 0.60)
            && pomodoroFullTime > 0
            && pomodoroTimeMinutes > 0
        ) {
            stats.totalPomodoros += 1;
        }

        stats.totalFocusMinutes += pomodoroTimeMinutes;
        stats.totalBreakMinutes += (breakTimeMinutes + longBreakTimeMinutes);

        // Update today's session or create a new one.
        let session = stats.sessionsCompleted.find(s => s.date === today);
        if (session) {
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
                pomodoros: (pomodoroTimeMinutes >= (pomodoroFullTime * 0.60)) && (pomodoroFullTime > 0) && (pomodoroTimeMinutes > 0) ? 1 : 0,
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
    },

    getToday: function() {
        // Returns date in this format YYYY-MM-DD
        return new Date().toISOString().slice(0, 10);
    }
};