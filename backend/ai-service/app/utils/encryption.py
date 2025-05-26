import base64
import hashlib
import logging
import os
import secrets
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core.config import settings

logger = logging.getLogger(__name__)

# Generate a key using the SECRET_KEY and ENCRYPTION_SALT from settings
def _get_encryption_key() -> bytes:
    """
    Generate an encryption key using the SECRET_KEY and ENCRYPTION_SALT from settings
    
    Returns:
        Bytes representation of the encryption key
    """
    try:
        # Use PBKDF2 to derive a key from the secret key and salt
        salt = settings.ENCRYPTION_SALT.encode()
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode()))
        return key
    except Exception as e:
        logger.error(f"Error generating encryption key: {str(e)}")
        # In case of failure, generate a temporary key
        # This is not ideal for production but prevents crashes
        return Fernet.generate_key()

# Global encryption key
_ENCRYPTION_KEY = _get_encryption_key()
_CIPHER_SUITE = Fernet(_ENCRYPTION_KEY)

def encrypt_data(data: str) -> str:
    """
    Encrypt a string using Fernet symmetric encryption
    
    Args:
        data: The string to encrypt
        
    Returns:
        Base64-encoded encrypted string
    """
    try:
        if not data:
            return ""
            
        # Encrypt the data
        encrypted_data = _CIPHER_SUITE.encrypt(data.encode())
        # Return as a base64 string
        return base64.urlsafe_b64encode(encrypted_data).decode()
    except Exception as e:
        logger.error(f"Error encrypting data: {str(e)}")
        # Return a placeholder in case of error
        return "[ENCRYPTION_ERROR]"

def decrypt_data(encrypted_data: str) -> str:
    """
    Decrypt a Fernet-encrypted string
    
    Args:
        encrypted_data: Base64-encoded encrypted string
        
    Returns:
        Decrypted string
    """
    try:
        if not encrypted_data or encrypted_data == "[ENCRYPTION_ERROR]":
            return ""
            
        # Decode from base64
        decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
        # Decrypt the data
        decrypted_data = _CIPHER_SUITE.decrypt(decoded_data)
        # Return as a string
        return decrypted_data.decode()
    except Exception as e:
        logger.error(f"Error decrypting data: {str(e)}")
        # Return a placeholder in case of error
        return "[DECRYPTION_ERROR]"

def hash_identifier(identifier: str, salt: Optional[str] = None) -> str:
    """
    Create a secure one-way hash of an identifier
    
    Args:
        identifier: The identifier to hash
        salt: Optional salt to use (defaults to a random salt)
        
    Returns:
        Secure hash of the identifier
    """
    try:
        if not identifier:
            return ""
            
        # If no salt is provided, generate a random one
        if not salt:
            salt = secrets.token_hex(16)
            
        # Create a hash using SHA-256
        h = hashlib.sha256()
        h.update(f"{salt}:{identifier}".encode())
        return f"{salt}:{h.hexdigest()}"
    except Exception as e:
        logger.error(f"Error hashing identifier: {str(e)}")
        # Return a placeholder in case of error
        return "[HASHING_ERROR]"

def verify_hash(identifier: str, hashed_value: str) -> bool:
    """
    Verify if an identifier matches a previously hashed value
    
    Args:
        identifier: The identifier to check
        hashed_value: The hashed value to compare against
        
    Returns:
        True if the identifier matches the hash, False otherwise
    """
    try:
        if not identifier or not hashed_value or ":" not in hashed_value:
            return False
            
        # Extract the salt from the hashed value
        salt, _ = hashed_value.split(":", 1)
        
        # Hash the identifier with the same salt
        expected_hash = hash_identifier(identifier, salt)
        
        # Compare the hashes
        return hashed_value == expected_hash
    except Exception as e:
        logger.error(f"Error verifying hash: {str(e)}")
        return False

def encrypt_dict(data: Dict[str, Any], fields_to_encrypt: list) -> Dict[str, Any]:
    """
    Encrypt specific fields in a dictionary
    
    Args:
        data: The dictionary containing data to encrypt
        fields_to_encrypt: List of field names to encrypt
        
    Returns:
        Dictionary with specified fields encrypted
    """
    result = data.copy()
    
    for field in fields_to_encrypt:
        if field in result and result[field]:
            if isinstance(result[field], str):
                result[field] = encrypt_data(result[field])
            elif isinstance(result[field], (int, float)):
                result[field] = encrypt_data(str(result[field]))
                
    return result

def decrypt_dict(data: Dict[str, Any], fields_to_decrypt: list) -> Dict[str, Any]:
    """
    Decrypt specific fields in a dictionary
    
    Args:
        data: The dictionary containing encrypted data
        fields_to_decrypt: List of field names to decrypt
        
    Returns:
        Dictionary with specified fields decrypted
    """
    result = data.copy()
    
    for field in fields_to_decrypt:
        if field in result and result[field]:
            try:
                decrypted = decrypt_data(result[field])
                result[field] = decrypted
            except Exception as e:
                logger.error(f"Error decrypting field {field}: {str(e)}")
                result[field] = "[DECRYPTION_ERROR]"
                
    return result 