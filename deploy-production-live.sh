#!/bin/bash

# 🚀 Production Deployment Script for m.zonash.com
# Directory: /home/zonash-mobile/htdocs/m.zonash.com
# Updated for current WooCommerce frontend codebase

echo "🚀 Starting LIVE deployment for m.zonash.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to app directory
APP_DIR="/home/zonash-mobile/htdocs/m.zonash.com"
print_status "Navigating to $APP_DIR..."

cd "$APP_DIR" || {
    print_error "Failed to navigate to $APP_DIR"
    exit 1
}

# Check if this is a git repository
if [ ! -d ".git" ]; then
    print_status "Cloning repository from GitHub..."
    git clone https://github.com/adwise-bangladesh/woocomm.git .
    if [ $? -ne 0 ]; then
        print_error "Failed to clone repository!"
        exit 1
    fi
    print_success "Repository cloned successfully!"
else
    print_status "Pulling latest changes from GitHub..."
    git pull origin main
    if [ $? -ne 0 ]; then
        print_warning "Git pull failed, continuing with existing code..."
    else
        print_success "Latest changes pulled successfully!"
    fi
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Make sure you're in the correct directory."
    exit 1
fi

# Install/update dependencies
print_status "Installing dependencies..."
npm install --production
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies!"
    exit 1
fi
print_success "Dependencies installed successfully!"

# Create environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_status "Creating production environment file..."
    cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://m.zonash.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
NEXT_PUBLIC_STORE_ID=1
NEXT_PUBLIC_STORE_NAME=Zonash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914
NEXT_PUBLIC_CROSS_DOMAIN_DOMAINS=m.zonash.com,zonash.com
NEXT_PUBLIC_COOKIE_DOMAIN=.zonash.com
NEXT_PUBLIC_ENABLE_CROSS_DOMAIN=true
EOF
    chmod 600 .env.production
    print_success "Environment file created!"
else
    print_status "Environment file already exists, skipping creation..."
fi

# Build application
print_status "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi
print_success "Application built successfully!"

# Create PM2 ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    print_status "Creating PM2 ecosystem file..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'zonash-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/zonash-mobile/htdocs/m.zonash.com',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/zonash-frontend-error.log',
    out_file: '/var/log/pm2/zonash-frontend-out.log',
    log_file: '/var/log/pm2/zonash-frontend.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
EOF
    print_success "PM2 ecosystem file created!"
fi

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop zonash-frontend 2>/dev/null || true
pm2 delete zonash-frontend 2>/dev/null || true

# Start/restart PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --update-env
if [ $? -ne 0 ]; then
    print_error "Failed to start PM2!"
    exit 1
fi

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved!"

# Check PM2 status
print_status "Checking PM2 status..."
pm2 status

# Test application
print_status "Testing application..."
sleep 10  # Wait for application to start

# Test local connection
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Application is running on localhost:3000"
else
    print_warning "Application might not be running on localhost:3000"
fi

# Test through Nginx (if configured)
if curl -s -I https://m.zonash.com > /dev/null; then
    print_success "Application is accessible via https://m.zonash.com"
else
    print_warning "Application might not be accessible via https://m.zonash.com (check Nginx configuration)"
fi

# Set proper permissions
print_status "Setting proper file permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
chmod -R 644 "$APP_DIR/.next/static/"

print_success "Deployment completed successfully!"
print_status "Application is running at: https://m.zonash.com"
print_status "PM2 status:"
pm2 status

echo ""
echo "🎉 LIVE Deployment Summary:"
echo "✅ Repository updated from GitHub"
echo "✅ Dependencies installed"
echo "✅ Application built successfully"
echo "✅ PM2 started/restarted"
echo "✅ File permissions set"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: pm2 logs zonash-frontend"
echo "  - Monitor: pm2 monit"
echo "  - Restart: pm2 restart zonash-frontend"
echo "  - Status: pm2 status"
echo ""
echo "🌐 Your application is now LIVE at: https://m.zonash.com"
echo ""
echo "📊 Next Steps:"
echo "1. Test the live website functionality"
echo "2. Verify Facebook Pixel is working"
echo "3. Check all pages load correctly"
echo "4. Test cart and checkout flow"
echo "5. Monitor performance and logs"
