# TrickDesk 🃏

A real-time, peer-to-peer multiplayer trick-taking card game web application built with **Next.js (React)**, **WebRTC (PeerJS)**, **Tailwind CSS**, and **DnD Kit**.

TrickDesk acts as a digital sandbox where physical playing cards are replaced by digital ones, while the **Host** retains the authoritative dealer controls of a real-life card table.

---

## 🌟 Key Architecture & Highlights

- **Serverless & Database-Free:** Powered entirely by WebRTC peer-to-peer data channels via PeerJS. The authoritative game state lives in the Host browser and broadcasts seamlessly to connected players.
- **Deep Persistence:** Fully synchronized with `localStorage`. If a player or the Host refreshes or experiences an internet drop, TrickDesk rebuilds room state and automatically reconnects players to their exact spot in the game.
- **Pixel-Perfect Vector Cards:** Pure SVG vector suits and responsive layout constraints ensure numbers, court symbols, and suits never clip, misalign, or break card borders on any mobile or desktop screen.
- **Mobile-First & Clutter-Free:** Designed with large tap targets and a minimalist, distraction-free neutral aesthetic.

---

## 🕹️ Game Features & Mechanics

### 1. Room Creation, Lobby & Strict Locking
- **Roles:** The creator is the **Host** (who actively plays). Other participants join as **Players** via unique room code or shareable direct link.
- **Strict Locking:** The Host **must lock** the room before rounds can begin. Once locked, no new players can join mid-round, preserving game integrity.

### 2. Deck Setup, Dealing & Discard Phase
- **Multi-Deck Pool:** Host chooses between 1 to 4 standard 52-card decks (up to 208 cards) shuffled together with Fisher-Yates randomization into a master pool.
- **Capacity Restrictions:** Automatic UI validation prevents dealing more cards than available in the pool.
- **Discard Phase:** Host can deal surplus cards. Players inspect their hands, select cards to discard/remove from the round, and confirm their hand.

### 3. "Your Hand" Views & Drag-and-Drop
- **Two View Modes:**
  - **Segregated:** Full horizontal spread of cards.
  - **Stacked / Fanned:** Overlapping cards with top-left rank and suit clearly visible.
- **Manual Organize Mode:** Tap the "Organize" button to trigger a continuous card "jiggle" effect indicating sorting mode is active.
- **DnD Micro-Interactions:**
  - Active card scales up by 5% (`scale(1.05)`) with a deep drop shadow.
  - Inactive cards dim to focus player attention.
  - Haptic feedback (15ms pop on pickup, 10ms tap on crossing slots).
  - Smooth 200–300ms CSS displacement of surrounding cards with ghost placeholder.
  - Drop border flash confirmation.
  - Snackbar toast: `"Cards reordered. [Undo]"` with 1-click state reversal.
  - Accessible 3-dot option menu with "Move Left" / "Move Right" keyboard/screen-reader controls.

### 4. Gameplay Loop (Desk Tricks) & Undo Logic
- **The Desk:** Tap cards to play them to the center table with player badges.
- **Reverse Order Undo:** A player can only request undo if they were the **last** person to play a card to the desk. Undo requests require Host approval.
- **Winner Declaration:** The "Win" button overlay **only** appears after 100% of players have played their card for that trick.
- **Host Universal Undo:** Host can undo any action at any time, including mistakenly declared trick winners or errant card plays.

### 5. Round Completion & Strict Ready Gate
- **Summary:** Clean summary displaying only stacks won *in that specific round*.
- **History Modal:** Review previous round scores.
- **Strict Next Round Gate:** Host cannot proceed until 100% of players tap "Ready". All cards then return to the pool for a full reshuffle.

---

## 🚀 Getting Started

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Next.js** (Zero custom environment variables required).
