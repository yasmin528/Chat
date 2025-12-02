# Chat

A **full-stack real-time chat application** built with **Angular** (frontend) and **.NET Core + SignalR** (backend) with **JWT authentication**, **Identity**, **SQLite database**, and styled using **Tailwind CSS**.  

The app supports user authentication, real-time messaging, online presence, typing indicators, and a clean separation of frontend and backend code.

---

## 📌 Table of Contents

- [Project Structure](#project-structure)  
- [Technologies](#technologies)  
- [Features](#features)  
- [Screenshots](#screenshots)  
- [Getting Started](#getting-started)  
- [Setup & Run](#setup--run)  

---

## 📁 Project Structure

Chat/
├── API/                     ← .NET Core Web API backend
│   ├── Common/              ← Shared helper classes (e.g., Response.cs)
│   ├── Data/                ← AppDbContext & Identity models
│   ├── DTOs/                ← Data Transfer Objects for API requests/responses
│   ├── EndPoints/           ← API endpoints (e.g., Account)
│   ├── Extensions/          ← Extension methods (e.g., ClaimsPrincipal extensions)
│   ├── Hubs/                ← SignalR ChatHub for real-time messaging
│   ├── Migrations/          ← Entity Framework Core migrations
│   ├── Models/              ← Entity models (e.g., AppUser, Message)
│   ├── Services/            ← Services (e.g., TokenService, FileUpload)
│   ├── wwwroot/             ← Static files (e.g., uploaded images)
│   ├── Program.cs           ← Entry point of the backend
│   ├── appsettings.json     ← Configuration file
│   └── API.csproj           ← Project file
└── Client/                   ← Angular frontend with Tailwind CSS
    ├── src/
    │   ├── app/             ← Angular components, services, modules
    │   ├── assets/          ← Images, icons, screenshots
    │   └── styles/          ← Tailwind CSS styles
    ├── angular.json         ← Angular configuration
    └── package.json         ← Frontend dependencies


---

## 🛠️ Technologies

| Layer           | Technology / Framework                           |
|-----------------|-------------------------------------------------|
| Frontend        | Angular, Tailwind CSS                           |
| Backend         | .NET Core Web API, SignalR, C#                 |
| Database        | SQLite (via Entity Framework Core)             |
| Real-time       | SignalR                                        |
| Authentication  | JWT, Microsoft Identity                        |

---

## ✅ Features

- **User Authentication**: Register, Login with JWT tokens and Identity  
- **Real-time Chat**: Messages sent and received instantly via SignalR  
- **Online Users List**: Shows which users are currently online  
- **Typing Indicators**: Displays when a user is typing  
- **Message History**: Messages stored in SQLite and loaded on login  
- **Frontend Styling**: Tailwind CSS for responsive design  
- **Clean Architecture**: Separation of concerns between frontend and backend

---

## 🖼️ Screenshots

> Replace with your actual screenshots for better presentation:

![Login Screen](./Client/src/assets/screenshots/login.png)  
![Chat Interface](./Client/src/assets/screenshots/chat.png)  

---

## 🚀 Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/)  
- [Node.js & npm](https://nodejs.org/)  
- Angular CLI (`npm install -g @angular/cli`)  

---

### Setup & Run

1. **Clone the repository**

```bash
git clone https://github.com/yasmin528/Chat.git
cd Chat
