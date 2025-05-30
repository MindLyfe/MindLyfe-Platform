# MindLyfe Infrastructure Troubleshooting Guide

This document provides troubleshooting information for common issues that may occur with the MindLyfe infrastructure.

## Terraform Deployment Issues

### Error: Error acquiring the state lock

```
Error: Error acquiring the state lock
```

**Solution**: The Terraform state is locked by another operation or a previous operation didn't release the lock properly.

1. Check if another deployment is in progress
2. If no other operation is running, force unlock:
   ```bash
   terraform force-unlock LOCK_ID
   ```

### Error: No valid credential sources found

```
Error: No valid credential sources found
```

**Solution**: AWS credentials are not properly configured.

1. Ensure AWS credentials are properly set in your environment:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```
2. Alternatively, configure the AWS CLI:
   ```bash
   aws configure
   ```

## Kubernetes Deployment Issues

### Pods stuck in `Pending` state

**Possible Causes and Solutions**:

1. **Insufficient resources**:
   - Check node resource usage: `kubectl describe nodes`
   - Adjust request/limits in the deployment specs

2. **PersistentVolumeClaim issues**:
   - Check PVC status: `kubectl get pvc -n mindlyfe`
   - Ensure the storage class exists: `kubectl get sc`

3. **Node affinity/taints issues**:
   - Check node taints: `kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints`
   - Review pod affinity rules in the deployment

### Services not accessible

**Possible Causes and Solutions**:

1. **Service targeting wrong pods**:
   - Check service selectors: `kubectl describe service <service-name> -n mindlyfe`
   - Ensure pod labels match service selectors
   - Verify pods are running: `kubectl get pods -n mindlyfe -l app=<app-label>`

2. **Network policies blocking traffic**:
   - Check network policies: `kubectl get networkpolicies -n mindlyfe`
   - Temporarily disable network policies if needed for testing

3. **Ingress issues**:
   - Check ingress status: `kubectl describe ingress -n mindlyfe`
   - Verify Load Balancer/ALB is properly configured in AWS

### Pod `CrashLoopBackOff` errors

**Possible Causes and Solutions**:

1. **Application errors**:
   - Check pod logs: `kubectl logs <pod-name> -n mindlyfe`
   - Check previous terminated container logs: `kubectl logs <pod-name> -n mindlyfe --previous`

2. **Resource constraints**:
   - Check if the pod is being OOM killed: `kubectl describe pod <pod-name> -n mindlyfe`
   - Increase memory limits in deployment spec

3. **Configuration issues**:
   - Verify environment variables: `kubectl describe pod <pod-name> -n mindlyfe`
   - Check ConfigMaps and Secrets: `kubectl get cm,secrets -n mindlyfe`

## Database Issues

### RDS connection issues

1. **Security Group issues**:
   - Verify security group rules allow traffic from the EKS cluster
   - Check the VPC Peering if using different VPCs

2. **Credential issues**:
   - Validate the database secrets in Kubernetes: `kubectl get secret database-secrets -n mindlyfe -o yaml`
   - Test connection using psql from a debug pod within the cluster

3. **Endpoint resolution**:
   - Ensure the RDS endpoint is correctly specified in the application configuration
   - Test DNS resolution from within the cluster

## Monitoring and Logging Issues

### Prometheus not collecting metrics

1. **Service discovery issues**:
   - Check Prometheus configuration: `kubectl get configmap prometheus-config -n monitoring -o yaml`
   - Ensure services have proper annotations: `prometheus.io/scrape: 'true'`

2. **Access permissions**:
   - Verify Prometheus service account has proper RBAC permissions
   - Check ClusterRole bindings: `kubectl describe clusterrolebinding prometheus -n monitoring`

### Missing logs in Elasticsearch

1. **Fluentd/Filebeat issues**:
   - Check pods status: `kubectl get pods -n logging`
   - Check logs of Fluentd/Filebeat: `kubectl logs -l app=fluentd -n logging`

2. **Elasticsearch capacity**:
   - Check Elasticsearch storage usage
   - Consider increasing storage or implementing log rotation

## CI/CD Pipeline Issues

### GitHub Actions workflow failures

1. **AWS authentication issues**:
   - Verify GitHub Secrets are properly configured
   - Check IAM permissions for the GitHub Actions role

2. **Docker build failures**:
   - Check Dockerfile for errors
   - Verify dependencies in package.json

3. **Deployment failures**:
   - Check kubeconfig is properly generated
   - Verify kubectl version compatibility

## Performance Issues

### High pod resource usage

1. **Check resource utilization**:
   - Use Prometheus metrics to identify high CPU/memory usage
   - View top pods: `kubectl top pods -n mindlyfe`

2. **Optimize code**:
   - Profile application performance
   - Check for memory leaks
   - Optimize database queries

### Slow response times

1. **Check network latency**:
   - Monitor request latency in Prometheus
   - Check AWS CloudWatch metrics for ALB latency

2. **Check resource bottlenecks**:
   - Monitor CPU/memory for all services
   - Check database query performance
   - Verify Redis cache hit rates

## Service-Specific Issues

### Auth Service Issues

- Verify Cognito configuration in AWS console
- Check Auth Service logs for token validation errors
- Ensure Cognito callback URLs are properly set

### AI Service Issues

- Check OpenAI API quota and usage
- Verify API keys are correctly set in secrets
- Monitor response times from OpenAI

### Teletherapy Service Issues

- Check WebRTC connection establishment
- Verify TURN server configuration
- Monitor network quality metrics

## Getting Help

If you're unable to resolve an issue using this guide:

1. Check AWS and Kubernetes documentation
2. Review service logs and metrics
3. Reach out to the infrastructure team
4. For urgent production issues, follow the on-call escalation process