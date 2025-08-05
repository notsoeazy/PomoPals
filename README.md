# PomoPals

#### Video Demo: `<insert your video link here>`
#### Live Site: [https://notsoeazy.github.io/PomoPals/](https://notsoeazy.github.io/PomoPals/)

---

## Description

**PomoPals** is a fun, minimalist **Pomodoro timer** web app designed to help users stay productive while forming consistent habits.

Unlike a basic timer, PomoPals includes a **stat-tracking system** and is designed with a **future goal** of including **pixel pet companions** that grow as you focus — encouraging a “grow together” philosophy with your virtual buddy (to be implemented in the future).

---

## Note

The original plan was to make a Flask app and enable users to create accounts and login to track progress. Due to time constraints and limited knowledge with implementing secure account logic, I decided to make it static which also helped in deployingb the site using GitHub Pages.

In the future I plan on making it into a Flask app and add new features such as animated Pets and rewards.

---

## Features

- **Pomodoro Timer**: Switch between Focus, Short Break, and Long Break sessions.
- **Customizable Times**: Set your own durations for focus and break modes.
- **Productivity Stats**:
  - Total pomodoros completed
  - Total minutes spent focusing and resting
  - Days you've used the app
  - Longest and current streak of daily activity
- **Local Data Persistence**: Your stats are stored locally using `localStorage` (no account required) and sessions are remembered using `sessionStorage` for time accuracy.
- **Responsive Design**: Compatible on both desktop and mobile screens.
- **Sound Effects**: Built-in button sounds and timer.

---

## How It Works
- When the timer runs and completes a session, your focus or break time is recorded.
- If you skip a session, the amount of time already elapsed is still saved — but you only get credit for a full Pomodoro if you've completed at least **60%** of it.
- Your streak is calculated based on daily activity and persists across sessions.

---

## Technologies Used

- **HTML, CSS, JavaScript** (Vanilla)
- **npm** for integrating Tailwind CSS
- **Tailwind** CSS for styling
- `localStorage` API for stat persistence
- `sessionStorage` API for saving sessions
- **GitHub Pages** for deployment

---

## Future Plans

- **Dark mode** toggle and desktop/mobile notifications.
- Add **user accounts** and cloud sync (with Flask and SQLite3).
- Add a virtual **pixel pet** companion that evolves or reacts to your progress.
- Implement **reward tokens** for completed pomodoros, to spend on pet items.
- **UI Redesign**.
- Implement a built-in **to-do list app** with drag to reorder functionality.

---

## How to Use

1. Open the [live site](https://notsoeazy.github.io/PomoPals/).
2. Click the **Start** button to begin a session.
3. Use the **Settings** to customize durations.
4. You can change the timer preset by clicking the buttons **Pomodoro**, **Short Break**, **Long Break**.
5. Track your productivity stats by clicking the **Stats** tab.
6. Keep coming back daily to maintain your streak!

---

Made for CS50 as Final Project.


