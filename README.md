# Invity - Wedding Invitation Management Platform

A comprehensive, full-stack wedding invitation management platform built with Next.js, React, and Node.js. Create beautiful invitations, manage guest lists, track RSVPs, and organize your entire wedding event seamlessly.

![Project Overview](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20100858.png)

## 🎯 Overview

Invity is a modern, feature-rich platform designed to simplify wedding planning and invitation management. From creating stunning digital invitations to tracking guest responses, managing events, and analyzing engagement metrics - everything you need in one place.

![Dashboard View](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20105932.png)

## ✨ Key Features

### 🎨 **Template Creator & Editor**

A powerful Canva-style editor for creating beautiful wedding invitations:

![Template Creator](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110024.png)

- **Canvas-Based Design**: High-quality canvas rendering with Fabric.js
- **Multiple Canvas Sizes**: Support for Portrait, Square, and Landscape formats
- **Real-time Preview**: See changes instantly as you design
- **Rich Text Editing**: 14+ wedding-specific fonts with full styling options
- **Image Management**: Upload, import from URLs, or use stock image library
- **Shape Library**: Decorative shapes, wedding icons, and vector graphics
- **Layer Management**: Professional layer panel with show/hide, lock, and reorder
- **Export Options**: Export as PDF for printing or PNG for digital sharing

![Editor Features](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110116.png)

### 📋 **Project & Event Management**

![Project Management](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110125.png)

- **Multi-Project Support**: Create and manage multiple wedding projects
- **Event Organization**: Organize multiple events within each project
- **Project Settings**: Comprehensive settings for each project
- **Team Collaboration**: Invite team members with granular permission levels
- **Access Control**: Fine-grained permission system (READ, WRITE, EDIT, ADD_MEMBER, DELETE, MANAGE_ROLES, OWNER)
- **Project Analytics**: Track project performance and engagement

### 👥 **Guest List Management**

![Guest Management](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110145.png)

- **Smart Categorization**: Organize guests by categories (Family, Friends, Colleagues, etc.)
- **RSVP Tracking**: Real-time RSVP status tracking
- **Contact Management**: Store contact information, addresses, and preferences
- **Bulk Operations**: Import/export guest lists, bulk actions
- **Guest Analytics**: Track engagement, response rates, and attendance
- **Invitation Status**: Monitor sent, opened, and responded invitations

### 📧 **Smart Invitations & Tracking**

![Invitation System](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110156.png)

- **Digital Invitations**: Send beautiful, personalized digital invitations
- **Email Integration**: Automated email sending with templates
- **Open Tracking**: Track when invitations are opened
- **Response Management**: Collect and manage RSVP responses
- **Reminder System**: Automated reminders for pending responses
- **Multi-language Support**: Send invitations in multiple languages

### 🔐 **Advanced Permission System**

![Access Control](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110232.png)

- **Role-Based Access Control (RBAC)**: Multiple roles (ADMIN, USER, MODERATOR, EDITOR, etc.)
- **Resource-Action Permissions**: Granular permissions based on resources and actions
- **Project-Level Permissions**: Different access levels per project
- **Access Links**: Generate shareable access links with expiration dates
- **Team Management**: Invite and manage team members with specific permissions
- **Permission Inheritance**: Smart permission inheritance from roles

### 📊 **Analytics & Reporting**

![Analytics Dashboard](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110328.png)

- **Dashboard Analytics**: Comprehensive overview of all projects and events
- **Guest Analytics**: Track guest engagement and response patterns
- **Event Analytics**: Monitor event performance and attendance
- **Visual Charts**: Interactive charts and graphs for data visualization
- **Export Reports**: Generate and export detailed reports
- **Real-time Updates**: Live data updates and notifications

### 👨‍💼 **Admin Dashboard**

![Admin Panel](https://raw.githubusercontent.com/pushan-alagiya/Backend-Boilerplate-CLI/master/frontend/Images/Screenshot%202026-01-23%20110357.png)

- **User Management**: Manage all users, roles, and permissions
- **System Health**: Monitor system performance and status
- **Project Oversight**: View and manage all projects across the platform
- **Analytics Overview**: Platform-wide analytics and insights
- **Email Management**: Manage email templates and sending
- **System Settings**: Configure platform-wide settings

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.3 (App Router)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Radix UI primitives
- **Canvas Editor**: Fabric.js 6.7.0
- **Charts**: Recharts 2.15.4
- **Forms**: Formik with Yup validation
- **Animations**: Framer Motion 12.19.2
- **Icons**: Lucide React, Tabler Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: ImageKit integration
- **Email**: Nodemailer with EJS templates

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                 # Admin routes
│   │   └── admin/               # Admin dashboard pages
│   ├── (common)/                 # Protected common routes
│   │   └── projects/             # Project management pages
│   │       └── [id]/            # Dynamic project routes
│   │           ├── events/      # Event management
│   │           ├── guests/      # Guest list management
│   │           └── settings/    # Project settings
│   ├── dashboard/               # Main dashboard
│   ├── login/                   # Authentication pages
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── editor/                  # Template editor components
│   ├── forms/                   # Form components
│   ├── landing/                 # Landing page components
│   └── ui/                      # Reusable UI components
├── api/                         # API routes
├── store/                       # Redux store configuration
├── utils/                       # Utility functions
└── Images/                      # Project screenshots
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x (LTS)
- npm, yarn, pnpm, or bun
- MySQL database
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pushan-alagiya/Backend-Boilerplate-CLI.git
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_IMAGEKIT_URL=your_imagekit_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating a Project

1. Navigate to the Projects page
2. Click "Create New Project"
3. Fill in project details (name, description, dates)
4. Upload a cover image (optional)
5. Click "Create Project"

### Managing Events

1. Open a project
2. Navigate to the Events section
3. Click "Create Event"
4. Set event details (name, date, time, location)
5. Create invitation templates using the Template Creator

### Using the Template Creator

1. Navigate to an event
2. Click "Create Template" or "Edit Template"
3. Use the editor tools:
   - **Text Tool**: Add and style text elements
   - **Image Tool**: Upload or import images
   - **Shape Tool**: Add decorative shapes
   - **Layer Panel**: Manage element layers
4. Export as PDF or PNG when ready

### Managing Guest Lists

1. Open a project
2. Navigate to the Guests section
3. Add guests manually or import from CSV
4. Organize into categories
5. Send invitations to selected guests
6. Track RSVP responses

### Setting Permissions

1. Open project settings
2. Navigate to "Access" tab
3. Generate access links or invite users directly
4. Set permission levels for each user
5. Manage team members and their access

## 🔑 Key Features in Detail

### Permission Levels

The platform supports 7 permission levels:

1. **READ (1)**: View project and basic info
2. **WRITE (2)**: Edit project details
3. **EDIT (3)**: Edit events and content
4. **ADD_MEMBER (4)**: Add/remove team members
5. **DELETE (5)**: Delete project
6. **MANAGE_ROLES (6)**: Manage roles and permissions
7. **OWNER (7)**: Full owner access

### Template Editor Features

- **14+ Wedding Fonts**: Dancing Script, Great Vibes, Playfair Display, and more
- **Image Effects**: Brightness, contrast, opacity, filters (grayscale, sepia, blur)
- **Shape Library**: Basic shapes + wedding-themed icons
- **Layer Management**: Professional layer panel with full control
- **Export Options**: High-quality PDF and PNG export
- **Keyboard Shortcuts**: Power user shortcuts for faster editing

### Guest Management Features

- **Smart Categories**: Auto-categorize guests
- **RSVP Tracking**: Real-time status updates
- **Bulk Import/Export**: CSV support for large lists
- **Contact Management**: Store addresses, phone numbers, preferences
- **Response Analytics**: Track response rates and patterns
- **Reminder System**: Automated follow-ups

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Full dark mode support
- **Modern UI**: Built with Radix UI and Tailwind CSS
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG compliant components
- **Loading States**: Beautiful loading indicators
- **Error Handling**: User-friendly error messages

## 📚 Documentation

- [Template Editor Guide](./README-EDITOR.md) - Complete guide to the template creator
- [Permission System](./README-PERMISSIONS.md) - Detailed permission system documentation
- [API Documentation](../backend/docs/) - Backend API documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Fabric.js for canvas capabilities
- All open-source contributors

## 📞 Support

For issues, feature requests, or questions:
- 🐛 [Report a Bug](https://github.com/pushan-alagiya/Backend-Boilerplate-CLI/issues)
- 💡 [Request a Feature](https://github.com/pushan-alagiya/Backend-Boilerplate-CLI/issues)
- 📖 [Documentation](https://github.com/pushan-alagiya/Backend-Boilerplate-CLI)

---

**Made with ❤️ for wedding planners and couples**

⭐ Star this repo if you find it helpful!
