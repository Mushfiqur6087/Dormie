-- Create mess manager tables

-- 1. Mess Manager Calls table
CREATE TABLE IF NOT EXISTS mess_manager_calls (
    call_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    application_deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 2. Mess Manager Applications table
CREATE TABLE IF NOT EXISTS mess_manager_applications (
    application_id BIGSERIAL PRIMARY KEY,
    call_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    motivation TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT,
    FOREIGN KEY (call_id) REFERENCES mess_manager_calls(call_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- 3. Mess Managers table
CREATE TABLE IF NOT EXISTS mess_managers (
    id BIGSERIAL PRIMARY KEY,
    call_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT NOT NULL,
    FOREIGN KEY (call_id) REFERENCES mess_manager_calls(call_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- 4. Mess Menu table
CREATE TABLE IF NOT EXISTS mess_menu (
    id BIGSERIAL PRIMARY KEY,
    menu_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    menu_items TEXT NOT NULL,
    special_notes TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 5. Fund Requests table
CREATE TABLE IF NOT EXISTS fund_requests (
    id BIGSERIAL PRIMARY KEY,
    mess_manager_id BIGINT NOT NULL,
    purpose TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    urgency VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT,
    FOREIGN KEY (mess_manager_id) REFERENCES mess_managers(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mess_manager_calls_status ON mess_manager_calls(status);
CREATE INDEX IF NOT EXISTS idx_mess_manager_calls_month_year ON mess_manager_calls(month, year);
CREATE INDEX IF NOT EXISTS idx_mess_manager_applications_call_id ON mess_manager_applications(call_id);
CREATE INDEX IF NOT EXISTS idx_mess_manager_applications_user_id ON mess_manager_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_mess_managers_user_id ON mess_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_mess_managers_status ON mess_managers(status);
CREATE INDEX IF NOT EXISTS idx_mess_menu_date ON mess_menu(menu_date);
CREATE INDEX IF NOT EXISTS idx_fund_requests_mess_manager_id ON fund_requests(mess_manager_id);
CREATE INDEX IF NOT EXISTS idx_fund_requests_status ON fund_requests(status);
