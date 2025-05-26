-- Migration: Add subscription system tables
-- This migration adds support for organizations, subscriptions, therapy sessions, and payments

-- Create Organization table
CREATE TABLE IF NOT EXISTS organization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    max_users INTEGER DEFAULT 0,
    current_users INTEGER DEFAULT 0,
    price_per_user DECIMAL(10,2) DEFAULT 680000,
    sessions_per_user INTEGER DEFAULT 8,
    subscription_start_date DATE,
    subscription_end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subscription table
CREATE TABLE IF NOT EXISTS subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'organization', 'credit')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    amount DECIMAL(10,2) NOT NULL,
    sessions_included INTEGER DEFAULT 0,
    sessions_used INTEGER DEFAULT 0,
    credits_available INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    last_session_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create TherapySession table
CREATE TABLE IF NOT EXISTS therapy_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    therapist_id UUID NOT NULL,
    subscription_id UUID,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    type VARCHAR(20) DEFAULT 'individual' CHECK (type IN ('individual', 'group', 'emergency')),
    scheduled_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    cost DECIMAL(10,2) DEFAULT 76000,
    paid_from_credit BOOLEAN DEFAULT false,
    paid_from_subscription BOOLEAN DEFAULT false,
    payment_reference VARCHAR(255),
    notes TEXT,
    cancellation_reason TEXT,
    meeting_link VARCHAR(500),
    meeting_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription(id) ON DELETE SET NULL
);

-- Create Payment table
CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID,
    organization_id UUID,
    type VARCHAR(30) NOT NULL CHECK (type IN ('subscription', 'credit_purchase', 'organization_payment', 'session_payment')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('mobile_money', 'bank_transfer', 'credit_card', 'cash')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    reference VARCHAR(255) NOT NULL UNIQUE,
    external_reference VARCHAR(255),
    phone_number VARCHAR(20),
    description TEXT,
    metadata JSONB,
    paid_at TIMESTAMP,
    expires_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE SET NULL
);

-- Update User table to add new fields
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(30) DEFAULT 'individual' CHECK (user_type IN ('individual', 'organization_member', 'minor')),
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);

-- Update User table role enum to include organization_admin
ALTER TABLE "user" 
ALTER COLUMN role TYPE VARCHAR(30),
ADD CONSTRAINT user_role_check CHECK (role IN ('user', 'admin', 'therapist', 'organization_admin'));

-- Add foreign key constraint for organization
ALTER TABLE "user" 
ADD CONSTRAINT fk_user_organization 
FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON subscription(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_type_status ON subscription(type, status);
CREATE INDEX IF NOT EXISTS idx_therapy_session_user_id ON therapy_session(user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_session_therapist_id ON therapy_session(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_session_scheduled_at ON therapy_session(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reference ON payment(reference);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_user_organization_id ON "user"(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_user_type ON "user"(user_type);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON subscription FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_session_updated_at BEFORE UPDATE ON therapy_session FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON payment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 