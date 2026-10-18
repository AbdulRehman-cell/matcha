# Fast Render Deployment Guide

Deploy your Node.js + MongoDB application to Render in under 5 minutes using Render Blueprints.

## Prerequisites
- A [Render Account](https://render.com)
- A GitHub repository containing this code

---

## Deployment Steps

### Method 1: Automated Blueprint Deployment (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository containing the project.
4. Render will automatically read `render.yaml`, provision a managed MongoDB database, create the web service, set up health checks, and generate a secure `JWT_SECRET`.
5. Click **Apply**.

---

## Local Verification Commands

To run and verify the complete stack locally before pushing to production, execute these 3 commands:

```bash
# 1. Copy local environment variables
cp .env.example .env

# 2. Build and start services in containerized environment
docker compose up -d --build

# 3. Check logs and health status
docker compose ps
```

Your app will be live locally at `http://localhost:5000`.