# SSH Setup

Goal: Connect my MacBook to my Linux server.

Steps:

1. Generate SSH key

ssh-keygen -t ed25519

2. Copy key to server

ssh-copy-id user@server-ip

3. Test connection

ssh user@server-ip
