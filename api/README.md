# BlockCopy PHP API

## Database Setup

1. Import the SQL file to create the database schema:

```bash
mysql -h 91.98.150.167 -u copywael -p copywael < database/setup.sql
```

Or use phpMyAdmin to import `database/setup.sql`

## API Configuration

The database connection is configured in `config/database.php`:

```php
define('DB_HOST', '91.98.150.167');
define('DB_NAME', 'copywael');
define('DB_USER', 'copywael');
define('DB_PASS', 'St@1088371529');
```

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123",
  "remember": false
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "remember": false
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```

### Projects

#### Get All Projects
```
GET /api/projects?status=active
Authorization: Bearer {token}
```

#### Create Project
```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Project Name",
  "clientName": "Client Name",
  "description": "Description",
  "content": "Content",
  "status": "active"
}
```

#### Get Single Project
```
GET /api/projects/{id}
Authorization: Bearer {token}
```

#### Update Project
```
PUT /api/projects/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "completed"
}
```

#### Delete Project
```
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

### Blocks

#### Get All Blocks
```
GET /api/blocks?projectId={projectId}
Authorization: Bearer {token}
```

#### Create Block
```
POST /api/blocks?projectId={projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Block Title",
  "content": "Block Content",
  "order": 0
}
```

#### Reorder Blocks
```
PUT /api/blocks?projectId={projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "blocks": [1, 2, 3]
}
```

#### Update Block
```
PUT /api/blocks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated Content"
}
```

#### Delete Block
```
DELETE /api/blocks/{id}
Authorization: Bearer {token}
```

### Files

#### Get All Files
```
GET /api/files?projectId={projectId}
Authorization: Bearer {token}
```

#### Create File/Note
```
POST /api/files?projectId={projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com/file.pdf",
  "name": "File Name",
  "size": 1024,
  "type": "application/pdf",
  "fileType": "file",
  "content": null
}
```

#### Delete File
```
DELETE /api/files/{id}
Authorization: Bearer {token}
```

### Chat

#### Get Chat Messages
```
GET /api/chat?projectId={projectId}
Authorization: Bearer {token}
```

#### Create Chat Message
```
POST /api/chat?projectId={projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "user",
  "content": "Message content"
}
```

#### Clear Chat History
```
DELETE /api/chat?projectId={projectId}
Authorization: Bearer {token}
```

### Start Section

#### Get Start Section
```
GET /api/start-section?projectId={projectId}
Authorization: Bearer {token}
```

#### Create/Update Start Section
```
POST /api/start-section?projectId={projectId}
PUT /api/start-section?projectId={projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectOverview": "Overview",
  "deliverables": "Deliverables",
  "timeline": "Timeline",
  "idealClientDemographics": "Demographics",
  "idealClientPainPoints": "Pain Points",
  "idealClientGoals": "Goals",
  "idealClientObjections": "Objections",
  "projectUnderstandingProblem": "Problem",
  "projectUnderstandingSolution": "Solution",
  "projectUnderstandingUniqueValue": "Unique Value",
  "frameworkWhatCoreProduct": "Core Product",
  "frameworkWhatKeyFeatures": "Key Features",
  "frameworkWhatUniqueSellingPoints": "USP",
  "frameworkWhoTargetAudience": "Target Audience",
  "frameworkWhoIdealCustomer": "Ideal Customer",
  "frameworkWhoDecisionMaker": "Decision Maker",
  "frameworkWhyProblemSolved": "Problem Solved",
  "frameworkWhyBenefits": "Benefits",
  "frameworkWhyEmotionalHook": "Emotional Hook",
  "frameworkHowProcess": "Process",
  "frameworkHowDeliveryMethod": "Delivery Method",
  "frameworkHowSupportSystem": "Support System"
}
```

#### Delete Start Section
```
DELETE /api/start-section?projectId={projectId}
Authorization: Bearer {token}
```

## Default Admin User

Email: `admin@blockcopy.com`
Password: `admin123`

**Important:** Change the default admin password after first login!

## Server Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- PDO extension enabled
- mod_rewrite enabled (for URL rewriting)

## Deployment

1. Upload the `api` folder to your server
2. Import the database schema from `database/setup.sql`
3. Make sure the `api` folder has proper permissions
4. Update the frontend API calls to point to the new PHP backend
