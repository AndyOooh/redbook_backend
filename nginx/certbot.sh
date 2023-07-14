#!/bin/sh

# Log start of script
# echo "Executing certbot.sh script" >> /var/log/certbot.log

# Generate or renew the SSL certificate using Certbot
certbot certonly --standalone --non-interactive --agree-tos --email andy.oeee@gmail.com -d api.theredbook.xyz,www.api.theredbook.xyz -v

# Log end of script
# echo "Fininshed Executing certbot.sh script" >> /var/log/certbot-finished.log

# Reload NGINX configuration to apply the new certificate
nginx -s reload
