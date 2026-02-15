-- BlockCopy Database Setup Script
-- MySQL Database Schema

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS ChatMessage;
DROP TABLE IF EXISTS File;
DROP TABLE IF EXISTS Block;
DROP TABLE IF EXISTS StartSection;
DROP TABLE IF EXISTS Project;
DROP TABLE IF EXISTS Session;
DROP TABLE IF EXISTS User;

-- User table
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session table for authentication
CREATE TABLE Session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    userId INT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project table
CREATE TABLE Project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    clientName VARCHAR(255),
    description TEXT,
    content LONGTEXT,
    status VARCHAR(50) DEFAULT 'active',
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- StartSection table (one-to-one with Project)
CREATE TABLE StartSection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL UNIQUE,

    -- Project Overview
    projectOverview TEXT,
    deliverables TEXT,
    timeline VARCHAR(255),

    -- Ideal Client
    idealClientDemographics TEXT,
    idealClientPainPoints TEXT,
    idealClientGoals TEXT,
    idealClientObjections TEXT,

    -- Project Understanding
    projectUnderstandingProblem TEXT,
    projectUnderstandingSolution TEXT,
    projectUnderstandingUniqueValue TEXT,

    -- Framework: What
    frameworkWhatCoreProduct TEXT,
    frameworkWhatKeyFeatures TEXT,
    frameworkWhatUniqueSellingPoints TEXT,

    -- Framework: Who
    frameworkWhoTargetAudience TEXT,
    frameworkWhoIdealCustomer TEXT,
    frameworkWhoDecisionMaker TEXT,

    -- Framework: Why
    frameworkWhyProblemSolved TEXT,
    frameworkWhyBenefits TEXT,
    frameworkWhyEmotionalHook TEXT,

    -- Framework: How
    frameworkHowProcess TEXT,
    frameworkHowDeliveryMethod TEXT,
    frameworkHowSupportSystem TEXT,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Block table (content blocks within projects)
CREATE TABLE Block (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    title VARCHAR(255),
    content LONGTEXT,
    `order` INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File table (uploaded files and notes)
CREATE TABLE File (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    url VARCHAR(500),
    name VARCHAR(255) NOT NULL,
    size INT,
    type VARCHAR(100),
    fileType ENUM('file', 'text') DEFAULT 'file',
    content TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ChatMessage table (AI chat history)
CREATE TABLE ChatMessage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content LONGTEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    INDEX idx_projectId (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a default admin user (password: admin123)
-- Password hash is for 'admin123'
INSERT INTO User (email, name, password) VALUES
('admin@blockcopy.com', 'Admin User', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc5i');
