import re
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List, Set
import httpx
import asyncio

from app.core.config import settings
from app.utils.encryption import encrypt_data

logger = logging.getLogger(__name__)

# Regular expressions for PHI detection
PHI_PATTERNS = {
    "name": r"\b(?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b",
    "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    "phone": r"\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b",
    "ssn": r"\b\d{3}[-]?\d{2}[-]?\d{4}\b",
    "address": r"\b\d{1,5}\s[A-Z][a-zA-Z\s]+,\s[A-Z]{2}\s\d{5}\b",
    "dob": r"\b(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/(19|20)\d{2}\b",
    "medical_record": r"\b(MR|MRN)#?\s*\d{5,10}\b",
}

async def detect_phi(text: str) -> Dict[str, List[str]]:
    """
    Detect potential PHI (Protected Health Information) in text
    
    Args:
        text: The text to scan for PHI
        
    Returns:
        Dictionary of PHI type to list of matches
    """
    if not settings.PHI_DETECTION_ENABLED:
        return {}
        
    phi_found = {}
    
    for phi_type, pattern in PHI_PATTERNS.items():
        matches = re.findall(pattern, text)
        if matches:
            phi_found[phi_type] = matches
            
    return phi_found

async def sanitize_phi(text: str) -> str:
    """
    Sanitize PHI from text by replacing it with placeholders
    
    Args:
        text: The text to sanitize
        
    Returns:
        Sanitized text with PHI replaced by placeholders
    """
    if not settings.PHI_DETECTION_ENABLED:
        return text
        
    phi_found = await detect_phi(text)
    sanitized_text = text
    
    for phi_type, matches in phi_found.items():
        for match in matches:
            replacement = f"[{phi_type.upper()}]"
            sanitized_text = sanitized_text.replace(match, replacement)
            
    return sanitized_text

def check_consent(user_id: str, data_processing_type: str) -> bool:
    """
    Check if a user has consented to a specific type of data processing
    
    Args:
        user_id: The ID of the user
        data_processing_type: The type of data processing to check consent for
        
    Returns:
        True if the user has consented, False otherwise
    """
    if not settings.CONSENT_CHECK_ENABLED:
        return True
        
    try:
        # In a real implementation, we would fetch this from a database or cache
        # For now, simulate consent for most processing types
        consent_mapping = {
            "ai_chat": True,
            "ai_journal_analysis": True,
            "ai_recommendations": True,
            "ai_insights": True,
            "data_sharing": False,
            "research_use": True
        }
        
        # Return the consent status, defaulting to False for unknown types
        return consent_mapping.get(data_processing_type, False)
        
    except Exception as e:
        logger.error(f"Error checking consent for user {user_id}: {str(e)}")
        # Default to no consent in case of errors
        return False

def log_data_access(
    user_id: str,
    data_type: str,
    access_reason: str,
    data_categories: List[str]
) -> Dict[str, Any]:
    """
    Log access to sensitive user data for GDPR compliance
    
    Args:
        user_id: The ID of the user whose data was accessed
        data_type: The type of data accessed
        access_reason: The reason for accessing the data
        data_categories: Categories of data accessed
        
    Returns:
        Log entry details
    """
    try:
        # Create the log entry
        log_entry = {
            "access_id": str(uuid.uuid4()),
            "user_id": user_id,
            "data_type": data_type,
            "access_reason": access_reason,
            "data_categories": data_categories,
            "timestamp": datetime.utcnow().isoformat(),
            "service": "ai-service",
            "automated_processing": True
        }
        
        # In a production environment, we'd store this in a secure database
        # and potentially stream it to a compliance monitoring service
        
        # Log the entry
        logger.info(f"DATA ACCESS: {json.dumps(log_entry)}")
        
        return log_entry
        
    except Exception as e:
        logger.error(f"Error logging data access: {str(e)}")
        return {
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

def audit_log(
    action: str,
    user_id: str,
    resource_type: str,
    resource_id: str,
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create an audit log entry for compliance and security monitoring
    
    Args:
        action: The action performed (e.g., "create", "read", "update", "delete")
        user_id: The ID of the user who performed the action
        resource_type: The type of resource acted upon
        resource_id: The ID of the specific resource
        metadata: Additional contextual information about the action
        
    Returns:
        Audit log entry details
    """
    try:
        # Create the audit log entry
        log_entry = {
            "audit_id": str(uuid.uuid4()),
            "action": action,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "timestamp": datetime.utcnow().isoformat(),
            "service": "ai-service",
            "metadata": metadata
        }
        
        # In a production environment, we'd send this to a secure audit logging service
        
        # If an audit log API is configured, send it there
        if settings.AUDIT_LOG_API_URL:
            # This would normally be done asynchronously or via a queue
            # For simplicity, we're just logging it
            logger.info(f"AUDIT LOG: {json.dumps(log_entry)}")
        else:
            # Otherwise, just log it locally
            logger.info(f"AUDIT LOG: {json.dumps(log_entry)}")
            
        return log_entry
        
    except Exception as e:
        logger.error(f"Error creating audit log: {str(e)}")
        return {
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

class DataMinimization:
    """Utility class for implementing data minimization principles"""
    
    @staticmethod
    def filter_fields(
        data: Dict[str, Any],
        allowed_fields: Set[str]
    ) -> Dict[str, Any]:
        """
        Filter a dictionary to only include allowed fields
        
        Args:
            data: The data dictionary to filter
            allowed_fields: Set of field names to allow
            
        Returns:
            Filtered dictionary with only allowed fields
        """
        return {k: v for k, v in data.items() if k in allowed_fields}
        
    @staticmethod
    def anonymize_data(
        data: Dict[str, Any],
        fields_to_anonymize: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Anonymize specific fields in a data dictionary
        
        Args:
            data: The data dictionary to anonymize
            fields_to_anonymize: Map of field names to anonymization method
                                 (e.g., {"name": "hash", "address": "redact"})
            
        Returns:
            Anonymized data dictionary
        """
        result = data.copy()
        
        for field, method in fields_to_anonymize.items():
            if field in result:
                if method == "hash":
                    # In a real implementation, we'd use a secure hashing function
                    result[field] = f"hashed_{field}"
                elif method == "redact":
                    result[field] = f"[REDACTED {field.upper()}]"
                elif method == "tokenize":
                    # Replace with a token that can be mapped back if needed
                    result[field] = encrypt_data(str(result[field]))
                    
        return result 