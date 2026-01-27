# AsientoMatic - Exam Seat Automation System

> **AsientoMatic** automates exam seat allocation for JYOTHI ENGINEERING COLLEGE (AUTONOMOUS), streamlining the process of assigning students to exam halls based on department, subjects, and available classrooms.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Core Modules](#core-modules)
- [Firebase Collections](#firebase-collections)
- [Contributing](#contributing)

---

## 🎯 Overview

**AsientoMatic** is a comprehensive web application designed to automate the exam seating arrangement process for educational institutions. It handles complex seat allocation algorithms, manages student data, tracks exam schedules, and generates printable reports for exam halls, attendance sheets, and department-wise notices.

### Key Capabilities
- Automated seat allocation using intelligent algorithms
- Multi-department and multi-slot exam management
- Real-time Firebase integration for data persistence
- Excel file upload for bulk data import
- Printable attendance sheets and classroom layouts
- Academic year management with automatic data migration

---

## ✨ Features

### 🔐 Authentication
- Firebase-based email/password authentication
- Protected routes for authorized access only
- User registration and login system

### 📊 Batch Management
- Add and edit department batch details
- Configure regular and lateral entry students
- Manage dropped and rejoined students
- Set starting roll numbers per department

### 📅 Slot & Subject Management
- Upload subjects via Excel files
- Automatic exam slot extraction from subject data
- Edit and manage exam slots
- Date and time scheduling for exams

### 🏛️ Exam Hall Configuration
- Upload exam hall capacities via Excel
- Automatic classroom capacity calculation
- Dynamic row and column allocation
- Support for different hall layouts

### 🪑 Intelligent Seat Allocation
- Automated seat assignment algorithm
- Prevents adjacent students with same subject code
- Handles dropped students and rejoined students
- Supports lateral entry students
- Generates multiple views: classroom, notice board, department-wise, attendance

### 📄 Print Features
- **Classroom View**: Seat-wise student allocation with bench labels
- **Notice Board**: Hall-wise student ranges
- **Department View**: Department-wise hall allocation for teachers
- **Attendance Sheets**: Sorted student lists per hall and department

### 🗓️ Academic Year Management
- Change academic year with automatic data migration
- Updates all year-based departments automatically
- Preserves exam schedules across year transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19.1.0** | Frontend framework |
| **Vite 6.2.3** | Build tool and dev server |
| **Firebase 11.5.0** | Authentication and Firestore database |
| **Ant Design 5.24.5** | UI component library |
| **React Router 7.4.1** | Client-side routing |
| **Lodash 4.17.21** | Utility functions for algorithms |
| **XLSX (SheetJS)** | Excel file parsing |
| **Day.js 1.11.13** | Date manipulation |
| **Swiper 11.2.6** | Carousel components |

## 🚀 Installation

### Prerequisites
- Node.js 16+ and pnpm
- Firebase project with Firestore and Authentication enabled

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exam-seat
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Firebase** (see [Configuration](#configuration))

4. **Start development server**
   ```bash
   pnpm run dev
   ```
   The app will open at `http://localhost:3000`

5. **Build for production**
   ```bash
   pnpm run build
   ```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_ID=your_firebase_app_id
```

> **Note**: Get these values from your Firebase project settings → General → Your apps → Web app

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore database** with the following collections:
   - `users` - User accounts
   - `DeptDetails` - Department configurations
   - `Subjects` - Subject information
   - `AllExams` - Exam slots and schedules
   - `Classes` - Classroom capacities
   - `AllocatedSeats` - Saved seat allocations

---

## 💻 Usage

### 1. First-Time Setup

1. **Register/Login**: Access the login page and create an admin account
2. **Upload Subjects**: Navigate to Subjects → Upload Excel file with subject data
3. **Upload Exam Halls**: Go to Exam Halls → Upload Excel with classroom capacities
4. **Configure Batches**: Open Batches → Add department-wise student details

### 2. Allocating Seats

1. **Select Slot**: On the home page, choose an exam slot from dropdown
2. **Auto-Allocation**: System automatically allocates seats based on algorithm
3. **View Results**: Check Notice Board, Department View, or Classroom View
4. **Print**: Navigate to Print page → Select desired format → Print

### 3. Managing Data

- **Edit Batches**: Modify student strengths, dropped students, rejoined students
- **Edit Slots**: Change exam dates, add/remove subjects from slots
- **Change Academic Year**: Update year in settings (migrates all department data)

---

## 🧩 Core Modules

### 🔑 Authentication (`LoginForm.jsx`, `firebaseConfig.js`)
- Uses Firebase Authentication for login/register
- Protected routes redirect unauthenticated users to `/login`
- User data stored in `localStorage` and Firebase `users` collection

### 📦 State Management (`AppContext.jsx`)
- Centralized app state using React Context API
- Manages: user, batches, slots, subjects, exam halls, allocated data
- Provides methods for Firebase CRUD operations
- Reducer pattern for state updates

### 🎲 Seat Allocation Algorithm (`seatAllocator.js`)

**Core Function**: `test(classCapacity, deptStrength, letStrength, exams, drop, rejoin, examToday, deptStart, savedClasses, savedData)`

**Algorithm Steps**:

1. **Data Preparation**
   - Filters exams for selected slot
   - Merges exam schedules for departments with common subjects
   - Updates department strengths (regular + lateral + rejoined)

2. **Department Grouping**
   - Groups departments by shared exam subjects
   - Sorts by department strength
   - Uses optimizer to balance even/odd bench allocation

3. **Seat Assignment** (`seatArr` function)
   - Iterates through classes, benches (alternating even/odd), and rows
   - Assigns roll numbers in sequence
   - Skips dropped students
   - Places rejoined students at designated positions
   - Generates formatted roll numbers (e.g., `JEC24CS001`, `LJEC24EC015`)

4. **Output Generation**
   - **Notice Board View**: Hall → roll number ranges → student counts
   - **Department View**: Department → halls → roll numbers → counts
   - **Classroom View**: Bench labels (A1, B1, A2...) → roll numbers
   - **Attendance View**: Department + Hall → sorted roll numbers

**Key Features**:
- Prevents adjacent seating of same department
- Handles complex scenarios: dropped, rejoined, lateral entry, supplementary
- Supports variable classroom layouts (rows × columns)
- Persists allocation to Firebase for reuse

### 📤 File Upload (`UploadSubFile`, `uploadExamhallFile`)

**Subjects Upload**:
- Accepts Excel with columns: DEPT, SEM, SLOT, COURSE CODE, COURSE NAME, L, T, P, HOURS, CREDIT
- Validates headers
- Uploads to `Subjects` collection
- Extracts slots automatically

**Exam Halls Upload**:
- Accepts Excel with columns: Semester, Classroom, No:of desks, Department
- Calculates optimal row/column layout
- Uploads to `Classes` collection

### 🖨️ Print Components
- `PrintNotice.jsx` - Generates notice board PDF view
- `PrintClass.jsx` - Classroom seating chart with bench labels
- `PrintDept.jsx` - Department-wise hall allocation
- `PrintAttendance.jsx` - Attendance sheets with roll numbers

---

## 🗄️ Firebase Collections

### `users`
```js
{
  userId: {
    username: "Admin",
    email: "admin@example.com"
  }
}
```

### `DeptDetails`
```js
{
  AcademicYear: { academicYear: 2024 },
  Exams: { "24CS": ["MATH101", "PHY102"], ... },
  ExamsCopy: { "24CS": ["MATH101", "PHY102"], ... },
  RegularStrength: { "24CS": 60, "24EC": 50, ... },
  LetStrength: { "24CS": 10, "24EC": 5, ... },
  Dropped: { "24CS": ["JEC24CS015", "JEC24CS032"], ... },
  Rejoined: { "24CS": ["JEC24CS005", "JEC24CS018"], ... },
  StartingRollNo: { "24CS": 1, "24EC": 1, ... }
}
```

### `Subjects`
```js
{
  "S3_CS_MATH301": {
    DEPT: "COMPUTER SCIENCE",
    SEM: "S3",
    SLOT: "A, B",
    "COURSE CODE": "MATH301",
    "COURSE NAME": "Discrete Mathematics",
    L: "3", T: "1", P: "0",
    HOURS: "4", CREDIT: "4"
  }
}
```

### `AllExams`
```js
{
  Slots: {
    A: ["MATH101", "PHY102"],
    B: ["CHEM101", "ENG102"]
  },
  EditedSlots: { ... }, // Same as Slots, but editable
  DateTime: {
    A: ["2024-05-01T09:00:00", "2024-05-01T12:00:00"],
    B: ["2024-05-02T09:00:00", "2024-05-02T12:00:00"]
  }
}
```

### `Classes`
```js
{
  UploadedClasses: {
    "EAB101": [30, 2], // [rows, columns]
    "WAB201": [25, 2]
  },
  AvailableClasses: { ... }, // Initially same as UploadedClasses
  AllotedClasses: { ... } // Updated as halls are allocated
}
```

### `AllocatedSeats`
```js
{
  "SLOT_A": {
    classes: [[[row1], [row2]], [[row1], [row2]]], // 2D arrays per class
    data: [["24CS", 60], ["DUM", 0], ["24EC", 50]], // Department allocation order
    classNames: ["EAB101", "WAB201"],
    deptView: [...],
    noticeBoardView: [...],
    attendanceView: [...],
    selectedSlotName: "A",
    dateTime: "2024-05-01 09:00 AM"
  }
}
```

---

## 📝 Key Files Documentation

### `src/App.jsx`
Main application component defining routes:
- `/login` - Login page
- `/` - Protected dashboard with nested routes:
  - `/` (index) - Home dashboard
  - `/slots` - Slot management
  - `/batches` - Batch management
  - `/subjects` - Subject management
  - `/exam-halls` - Exam hall configuration
  - `/addform` - Add new data
  - `/editform` - Edit existing data
- `/print` - Print page (outside dashboard layout)
- `/developer-credits` - Developer information
- `/*` - 404 fallback

### `src/context/AppContext.jsx`
Provides global state and methods:

**State**: user, classCapacity, deptStrength, letStrength, exams, drop, rejoin, slots, examToday, allocated views, academicYear

**Methods**:
- `setupUser(user, endpoint)` - Login/register
- `logoutUser()` - Clear session
- `batchesForm(depts)` - Save batch data to Firebase
- `fetchBatches(academicYear)` - Get batch data
- `uploadSubFile(workbook)` - Upload subjects Excel
- `uploadExamhallFile(workbook)` - Upload exam halls Excel
- `fetchSubjects()` - Get all subjects
- `fetchSlots()` - Get exam slots
- `slotsForm(slots)` - Save slot configurations
- `fetchExamData(exams, slot)` - Load slot data and allocate seats
- `setAllocatedData(data, slot)` - Save allocation to Firebase
- `updateAcademicYear(year)` - Migrate data to new academic year

### `src/utils/seatAllocator.js`
Contains the `test()` function - the heart of the seat allocation algorithm. Returns array:
```js
[noticeBoardView, deptView, classroomView, attendanceView, classNames, classes, data]
```

**Helper Functions**:
- `mergeExamSchedules()` - Combines departments with common exams
- `updateDeptStrength()` - Adds lateral and rejoined students
- `dataArrayMaker()` - Creates allocation sequence
- `optimizer()` - Balances even/odd bench distribution
- `seatArr()` - Core seat assignment logic
- `consolidateItems()` - Groups roll numbers into ranges
- `calculateCounts()` - Computes student counts per range
- `organizeByDept()` - Creates department-wise view
- `classroomViewMaker()` - Adds bench labels (A1, B1, A2...)
- `attendanceSheet()` - Generates attendance lists

### `src/components/TodayExam.jsx`
Slot selector dropdown component:
- Fetches available slots on mount
- `checkSlot()` - Checks if allocation exists for selected slot
- `submitSlot()` - Fetches exam data and triggers allocation
- Shows modal if allocation exists (overwrite confirmation)
- Displays exam list in collapsible panel

### `src/components/BatchesTable.jsx`
Displays and manages batch data:
- Fetches batches on academic year change
- Editable table with inline editing
- Fields: Department, Regular Strength, Lateral Strength, Exams, Drop, Rejoin, Start Roll No
- Save button triggers `batchesForm()`

### `src/pages/Login.jsx`
Login page layout:
- Left side: Vector graphic + tagline
- Right side: LoginForm component
- Footer with developer credits link

### `src/pages/dashboard/Home.jsx`
Main dashboard:
- `TodayExam` slot selector at top
- Loading spinner during allocation
- Shows alert if no slot selected
- Displays `NoticeTable` and `DepartmentTable` when data available

### `src/pages/dashboard/PrintData.jsx`
Print view selector:
- Tabs for: Notice Board, Department View, Classroom View, Attendance
- Each tab renders corresponding print component
- Uses `window.print()` for printing

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is developed for JYOTHI ENGINEERING COLLEGE (AUTONOMOUS).

---

## 👨‍💻 Developer Credits

Visit `/developer-credits` in the app to see the development team.

---

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Supply exam feature is commented out (needs implementation)
- No support for multiple exam halls per slot (single allocation only)
- Manual Excel format required (no template generator)

### Planned Features
- [ ] Supplementary exam support


---

## 📞 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for JYOTHI ENGINEERING COLLEGE (AUTONOMOUS)**