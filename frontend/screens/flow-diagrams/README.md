# MindLyf Screen Flow Diagrams

## Overview
This document provides comprehensive flow diagrams showing how all screens in the MindLyf Progressive Web Application connect and interact with each other. These flows are designed with mobile-first principles and ensure seamless user experience across all features.

## 🔄 Main Application Flow

### Primary Navigation Flow
```
App Launch
    ↓
Authentication Check
    ├─ Not Authenticated → Login Flow
    └─ Authenticated → Dashboard
        ↓
Main Dashboard
    ├─ Quick Actions → Feature Screens
    ├─ Progress → Analytics Screens
    ├─ Notifications → Action Screens
    ├─ Search → Content Discovery
    └─ Profile → Settings & Account
```

## 🔐 Authentication Flow

### Complete Authentication Journey
```
App Start
    ↓
Splash Screen (PWA Loading)
    ↓
Authentication Check
    ├─ Has Valid Token → Dashboard
    ├─ Has Refresh Token → Token Refresh → Dashboard
    └─ No Token → Welcome Screen
        ↓
Welcome Screen
    ├─ [Sign In] → Login Flow
    └─ [Sign Up] → Registration Flow

Login Flow:
Login Screen
    ├─ Valid Credentials → MFA Check
    │   ├─ MFA Enabled → MFA Input → Dashboard
    │   └─ MFA Disabled → Dashboard
    ├─ Invalid Credentials → Error Message → Login Screen
    ├─ [Forgot Password] → Password Recovery Flow
    ├─ [Biometric Login] → Biometric Auth → Dashboard
    └─ [Sign Up] → Registration Flow

Registration Flow:
Registration Step 1 (Basic Info)
    ↓ [Continue]
Registration Step 2 (Health Info)
    ↓ [Continue]
Registration Step 3 (Privacy & Consent)
    ↓ [Continue]
Registration Step 4 (Preferences)
    ↓ [Complete Registration]
Email Verification Screen
    ├─ [Verify Email] → Verification Success → Onboarding
    ├─ [Resend Email] → Email Sent → Email Verification Screen
    └─ [Skip for Now] → Onboarding

Onboarding Flow:
Welcome to MindLyf
    ↓ [Get Started]
MFA Setup (Optional)
    ├─ [Set Up MFA] → MFA Configuration → Biometric Setup
    └─ [Skip] → Biometric Setup
Biometric Setup (Mobile Only)
    ├─ [Enable Biometric] → Biometric Config → Dashboard
    └─ [Skip] → Dashboard

Password Recovery Flow:
Forgot Password Screen
    ↓ [Send Reset Link]
Email Sent Confirmation
    ↓ [Check Email]
Password Reset Screen (from email link)
    ↓ [Reset Password]
Password Reset Success → Login Screen
```

## 🏠 Dashboard Flow

### Dashboard Navigation Patterns
```
Main Dashboard
    ├─ Wellness Summary Cards
    │   ├─ Mood Card → Mood Tracking Screen
    │   ├─ Streak Card → Progress Overview
    │   └─ Goal Card → Goal Management
    ├─ Quick Actions Grid
    │   ├─ Chat → LyfBot Interface
    │   ├─ Write → Journal Entry
    │   ├─ Calm → Meditation Resources
    │   ├─ Therapy → Teletherapy Booking
    │   ├─ Community → Community Feed
    │   ├─ Learn → Resource Library
    │   ├─ Track → Mood Tracker
    │   ├─ Goals → Goal Setting
    │   ├─ Crisis → Crisis Support
    │   └─ More → Quick Actions Screen
    ├─ Recent Activity
    │   └─ [View All] → Activity History
    ├─ Recommendations
    │   ├─ Course Recommendation → Resource Details
    │   ├─ Therapist Recommendation → Therapist Profile
    │   └─ Community Recommendation → Group Details
    └─ Navigation
        ├─ [Profile] → Profile Overview
        ├─ [Notifications] → Notifications Center
        ├─ [Search] → Search Interface
        └─ [Menu] → App Menu

Quick Actions Screen:
Quick Actions Grid
    ├─ Search Actions
    ├─ Category Filters
    ├─ Drag & Drop Reordering
    ├─ [Add Custom Action] → Action Creator
    └─ [Settings] → Quick Actions Settings

Progress Overview:
Time Period Selector
    ├─ Week View → Weekly Analytics
    ├─ Month View → Monthly Analytics
    ├─ 3 Month View → Quarterly Analytics
    └─ Year View → Annual Analytics
Charts & Metrics
    ├─ Mood Trend Chart → Mood Details
    ├─ Goal Progress → Goal Management
    ├─ Achievement List → Achievement Details
    └─ Insights → AI Insights Screen

Notifications Center:
Notification Categories
    ├─ All Notifications
    ├─ Health Notifications → Health Actions
    ├─ Social Notifications → Community Actions
    └─ System Notifications → System Actions
Notification Actions
    ├─ Mark as Read
    ├─ Delete
    ├─ Take Action → Relevant Screen
    └─ Settings → Notification Preferences

Search Interface:
Search Input
    ├─ Voice Search → Speech Recognition
    ├─ Text Search → Search Results
    └─ Category Filters → Filtered Results
Search Results
    ├─ Articles → Article Details
    ├─ Videos → Video Player
    ├─ Therapists → Therapist Profile
    ├─ Groups → Group Details
    └─ Resources → Resource Details
```

## 🧠 Mental Health Flow

### Mental Health Journey
```
Mental Health Entry Points:
Dashboard → [Track Mood] → Mood Tracker
Dashboard → [Assessment] → Initial Assessment
Dashboard → [Goals] → Goal Management
Quick Actions → [Mental Health] → Mental Health Dashboard

Mental Health Dashboard:
Current Status Overview
    ├─ Mood Score → Mood History
    ├─ Risk Level → Risk Assessment
    ├─ Recent Activities → Activity Details
    └─ Recommendations → Suggested Actions

Initial Assessment Flow:
Assessment Introduction
    ↓ [Start Assessment]
Question Categories
    ├─ Mood & Emotions (5-7 questions)
    ├─ Sleep Patterns (3-4 questions)
    ├─ Daily Activities (4-5 questions)
    ├─ Social Interactions (3-4 questions)
    ├─ Stress Levels (4-5 questions)
    └─ Coping Mechanisms (3-4 questions)
Assessment Results
    ├─ Risk Level Display
    ├─ Personalized Recommendations
    ├─ [Save Results] → Profile Integration
    ├─ [Book Therapy] → Therapist Matching
    ├─ [Join Community] → Support Groups
    └─ [Continue to Dashboard] → Dashboard

Mood Tracking Flow:
Mood Tracker Entry
    ├─ Mood Scale (1-10)
    ├─ Emotion Selection (multiple choice)
    ├─ Trigger Identification
    ├─ Activity Correlation
    ├─ Notes (optional)
    └─ [Save Mood] → Mood Confirmation
Mood History
    ├─ Daily View → Day Details
    ├─ Weekly View → Week Analytics
    ├─ Monthly View → Month Trends
    └─ [Export Data] → Data Export

Goal Management Flow:
Goal Dashboard
    ├─ Active Goals → Goal Details
    ├─ Completed Goals → Achievement View
    ├─ [Create Goal] → Goal Creator
    └─ [Templates] → Goal Templates
Goal Creator
    ├─ Goal Type Selection
    ├─ Target Setting
    ├─ Timeline Definition
    ├─ Milestone Planning
    └─ [Create Goal] → Goal Confirmation
Goal Progress
    ├─ Progress Updates
    ├─ Milestone Tracking
    ├─ [Update Progress] → Progress Entry
    ├─ [Modify Goal] → Goal Editor
    └─ [Complete Goal] → Achievement Celebration
```

## 🩺 Teletherapy Flow

### Therapy Service Journey
```
Teletherapy Entry Points:
Dashboard → [Therapy] → Therapist Discovery
Quick Actions → [Book Session] → Appointment Booking
Recommendations → [Therapist] → Therapist Profile

Therapist Discovery Flow:
Therapist Search
    ├─ AI Recommendations → Recommended Therapists
    ├─ Search Filters
    │   ├─ Specialization Filter
    │   ├─ Location Filter
    │   ├─ Availability Filter
    │   ├─ Language Filter
    │   └─ Price Range Filter
    ├─ Search Results → Therapist List
    └─ [Browse All] → All Therapists

Therapist Profile Flow:
Therapist Details
    ├─ Professional Information
    ├─ Specializations
    ├─ Reviews & Ratings
    ├─ Availability Calendar
    ├─ Session Types
    ├─ Pricing Information
    ├─ [Book Appointment] → Appointment Booking
    ├─ [Read Reviews] → Reviews Screen
    ├─ [Message Therapist] → Chat Interface
    └─ [Save to Favorites] → Favorites List

Appointment Booking Flow:
Date & Time Selection
    ↓
Session Type Selection
    ├─ Video Session
    ├─ Audio Session
    └─ Chat Session
Duration Selection
    ↓
Notes & Preferences
    ↓
Payment Method Selection
    ↓
Booking Confirmation
    ├─ Calendar Integration
    ├─ Reminder Setup
    ├─ [Confirm Booking] → Booking Success
    └─ [Modify] → Back to Selection

Appointment Management:
My Appointments
    ├─ Upcoming Appointments
    │   ├─ [Join Session] → Video Interface
    │   ├─ [Reschedule] → Reschedule Flow
    │   ├─ [Cancel] → Cancellation Flow
    │   └─ [Message Therapist] → Chat
    ├─ Past Appointments
    │   ├─ Session Notes
    │   ├─ [Rate Session] → Rating Interface
    │   ├─ [Book Follow-up] → Appointment Booking
    │   └─ [Download Summary] → File Download
    └─ [Book New Session] → Therapist Discovery

Video Session Flow:
Pre-Session Check
    ├─ Camera/Microphone Test
    ├─ Connection Test
    ├─ Privacy Reminder
    └─ [Join Session] → Video Interface
Video Interface
    ├─ Video Controls
    ├─ Chat Panel
    ├─ Screen Sharing
    ├─ Session Timer
    ├─ [End Session] → Session End
    └─ [Emergency] → Crisis Support
Post-Session
    ├─ Session Summary
    ├─ Next Steps
    ├─ [Rate Session] → Rating Interface
    ├─ [Book Follow-up] → Appointment Booking
    └─ [Return to Dashboard] → Dashboard
```

## 🤖 LyfBot Flow

### AI Chat Interface Journey
```
LyfBot Entry Points:
Dashboard → [Chat] → LyfBot Interface
Quick Actions → [LyfBot] → Chat Interface
Crisis Detection → Auto-redirect → LyfBot Crisis Mode

LyfBot Interface Flow:
Chat Welcome
    ├─ Conversation Starters
    ├─ Recent Conversations → Conversation History
    ├─ [New Conversation] → Fresh Chat
    └─ [Settings] → LyfBot Settings

Chat Interface:
Message Input
    ├─ Text Input → Send Message
    ├─ Voice Input → Speech-to-Text → Send Message
    ├─ Emoji Reactions
    └─ Quick Replies → Predefined Responses
Chat Features
    ├─ Message History
    ├─ Typing Indicators
    ├─ Read Receipts
    ├─ Message Reactions
    ├─ [Share Conversation] → Share Options
    └─ [Export Chat] → Data Export

LyfBot Responses:
Standard Response
    ├─ Text Response
    ├─ Suggested Actions
    ├─ Quick Reply Options
    ├─ Resource Recommendations → Resource Details
    └─ Follow-up Questions
Crisis Detection Response
    ├─ Immediate Support Message
    ├─ Crisis Resources → Crisis Support
    ├─ Emergency Contacts → Contact Options
    ├─ [Get Help Now] → Emergency Services
    └─ [I'm Safe] → Safety Confirmation

Conversation Management:
Conversation History
    ├─ Recent Conversations
    ├─ Conversation Search
    ├─ [Resume Conversation] → Chat Interface
    ├─ [Delete Conversation] → Confirmation
    └─ [Export Conversations] → Data Export

LyfBot Settings:
Personalization
    ├─ Response Style
    ├─ Topic Preferences
    ├─ Crisis Sensitivity
    ├─ Language Settings
    └─ [Save Settings] → Settings Confirmation
Privacy Settings
    ├─ Data Retention
    ├─ Conversation Sharing
    ├─ Analytics Opt-out
    └─ [Update Privacy] → Privacy Confirmation
```

## 👥 Community Flow

### Social Features Journey
```
Community Entry Points:
Dashboard → [Community] → Community Feed
Quick Actions → [Groups] → Support Groups
Recommendations → [Connect] → Community Features

Community Feed Flow:
Main Feed
    ├─ Post Types
    │   ├─ Text Posts
    │   ├─ Image Posts
    │   ├─ Poll Posts
    │   └─ Story Posts
    ├─ Feed Filters
    │   ├─ Following
    │   ├─ Popular
    │   ├─ Recent
    │   └─ Categories
    ├─ [Create Post] → Post Creator
    └─ [Join Groups] → Support Groups

Post Interaction Flow:
Post Actions
    ├─ Reactions
    │   ├─ Like
    │   ├─ Love
    │   ├─ Support
    │   └─ Celebrate
    ├─ Comments
    │   ├─ [Add Comment] → Comment Creator
    │   ├─ Reply to Comment → Reply Interface
    │   └─ Comment Reactions
    ├─ Sharing
    │   ├─ Share to Feed
    │   ├─ Share to Group
    │   └─ Share Externally
    └─ [Report Post] → Report Interface

Post Creator Flow:
Content Type Selection
    ├─ Text Post → Text Editor
    ├─ Image Post → Image Upload + Text
    ├─ Poll Post → Poll Creator
    └─ Story Post → Story Editor
Privacy Settings
    ├─ Public
    ├─ Friends Only
    ├─ Group Only
    └─ Anonymous
Post Options
    ├─ Tags
    ├─ Location
    ├─ Mood
    └─ [Publish] → Post Confirmation

Support Groups Flow:
Group Discovery
    ├─ Category Browse
    │   ├─ Anxiety Support
    │   ├─ Depression Support
    │   ├─ Addiction Recovery
    │   ├─ Grief Support
    │   └─ General Wellness
    ├─ Search Groups
    ├─ Recommended Groups
    └─ [Create Group] → Group Creator

Group Details
    ├─ Group Information
    ├─ Member List
    ├─ Group Rules
    ├─ Recent Activity
    ├─ [Join Group] → Join Request
    ├─ [Group Chat] → Group Discussion
    └─ [Group Events] → Event Calendar

Group Participation:
Group Discussion
    ├─ Discussion Topics
    ├─ [New Topic] → Topic Creator
    ├─ [Reply] → Reply Interface
    └─ [Private Message] → Direct Chat
Group Events
    ├─ Upcoming Events
    ├─ [RSVP] → Event Registration
    ├─ [Create Event] → Event Creator
    └─ [Join Video Call] → Group Video Session
```

## 📝 Journal Flow

### Digital Journaling Journey
```
Journal Entry Points:
Dashboard → [Write] → Journal Interface
Quick Actions → [Journal] → Journal Dashboard
Mood Tracker → [Add Notes] → Journal Entry

Journal Dashboard:
Journal Overview
    ├─ Recent Entries → Entry List
    ├─ Writing Streak
    ├─ Mood Trends
    ├─ Word Count Stats
    ├─ [New Entry] → Entry Creator
    ├─ [Browse Entries] → Entry Browser
    └─ [Insights] → Journal Analytics

Entry Creator Flow:
Entry Type Selection
    ├─ Free Writing → Blank Editor
    ├─ Guided Prompt → Prompt Selection
    ├─ Mood Journal → Mood + Writing
    └─ Gratitude Journal → Gratitude Template
Writing Interface
    ├─ Text Editor
    ├─ Mood Selector
    ├─ Emotion Tags
    ├─ Privacy Settings
    ├─ [Save Draft] → Draft Storage
    ├─ [Publish] → Entry Confirmation
    └─ [Voice-to-Text] → Speech Recognition

Entry Management:
Entry Browser
    ├─ Date Filter
    ├─ Mood Filter
    ├─ Tag Filter
    ├─ Search Entries
    ├─ [Edit Entry] → Entry Editor
    ├─ [Delete Entry] → Confirmation
    └─ [Share Entry] → Share Options

Journal Analytics:
Insights Dashboard
    ├─ Writing Patterns
    ├─ Mood Correlations
    ├─ Emotion Trends
    ├─ Word Cloud
    ├─ Progress Charts
    └─ [Export Data] → Data Export

Prompt System:
Prompt Categories
    ├─ Daily Reflection
    ├─ Gratitude Practice
    ├─ Goal Setting
    ├─ Stress Management
    ├─ Relationship Focus
    └─ Creative Writing
Prompt Selection
    ├─ Random Prompt
    ├─ Category Browse
    ├─ Difficulty Level
    └─ [Start Writing] → Entry Creator
```

## 📚 Resources Flow

### Learning and Content Journey
```
Resources Entry Points:
Dashboard → [Learn] → Resource Library
Quick Actions → [Resources] → Content Browser
Recommendations → [Course] → Resource Details

Resource Library Flow:
Content Browser
    ├─ Content Types
    │   ├─ Articles
    │   ├─ Videos
    │   ├─ Audio Content
    │   ├─ Courses
    │   ├─ Worksheets
    │   └─ Tools
    ├─ Categories
    │   ├─ Anxiety Management
    │   ├─ Depression Support
    │   ├─ Stress Relief
    │   ├─ Mindfulness
    │   ├─ Sleep Improvement
    │   └─ Relationship Skills
    ├─ Search & Filters
    ├─ Featured Content
    └─ [My Library] → Personal Collection

Resource Details Flow:
Content Overview
    ├─ Description
    ├─ Duration/Length
    ├─ Difficulty Level
    ├─ User Ratings
    ├─ Related Content
    ├─ [Start/Continue] → Content Viewer
    ├─ [Save to Library] → Personal Collection
    ├─ [Share] → Share Options
    └─ [Rate & Review] → Review Interface

Content Consumption:
Article Reader
    ├─ Reading Progress
    ├─ Bookmark Feature
    ├─ Note Taking
    ├─ [Complete] → Progress Update
    └─ [Related Articles] → Content Suggestions
Video Player
    ├─ Playback Controls
    ├─ Progress Tracking
    ├─ Closed Captions
    ├─ [Complete] → Progress Update
    └─ [Next Video] → Playlist Continue
Audio Player
    ├─ Playback Controls
    ├─ Background Play
    ├─ Sleep Timer
    ├─ [Complete] → Progress Update
    └─ [Download] → Offline Access

Learning Paths:
Path Discovery
    ├─ Recommended Paths
    ├─ Category Browse
    ├─ Skill Level Filter
    └─ [Enroll] → Path Enrollment
Path Progress
    ├─ Current Step
    ├─ Completion Percentage
    ├─ Next Steps
    ├─ [Continue Learning] → Next Content
    ├─ [Review Progress] → Progress Analytics
    └─ [Certificate] → Achievement Display
```

## 💳 Payment Flow

### Subscription and Billing Journey
```
Payment Entry Points:
Dashboard → [Upgrade] → Subscription Plans
Profile → [Billing] → Payment Management
Feature Restriction → [Upgrade] → Plan Selection

Subscription Flow:
Plan Selection
    ├─ Free Plan (Current)
    ├─ Premium Individual
    ├─ Premium Family
    └─ Enterprise Plan
Plan Comparison
    ├─ Feature Comparison
    ├─ Pricing Details
    ├─ [Select Plan] → Payment Setup
    └─ [Contact Sales] → Sales Contact

Payment Setup:
Payment Method Selection
    ├─ Credit/Debit Card
    ├─ Bank Transfer
    ├─ Mobile Money
    └─ Digital Wallets
Billing Information
    ├─ Billing Address
    ├─ Tax Information
    ├─ Billing Cycle (Monthly/Yearly)
    └─ Promo Code Entry
Payment Confirmation
    ├─ Order Summary
    ├─ Terms & Conditions
    ├─ [Complete Purchase] → Payment Processing
    └─ [Modify] → Back to Setup

Payment Management:
Billing Dashboard
    ├─ Current Subscription
    ├─ Payment Methods
    ├─ Billing History
    ├─ [Change Plan] → Plan Selection
    ├─ [Update Payment] → Payment Method Editor
    ├─ [Cancel Subscription] → Cancellation Flow
    └─ [Download Invoice] → Invoice Download

Payment Method Management:
Method List
    ├─ Primary Method
    ├─ Backup Methods
    ├─ [Add Method] → Method Creator
    ├─ [Edit Method] → Method Editor
    ├─ [Delete Method] → Confirmation
    └─ [Set Default] → Default Update

Billing History:
Transaction List
    ├─ Payment Date
    ├─ Amount
    ├─ Status
    ├─ [View Details] → Transaction Details
    ├─ [Download Receipt] → Receipt Download
    └─ [Request Refund] → Refund Request

Cancellation Flow:
Cancellation Reasons
    ├─ Too Expensive
    ├─ Not Using Features
    ├─ Technical Issues
    ├─ Found Alternative
    └─ Other
Retention Offers
    ├─ Discount Offer
    ├─ Feature Explanation
    ├─ [Accept Offer] → Subscription Continue
    └─ [Continue Cancellation] → Cancellation Confirmation
Cancellation Confirmation
    ├─ Cancellation Date
    ├─ Access Until Date
    ├─ Data Retention Policy
    ├─ [Confirm Cancellation] → Cancellation Complete
    └─ [Keep Subscription] → Dashboard
```

## 🎮 Gamification Flow

### Achievement and Progress Journey
```
Gamification Entry Points:
Dashboard → [Achievements] → Achievement Dashboard
Progress Overview → [Badges] → Badge Collection
Notifications → [Achievement Unlocked] → Achievement Details

Achievement Dashboard:
Progress Overview
    ├─ Current Level
    ├─ Total Points
    ├─ Points to Next Level
    ├─ Active Streaks
    ├─ Recent Achievements
    ├─ [View All Badges] → Badge Collection
    ├─ [Leaderboards] → Leaderboard View
    └─ [Daily Challenges] → Challenge Center

Badge Collection:
Badge Categories
    ├─ Consistency Badges
    ├─ Milestone Badges
    ├─ Social Badges
    ├─ Learning Badges
    └─ Special Event Badges
Badge Details
    ├─ Badge Description
    ├─ Unlock Requirements
    ├─ Progress Tracking
    ├─ Unlock Date
    ├─ [Share Achievement] → Share Options
    └─ [Related Badges] → Badge Suggestions

Challenge Center:
Daily Challenges
    ├─ Today's Challenges
    ├─ Challenge Progress
    ├─ Streak Counter
    ├─ [Complete Challenge] → Challenge Completion
    └─ [View Rewards] → Reward Details
Weekly Challenges
    ├─ Current Week Challenges
    ├─ Progress Tracking
    ├─ [Join Challenge] → Challenge Participation
    └─ [Challenge History] → Past Challenges

Leaderboards:
Leaderboard Types
    ├─ Global Leaderboard
    ├─ Friends Leaderboard
    ├─ Community Leaderboard
    └─ Challenge Leaderboard
Leaderboard Views
    ├─ Daily Rankings
    ├─ Weekly Rankings
    ├─ Monthly Rankings
    ├─ All-Time Rankings
    └─ [My Rank] → Personal Stats

Streak Tracking:
Active Streaks
    ├─ Journal Writing Streak
    ├─ Mood Tracking Streak
    ├─ Meditation Streak
    ├─ Community Engagement Streak
    └─ Learning Streak
Streak Details
    ├─ Current Count
    ├─ Best Streak
    ├─ Streak History
    ├─ [Maintain Streak] → Relevant Activity
    └─ [Streak Recovery] → Recovery Options
```

## 🆘 Crisis Support Flow

### Emergency Support Journey
```
Crisis Entry Points:
Dashboard → [Crisis Support] → Crisis Resources
LyfBot → Crisis Detection → Crisis Interface
Quick Actions → [Emergency] → Crisis Support
Assessment → High Risk → Crisis Intervention

Crisis Support Interface:
Immediate Support
    ├─ Crisis Hotlines
    │   ├─ National Suicide Prevention Lifeline
    │   ├─ Crisis Text Line
    │   ├─ Local Emergency Services
    │   └─ [Call Now] → Phone Integration
    ├─ Emergency Contacts
    │   ├─ Personal Emergency Contacts
    │   ├─ Healthcare Providers
    │   └─ [Contact] → Communication Options
    ├─ Safety Planning
    │   ├─ [Create Safety Plan] → Safety Plan Creator
    │   ├─ [View My Plan] → Safety Plan Display
    │   └─ [Emergency Plan] → Emergency Protocol
    └─ [I'm Safe Now] → Safety Confirmation

Safety Plan Creator:
Plan Components
    ├─ Warning Signs Recognition
    ├─ Coping Strategies
    ├─ Support Network
    ├─ Professional Contacts
    ├─ Environment Safety
    └─ [Save Plan] → Plan Confirmation
Plan Review
    ├─ Plan Summary
    ├─ [Edit Plan] → Plan Editor
    ├─ [Share with Therapist] → Share Options
    └─ [Emergency Access] → Quick Access Setup

Crisis Resources:
Resource Categories
    ├─ Immediate Help
    ├─ Local Resources
    ├─ Online Support
    ├─ Self-Help Tools
    └─ Professional Services
Resource Details
    ├─ Contact Information
    ├─ Availability
    ├─ Services Offered
    ├─ [Contact] → Communication Options
    └─ [Save to Favorites] → Resource Collection

Crisis Follow-up:
Safety Check-in
    ├─ Mood Assessment
    ├─ Safety Confirmation
    ├─ Support Needs
    ├─ [Schedule Follow-up] → Appointment Booking
    ├─ [Connect with Therapist] → Therapist Contact
    └─ [Return to Dashboard] → Dashboard
```

## 👤 Profile & Settings Flow

### Account Management Journey
```
Profile Entry Points:
Dashboard → [Profile] → Profile Overview
Navigation Menu → [Settings] → Settings Dashboard
Account Issues → [Account] → Account Management

Profile Overview:
Personal Information
    ├─ Profile Photo
    ├─ Basic Information
    ├─ Contact Details
    ├─ Emergency Contacts
    ├─ [Edit Profile] → Profile Editor
    └─ [Privacy Settings] → Privacy Controls
Account Summary
    ├─ Account Status
    ├─ Subscription Details
    ├─ Usage Statistics
    ├─ [Billing] → Payment Management
    └─ [Account Settings] → Account Controls

Profile Editor:
Information Sections
    ├─ Personal Details
    ├─ Health Information
    ├─ Preferences
    ├─ Emergency Contacts
    └─ [Save Changes] → Profile Update
Photo Management
    ├─ [Upload Photo] → Photo Upload
    ├─ [Take Photo] → Camera Interface
    ├─ [Remove Photo] → Photo Removal
    └─ [Crop Photo] → Photo Editor

Settings Dashboard:
Setting Categories
    ├─ Account Settings
    ├─ Privacy Settings
    ├─ Notification Settings
    ├─ Accessibility Settings
    ├─ Data & Storage
    └─ Help & Support

Privacy Controls:
Privacy Options
    ├─ Profile Visibility
    ├─ Data Sharing
    ├─ Analytics Opt-out
    ├─ Marketing Preferences
    ├─ [Update Privacy] → Privacy Confirmation
    └─ [Data Export] → Export Request

Notification Settings:
Notification Types
    ├─ Push Notifications
    ├─ Email Notifications
    ├─ SMS Notifications
    ├─ In-App Notifications
    └─ [Save Preferences] → Settings Update
Notification Categories
    ├─ Health Reminders
    ├─ Social Updates
    ├─ System Notifications
    ├─ Marketing Messages
    └─ Emergency Alerts

Account Management:
Security Settings
    ├─ Password Change
    ├─ MFA Settings
    ├─ Device Management
    ├─ Login History
    └─ [Security Review] → Security Audit
Data Management
    ├─ Data Export
    ├─ Data Deletion
    ├─ Storage Usage
    ├─ [Download Data] → Export Process
    └─ [Delete Account] → Account Deletion Flow

Account Deletion Flow:
Deletion Confirmation
    ├─ Reason Selection
    ├─ Data Retention Options
    ├─ Alternative Solutions
    ├─ [Confirm Deletion] → Deletion Process
    └─ [Keep Account] → Dashboard
Final Confirmation
    ├─ Password Verification
    ├─ Deletion Timeline
    ├─ Data Recovery Information
    ├─ [Final Confirmation] → Account Deleted
    └─ [Cancel] → Account Management
```

## 🔄 Cross-Screen Communication Patterns

### State Management Flow
```
Global State Updates:
User Authentication
    ├─ Login Success → Update All Screens
    ├─ Token Refresh → Silent Update
    └─ Logout → Clear All Data

Real-time Updates:
WebSocket Connections
    ├─ New Notifications → Notification Badge Update
    ├─ Chat Messages → Chat Interface Update
    ├─ Community Activity → Feed Refresh
    └─ Crisis Alerts → Emergency Interface

Data Synchronization:
Offline to Online Sync
    ├─ Queue Offline Actions
    ├─ Sync on Connection Restore
    ├─ Conflict Resolution
    └─ Update UI with Synced Data

Navigation Patterns:
Deep Linking
    ├─ Notification Tap → Relevant Screen
    ├─ Share Link → Content Display
    ├─ Email Link → App Navigation
    ├─ Search Result → Content View

Back Navigation
    ├─ Browser Back Button
    ├─ App Back Button
    ├─ Gesture Navigation
    └─ Breadcrumb Navigation
```

## 📱 Mobile-Specific Flow Patterns

### Touch and Gesture Navigation
```
Gesture Patterns:
Swipe Gestures
    ├─ Horizontal Swipe → Tab Navigation
    ├─ Vertical Swipe → Content Scroll
    ├─ Pull Down → Refresh Content
    └─ Swipe Actions → Quick Actions

Touch Interactions:
Tap Patterns
    ├─ Single Tap → Select/Navigate
    ├─ Double Tap → Like/Favorite
    ├─ Long Press → Context Menu
    └─ Pinch/Zoom → Content Scaling

Bottom Sheet Navigation:
Modal Presentations
    ├─ Action Sheets → Quick Actions
    ├─ Form Modals → Data Entry
    ├─ Detail Views → Content Display
    └─ Settings Panels → Configuration
```

---

This comprehensive flow diagram documentation provides a complete overview of how all screens in the MindLyf PWA connect and interact, ensuring seamless user experience across all features and use cases. 