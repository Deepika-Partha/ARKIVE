# ARKIVE

ARKIVE is a digital backpack for students, offering centralized access to digital textbooks, planners, notes, and productivity tools.

## 🚀 Features

- TBD

## 🛠️ Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Deepika-Partha/ARKIVE.git
   cd ARKIVE
   
2. **Install dependencies:**

   ```bash
   npm install
   npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction
   npm install --save-dev @types/fullcalendar
   npm install mammoth
   npm install docx
   npm install pdfjs-dist

---FOR DATABASE (login/register/logout) AND UNIT TESTS---
   npm install --save-dev jest supertest
   npm install express
   npm install dotenv
   npm install mongoose
   npm install bcrypt
   npm install jsonwebtoken

3. **Run the development server:**

   ```bash
   npm run dev
   #in a seperate terminal
   node server/index.js


4. **Connect to github:**

   ```bash
   git init
   git remote add origin https://github.com/Deepika-Partha/ARKIVE.git
   
--- TESTS ---
npm install --save-dev jest ts-jest @types/jest svelte-jester @testing-library/svelte @testing-library/jest-dom jest-environment-jsdom
npx jest
npx jest --coverage

--- For Database tests ---
node --experimental-vm-modules ./node_modules/jest/bin/jest.js server/routes/auth.test.js --coverage