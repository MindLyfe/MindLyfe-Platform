# Crisis Support Screens Documentation

## Overview
The crisis support screens provide immediate assistance, emergency resources, and safety planning tools. All screens are designed with urgency, accessibility, and safety as top priorities.

## 🚨 Core Features
- Immediate crisis intervention
- Emergency contact integration
- Safety planning tools
- Professional resource directory
- Real-time support chat
- Location-based emergency services

## 📱 Screen Specifications

### 1. Crisis Dashboard (`/crisis-support`)

#### Purpose
Immediate access to crisis resources with clear, prominent emergency options and safety tools.

#### Mobile-First Design
- **Emergency Buttons**: Large, accessible crisis intervention
- **Quick Access**: One-tap emergency contacts
- **Safety Tools**: Immediate coping resources
- **Clear Navigation**: Simple, stress-free interface
- **Offline Access**: Critical resources available offline

#### UI Components
```typescript
interface CrisisDashboardProps {
  emergencyContacts: EmergencyContact[];
  safetyPlan: SafetyPlan;
  crisisResources: CrisisResource[];
  userLocation?: Location;
  isInCrisis: boolean;
  onEmergencyCall: (contactId: string) => void;
  onSafetyPlan: () => void;
  onCopingTools: () => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isAvailable: boolean;
  responseTime: string;
  type: 'personal' | 'professional' | 'hotline';
}

interface SafetyPlan {
  id: string;
  warningSignals: string[];
  copingStrategies: string[];
  supportContacts: string[];
  professionalContacts: string[];
  environmentSafety: string[];
  lastUpdated: Date;
}

interface CrisisResource {
  id: string;
  title: string;
  description: string;
  type: 'hotline' | 'chat' | 'text' | 'location' | 'guide';
  availability: '24/7' | 'business_hours' | 'limited';
  contact: string;
  location?: string;
  languages: string[];
}
```

#### Screen Layout
```
┌─────────────────────────────────┐
│ 🚨 Crisis Support              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ Need Immediate Help?     │ │
│ │                             │ │
│ │ If you're in immediate      │ │
│ │ danger, call emergency      │ │
│ │ services right away.        │ │
│ │                             │ │
│ │ [🚨 Call 911] [🏥 Hospital] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📞 Crisis Hotlines          │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🇺🇸 National Suicide   │ │ │
│ │ │ Prevention Lifeline     │ │ │
│ │ │ 988 • Available 24/7    │ │ │
│ │ │ [Call Now] [Chat Online]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💬 Crisis Text Line    │ │ │
│ │ │ Text HOME to 741741     │ │ │
│ │ │ Available 24/7          │ │ │
│ │ │ [Start Text Chat]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏳️‍🌈 LGBTQ+ Support   │ │ │
│ │ │ Trevor Project Lifeline │ │ │
│ │ │ 1-866-488-7386          │ │ │
│ │ │ [Call Now] [Chat Online]│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🛡️ Your Safety Plan        │ │
│ │                             │ │
│ │ Last updated: Jan 10, 2024  │ │
│ │ 5 warning signals identified│ │
│ │ 8 coping strategies ready   │ │
│ │                             │ │
│ │ [View Safety Plan]          │ │
│ │ [Quick Coping Tools]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👥 Personal Support         │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Dr. Sarah Johnson    │ │ │
│ │ │ Your Therapist          │ │ │
│ │ │ Available: Mon-Fri 9-5  │ │ │
│ │ │ [Call] [Message]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mom                  │ │ │
│ │ │ Emergency Contact       │ │ │
│ │ │ Available: Always       │ │ │
│ │ │ [Call] [Message]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [Manage Contacts]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧘 Immediate Coping Tools   │ │
│ │                             │ │
│ │ [Breathing Exercise]        │ │
│ │ [Grounding Technique]       │ │
│ │ [Calming Music]             │ │
│ │ [Guided Meditation]         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Get crisis support resources
GET /api/crisis-support/resources
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "emergencyContacts": [
      {
        "id": "suicide_prevention",
        "name": "National Suicide Prevention Lifeline",
        "relationship": "Crisis Hotline",
        "phone": "988",
        "isAvailable": true,
        "responseTime": "Immediate",
        "type": "hotline"
      },
      {
        "id": "crisis_text",
        "name": "Crisis Text Line",
        "relationship": "Text Support",
        "phone": "741741",
        "isAvailable": true,
        "responseTime": "< 5 minutes",
        "type": "hotline"
      }
    ],
    "personalContacts": [
      {
        "id": "therapist_123",
        "name": "Dr. Sarah Johnson",
        "relationship": "Therapist",
        "phone": "+1-555-0123",
        "isAvailable": true,
        "responseTime": "Within 24 hours",
        "type": "professional"
      }
    ],
    "safetyPlan": {
      "id": "plan_456",
      "warningSignals": [
        "Feeling hopeless",
        "Isolating from friends",
        "Sleep disturbances",
        "Loss of interest in activities",
        "Increased anxiety"
      ],
      "copingStrategies": [
        "Call a trusted friend",
        "Practice deep breathing",
        "Go for a walk",
        "Listen to calming music",
        "Use grounding techniques"
      ],
      "lastUpdated": "2024-01-10T00:00:00Z"
    },
    "localResources": [
      {
        "id": "hospital_789",
        "title": "City General Hospital",
        "description": "24/7 emergency psychiatric services",
        "type": "location",
        "availability": "24/7",
        "contact": "+1-555-0911",
        "location": "123 Hospital Ave, City, State 12345"
      }
    ]
  }
}
```

---

### 2. Safety Planning (`/crisis-support/safety-plan`)

#### Purpose
Comprehensive safety planning tool with personalized strategies and emergency protocols.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Safety Plan       [✏️] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🛡️ Your Personal Safety Plan│ │
│ │                             │ │
│ │ Created: Jan 10, 2024       │ │
│ │ Last updated: 4 days ago    │ │
│ │ Shared with: Dr. Johnson    │ │
│ │                             │ │
│ │ [Edit Plan] [Share Plan]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ Warning Signals          │ │
│ │                             │ │
│ │ Recognize when you might    │ │
│ │ be entering a crisis:       │ │
│ │                             │ │
│ │ • Feeling hopeless          │ │
│ │ • Isolating from friends    │ │
│ │ • Sleep disturbances        │ │
│ │ • Loss of interest          │ │
│ │ • Increased anxiety         │ │
│ │                             │ │
│ │ [Add Warning Signal]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧘 Coping Strategies        │ │
│ │                             │ │
│ │ Things you can do to help   │ │
│ │ yourself feel better:       │ │
│ │                             │ │
│ │ • Call a trusted friend     │ │
│ │ • Practice deep breathing   │ │
│ │ • Go for a walk             │ │
│ │ • Listen to calming music   │ │
│ │ • Use grounding techniques  │ │
│ │ • Write in journal          │ │
│ │                             │ │
│ │ [Add Coping Strategy]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👥 Support People           │ │
│ │                             │ │
│ │ People you can reach out to:│ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mom                  │ │ │
│ │ │ Always available        │ │ │
│ │ │ +1-555-0123             │ │ │
│ │ │ [Call] [Text]           │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Best Friend Sarah    │ │ │
│ │ │ Evenings & weekends     │ │ │
│ │ │ +1-555-0456             │ │ │
│ │ │ [Call] [Text]           │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [Add Support Person]        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Professional Contacts  │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Dr. Sarah Johnson    │ │ │
│ │ │ Therapist               │ │ │
│ │ │ +1-555-0789             │ │ │
│ │ │ Mon-Fri 9AM-5PM         │ │ │
│ │ │ [Call] [Message]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [Add Professional]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Save Changes] [Test Plan]      │
└─────────────────────────────────┘
```

---

### 3. Emergency Contacts (`/crisis-support/contacts`)

#### Purpose
Comprehensive emergency contact management with quick access and availability status.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Emergency Contacts[+] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🚨 Crisis Hotlines          │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🇺🇸 Suicide Prevention  │ │ │
│ │ │ 988 • 24/7 Available    │ │ │
│ │ │ English, Spanish        │ │ │
│ │ │ [Call] [Chat] [Info]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💬 Crisis Text Line    │ │ │
│ │ │ Text HOME to 741741     │ │ │
│ │ │ 24/7 • Multiple languages│ │ │
│ │ │ [Text] [Info]           │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏳️‍🌈 Trevor Project   │ │ │
│ │ │ 1-866-488-7386          │ │ │
│ │ │ LGBTQ+ Youth Support    │ │ │
│ │ │ [Call] [Chat] [Info]    │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👥 Personal Contacts        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Mom                  │ │ │
│ │ │ Primary Emergency       │ │ │
│ │ │ +1-555-0123             │ │ │
│ │ │ 🟢 Available now        │ │ │
│ │ │ [Call] [Text] [Edit]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Sarah (Best Friend)  │ │ │
│ │ │ Support Contact         │ │ │
│ │ │ +1-555-0456             │ │ │
│ │ │ 🟡 Available evenings   │ │ │
│ │ │ [Call] [Text] [Edit]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Brother Mike         │ │ │
│ │ │ Family Support          │ │ │
│ │ │ +1-555-0789             │ │ │
│ │ │ 🔴 Do not disturb       │ │ │
│ │ │ [Call] [Text] [Edit]    │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [+ Add Personal Contact]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👨‍⚕️ Professional Support   │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 Dr. Sarah Johnson    │ │ │
│ │ │ Therapist               │ │ │
│ │ │ +1-555-0321             │ │ │
│ │ │ 🟢 Office hours         │ │ │
│ │ │ [Call] [Message] [Edit] │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏥 City General ER      │ │ │
│ │ │ Emergency Room          │ │ │
│ │ │ +1-555-0911             │ │ │
│ │ │ 🟢 24/7 Available       │ │ │
│ │ │ [Call] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ [+ Add Professional]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 4. Coping Tools (`/crisis-support/coping`)

#### Purpose
Immediate access to coping strategies and calming techniques for crisis situations.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Coping Tools           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧘 Immediate Relief         │ │
│ │                             │ │
│ │ Quick techniques to help    │ │
│ │ you feel calmer right now:  │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🫁 4-7-8 Breathing      │ │ │
│ │ │ Calm your nervous system│ │ │
│ │ │ Duration: 2 minutes     │ │ │
│ │ │ [Start Exercise]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👁️ 5-4-3-2-1 Grounding │ │ │
│ │ │ Connect with your senses│ │ │
│ │ │ Duration: 3 minutes     │ │ │
│ │ │ [Start Exercise]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💪 Progressive Muscle   │ │ │
│ │ │ Release physical tension│ │ │
│ │ │ Duration: 10 minutes    │ │ │
│ │ │ [Start Exercise]        │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎵 Calming Audio            │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🌊 Ocean Waves          │ │ │
│ │ │ Natural sounds          │ │ │
│ │ │ [Play] [Download]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Guided Meditation    │ │ │
│ │ │ "Finding Peace"         │ │ │
│ │ │ 5 minutes               │ │ │
│ │ │ [Play] [Download]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎶 Calming Playlist     │ │ │
│ │ │ Curated peaceful music  │ │ │
│ │ │ [Play] [Customize]      │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 Thought Exercises        │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 💭 Thought Challenging  │ │ │
│ │ │ Question negative thoughts│ │ │
│ │ │ [Start Exercise]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📋 Gratitude List       │ │ │
│ │ │ Focus on positive things│ │ │
│ │ │ [Start Exercise]        │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎯 Distraction Activities│ │ │
│ │ │ Healthy ways to redirect│ │ │
│ │ │ [View Activities]       │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆘 Still Need Help?         │ │
│ │                             │ │
│ │ If these tools aren't       │ │
│ │ helping, please reach out:  │ │
│ │                             │ │
│ │ [Call Crisis Hotline]       │ │
│ │ [Contact Therapist]         │ │
│ │ [Emergency Services]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 5. Local Resources (`/crisis-support/local`)

#### Purpose
Location-based emergency services and mental health resources with directions and contact information.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Local Resources   [📍] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📍 Your Location            │ │
│ │ New York, NY                │ │
│ │ [Change Location]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏥 Emergency Services       │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚑 City General Hospital│ │ │
│ │ │ Emergency Room          │ │ │
│ │ │ 0.8 miles away          │ │ │
│ │ │ 24/7 Psychiatric Care   │ │ │
│ │ │ [Call] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚓 Police Department    │ │ │
│ │ │ Crisis Intervention Team│ │ │
│ │ │ 1.2 miles away          │ │ │
│ │ │ Mental Health Training  │ │ │
│ │ │ [Call] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏢 Mental Health Centers    │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧠 Community Mental     │ │ │
│ │ │ Health Center           │ │ │
│ │ │ 2.1 miles away          │ │ │
│ │ │ Walk-in crisis services │ │ │
│ │ │ Mon-Fri 8AM-8PM         │ │ │
│ │ │ [Call] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏥 Psychiatric Hospital │ │ │
│ │ │ Inpatient & Outpatient  │ │ │
│ │ │ 3.5 miles away          │ │ │
│ │ │ 24/7 Crisis Assessment  │ │ │
│ │ │ [Call] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏠 Support Groups           │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👥 NAMI Support Group   │ │ │
│ │ │ Peer support meetings   │ │ │
│ │ │ 1.5 miles away          │ │ │
│ │ │ Tuesdays 7PM            │ │ │
│ │ │ [Info] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🧘 Mindfulness Center   │ │ │
│ │ │ Meditation & wellness   │ │ │
│ │ │ 2.8 miles away          │ │ │
│ │ │ Drop-in sessions        │ │ │
│ │ │ [Info] [Directions]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🚨 Crisis Mobile Teams      │ │
│ │                             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚐 Mobile Crisis Unit   │ │ │
│ │ │ On-site crisis response │ │ │
│ │ │ Available 24/7          │ │ │
│ │ │ Response time: 30 min   │ │ │
│ │ │ [Request Team]          │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ [View Map] [Update Location]    │
└─────────────────────────────────┘
```

---

### 6. Crisis Chat (`/crisis-support/chat`)

#### Purpose
Real-time crisis support chat with trained counselors and immediate assistance.

#### Screen Layout
```
┌─────────────────────────────────┐
│ [← Back] Crisis Chat       [⚙️] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💬 Connected to Crisis      │ │
│ │ Support Counselor           │ │
│ │                             │ │
│ │ Response time: < 2 minutes  │ │
│ │ Available 24/7              │ │
│ │ Confidential & Anonymous    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Chat Messages               │ │
│ │                             │ │
│ │ 👤 Counselor Sarah          │ │
│ │ Hi there! I'm here to help. │ │
│ │ How are you feeling right   │ │
│ │ now?                        │ │
│ │ 2:34 PM                     │ │
│ │                             │ │
│ │                        You 👤│ │
│ │                I'm feeling  │ │
│ │                overwhelmed  │ │
│ │                and scared.  │ │
│ │                    2:35 PM  │ │
│ │                             │ │
│ │ 👤 Counselor Sarah          │ │
│ │ I understand that must be   │ │
│ │ really difficult. You're    │ │
│ │ brave for reaching out.     │ │
│ │ Can you tell me more about  │ │
│ │ what's making you feel      │ │
│ │ overwhelmed?                │ │
│ │ 2:35 PM                     │ │
│ │                             │ │
│ │                        You 👤│ │
│ │                I've been    │ │
│ │                having       │ │
│ │                thoughts of  │ │
│ │                hurting      │ │
│ │                myself...    │ │
│ │                    2:36 PM  │ │
│ │                             │ │
│ │ 👤 Counselor Sarah          │ │
│ │ Thank you for sharing that  │ │
│ │ with me. I'm concerned about│ │
│ │ your safety. Are you in a   │ │
│ │ safe place right now?       │ │
│ │ 2:36 PM                     │ │
│ │                             │ │
│ │ 🔄 Counselor is typing...   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Type your message...]      │ │
│ │                        [📤] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆘 Emergency Options        │ │
│ │                             │ │
│ │ [Call 911] [Call Hotline]   │ │
│ │ [Share Location] [Get Help] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔒 Privacy Notice           │ │
│ │                             │ │
│ │ This chat is confidential   │ │
│ │ and anonymous. We may need  │ │
│ │ to contact emergency        │ │
│ │ services if you're in       │ │
│ │ immediate danger.           │ │
│ │                             │ │
│ │ [Privacy Policy]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Integration
```typescript
// Initiate crisis chat
POST /api/crisis-support/chat/start
Authorization: Bearer {access_token}

Request Body:
{
  "urgencyLevel": "high",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "preferredLanguage": "en"
}

Response:
{
  "success": true,
  "data": {
    "chatId": "crisis_chat_123",
    "counselorId": "counselor_456",
    "counselorName": "Sarah",
    "estimatedWaitTime": 120, // seconds
    "sessionToken": "session_789",
    "emergencyProtocols": {
      "localEmergency": "911",
      "crisisHotline": "988",
      "textCrisis": "741741"
    }
  }
}

// Send crisis chat message
POST /api/crisis-support/chat/{chatId}/message
Authorization: Bearer {access_token}

Request Body:
{
  "message": "I'm feeling overwhelmed and scared",
  "urgencyLevel": "medium",
  "needsImmediate": false
}

Response:
{
  "success": true,
  "data": {
    "messageId": "msg_123",
    "timestamp": "2024-01-15T14:36:00Z",
    "delivered": true,
    "counselorNotified": true
  }
}

// Get crisis resources
GET /api/crisis-support/resources/local?lat=40.7128&lng=-74.0060
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "emergencyServices": [
      {
        "id": "hospital_123",
        "name": "City General Hospital",
        "type": "emergency_room",
        "address": "123 Hospital Ave, New York, NY 10001",
        "phone": "+1-555-0911",
        "distance": 0.8, // miles
        "availability": "24/7",
        "services": ["psychiatric_emergency", "crisis_assessment"],
        "coordinates": {
          "latitude": 40.7589,
          "longitude": -73.9851
        }
      }
    ],
    "mentalHealthCenters": [
      {
        "id": "center_456",
        "name": "Community Mental Health Center",
        "type": "crisis_center",
        "address": "456 Wellness St, New York, NY 10002",
        "phone": "+1-555-0123",
        "distance": 2.1,
        "availability": "Mon-Fri 8AM-8PM",
        "services": ["walk_in_crisis", "counseling", "assessment"]
      }
    ]
  }
}
```

## 🔄 Screen Flow Patterns

### Crisis Intervention Flow
```
Crisis Detection
├─ Immediate Danger → Emergency Services → Professional Intervention → Follow-up Care
├─ High Risk → Crisis Chat → Safety Assessment → Resource Connection
├─ Medium Risk → Coping Tools → Safety Planning → Support Contact
└─ Low Risk → Self-Help Resources → Monitoring → Preventive Care

Safety Planning Flow
├─ Warning Signal Identification → Coping Strategy Development → Support Network Building
├─ Professional Contact Setup → Emergency Protocol Creation → Plan Testing
├─ Regular Updates → Effectiveness Review → Plan Refinement
└─ Crisis Activation → Plan Execution → Professional Intervention → Plan Revision
```

## 📊 Performance Metrics

### Crisis Response
- **Response Time**: Average time to connect with crisis support
- **Resolution Rate**: Successful crisis intervention outcomes
- **Follow-up Engagement**: Continued care after crisis episodes
- **Resource Utilization**: Usage of local emergency services

### Safety Planning
- **Plan Completion**: Users with active safety plans
- **Plan Effectiveness**: Crisis prevention success rates
- **Update Frequency**: Regular safety plan maintenance
- **Professional Integration**: Therapist collaboration on plans

## 🔒 Safety & Legal Compliance

### Emergency Protocols
- Mandatory reporting for imminent danger
- Integration with local emergency services
- Professional counselor training and certification
- 24/7 crisis support availability

### Privacy & Confidentiality
- HIPAA-compliant crisis communications
- Anonymous crisis chat options
- Secure emergency contact storage
- Clear privacy policy for crisis situations

---

This documentation provides comprehensive coverage of all crisis support screens with safety-first design, immediate intervention capabilities, and professional-grade crisis management tools. 