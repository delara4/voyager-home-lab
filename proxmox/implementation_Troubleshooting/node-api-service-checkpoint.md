# Rocky Linux Node API — Application Hosting Checkpoint

| Field | Details |
|---|---|
| Period | November 2026, checkpoint published November 24 |
| System | Rocky Linux 9 VM on Voyager, administered from macOS |
| Status | API deployed, recovery tests verified, source and configuration published |
| Deployment commit | `12162fb` |
| Application | Node.js 24.22.1, npm 11.19.1, Express 5.3.0 |

## Goal

Build on the first Rocky VM checkpoint by deploying an application I could operate and troubleshoot. I wanted to understand how HTTP responses, process state, listening sockets, and remote access fit together, then preserve the application and configuration in Git.

## Overview

I started with a disposable Python HTTP service, used it to practice diagnosing failures, and wrote a Bash health check. I then created a regular Linux account, installed Node.js, built an Express API, and configured systemd to manage it. I verified automatic recovery after a forced process failure, startup after reboot, and access from my Mac through SSH forwarding.

The deployment instructions are in the [API README](../../apps/voyager-api/README.md).

## What I added

| Component | Configuration or purpose |
|---|---|
| Linux account | `aaron`, with a home directory and wheel membership for sudo |
| API project | `/home/aaron/projects/voyager-api` |
| Routes | `GET /` returns a welcome message, `GET /health` returns HTTP 200 with `{"status":"ok"}` |
| API listener | Rocky loopback, `127.0.0.1:3000` |
| systemd unit | `/etc/systemd/system/voyager-api.service`, runs as `aaron` |
| Restart policy | `Restart=on-failure`, `RestartSec=3` |
| Bash health check | Uses curl's exit status to print healthy or unhealthy and exit 0 or 1 |
| SSH forwarding | Mac loopback port 3001 forwards to Rocky loopback port 3000 |
| Version control | Local Rocky checkout, reviewed commit, GitHub CLI authentication, successful push |

## Setup and troubleshooting

### 1. Establish SSH access and distinguish authentication from shell behavior

I verified Rocky key authentication with a fresh connection restricted to public-key authentication. An early command failed because I placed a backslash followed by a space into a single-line command. SSH interpreted the malformed argument as a hostname. Re-entering the command on one line resolved the parsing error.

This reinforced that the private key stays on the Mac, while the target account's `~/.ssh/authorized_keys` records allowed public keys. Key access was verified for the account tested. Aaron's later SSH connections used the account's password during the tunnel setup.

### 2. Practice HTTP failure diagnosis before deploying Node

I ran a temporary Python HTTP service on Rocky loopback port 8080. Stopping the service produced a connection refusal, an inactive systemd state, and no listening socket in ss.

After restarting it, requesting a nonexistent file returned HTTP 404. The server could answer requests even though the requested resource was missing.

| Observation | Interpretation |
|---|---|
| curl connection refusal, exit 7 | The connection could not be established. In the stopped-service test, no process was listening. |
| HTTP 404, plain curl exit 0 | The HTTP exchange completed and the server reported a missing resource. |
| HTTP 404, curl -f exit 22 | curl treated the HTTP error response as a command failure. |
| ss printed only column headings for the port | No matching TCP listener was present when checked. |

I used these results to distinguish a missing path from an unavailable listener.

### 3. Write a Bash health check

The script accepts a URL argument, uses `curl -fsS --max-time 3 -o /dev/null`, and branches on curl's exit status. It prints `healthy` and exits 0 on success, or prints `unhealthy` and exits 1 on failure.

I learned that Bash conditions use command exit status. Printed messages help the person reading the terminal, while the exit status controls the next program's decision.

The original script was saved at `/health-check.sh`. Attempts to read it from a user's home directory failed because the path was different. I located it and copied it into the project for version control.

The committed script retains the Python lab's default URL on port 8080. To check Node, I supply the API URL explicitly.

```bash
bash apps/voyager-api/scripts/health-check.sh http://127.0.0.1:3000/health
```

The check discards the body. A successful HTTP response with an incorrect JSON body would still pass, so body validation and dependency checks remain future work.

### 4. Install Node and build the API as a regular user

Initial checks showed I was using root and that Node and npm were absent. I created `aaron`, added it to wheel, and installed the Node.js 24 common profile through AppStream.

As aaron, I initialized the project with npm and installed Express. The project uses CommonJS. I wrote the welcome route and added a JSON health route. The first response used a message field, which I changed to status to match the agreed endpoint format.

I first ran Node in the foreground and verified it with curl. That established a working application before introducing service management.

### 5. Manage the API with systemd and verify recovery

I created a service definition with the account, working directory, absolute Node executable path, restart policy, and startup target. I loaded it with daemon-reload and enabled it with `systemctl enable --now`.

For a controlled failure, I sent SIGKILL to the service's main process and checked the journal, restart count, PID, and HTTP endpoint.

| Evidence | Result |
|---|---|
| Original process | PID 6472 |
| Forced termination | Journal recorded signal 9/KILL |
| Restart timing | Termination at 22:22:56, restart scheduled at 22:22:59 |
| Replacement process | PID 6522 |
| Restart count | `NRestarts=1` |
| Application verification | `/health` returned HTTP 200 with `{"status":"ok"}` |

The failed-process entry and the later recovery entries describe successive events. I checked the endpoint to verify that the replacement process could actually serve requests.

I then rebooted Rocky. The current-boot journal showed the service starting, its state was active, and the health endpoint returned HTTP 200 without manually launching Node.

### 6. Reach the private API through an SSH tunnel

I forwarded Mac loopback port 3001 through SSH to Rocky loopback port 3000.

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:3001:127.0.0.1:3000 aaron@ROCKY_LAN_IP
```

The blank terminal after authentication initially appeared stuck. I learned that `-N` keeps the forwarding connection open without starting a remote shell. A request from another Mac terminal reached the API successfully.

After closing the tunnel, I investigated an initially confusing report of a 200 response and HTML. A fresh Mac test showed no listener in lsof and a curl connection refusal. Rocky's local health request continued succeeding. The earlier mixed output was not captured well enough to establish its cause.

This verified that the forwarding path could disappear while the application remained available inside Rocky. Each machine's 127.0.0.1 refers to that machine's own loopback interface.

### 7. Preserve the deployment in Git and publish it

I cloned the existing Voyager repository onto Rocky and copied in the application, dependency manifests, health script, and systemd unit. The project systemd folder was initially empty, so I copied the installed unit from `/etc/systemd/system` and assigned the project copy to aaron.

I added ignore rules for node_modules and .env, staged the selected files, and inspected the diff. I also learned to press q to leave Git's diff viewer.

The first commit attempt failed with “Author identity unknown.” Configuring the repository's author name and email allowed the commit to succeed. I then installed GitHub CLI, completed browser authentication from the Mac, configured Git credentials, and pushed.

GitHub accepted commit `12162fb`, and git status reported a clean checkout up to date with origin/main.

## Outcome

The API runs under a regular account, starts after reboot, recovers from the tested process termination, and is reachable through an authenticated SSH tunnel. Source, locked dependencies, service configuration, a health script, and operating instructions are published together.

## Remaining verification

- Test the documented deployment from a clean copy. A successful push does not establish a successful rebuild.
- Capture and record a Proxmox snapshot for this checkpoint. Snapshot completion has not been verified.
- Extend health checks when the application gains data or external dependencies.
- The earlier host DHCP protection and firewall follow-ups remain open in their respective reports.

## Lessons learned

- Form a prediction, introduce one controlled failure, inspect evidence, and verify recovery from the client.
- A running process, a listening socket, and a successful HTTP response establish different facts.
- systemd startup and restart policies need actual reboot and failure tests.
- SSH forwarding supplies a request path to a loopback-bound service.
- Filesystem root, a user's home, the deployment directory, and the repository checkout are distinct locations.
- Git commits preserve selected files and history. Snapshots and backup/restore procedures have additional recovery roles.

## Skills practiced

Linux accounts and permissions, SSH public-key authentication, HTTP routing and JSON responses, Bash conditions and exit codes, systemd service management, journal inspection, TCP listener inspection, SSH forwarding, npm dependency management, and Git publishing.
