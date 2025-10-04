# ✅ Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Code Quality ✅
- [x] Build successful (`npm run build`)
- [x] All TypeScript errors fixed
- [x] ESLint warnings minimized
- [x] No console errors in production build
- [x] All components optimized
- [x] Static generation working

### Environment Variables 🔧
- [ ] `NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql`
- [ ] `NEXT_PUBLIC_STORE_ID=your_store_id`
- [ ] `NEXT_PUBLIC_STORE_NAME=Zonash`
- [ ] `NEXT_PUBLIC_SITE_URL=https://m.zonash.com`
- [ ] `NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914`
- [ ] `FACEBOOK_ACCESS_TOKEN=your_facebook_access_token`
- [ ] `FACEBOOK_APP_ID=your_facebook_app_id`
- [ ] `FACEBOOK_APP_SECRET=your_facebook_app_secret`

### Server Requirements 🖥️
- [ ] Debian server with CloudPanel
- [ ] Node.js 18.x or higher installed
- [ ] PM2 process manager installed
- [ ] Nginx configured
- [ ] SSL certificate ready

## 📋 Deployment Steps

### 1. Server Preparation
- [ ] Update system packages
- [ ] Install Node.js 18.x
- [ ] Install PM2 globally
- [ ] Create application directory `/var/www/m.zonash.com`
- [ ] Set proper file permissions

### 2. Application Setup
- [ ] Upload project files to server
- [ ] Install production dependencies (`npm install --production`)
- [ ] Create `.env.production` file with all variables
- [ ] Build application (`npm run build`)
- [ ] Verify build output

### 3. Process Management
- [ ] Create PM2 ecosystem file
- [ ] Start application with PM2
- [ ] Configure PM2 to start on boot
- [ ] Test application is running on port 3000

### 4. Nginx Configuration
- [ ] Create Nginx configuration for m.zonash.com
- [ ] Configure reverse proxy to port 3000
- [ ] Enable Gzip compression
- [ ] Set up static file caching
- [ ] Test Nginx configuration
- [ ] Restart Nginx service

### 5. SSL Certificate
- [ ] Configure SSL in CloudPanel
- [ ] Or use Let's Encrypt with Certbot
- [ ] Test SSL certificate is working
- [ ] Verify HTTPS redirect

### 6. Domain Configuration
- [ ] Add m.zonash.com in CloudPanel
- [ ] Configure DNS records
- [ ] Test domain resolution
- [ ] Verify backend.zonash.com is accessible

### 7. Security Hardening
- [ ] Configure firewall (UFW)
- [ ] Set proper file permissions
- [ ] Enable security headers
- [ ] Configure log rotation

### 8. Monitoring Setup
- [ ] Configure PM2 log rotation
- [ ] Set up health check script
- [ ] Configure monitoring alerts
- [ ] Test log access

## 🧪 Post-Deployment Testing

### Application Tests
- [ ] Homepage loads correctly
- [ ] Product pages work
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Thank you page displays
- [ ] Search functionality works
- [ ] Category pages load

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness
- [ ] SSL rating A+ on SSLLabs
- [ ] Google PageSpeed score > 90

### Facebook Pixel Tests
- [ ] PageView events firing
- [ ] ViewContent events on product pages
- [ ] AddToCart events working
- [ ] InitiateCheckout events firing
- [ ] Purchase events tracking
- [ ] No duplicate events

### API Integration Tests
- [ ] GraphQL endpoint accessible
- [ ] Cart operations working
- [ ] Order placement working
- [ ] Customer verification working
- [ ] Webhook endpoints responding

## 🔧 Quick Commands

### Server Commands
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend

# Restart application
pm2 restart zonash-frontend

# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Application Commands
```bash
# Build application
npm run build

# Start in production
npm start

# Check build
ls -la .next/

# Test locally
curl http://localhost:3000
```

### Monitoring Commands
```bash
# Check application health
curl -I https://m.zonash.com

# Monitor resources
pm2 monit

# Check logs
tail -f /var/log/pm2/zonash-frontend-out.log
```

## 🚨 Troubleshooting

### Common Issues
- [ ] **Port 3000 not accessible**: Check PM2 status, restart if needed
- [ ] **SSL certificate issues**: Renew certificate, reload Nginx
- [ ] **Build errors**: Clear cache, rebuild
- [ ] **Memory issues**: Increase Node.js memory limit
- [ ] **Permission errors**: Fix file ownership and permissions

### Emergency Procedures
- [ ] **Application down**: `pm2 restart zonash-frontend`
- [ ] **Nginx issues**: `sudo systemctl restart nginx`
- [ ] **SSL problems**: `sudo certbot renew --force-renewal`
- [ ] **Full restart**: `pm2 restart all && sudo systemctl restart nginx`

## 📊 Success Metrics

### Performance Targets
- [ ] Page load time < 3 seconds
- [ ] Time to First Byte < 200ms
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

### Functionality Targets
- [ ] 100% of pages load without errors
- [ ] All Facebook Pixel events firing correctly
- [ ] Complete checkout flow working
- [ ] Mobile responsiveness perfect

### Security Targets
- [ ] SSL certificate valid and secure
- [ ] Security headers configured
- [ ] No exposed sensitive information
- [ ] Firewall properly configured

## 🎯 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Test all critical user flows
- [ ] Verify Facebook Pixel events
- [ ] Check error logs
- [ ] Monitor performance

### Short-term (Week 1)
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Performance optimization
- [ ] User feedback collection

### Long-term (Month 1)
- [ ] Analytics setup
- [ ] A/B testing framework
- [ ] Scaling preparation
- [ ] Feature development planning

---

**🎉 Ready for Production Deployment!**

**Next Steps:**
1. Follow the deployment guide step by step
2. Test thoroughly after each step
3. Monitor closely for the first 24 hours
4. Have rollback plan ready
5. Document any issues encountered
