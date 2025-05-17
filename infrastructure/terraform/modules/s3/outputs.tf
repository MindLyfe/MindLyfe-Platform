output "media_bucket_name" {
  description = "The name of the media bucket"
  value       = aws_s3_bucket.media.id
}

output "media_bucket_arn" {
  description = "The ARN of the media bucket"
  value       = aws_s3_bucket.media.arn
}

output "logs_bucket_name" {
  description = "The name of the logs bucket"
  value       = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  description = "The ARN of the logs bucket"
  value       = aws_s3_bucket.logs.arn
}

output "archives_bucket_name" {
  description = "The name of the archives bucket"
  value       = aws_s3_bucket.archives.id
}

output "archives_bucket_arn" {
  description = "The ARN of the archives bucket"
  value       = aws_s3_bucket.archives.arn
} 