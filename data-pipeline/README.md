# MindLyfe Data Lake + AI Logging + Training Pipeline

A comprehensive data lake and AI training pipeline system for the MindLyfe mental health platform. This system captures, processes, and manages data across all microservices for AI training, analytics, personalization, and compliance.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MindLyfe Microservices                        │
├─────────────────────────────────────────────────────────────────┤
│ auth-service │ lyfbot-service │ journal-service │ ai-service     │
│ payment-service │ chat-service │ community-service │ etc...      │
└─────────────────┬───────────────────────────────────────────────┘
                  │ @mindlyfe/data-lake-logger
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    S3 Data Lake                                 │
│  s3://mindlyfe-data-lake/                                        │
│  ├── raw/{service}/{YYYY}/{MM}/{DD}/[user_id].json             │
│  ├── processed/                                                 │
│  │   └── training-data/ai_pairs.jsonl                          │
│  ├── analytics/                                                 │
│  ├── embeddings/                                                │
│  └── backups/                                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                Processing Pipelines                             │
├─────────────────────────────────────────────────────────────────┤
│ AI Training Export │ Embedding Pipeline │ Analytics Pipeline    │
│ PII Anonymization  │ Consent Management │ Compliance Reporting  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              Vector Database & Analytics                        │
├─────────────────────────────────────────────────────────────────┤
│ Qdrant/Weaviate │ AWS Athena │ Custom AI Models │ Dashboards    │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Components

### 1. Shared Data Lake Logger (`shared/data-lake-logger/`)
- **Purpose**: Shared library for all microservices to log data to S3
- **Features**: 
  - Schema validation with Zod
  - PII detection and anonymization
  - Consent management (GDPR/HIPAA/PDPO compliant)
  - Buffering and compression
  - Encryption with AWS KMS
  - Retry logic and error handling

### 2. AI Training Export Pipeline (`data-pipeline/ai-training-export/`)
- **Purpose**: Extract and process raw logs into JSONL training data
- **Features**:
  - Service-specific data extraction
  - Quality scoring and filtering
  - Consent verification
  - Crisis content filtering
  - Automated daily/weekly exports

### 3. Embedding Pipeline (`data-pipeline/embedding-pipeline/`)
- **Purpose**: Create vector embeddings for semantic search and personalization
- **Features**:
  - OpenAI embeddings integration
  - Qdrant/Weaviate vector database support
  - Text preprocessing and chunking
  - Incremental updates
  - Backup to S3

### 4. Infrastructure (`infrastructure/data-lake/`)
- **Purpose**: Terraform configuration for AWS infrastructure
- **Resources**:
  - S3 bucket with lifecycle policies
  - KMS encryption keys
  - IAM roles and policies
  - CloudWatch monitoring
  - Athena for analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- Terraform (for infrastructure)
- Docker (optional)

### 1. Infrastructure Setup

```bash
cd infrastructure/data-lake/terraform
terraform init
terraform plan
terraform apply
```

### 2. Install Shared Logger

```bash
cd shared/data-lake-logger
npm install
npm run build
npm link  # For local development
```

### 3. Integrate with Microservices

```typescript
// In your microservice
import { createDataLakeLoggerFromEnv, LyfBotLog } from '@mindlyfe/data-lake-logger';

const dataLakeLogger = createDataLakeLoggerFromEnv();

// Log LyfBot interaction
await dataLakeLogger.log({
  service: 'lyfbot-service',
  user_id: 'u_12345',
  timestamp: new Date().toISOString(),
  interaction_type: 'response',
  prompt: 'How are you feeling today?',
  response: 'I understand you want to check in on your feelings...',
  model: 'gpt-4-turbo',
  session_id: 'sess_67890',
  conversation_id: 'conv_abc123',
  intent: 'mood_check',
  confidence_score: 0.95
} as LyfBotLog);
```

### 4. Run Training Data Export

```bash
cd data-pipeline/ai-training-export
npm install
npm run build

# Export last 7 days
npm run export:daily

# Export custom date range
node dist/cli.js --start-date 2024-01-01 --end-date 2024-01-31 --services lyfbot-service,ai-service
```

### 5. Run Embedding Pipeline

```bash
cd data-pipeline/embedding-pipeline
npm install
npm run build

# Process daily embeddings
npm run embed:daily

# Sync to vector database
npm run vector:sync
```

## 🔧 Configuration

### Environment Variables

```bash
# Data Lake Configuration
DATA_LAKE_BUCKET_NAME=mindlyfe-data-lake
DATA_LAKE_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
DATA_LAKE_ENABLE_COMPRESSION=true
DATA_LAKE_ENABLE_ENCRYPTION=true
DATA_LAKE_BUFFER_SIZE=100
DATA_LAKE_FLUSH_INTERVAL=30000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Service URLs (for consent management)
AUTH_SERVICE_URL=http://auth-service:3001
SERVICE_TOKEN=your-service-token

# AI/Embedding Configuration
OPENAI_API_KEY=your-openai-key
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=your-qdrant-key
WEAVIATE_URL=http://weaviate:8080
```

## 📊 Data Lake Structure

```
s3://mindlyfe-data-lake/
├── raw/                              # Raw logs from services
│   ├── lyfbot-service/
│   │   └── 2024/01/15/
│   │       ├── u_12345_143022_a1b2c3d4.json.gz
│   │       └── u_67890_143055_e5f6g7h8.json.gz
│   ├── journal-service/
│   ├── ai-service/
│   └── ...
├── processed/                        # Processed data for AI training
│   └── training-data/
│       ├── ai_training_data_2024-01-15-143000_a1b2c3d4.jsonl.gz
│       └── ai_training_data_2024-01-14-143000_e5f6g7h8.jsonl.gz
├── analytics/                        # Analytics exports
│   └── monthly_reports/
│       └── 2024/01/
│           ├── user_engagement.csv
│           ├── service_metrics.parquet
│           └── compliance_report.json
├── embeddings/                       # Vector embeddings backup
│   └── lyfbot-service/
│       └── 2024/01/15/
│           └── embeddings_backup.json.gz
└── backups/                         # Data backups
    └── consent_records/
        └── 2024-01-15_consent_backup.json.gz
```

## 🔒 Compliance & Privacy

### GDPR Compliance
- ✅ Explicit consent tracking
- ✅ Right to be forgotten (data erasure)
- ✅ Data portability
- ✅ Privacy by design
- ✅ Audit logging

### HIPAA Compliance
- ✅ Encryption at rest and in transit
- ✅ Access controls and audit trails
- ✅ Business Associate Agreements
- ✅ Minimum necessary standard
- ✅ Breach notification procedures

### PDPO Compliance
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Consent management
- ✅ Cross-border transfer controls
- ✅ Data subject rights

### PII Handling
```typescript
// Automatic PII detection and anonymization
const piiDetector = new PIIDetector();

// Add custom PII patterns
piiDetector.addPIIPattern('medical_id', /MID-\d{6}/g);

// Configure anonymization
piiDetector.addPIIField({
  field: 'therapy_notes',
  type: 'custom',
  anonymizationMethod: 'hash',
  preserveFormat: false
});
```

## 🤖 AI Training Data Format

### JSONL Output Format
```jsonl
{"prompt": "How are you feeling today?", "completion": "I understand you want to check in on your feelings. It's important to acknowledge how you're doing emotionally.", "metadata": {"source": "lyfbot", "timestamp": "2024-01-15T14:30:22Z", "quality_score": 0.85, "tags": ["conversation", "mental-health", "support"]}}
{"prompt": "I'm feeling anxious about work", "completion": "I hear that work is causing you anxiety. That's a common experience, and it's okay to feel this way. Would you like to explore some strategies to help manage these feelings?", "metadata": {"source": "lyfbot", "timestamp": "2024-01-15T14:32:15Z", "quality_score": 0.92, "tags": ["anxiety", "work-stress", "coping-strategies"]}}
```

### Quality Scoring
- **Length appropriateness**: 0.1 points
- **Helpful language**: 0.1 points
- **Avoids unhelpful responses**: 0.1 points
- **Vocabulary diversity**: 0.1 points
- **Mental health appropriateness**: 0.1 points
- **Base score**: 0.5 points

## 📈 Analytics & Monitoring

### Key Metrics
- **Data Volume**: Logs per service per day
- **Processing Latency**: Time from log to processed data
- **Quality Scores**: Average training data quality
- **Consent Rates**: User consent percentages
- **Error Rates**: Failed processing attempts

### Dashboards
- Real-time data ingestion monitoring
- Training data quality trends
- Compliance metrics
- Cost optimization insights

## 🔄 Automation & Scheduling

### Daily Tasks (Cron: 0 2 * * *)
```bash
# Export training data
npm run export:daily

# Process embeddings
npm run embed:daily

# Generate compliance reports
npm run compliance:daily
```

### Weekly Tasks (Cron: 0 3 * * 0)
```bash
# Full embedding sync
npm run vector:sync

# Analytics export
npm run analytics:weekly

# Data quality assessment
npm run quality:assess
```

### Monthly Tasks (Cron: 0 4 1 * *)
```bash
# Comprehensive analytics
npm run analytics:monthly

# Consent audit
npm run consent:audit

# Cost optimization review
npm run cost:optimize
```

## 🧪 Testing

### Unit Tests
```bash
cd shared/data-lake-logger
npm test

cd data-pipeline/ai-training-export
npm test
```

### Integration Tests
```bash
# Test full pipeline
npm run test:integration

# Test with sample data
npm run test:sample-data
```

### Load Testing
```bash
# Simulate high-volume logging
npm run test:load

# Test S3 upload performance
npm run test:s3-performance
```

## 🚨 Troubleshooting

### Common Issues

1. **S3 Upload Failures**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Verify bucket permissions
   aws s3 ls s3://mindlyfe-data-lake/
   ```

2. **PII Detection False Positives**
   ```typescript
   // Adjust PII patterns
   piiDetector.addPIIPattern('custom_id', /CUSTOM-\d{4}/g);
   ```

3. **Consent Check Failures**
   ```bash
   # Verify auth service connectivity
   curl $AUTH_SERVICE_URL/health
   ```

4. **Vector Database Connection Issues**
   ```bash
   # Check Qdrant health
   curl $QDRANT_URL/health
   ```

## 📚 API Reference

### DataLakeLogger
```typescript
interface DataLakeLogger {
  log(entry: LogEntry, options?: LoggingOptions): Promise<void>;
  logBatch(entries: LogEntry[], options?: LoggingOptions): Promise<void>;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
}
```

### TrainingDataExporter
```typescript
interface TrainingDataExporter {
  exportTrainingData(): Promise<ExportStats>;
  static exportDateRange(start: Date, end: Date, services: string[]): Promise<ExportStats>;
  static exportLastDays(days: number, services: string[]): Promise<ExportStats>;
}
```

### ConsentManager
```typescript
interface ConsentManager {
  checkConsent(userId: string, purpose: ConsentPurpose): Promise<boolean>;
  updateConsent(userId: string, updates: Partial<UserConsent>): Promise<void>;
  revokeAllConsent(userId: string): Promise<void>;
  canIncludeInAITraining(userId: string): Promise<boolean>;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure compliance with privacy standards
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: [Internal Wiki](https://wiki.mindlyfe.com/data-lake)
- **Slack**: #data-engineering
- **Email**: data-team@mindlyfe.com
- **On-call**: PagerDuty rotation

---

**⚠️ Important**: This system handles sensitive mental health data. Always follow HIPAA, GDPR, and PDPO guidelines when working with user data. When in doubt, consult the compliance team.