# Project Voyager — Infrastructure Homelab

**A hands-on Linux infrastructure and virtualization lab focused on systems administration, networking, troubleshooting, automation, and continuous learning.**

## Overview

Project Voyager is a self-hosted infrastructure lab built on a repurposed Dell Inspiron laptop running Proxmox VE.

The goal is to develop practical engineering skills by building systems, understanding their behavior, safely introducing failures, diagnosing problems, restoring functionality, and documenting the results.

**Engineering philosophy:**

Build → Understand → Break Safely → Diagnose → Repair → Automate → Document

## Infrastructure

| Component | Configuration |
|---|---|
| Host | Dell Inspiron 3542 |
| CPU | Intel Core i3-4030U |
| Memory | 8 GB RAM |
| Storage | ~500 GB HDD |
| Hypervisor | Proxmox VE 9.x |
| Host OS | Debian 13 |
| Guest OS | Rocky Linux 9 Minimal |
| VM Resources | 2 vCPU, 2 GB RAM, 32 GB disk |
| Networking | Linux Bridge (vmbr0), VirtIO |
| Remote Access | SSH, Tailscale |
| Administration | macOS Terminal, Proxmox Web UI |

## Completed Milestones

### Phase 1 — Host Infrastructure
- Installed Proxmox VE on bare-metal hardware.
- Configured management networking and Linux bridge.
- Enabled SSH public-key authentication.
- Established remote access through Tailscale.
- Resolved APT repository configuration errors.
- Diagnosed and corrected unexpected host suspension when the laptop lid closed.

### Phase 2 — Virtualization
- Provisioned Rocky Linux 9 Minimal as a Proxmox VM.
- Allocated virtual CPU, memory, and disk resources.
- Configured VirtIO networking through the host bridge.
- Established SSH connectivity from the administration workstation.
- Investigated a duplicate IP address affecting the hypervisor and VM.
- Configured a DHCP reservation and restored network connectivity.

### Phase 3 — Connectivity & Incident Response
- Investigated remote SSH and Proxmox dashboard timeouts.
- Checked host and Tailscale connectivity.
- Restored remote access and verified connectivity using an external network.
- Documented incident symptoms, diagnostic steps, and recovery results.

### Phase 4 — Application Hosting & Recovery
- Deployed a Node.js/Express API on Rocky Linux under a regular user account.
- Added a JSON health endpoint and a Bash HTTP health check.
- Configured systemd startup and automatic recovery after process failure.
- Verified recovery after SIGKILL and application startup after a VM reboot.
- Accessed the loopback-bound API from macOS through SSH forwarding.
- Verified that closing the tunnel interrupted Mac access while the local API stayed available.
- Published application source, dependency manifests, service configuration, and deployment instructions.
- Rebuilt the application from a fresh Git checkout and verified routes, health-script behavior, and restoration of the deployed service.

[Application hosting checkpoint](proxmox/implementation_Troubleshooting/node-api-service-checkpoint.md) · [Deployment instructions](apps/voyager-api/README.md)

## Technical Skills Practiced

- Linux systems administration
- Type-1 virtualization and VM provisioning
- TCP/IP networking and DHCP troubleshooting
- Linux bridges and virtual network interfaces
- SSH authentication and remote administration
- VPN-based remote connectivity
- System services and configuration management
- Incident investigation and technical documentation
- Node.js/Express deployment and npm dependency management
- Bash health checks and command exit statuses
- systemd crash recovery and boot verification
- SSH local forwarding
- Git staging, commits, and authenticated publishing

## Lessons Learned

- Network connectivity depends on correct addressing across both the hypervisor and its guests.
- DHCP behavior must be understood even when using static management addresses.
- Remote-access failures require checking both endpoints before assuming the server is down.
- Logs, system state, and configuration evidence are more reliable than assumptions.
- Documentation turns one-time fixes into reusable operational knowledge.

## Roadmap

**Checkpoint Closeout — Recovery Snapshot**
- Compare the installed service configuration with the versioned definition.
- Capture and record a Proxmox checkpoint snapshot.

HTTP health checks, crash recovery, boot startup, SSH forwarding, and a clean-copy application rebuild on the existing Rocky environment have been verified. Final configuration comparison and the checkpoint snapshot remain pending.

**Next Milestone — Application Data**
- Add a useful API feature, then introduce PostgreSQL persistence.

**Future Milestones**
- Podman containerization.
- Monitoring and automated health checks.
- Backup and restore testing.
- Linux firewall and SELinux configuration.
- Application and database deployment.
- Bash/Python automation.
- CI/CD and reproducible deployment workflows.

## Project Status

**Active Development — November 2026**

Current focus: application hosting, service recovery, deployment documentation, and preparation for persistence and containerization.


