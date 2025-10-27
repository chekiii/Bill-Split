# 🧾 Smart Bill Splitter

A **no-login web app** that scans restaurant bills using **OCR** and lets users select what they ate to calculate their **exact personal share** — including optional **tax and tip**. Built with **React** and deployed on **Vercel**.

---

### 🚀 Live Demo
🔗 [https://bill-snap.vercel.app](https://bill-split-henna.vercel.app/)

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Features](#-features)
- [User Flow](#-user-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Deployment (Vercel)](#-deployment-vercel)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 💡 About the Project
When friends eat out together and one person pays the total bill, it’s often difficult to remember what each person ordered.  
**Smart Bill Splitter** solves this by allowing users to:
- Scan a photo of the receipt.
- Automatically generate a digital, editable menu.
- Let each person select the dishes they ate and quantities.
- Calculate each person’s share precisely, including (or excluding) tax and tip.

No signup. No accounts. Just open, scan, split, and share.

---

## ✨ Features
✅ **OCR Scanning** – Uses Tesseract.js to extract text from receipt images.  
✅ **Editable Menu** – Users can fix OCR mistakes or add missing items.  
✅ **Smart Quantity Tracking** – Prevents selecting more items than available.  
✅ **Optional Tax & Tip** – Choose whether to include taxes in the split.  
✅ **Unique Session Links** – Share editable bill sessions via link or QR code.  
✅ **No Login Required** – Lightweight and privacy-friendly.  
✅ **Mobile-First UI** – Fully responsive, clean interface built for small screens.

---

## 👣 User Flow

### 🧍‍♂️ The Payer
1. Opens the website and uploads a photo of the bill.  
2. OCR converts it into an editable list of dishes.  
3. Adds tax/tip manually (optional).  
4. Generates a shareable session link + QR code.  
5. Sends the link to friends.

### 👩‍💻 The Friends (Reimbursers)
1. Open the shared link.  
2. Enter their name.  
3. Select what they ate (and quantity).  
4. View their personal total — instantly calculated.  
5. Send payment to the payer via any payment app.

---

## 🧠 Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend | React (Vite or CRA) |
| Styling | CSS Modules |
| OCR Engine | Tesseract.js |
| Hosting | Vercel |
| (Optional) Realtime Sync | Firebase / Vercel KV |
| Version Control | Git + GitHub |

---

## 🧩 Project Structure

```
bill-snap-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   └── ocrService.js
│   ├── components/
│   │   ├── BillUpload.jsx
│   │   ├── ScanProcessor.jsx
│   │   ├── MenuEditor.jsx
│   │   ├── MemberSelectionMenu.jsx
│   │   ├── ShareSession.jsx
│   │   ├── ResultSummary.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       └── Spinner.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── App.module.css
├── package.json
└── vite.config.js
```

---

## ⚙️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/smart-bill-splitter.git
   cd smart-bill-splitter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment (Vercel)

1. Push your project to GitHub.
2. Visit [https://vercel.com/new](https://vercel.com/new).
3. Import your GitHub repo.
4. Build Command → `npm run build`  
   Output Directory → `build`
5. Click **Deploy** 🚀

---

## 🔮 Future Enhancements
- Live session syncing (multiple users editing together).
- Auto-detect tax/tip from OCR.
- Currency conversion & multi-currency support.
- Export receipts as PDF or image.
- Dark mode theme.

---

### ❤️ Author
**@SeeGyeltshen**  
Frontend Developer & Product Designer  
> Building smart, no-login tools for daily life.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
