# 🔧 Create PM2 Configuration

## 📍 **Current Issue**
PM2 can't find the ecosystem.config.js file. Let's create it and start the application.

### **1. Create PM2 Ecosystem File**
```bash
# Create PM2 ecosystem file
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
```

### **2. Start Application with PM2**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check PM2 status
pm2 status
```

### **3. Test Application**
```bash
# Test application locally
curl http://localhost:3000

# Check PM2 logs
pm2 logs zonash-frontend --lines 20
```

## 🚨 **If PM2 Still Fails**

### **Alternative: Start with npm directly**
```bash
# Start with npm directly (for testing)
npm start

# In another terminal, check if it's running
curl http://localhost:3000
```

### **Alternative: Simple PM2 Start**
```bash
# Start with PM2 without config file
pm2 start npm --name "zonash-frontend" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

## 🔧 **Quick Commands**

```bash
# Create PM2 ecosystem file
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

# Start with PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Check status
pm2 status
```

## 🎯 **What to Do Next**

1. **Create the PM2 config file** (run the cat command above)
2. **Start with PM2** (`pm2 start ecosystem.config.js`)
3. **Save configuration** (`pm2 save`)
4. **Test application** (`curl http://localhost:3000`)
5. **Configure CloudPanel** (add website, configure Nginx)

## 🚨 **Troubleshooting**

### **If PM2 Still Fails**
```bash
# Check if the file was created
ls -la ecosystem.config.js

# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs zonash-frontend
```

### **If Application Not Starting**
```bash
# Check if port 3000 is in use
netstat -tlnp | grep 3000

# Kill any existing processes
pm2 kill

# Start fresh
pm2 start ecosystem.config.js
```

---

**🔧 Create the PM2 config file and start the application!**
