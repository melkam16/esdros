# Esdros SMS — Production Deployment Guide
This guide provides step-by-step instructions for deploying the **Esdros Seminary Management System (Next.js, Prisma, PostgreSQL)** on an **IONOS VPS** running **Ubuntu 24.04.4 LTS** with **PostgreSQL 16.14**.

---

## Architecture Overview
```mermaid
graph TD
    Client[Web Browser] -->|HTTPS :443| Nginx[Nginx Reverse Proxy]
    Nginx -->|HTTP :3000| NextApp[Next.js App Server via PM2]
    NextApp -->|Database Pool| PG[(PostgreSQL 16.14)]
    NextApp -->|SMTP| SendGrid[SMTP Email Delivery]
```

---

## Prerequisites
Before beginning the deployment, ensure you have:
1. An active **IONOS VPS** or dedicated server running **Ubuntu 24.04.4 LTS**.
2. Root access or `sudo` privileges.
3. A domain name pointed to your server IP (A records for `yourdomain.com` and `www.yourdomain.com`).
4. The codebase hosted in a GitHub repository.

---

## Step 1: Server Initialization & Security Configuration

First, SSH into your IONOS VPS:
```bash
ssh root@<YOUR_SERVER_IP>
```
If you are logged in as `root`, it is highly recommended to create a non-root deployment user:
```bash
# Create user 'deploy'
adduser deploy
usermod -aG sudo deploy

# Copy authorized SSH keys from root to deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Switch to the deploy user
su - deploy
```

Update your package lists and upgrade existing software packages to ensure security:
```bash
sudo apt update && sudo apt upgrade -y
```

Set the system timezone to UTC or your preferred local time:
```bash
sudo timedatectl set-timezone UTC
```

Install essential system packages:
```bash
sudo apt install -y curl git build-essential ufw fail2ban nano
```

### Configure the Firewall (UFW)
Secure your server ports. We only allow SSH, HTTP, and HTTPS traffic:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Step 2: Install and Configure PostgreSQL 16

Ubuntu 24.04 LTS includes **PostgreSQL 16** in its official apt repositories by default.

### 1. Install PostgreSQL 16 and Contrib utilities
```bash
sudo apt install -y postgresql-16 postgresql-contrib-16
```

### 2. Verify Installation
```bash
psql --version
# Expected output: psql (PostgreSQL) 16.x
```

Ensure the PostgreSQL service is active and enabled to start automatically on system boots:
```bash
sudo systemctl status postgresql
sudo systemctl enable postgresql
```

### 3. Create the Production Database and User
Open the PostgreSQL command-line interface as the administrative `postgres` user:
```bash
sudo -u postgres psql
```

Execute the following SQL queries inside the psql prompt. Make sure to replace `'choose_a_strong_password'` with a secure password:
```sql
-- Create the database
CREATE DATABASE esdros_db;

-- Create the database user
CREATE USER esdros_user WITH PASSWORD 'choose_a_strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE esdros_db TO esdros_user;

-- Connect to the database to configure schema access (Required for PG 15+)
\c esdros_db

-- Grant all permissions on public schema to enable Prisma migrations
GRANT ALL ON SCHEMA public TO esdros_user;

-- Exit the PostgreSQL shell
\q
```

---

## Step 3: Install Node.js LTS and PM2

### 1. Download and Install Node.js v20 LTS
Use NodeSource to install the LTS version of Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Validate Node.js and npm versions:
```bash
node -v  # Should be v20.x.x
npm -v   # Should be v10.x.x
```

### 2. Install PM2 (Process Manager)
PM2 runs the Next.js application server in the background and restarts it on crashes or server reboots:
```bash
sudo npm install -g pm2
```

---

## Step 4: Clone the Application from GitHub

### 1. Configure SSH Access for GitHub (Recommended for Private Repos)
Generate a public/private keypair for the deploy user:
```bash
ssh-keygen -t ed25519 -C "admin@esdros.org"
```
Press Enter to accept defaults. Display your public key:
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy this output, go to your GitHub repository -> **Settings** -> **Deploy Keys** -> **Add deploy key**, check **Allow write access** if needed, and paste the key.

### 2. Clone the Codebase
Create the deployment directory in `/var/www/` and change its ownership:
```bash
sudo mkdir -p /var/www/esdros-sms
sudo chown -R $USER:$USER /var/www/esdros-sms
```
Clone the repository:
```bash
# Using SSH (recommended for private repos)
git clone git@github.com:your-github-username/esdros-sms.git /var/www/esdros-sms

# Or using HTTPS (for public repositories)
git clone https://github.com/your-github-username/esdros-sms.git /var/www/esdros-sms
```

---

## Step 5: Application Configuration & Build

Navigate to the project directory:
```bash
cd /var/www/esdros-sms
```

### 1. Install Dependencies
Install production and development dependencies (required for Next.js compilation):
```bash
npm install
```

### 2. Create the Production Environment File (`.env`)
Create a `.env` file in the root directory:
```bash
nano .env
```
Copy and paste the configuration below. Make sure to replace placeholders with your actual secrets:
```env
# Database Connection String (pointing to local PostgreSQL 16)
DATABASE_URL="postgresql://esdros_user:choose_a_strong_password@localhost:5432/esdros_db?schema=public"

# JWT Secret Key (Generate a secure 64-character secret using: openssl rand -hex 32)
JWT_SECRET="YOUR_SECURE_JWT_SECRET"

# SMTP Configuration for Two-Factor (2FA) Codes and Notifications
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="YOUR_SMTP_API_KEY_OR_PASSWORD"
```

### 3. Generate Prisma client & Apply database schema migrations
Execute the schema setup:
```bash
npx prisma generate
npx prisma migrate deploy
```
> [!NOTE]
> The database migrations will initialize all required tables (User, Student, Faculty, Department, etc.).

### 4. Build the Next.js Application
Compile the project for production:
```bash
npm run build
```

---

## Step 6: Process Management Setup with PM2

Start the Next.js application in background cluster mode:
```bash
pm2 start npm --name "esdros-sms" -- start
```
Verify that the service is running successfully:
```bash
pm2 status
```
You can inspect logs to verify everything started properly on local port 3000:
```bash
pm2 logs esdros-sms
```

### Configure PM2 Auto-Start on System Boot
Generate the systemd startup configuration command:
```bash
pm2 startup
```
This command outputs a block of script to run as root. Copy it, paste it, and run it. It will look like this:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```
Once run, save the current active PM2 configurations so they are restored on server reboots:
```bash
pm2 save
```

---

## Step 7: Nginx Web Server & Reverse Proxy Setup

Install Nginx:
```bash
sudo apt install -y nginx
```

### 1. Configure the Nginx Server Block
Create a virtual host configuration file:
```bash
sudo nano /etc/nginx/sites-available/esdros-sms
```
Paste the configuration block below, replacing `yourdomain.com` with your actual domain:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Gzip Compression
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
    gzip_comp_level 5;

    location / {
        # Reverse proxy settings pointing to PM2's Next.js Port (3000)
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Headers forwarding client IP addresses
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Custom Error Pages
    error_page 502 /502.html;
    location = /502.html {
        root /var/www/esdros-sms/public;
        internal;
    }
}
```

### 2. Enable Site and Apply Configurations
Enable the site block by symlinking it:
```bash
sudo ln -s /etc/nginx/sites-available/esdros-sms /etc/nginx/sites-enabled/
```
Remove the default placeholder site to prevent host routing conflicts:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```
Verify that the Nginx configuration contains no syntax errors:
```bash
sudo nginx -t
```
If the test is successful, reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Step 8: SSL Encryption Setup (Let's Encrypt / Certbot)

Encrypt all web traffic with automated SSL certificates:

### 1. Install Certbot Nginx package
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Request and Install SSL Certificates
Run Certbot. It automatically edits the Nginx configurations to enforce redirects from HTTP to HTTPS:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the interactive prompt:
- Enter your email address for renewal notifications.
- Agree to terms of service.
- Choose whether to share your email.
- Certbot will obtain the certificate and modify Nginx automatically.

### 3. Verify SSL Renewal
Let's Encrypt certificates are valid for 90 days. Certbot configures a cron job/systemd timer that automatically checks and renews certificates. Verify renewal dry run:
```bash
sudo certbot renew --dry-run
```

---

## Step 9: Database Seeding & Initial Logins

The application features a built-in safety net. **If there are no registered accounts in the User table**, the system automatically seeds:
- **Default Academic Class**: `Theology Cohort Year 1` (Code: `TH-Y1`)
- **Default Department**: `Theology` (Code: `THEO`)
- **First Super Administrator Account**:
  - **Email**: `admin@esderos.org`
  - **Password**: `admin123`

### To Initialize Your Database:
1. Open your web browser and navigate to your production URL (`https://yourdomain.com`).
2. Log in using:
   - **Email**: `admin@esderos.org`
   - **Password**: `admin123`
3. **Important**: Go to the admin account dashboard page, navigate to Profile or Security Settings, and change your default credentials immediately to maintain server security.

---

## Step 10: Automated Deployments (Optional helper)

To easily update your production server with new commits pushed to your GitHub `main` branch, create a fast deployment script:
```bash
nano /var/www/esdros-sms/deploy.sh
```
Paste this automated script:
```bash
#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Esdros SMS deployment update..."

# Navigate to app root
cd /var/www/esdros-sms

# Pull latest commits
git pull origin main

# Install packages
npm install

# Run database schema migrations
npx prisma generate
npx prisma migrate deploy

# Build the project
npm run build

# Restart the application runner
pm2 restart esdros-sms

echo "✅ App successfully updated and restarted in PM2!"
```
Make the script executable:
```bash
chmod +x /var/www/esdros-sms/deploy.sh
```
Now, whenever you pull changes, just run:
```bash
./deploy.sh
```

---

## Step 11: Production Backup Plan (Database Backups)

Ensure security against data loss. Back up your production database daily using PostgreSQL's dump utility.

### 1. Create a Backup Directory
```bash
sudo mkdir -p /var/backups/postgres
sudo chown -R deploy:deploy /var/backups/postgres
```

### 2. Write the Backup Script
```bash
nano /home/deploy/db_backup.sh
```
Paste the script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%F_%H-%M-%S)
DATABASE="esdros_db"
USER="esdros_user"
FILE="$BACKUP_DIR/esdros_backup_$DATE.sql"

echo "Starting database backup..."
pg_dump -U $USER -h localhost -d $DATABASE -F c -f $FILE

# Delete backups older than 14 days to preserve disk space
find $BACKUP_DIR -type f -name "esdros_backup_*.sql" -mtime +14 -delete
echo "Backup completed: $FILE"
```
Make it executable:
```bash
chmod +x /home/deploy/db_backup.sh
```

### 3. Schedule via Cron Jobs
Add to your personal user crontab:
```bash
crontab -e
```
Add this line at the bottom to execute the backup script daily at **02:00 AM**:
```cron
0 2 * * * /home/deploy/db_backup.sh >> /home/deploy/db_backup.log 2>&1
```

---

## Useful Maintenance Commands

| Command | Action |
|---------|--------|
| `pm2 logs esdros-sms` | Stream Next.js application stdout/stderr logs |
| `pm2 status` | Check status of Node processes managed by PM2 |
| `pm2 restart esdros-sms` | Hard restart the Next.js process |
| `sudo tail -n 100 /var/log/nginx/error.log` | Check Nginx web server errors |
| `sudo systemctl restart postgresql` | Restart PostgreSQL 16 database |
| `sudo systemctl reload nginx` | Reload Nginx server configuration changes without downtime|
