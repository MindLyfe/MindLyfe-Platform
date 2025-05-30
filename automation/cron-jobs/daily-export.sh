#!/bin/bash

# MindLyf Data Lake - Daily Export and Processing Script
# This script runs daily to export training data, process embeddings, and generate reports
# Cron: 0 2 * * * (runs at 2 AM daily)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="/var/log/mindlyf-data-lake"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log file for this run
LOG_FILE="$LOG_DIR/daily-export-$TIMESTAMP.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    send_alert "Daily Export Failed" "$1"
    exit 1
}

# Function to send alerts (placeholder - implement based on your notification system)
send_alert() {
    local subject="$1"
    local message="$2"
    
    # Send to SNS topic if configured
    if [[ -n "${SNS_TOPIC_ARN:-}" ]]; then
        aws sns publish \
            --topic-arn "$SNS_TOPIC_ARN" \
            --subject "$subject" \
            --message "$message" \
            --region "${AWS_REGION:-us-east-1}" || true
    fi
    
    # Send to Slack if webhook is configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$subject: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required environment variables are set
    local required_vars=(
        "DATA_LAKE_BUCKET_NAME"
        "AWS_REGION"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable $var is not set"
        fi
    done
    
    # Check if AWS CLI is available and configured
    if ! command -v aws &> /dev/null; then
        error_exit "AWS CLI is not installed or not in PATH"
    fi
    
    # Test AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error_exit "AWS credentials are not configured or invalid"
    fi
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        error_exit "Node.js is not installed or not in PATH"
    fi
    
    # Check if npm packages are built
    if [[ ! -d "$PROJECT_ROOT/data-pipeline/ai-training-export/dist" ]]; then
        log "Building AI training export package..."
        cd "$PROJECT_ROOT/data-pipeline/ai-training-export"
        npm run build || error_exit "Failed to build AI training export package"
    fi
    
    if [[ ! -d "$PROJECT_ROOT/data-pipeline/embedding-pipeline/dist" ]]; then
        log "Building embedding pipeline package..."
        cd "$PROJECT_ROOT/data-pipeline/embedding-pipeline"
        npm run build || error_exit "Failed to build embedding pipeline package"
    fi
    
    log "Prerequisites check completed successfully"
}

# Function to export training data
export_training_data() {
    log "Starting training data export..."
    
    cd "$PROJECT_ROOT/data-pipeline/ai-training-export"
    
    # Export data for the last 7 days
    local start_date=$(date -d '7 days ago' +%Y-%m-%d)
    local end_date=$(date -d '1 day ago' +%Y-%m-%d)
    
    log "Exporting training data from $start_date to $end_date"
    
    # Run the export with error handling
    if node dist/cli.js \
        --mode daily \
        --start-date "$start_date" \
        --end-date "$end_date" \
        --services "lyfbot-service,ai-service,journal-service,recommendation-service" \
        --quality-threshold 0.6 \
        --anonymize-data true \
        --filter-crisis-content true \
        --output-format jsonl \
        --compress true 2>&1 | tee -a "$LOG_FILE"; then
        log "Training data export completed successfully"
    else
        error_exit "Training data export failed"
    fi
}

# Function to process embeddings
process_embeddings() {
    log "Starting embedding processing..."
    
    cd "$PROJECT_ROOT/data-pipeline/embedding-pipeline"
    
    # Process embeddings for the last day
    local target_date=$(date -d '1 day ago' +%Y-%m-%d)
    
    log "Processing embeddings for $target_date"
    
    # Run the embedding pipeline with error handling
    if node dist/cli.js \
        --mode daily \
        --date "$target_date" \
        --services "lyfbot-service,journal-service,chat-service" \
        --embedding-model "text-embedding-ada-002" \
        --chunk-size 1000 \
        --overlap 200 \
        --batch-size 100 \
        --vector-db "qdrant" \
        --backup-to-s3 true 2>&1 | tee -a "$LOG_FILE"; then
        log "Embedding processing completed successfully"
    else
        error_exit "Embedding processing failed"
    fi
}

# Function to generate compliance reports
generate_compliance_reports() {
    log "Generating compliance reports..."
    
    # Create reports directory
    local reports_dir="$PROJECT_ROOT/reports/daily/$DATE"
    mkdir -p "$reports_dir"
    
    # Generate consent summary report
    log "Generating consent summary report..."
    if node -e "
        const { ConsentManager } = require('$PROJECT_ROOT/shared/data-lake-logger/dist');
        const fs = require('fs');
        
        (async () => {
            try {
                const consentManager = new ConsentManager();
                const summary = await consentManager.getConsentSummary();
                
                const report = {
                    date: '$DATE',
                    timestamp: new Date().toISOString(),
                    ...summary
                };
                
                fs.writeFileSync('$reports_dir/consent_summary.json', JSON.stringify(report, null, 2));
                console.log('Consent summary report generated successfully');
            } catch (error) {
                console.error('Failed to generate consent summary:', error);
                process.exit(1);
            }
        })();
    " 2>&1 | tee -a "$LOG_FILE"; then
        log "Consent summary report generated successfully"
    else
        log "WARNING: Failed to generate consent summary report"
    fi
    
    # Generate data volume report
    log "Generating data volume report..."
    local volume_report="$reports_dir/data_volume.json"
    
    # Count objects in S3 by service
    aws s3api list-objects-v2 \
        --bucket "$DATA_LAKE_BUCKET_NAME" \
        --prefix "raw/" \
        --query 'Contents[?LastModified>=`'"$(date -d '1 day ago' --iso-8601)"'`].[Key,Size]' \
        --output json > "$volume_report.tmp" || error_exit "Failed to query S3 for data volume"
    
    # Process the data into a summary
    node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$volume_report.tmp', 'utf8'));
        
        const summary = {
            date: '$DATE',
            timestamp: new Date().toISOString(),
            totalFiles: data.length,
            totalSize: data.reduce((sum, [key, size]) => sum + size, 0),
            serviceBreakdown: {}
        };
        
        data.forEach(([key, size]) => {
            const service = key.split('/')[1];
            if (!summary.serviceBreakdown[service]) {
                summary.serviceBreakdown[service] = { files: 0, size: 0 };
            }
            summary.serviceBreakdown[service].files++;
            summary.serviceBreakdown[service].size += size;
        });
        
        fs.writeFileSync('$volume_report', JSON.stringify(summary, null, 2));
        fs.unlinkSync('$volume_report.tmp');
        console.log('Data volume report generated successfully');
    " 2>&1 | tee -a "$LOG_FILE"
    
    log "Compliance reports generated successfully"
}

# Function to cleanup old logs and temporary files
cleanup() {
    log "Performing cleanup..."
    
    # Remove log files older than 30 days
    find "$LOG_DIR" -name "daily-export-*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Remove temporary files
    find /tmp -name "mindlyf-*" -mtime +1 -delete 2>/dev/null || true
    
    log "Cleanup completed"
}

# Function to upload reports to S3
upload_reports() {
    log "Uploading reports to S3..."
    
    local reports_dir="$PROJECT_ROOT/reports/daily/$DATE"
    
    if [[ -d "$reports_dir" ]]; then
        # Upload reports to S3
        aws s3 sync "$reports_dir" "s3://$DATA_LAKE_BUCKET_NAME/analytics/daily_reports/$DATE/" \
            --region "$AWS_REGION" \
            --sse aws:kms \
            --sse-kms-key-id "$DATA_LAKE_KMS_KEY_ID" 2>&1 | tee -a "$LOG_FILE" || error_exit "Failed to upload reports to S3"
        
        log "Reports uploaded to S3 successfully"
    else
        log "No reports directory found, skipping upload"
    fi
}

# Function to send success notification
send_success_notification() {
    local duration=$1
    local message="Daily data lake export completed successfully in ${duration}s"
    
    log "$message"
    send_alert "Daily Export Success" "$message"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    log "=== Starting MindLyf Data Lake Daily Export - $TIMESTAMP ==="
    
    # Load environment variables if .env file exists
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        log "Loading environment variables from .env file"
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
    fi
    
    # Run all tasks
    check_prerequisites
    export_training_data
    process_embeddings
    generate_compliance_reports
    upload_reports
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    send_success_notification "$duration"
    
    log "=== Daily export completed successfully in ${duration}s ==="
}

# Handle script interruption
trap 'error_exit "Script interrupted"' INT TERM

# Run main function
main "$@" 