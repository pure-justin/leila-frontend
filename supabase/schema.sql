-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table
CREATE TABLE contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    business_name TEXT,
    phone TEXT,
    services TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    emergency_available BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_first_name TEXT NOT NULL,
    customer_last_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    service TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    contractor_id UUID REFERENCES contractors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (for contractor job assignments)
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    contractor_id UUID REFERENCES contractors(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    price DECIMAL(10,2),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id, contractor_id)
);

-- Contractor availability
CREATE TABLE contractor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contractor_id UUID REFERENCES contractors(id) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    UNIQUE(contractor_id, day_of_week)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    contractor_id UUID REFERENCES contractors(id) NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- Create indexes for better performance
CREATE INDEX idx_contractors_status ON contractors(status);
CREATE INDEX idx_contractors_services ON contractors USING GIN(services);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_jobs_contractor ON jobs(contractor_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Row Level Security (RLS) Policies
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for contractors
CREATE POLICY "Public can view active contractors" ON contractors
    FOR SELECT USING (status = 'active');

-- Contractors can update their own profile
CREATE POLICY "Contractors can update own profile" ON contractors
    FOR UPDATE USING (auth.uid()::text = email);

-- Anyone can create bookings
CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Contractors can view jobs assigned to them
CREATE POLICY "Contractors can view their jobs" ON jobs
    FOR SELECT USING (contractor_id::text = auth.uid()::text);

-- Function to update contractor ratings after a review
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contractors
    SET rating = (
        SELECT AVG(rating)::decimal(3,2)
        FROM reviews
        WHERE contractor_id = NEW.contractor_id
    )
    WHERE id = NEW.contractor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
CREATE TRIGGER update_contractor_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_contractor_rating();

-- Function to increment completed jobs
CREATE OR REPLACE FUNCTION increment_completed_jobs()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE contractors
        SET completed_jobs = completed_jobs + 1
        WHERE id = NEW.contractor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for completed jobs
CREATE TRIGGER increment_completed_jobs_trigger
AFTER UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION increment_completed_jobs();