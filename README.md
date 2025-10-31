# 🎨 ComplyFormAI – React Frontend
A modern React TypeScript frontend for managing and validating construction bids with MBE compliance.

## 🚀 Installation & Setup Guide

### 1️⃣ Install Dependencies

Open your terminal (or VS Code terminal) and navigate to your project:

`npm install axios react-router-dom lucide-react

npm install -D tailwindcss postcss autoprefixer`

### Verify Backend is Running

Backend should be running at: http://localhost:8000

### Start Frontend Development Server

npm start

## 🎯 Features & Pages

### 🏠 Home Page (/)

View all your bids
Quick overview of bid details
Click to navigate to bid details
Create new bid button

### ➕ Create Bid Page (/create-bid)

Select organization
Enter solicitation number
Set total amount
Define MBE goal percentage
Automatic redirect to bid details after creation

### 📋 Bid Detail Page (/bid/:id)

View bid summary and statistics
Real-time MBE percentage calculation
Add subcontractors with work details
Search and filter subcontractors
Remove subcontractors
Run compliance validation
View validation results with color-coded status

## 🔌 API Integration

The frontend connects to the FastAPI backend at http://localhost:8000/api/v1

### Available Endpoints:

#### Organizations

GET /organizations/ - List all organizations
POST /organizations/ - Create new organization

#### Subcontractors

GET /subcontractors/ - List all subcontractors
GET /subcontractors/search - Search subcontractors
GET /subcontractors/{id} - Get subcontractor details

#### Bids

GET /bids/ - List all bids
POST /bids/ - Create new bid
GET /bids/{id} - Get bid with all details
POST /bids/{id}/subcontractors - Add subcontractor to bid
DELETE /bids/{id}/subcontractors/{bid_sub_id} - Remove subcontractor
GET /bids/{id}/validate - Run validation on bid

## 🎨 UI Components

### BidForm
Create new bids with organization selection, solicitation details, and MBE goals.

### SubcontractorForm

Search existing subcontractors
Select from dropdown
Enter work description
Specify NAICS code
Set subcontract value
Toggle MBE participation

### SubcontractorList

Display all subcontractors in a bid
Show certification status
MBE indicators
Remove functionality
Value and NAICS display

### ValidationDashboard

Run validation checks
Overall status summary
Individual rule results
Color-coded pass/fail/warning indicators
Detailed error messages

## 📱 Browser Compatibility
Tested and working on:

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

## 🧰 Tech Stack

Frontend Framework: React 18 with TypeScript
Styling: Tailwind CSS
Routing: React Router v6
HTTP Client: Axios
Icons: Lucide React
State Management: React Hooks (useState, useEffect)
Build Tool: Create React App

## 📝 Key Features
✅ Type-Safe Development - Full TypeScript support
✅ Real-time Validation - Instant MBE compliance checks
✅ Responsive Design - Works on desktop and mobile
✅ Modern UI - Clean interface with Tailwind CSS
✅ Search & Filter - Easy subcontractor discovery
✅ Error Handling - Comprehensive error messages
✅ Loading States - Visual feedback for all actions
✅ Form Validation - Client-side input validation

## 🤝 Integration with Backend
Ensure your backend is configured properly:

Database: PostgreSQL running with seed data
Backend Server: FastAPI running on port 8000
CORS: Properly configured for http://localhost:3000
API Endpoints: All routes accessible at /api/v1

## 📚 Next Steps
After successful setup:

✅ Create a test bid
✅ Add multiple subcontractors
✅ Run validations
✅ Test error scenarios
✅ Explore all features