# MindLyfe Scaling Guide

This document provides guidance on how to scale the MindLyfe infrastructure to handle increased load or growing user base.

## Scaling Principles

The MindLyfe platform follows these scaling principles:

1. **Horizontal over vertical scaling**: Prefer adding more instances over increasing instance sizes
2. **Auto-scaling when possible**: Implement automatic scaling mechanisms to handle fluctuating loads
3. **Distributed workloads**: Distribute workloads across multiple availability zones
4. **Caching**: Implement appropriate caching strategies to reduce load on core services
5. **Data partitioning**: Shard databases when necessary to handle increased data volume

## Kubernetes Workloads

### Horizontal Pod Autoscaler

MindLyfe services are configured with Horizontal Pod Autoscalers (HPA) that automatically scale based on CPU and memory utilization:

```bash
# View current HPAs
kubectl get hpa -n mindlyfe

# Modify HPA thresholds
kubectl edit hpa <service-name>-hpa -n mindlyfe
```

Key services HPA configurations:

| Service | Min Replicas | Max Replicas | CPU Target | Memory Target |
|---------|--------------|--------------|------------|---------------|
| API Gateway | 2 | 10 | 70% | 80% |
| Auth Service | 2 | 8 | 70% | 80% |
| AI Service | 2 | 10 | 70% | 80% |
| Teletherapy Service | 2 | 12 | 70% | 80% |

### Cluster Autoscaler

The EKS cluster has node group autoscaling enabled, which automatically adds or removes nodes based on pod scheduling demands:

```bash
# View current node groups
kubectl get nodes

# Check autoscaler logs
kubectl logs -n kube-system -l app=cluster-autoscaler
```

## Database Scaling

### RDS PostgreSQL

The MindLyfe PostgreSQL database can be scaled in several ways:

1. **Vertical Scaling**: Increase the instance size (CPU/Memory)
   ```bash
   # Example Terraform change
   rds_instance_class = "db.r5.2xlarge"
   ```

2. **Read Replicas**: Add read replicas to offload read operations
   ```bash
   # Add a read replica in Terraform
   aws_db_instance.read_replica = {
     replicate_source_db = module.rds.db_instance_id
     instance_class     = var.rds_instance_class
   }
   ```

3. **Storage Scaling**: Increase allocated storage
   ```bash
   # Example Terraform change
   rds_allocated_storage = 500
   ```

### ElastiCache Redis

The Redis cluster can be scaled as follows:

1. **Increase Node Size**: Use larger instance types
   ```bash
   # Example Terraform change
   redis_node_type = "cache.r5.large"
   ```

2. **Add Nodes**: Increase the number of nodes in the cluster
   ```bash
   # Example Terraform change
   redis_num_nodes = 3
   ```

## Service-Specific Scaling

### AI Service

The AI service is one of the most resource-intensive components and may require special attention:

1. **Model Caching**: Implement model response caching to reduce API calls
2. **Request Batching**: Batch similar requests to reduce API costs and improve throughput
3. **Implement Queue**: Use SQS or Redis-based queue for handling spikes in AI requests
4. **Dedicated Node Groups**: Consider using CPU or GPU optimized node groups
   ```bash
   # Example node selector in Kubernetes
   nodeSelector:
     workload: cpu
   ```

### Teletherapy Service

The WebRTC-based teletherapy service has unique scaling considerations:

1. **Media Server Scaling**: Add more media server instances for handling WebRTC sessions
2. **Geographic Distribution**: Deploy media servers closer to users
3. **TURN Server Capacity**: Monitor and scale TURN servers for handling NAT traversal

## Monitoring and Thresholds

Key metrics to monitor for scaling decisions:

1. **CPU Utilization**: >70% sustained for 5+ minutes
2. **Memory Usage**: >80% sustained for 5+ minutes
3. **Request Latency**: >200ms P95 latency
4. **Database Connections**: >80% of maximum connections
5. **Queue Depth**: >1000 messages or >60 second processing delay

## Cost Optimization

As you scale, consider these cost optimization strategies:

1. **Right-sizing**: Regularly analyze resource usage and adjust accordingly
2. **Spot Instances**: Use spot instances for non-critical workloads
3. **Reserved Instances**: Purchase reserved instances for predictable baseline load
4. **Autoscaling Schedules**: Implement time-based scaling for predictable traffic patterns
5. **Resource Quotas**: Set resource quotas to prevent unexpected costs

## Scaling Procedure

When scaling is needed:

1. **Analyze Metrics**: Review monitoring data to identify bottlenecks
2. **Update Configuration**: Modify Terraform variables or Kubernetes manifests
3. **Apply Changes**: Apply changes in dev/staging environments first
4. **Verify Performance**: Conduct load testing to verify scaling effectiveness
5. **Roll Out to Production**: Apply changes to production during maintenance window
6. **Document Changes**: Update documentation with new scaling parameters