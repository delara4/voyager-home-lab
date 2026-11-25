# Voyager API

A small Express API deployed on Rocky Linux and managed by systemd.

## Application

- Node.js 24 with Express 5.
- Listens on 127.0.0.1:3000.
- GET / returns a welcome message.
- GET /health returns HTTP 200 with {"status":"ok"}.

The health check confirms HTTP availability. It does not inspect the JSON body or check a database.

## Deployment

These instructions assume an existing aaron account with sudo access, Node.js 24, npm, and this repository cloned under ~/repos.

Copy the application into its deployment directory and install the locked dependencies as aaron.

```bash
mkdir -p ~/projects/voyager-api
cp ~/repos/voyager-home-lab/apps/voyager-api/server.js ~/projects/voyager-api/
cp ~/repos/voyager-home-lab/apps/voyager-api/package*.json ~/projects/voyager-api/
cd ~/projects/voyager-api
npm ci
```

Install the service definition and start the API.

```bash
sudo install -m 0644 ~/repos/voyager-home-lab/apps/voyager-api/systemd/voyager-api.service /etc/systemd/system/voyager-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now voyager-api.service
```

After changing deployed application code, restart the service.

```bash
sudo systemctl restart voyager-api.service
```

## Verification

Run inside Rocky.

```bash
curl -i --max-time 3 http://127.0.0.1:3000/health
bash ~/repos/voyager-home-lab/apps/voyager-api/scripts/health-check.sh http://127.0.0.1:3000/health
echo "$?"
sudo journalctl -u voyager-api.service -n 20 --no-pager
```

Expect HTTP 200, {"status":"ok"}, and health-check exit status 0.

## Access from a Mac

Replace ROCKY_LAN_IP with the guest's LAN address. Run in Mac Terminal and keep the connection open.

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:3001:127.0.0.1:3000 aaron@ROCKY_LAN_IP
```

In another Mac terminal, request the forwarded endpoint.

```bash
curl -i --max-time 3 http://127.0.0.1:3001/health
```

## Verified failure and recovery exercises

- A missing route returned HTTP 404.
- A stopped listener produced curl connection error 7.
- The Bash check translated unsuccessful requests into exit status 1.
- Killing the systemd-managed Node process triggered an automatic restart after the configured three-second delay.
- The replacement process had a new PID and served the health endpoint successfully.
- After a Rocky reboot, the enabled service started and returned HTTP 200.
- Closing the SSH tunnel removed the Mac's port 3001 listener. The Mac request failed while Rocky's local health request continued to succeed.

## Lessons learned

Service state, listening sockets, HTTP responses, and SSH forwarding describe different parts of the request path. I used systemctl, journalctl, ss, lsof, and curl to investigate those parts and verify recovery.
