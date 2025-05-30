# MindLyfe Reporting Service

## 📊 Overview

The MindLyfe Reporting Service is a comprehensive analytics and reporting microservice designed to provide actionable insights into platform usage, user engagement, clinical outcomes, and business metrics. It serves as the central data intelligence hub for the MindLyfe mental health platform.

## 🏗️ Architecture

### Data Flow Architecture

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   Operational Services  ├─────►│   Data Ingestion        │
│   (Auth, Payment, etc.) │      │   & ETL Pipeline        │
└─────────────────────────┘      └─────────┬───────────────┘
                                           │
┌─────────────────────────┐                │
│                         │                │
│   Event Streaming       ├────────────────┤
│   (Real-time Events)    │                │
└─────────────────────────┘                │
                                           │
                                 ┌─────────▼───────────────┐
                                 │                         │
                                 │   Analytics Database    │
                                 │   (Data Warehouse)      │
                                 └─────────┬───────────────┘
                                           │
                                 ┌─────────▼───────────────┐
                                 │                         │
                                 │   Reporting API         │
                                 │                         │
                                 └─────────┬───────────────┘
                                           │
                                 ┌─────────▼───────────────┐
                                 │                         │
                                 │   Dashboard Frontend    │
                                 │                         │
                                 └─────────────────────────┘
```

### Core Components

```
src/
├── controllers/
│   ├── analytics.controller.ts         # Analytics endpoints
│   ├── reports.controller.ts           # Report generation endpoints
│   ├── dashboards.controller.ts        # Dashboard data endpoints
│   ├── notifications.controller.ts     # Notification analytics
│   ├── gamification.controller.ts      # Gamification analytics
│   ├── users.controller.ts             # User analytics
│   ├── payments.controller.ts          # Payment analytics
│   ├── export.controller.ts            # Data export endpoints
│   └── health.controller.ts            # Health check endpoints
├── services/
│   ├── analytics.service.ts            # Core analytics logic
│   ├── data-aggregation.service.ts     # Data aggregation
│   ├── report-generation.service.ts    # Report generation
│   ├── dashboard.service.ts            # Dashboard data
│   ├── etl.service.ts                  # ETL processing
│   ├── export.service.ts               # Data export
│   ├── notification-analytics.service.ts # Notification metrics
│   ├── gamification-analytics.service.ts # Gamification metrics
│   ├── user-analytics.service.ts       # User behavior analytics
│   └── payment-analytics.service.ts    # Payment analytics
├── entities/
│   ├── analytics-event.entity.ts       # Raw analytics events
│   ├── daily-summary.entity.ts         # Daily aggregated data
│   ├── user-metrics.entity.ts          # User-level metrics
│   ├── notification-summary.entity.ts  # Notification analytics
│   ├── gamification-summary.entity.ts  # Gamification analytics
│   ├── payment-summary.entity.ts       # Payment analytics
│   ├── report.entity.ts                # Generated reports
│   └── dashboard-widget.entity.ts      # Dashboard configurations
├── dto/
│   ├── analytics-query.dto.ts          # Analytics query parameters
│   ├── report-request.dto.ts           # Report generation request
│   ├── dashboard-config.dto.ts         # Dashboard configuration
│   ├── export-request.dto.ts           # Data export request
│   └── metrics-filter.dto.ts           # Metrics filtering
├── interfaces/
│   ├── analytics.interface.ts          # Analytics interfaces
│   ├── report.interface.ts             # Report interfaces
│   ├── dashboard.interface.ts          # Dashboard interfaces
│   └── metrics.interface.ts            # Metrics interfaces
├── enums/
│   ├── metric-type.enum.ts             # Metric types
│   ├── report-type.enum.ts             # Report types
│   ├── time-period.enum.ts             # Time period options
│   └── export-format.enum.ts           # Export formats
├── processors/
│   ├── event.processor.ts              # Event processing
│   ├── aggregation.processor.ts        # Data aggregation
│   ├── notification.processor.ts       # Notification data processing
│   └── gamification.processor.ts       # Gamification data processing
└── modules/
    ├── analytics.module.ts             # Analytics module
    ├── reports.module.ts               # Reports module
    ├── dashboards.module.ts            # Dashboards module
    ├── export.module.ts                # Export module
    └── health.module.ts                # Health check module
```

## 📈 Features

### Analytics Dashboard
- **Real-time Metrics**: Live platform usage statistics
- **User Engagement**: Activity patterns and retention metrics
- **Clinical Outcomes**: Therapy effectiveness and progress tracking
- **Business Intelligence**: Revenue, growth, and operational metrics
- **Custom Dashboards**: Configurable widgets and layouts

### Notification Analytics
- **Delivery Metrics**: Sent, delivered, failed, bounced rates
- **Engagement Metrics**: Open rates, click-through rates, conversions
- **Channel Performance**: SMS, email, push, WhatsApp, in-app analytics
- **A/B Testing**: Comparative analysis of notification variants
- **User Preferences**: Opt-out patterns and channel preferences

### Gamification Analytics
- **Feature Adoption**: Streaks, badges, achievements engagement
- **Progression Metrics**: Average streak lengths, badge completion rates
- **Reward Analytics**: Redemption rates and reward effectiveness
- **Leaderboard Insights**: Competition engagement and rankings
- **Retention Impact**: Correlation with user retention

### User Analytics
- **Behavioral Patterns**: Session duration, feature usage, navigation paths
- **Cohort Analysis**: User groups based on registration date, demographics
- **Retention Analysis**: Daily, weekly, monthly active users
- **Segmentation**: Custom user segments and their characteristics
- **Churn Prediction**: Early warning indicators for user attrition

### Payment Analytics
- **Revenue Metrics**: Daily, weekly, monthly revenue trends
- **Subscription Analytics**: Conversion rates, churn, lifetime value
- **Gateway Performance**: Success rates by payment provider
- **Geographic Analysis**: Revenue by region and currency
- **Pricing Optimization**: Plan performance and upgrade patterns

### Report Generation
- **Automated Reports**: Scheduled daily, weekly, monthly reports
- **Custom Reports**: Ad-hoc report generation with filters
- **Executive Summaries**: High-level KPI dashboards
- **Clinical Reports**: Therapy outcomes and patient progress
- **Compliance Reports**: Data privacy and regulatory compliance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+ (Analytics Database)
- Redis 6+ (Caching)
- Docker & Docker Compose

### Local Development

1. **Clone and Install**
```bash
cd backend/reporting-service
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

3. **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
npm run migration:run
```

4. **Start Development Server**
```bash
npm run start:dev
```

The service will be available at `http://localhost:3009`

## 📋 Configuration

### Environment Variables

```bash
# Service Configuration
NODE_ENV=development
PORT=3009
SERVICE_NAME=reporting-service

# Analytics Database Configuration
ANALYTICS_DB_HOST=localhost
ANALYTICS_DB_PORT=5432
ANALYTICS_DB_USERNAME=postgres
ANALYTICS_DB_PASSWORD=postgres
ANALYTICS_DB_NAME=mindlyfe_analytics

# Operational Database (Read-only)
OPERATIONAL_DB_HOST=localhost
OPERATIONAL_DB_PORT=5432
OPERATIONAL_DB_USERNAME=postgres
OPERATIONAL_DB_PASSWORD=postgres
OPERATIONAL_DB_NAME=mindlyfe_main

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h

# ETL Configuration
ETL_BATCH_SIZE=1000
ETL_SCHEDULE_INTERVAL=300000  # 5 minutes
ENABLE_REAL_TIME_PROCESSING=true
DATA_RETENTION_DAYS=365

# Report Configuration
REPORT_CACHE_TTL=3600  # 1 hour
MAX_REPORT_SIZE_MB=50
ENABLE_SCHEDULED_REPORTS=true
REPORT_STORAGE_PATH=/reports

# Dashboard Configuration
DASHBOARD_REFRESH_INTERVAL=60000  # 1 minute
MAX_DASHBOARD_WIDGETS=20
ENABLE_CUSTOM_DASHBOARDS=true

# External Services
AUTH_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_URL=http://localhost:3005
GAMIFICATION_SERVICE_URL=http://localhost:3008
PAYMENT_SERVICE_URL=http://localhost:3006
```

## 🔌 API Documentation

### Authentication

All endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

### Analytics Operations

#### Get Platform Overview
```http
GET /api/analytics/overview?timeframe=7d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15420,
    "activeUsers": 8750,
    "newUsers": 245,
    "retentionRate": 0.68,
    "averageSessionDuration": 1800,
    "totalSessions": 45230,
    "conversionRate": 0.12,
    "revenue": 125000
  }
}
```

#### Get User Engagement Metrics
```http
GET /api/analytics/engagement?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Feature Usage Analytics
```http
GET /api/analytics/features?feature=therapy-sessions&groupBy=day
```

### Notification Analytics

#### Get Notification Performance
```http
GET /api/analytics/notifications/performance?channel=email&timeframe=30d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": 125000,
    "delivered": 118750,
    "opened": 47500,
    "clicked": 9500,
    "deliveryRate": 0.95,
    "openRate": 0.40,
    "clickRate": 0.20,
    "conversionRate": 0.08
  }
}
```

#### Get Channel Comparison
```http
GET /api/analytics/notifications/channels?metric=engagement
```

#### Get A/B Test Results
```http
GET /api/analytics/notifications/ab-tests/{testId}
```

### Gamification Analytics

#### Get Gamification Overview
```http
GET /api/analytics/gamification/overview
```

#### Get Streak Analytics
```http
GET /api/analytics/gamification/streaks?type=daily-login
```

#### Get Badge Performance
```http
GET /api/analytics/gamification/badges?category=achievement
```

### User Analytics

#### Get User Cohorts
```http
GET /api/analytics/users/cohorts?cohortType=registration&period=monthly
```

#### Get Retention Analysis
```http
GET /api/analytics/users/retention?cohortDate=2024-01-01
```

#### Get User Segments
```http
GET /api/analytics/users/segments?segmentType=engagement
```

### Payment Analytics

#### Get Revenue Analytics
```http
GET /api/analytics/payments/revenue?timeframe=30d&groupBy=day
```

#### Get Subscription Metrics
```http
GET /api/analytics/payments/subscriptions?metric=churn
```

#### Get Gateway Performance
```http
GET /api/analytics/payments/gateways?metric=success-rate
```

### Report Generation

#### Generate Custom Report
```http
POST /api/reports/generate
Content-Type: application/json

{
  "reportType": "user-engagement",
  "timeframe": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "filters": {
    "userSegment": "premium",
    "features": ["therapy", "meditation"]
  },
  "format": "pdf",
  "includeCharts": true
}
```

#### Get Report Status
```http
GET /api/reports/{reportId}/status
```

#### Download Report
```http
GET /api/reports/{reportId}/download
```

### Dashboard Operations

#### Get Dashboard Configuration
```http
GET /api/dashboards/{dashboardId}
```

#### Update Dashboard
```http
PUT /api/dashboards/{dashboardId}
Content-Type: application/json

{
  "name": "Executive Dashboard",
  "widgets": [
    {
      "type": "metric",
      "title": "Active Users",
      "query": "users.active.daily",
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
    }
  ]
}
```

#### Get Widget Data
```http
GET /api/dashboards/widgets/{widgetId}/data?timeframe=7d
```

### Data Export

#### Export Analytics Data
```http
POST /api/export/analytics
Content-Type: application/json

{
  "dataType": "user-events",
  "timeframe": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "format": "csv",
  "includeHeaders": true,
  "filters": {
    "eventTypes": ["login", "session_start", "feature_usage"]
  }
}
```

## 📊 Data Models

### Analytics Event Schema

```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
  };
}
```

### Aggregated Metrics Schema

```typescript
interface DailySummary {
  date: Date;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  averageSessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  retentionRate: number;
}
```

## 🔄 ETL Pipeline

### Data Sources

1. **Operational Databases**: User data, transactions, content
2. **Event Streams**: Real-time user interactions
3. **External APIs**: Third-party service data
4. **Log Files**: Application and server logs

### Processing Stages

1. **Extract**: Pull data from various sources
2. **Transform**: Clean, normalize, and enrich data
3. **Load**: Store processed data in analytics database
4. **Aggregate**: Create summary tables and metrics
5. **Index**: Optimize for query performance

### Scheduling

- **Real-time**: Event streaming for immediate insights
- **Hourly**: User activity aggregation
- **Daily**: Comprehensive metrics calculation
- **Weekly**: Cohort analysis and retention metrics
- **Monthly**: Business intelligence reports

## 📈 Key Metrics

### Platform Metrics
- Daily/Monthly Active Users (DAU/MAU)
- User Retention Rates
- Session Duration and Frequency
- Feature Adoption Rates
- Conversion Funnels

### Clinical Metrics
- Therapy Session Completion Rates
- Patient Progress Indicators
- Treatment Outcome Measures
- Therapist Utilization Rates
- Clinical Goal Achievement

### Business Metrics
- Revenue Growth
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Churn Rate
- Monthly Recurring Revenue (MRR)

### Engagement Metrics
- Notification Engagement Rates
- Gamification Participation
- Community Activity Levels
- Content Consumption Patterns
- Support Ticket Volume

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:cov
```

### Integration Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
# Test query performance
npm run test:performance

# Load test analytics endpoints
k6 run tests/load/analytics-load-test.js
```

## 🚀 Deployment

### Docker Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

- **Liveness**: `/health/live`
- **Readiness**: `/health/ready`
- **Database**: `/health/database`
- **ETL Pipeline**: `/health/etl`

## 🔧 Development

### Adding New Metrics

1. **Define Metric Schema**
```typescript
// src/interfaces/metrics.interface.ts
export interface NewMetric {
  name: string;
  value: number;
  timestamp: Date;
  dimensions: Record<string, string>;
}
```

2. **Create Aggregation Logic**
```typescript
// src/services/aggregation.service.ts
async aggregateNewMetric(timeframe: string): Promise<NewMetric[]> {
  // Implementation
}
```

3. **Add API Endpoint**
```typescript
// src/controllers/analytics.controller.ts
@Get('new-metric')
async getNewMetric(@Query() query: AnalyticsQueryDto) {
  // Implementation
}
```

### Creating Custom Reports

1. **Define Report Template**
2. **Implement Data Queries**
3. **Add Visualization Components**
4. **Configure Export Options**

## 📚 Additional Resources

- [Analytics Best Practices](./docs/ANALYTICS_BEST_PRACTICES.md)
- [API Documentation](http://localhost:3009/api/docs) (when running locally)
- [Data Schema Reference](./docs/DATA_SCHEMA.md)
- [ETL Pipeline Guide](./docs/ETL_PIPELINE.md)
- [Dashboard Configuration](./docs/DASHBOARD_CONFIG.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement analytics features
4. Add comprehensive tests
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and guides

---

**MindLyfe Reporting Service** - Transforming data into actionable insights for mental health platform optimization. 