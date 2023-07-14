FROM nginx:latest

# Install Certbot
RUN apt-get update && \
    apt-get install -y certbot

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add script for certificate generation and renewal
COPY certbot.sh /usr/local/bin/certbot.sh
RUN chmod +x /usr/local/bin/certbot.sh

# Expose ports 80 and 443
EXPOSE 80
EXPOSE 443

# Start NGINX and run certbot script in the background
# CMD /bin/bash -c "certbot.sh & nginx -g 'daemon off;'"
# CMD /bin/bash -c "certbot.sh && nginx -g 'daemon off;'"
# CMD /bin/bash -c "certbot.sh"

CMD ["nginx", "-g", "daemon off;"]


# Note that you could also achieve a similar effect by specifying multiple CMD instructions in the Dockerfile, 
# each with a single command. However, using /bin/bash -c with a combined command allows you to run multiple commands 
# in a single CMD instruction, simplifying the Dockerfile and avoiding unnecessary layers in the resulting image.
