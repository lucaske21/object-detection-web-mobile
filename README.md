<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Object Detection Web Mobile

A responsive web application for AI-powered object detection, supporting both Gemini AI and custom detection APIs. Optimized for both portrait and landscape viewing modes.

## Features

- 🎯 Real-time object detection with bounding boxes
- 🎨 Color-coded detection classes
- 📊 Interactive statistics with class filtering
- 📱 Responsive design for mobile and desktop
- 🔄 Support for multiple detection backends (Gemini AI / Custom API)
- 🐳 Docker-ready for easy deployment

## Run Locally

**Prerequisites:** Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create or edit `.env.local` file:
   ```env
   # For Gemini API (default)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # For Custom API (optional)
   VITE_USE_CUSTOM_API=true
   VITE_API_ENDPOINT=http://your-api-server:8000/api/v1/detect
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Docker Deployment

### Quick Start with Docker

#### Option 1: Build and Run Locally

1. **Build the Docker image:**
   ```bash
   docker build -t object-detection-web:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 8080:80 \
     --name object-detection-web \
     object-detection-web:latest
   ```

3. **Access the application:**
   
   Open your browser and navigate to `http://localhost:8080`

#### Option 2: Pull from GitHub Container Registry

After building via GitHub Actions, you can pull the pre-built image:

```bash
# Pull the latest version
docker pull ghcr.io/lucaske21/object-detection-web-mobile:latest

# Or pull a specific version
docker pull ghcr.io/lucaske21/object-detection-web-mobile:main-a1b2c3d

# Run the container
docker run -d \
  -p 8080:80 \
  --name object-detection-web \
  ghcr.io/lucaske21/object-detection-web-mobile:latest
```

### Docker Compose (Recommended for Production)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  web:
    image: ghcr.io/lucaske21/object-detection-web-mobile:latest
    # Or build locally:
    # build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    # Optional: Mount custom nginx config
    # volumes:
    #   - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

Run with:
```bash
docker-compose up -d
```

### Multi-Architecture Support

The Docker image supports both AMD64 and ARM64 architectures:

```bash
# For AMD64 (Intel/AMD processors)
docker pull --platform linux/amd64 ghcr.io/lucaske21/object-detection-web-mobile:latest

# For ARM64 (Apple Silicon, Raspberry Pi, etc.)
docker pull --platform linux/arm64 ghcr.io/lucaske21/object-detection-web-mobile:latest
```

### Building Images via GitHub Actions

This repository includes a GitHub Actions workflow for automated Docker builds.

1. **Trigger the workflow:**
   - Go to the **Actions** tab in your GitHub repository
   - Select **Build and Push Docker Image** workflow
   - Click **Run workflow** button
   - Select the branch and click **Run workflow**

2. **Workflow features:**
   - Builds for both `linux/amd64` and `linux/arm64` platforms
   - Tags images with format: `{branch}-{commit-hash}` (e.g., `main-a1b2c3d`)
   - Also tags the latest build as `latest`
   - Automatically pushes to GitHub Container Registry (`ghcr.io`)
   - Uses layer caching for faster subsequent builds

3. **Image naming convention:**
   ```
   ghcr.io/lucaske21/object-detection-web-mobile:latest
   ghcr.io/lucaske21/object-detection-web-mobile:main-a1b2c3d
   ghcr.io/lucaske21/object-detection-web-mobile:dev-b2c3d4e
   ```

### Advanced Docker Configuration

#### Custom Nginx Configuration

If you need to customize the Nginx configuration (e.g., for API proxying, custom headers):

1. Create `nginx.conf`:
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to backend
       location /api/ {
           proxy_pass http://your-backend-api:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. Mount the config in Docker:
   ```bash
   docker run -d \
     -p 8080:80 \
     -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
     --name object-detection-web \
     ghcr.io/lucaske21/object-detection-web-mobile:latest
   ```

#### Environment Variables at Build Time

To build with specific environment variables:

```bash
docker build \
  --build-arg VITE_USE_CUSTOM_API=true \
  --build-arg VITE_API_ENDPOINT=http://api.example.com/detect \
  -t object-detection-web:custom .
```

Note: Environment variables are baked into the build. For runtime configuration, consider using a configuration API or mounting config files.

### Container Management

```bash
# View running containers
docker ps

# View logs
docker logs object-detection-web
docker logs -f object-detection-web  # Follow logs

# Stop the container
docker stop object-detection-web

# Start the container
docker start object-detection-web

# Restart the container
docker restart object-detection-web

# Remove the container
docker rm -f object-detection-web

# Remove the image
docker rmi ghcr.io/lucaske21/object-detection-web-mobile:latest
```

### Troubleshooting

**Issue: Container exits immediately**
```bash
# Check logs
docker logs object-detection-web

# Verify the image
docker inspect object-detection-web:latest
```

**Issue: Cannot access the app**
- Ensure port 8080 is not already in use: `lsof -i :8080` or `netstat -an | grep 8080`
- Check firewall settings
- Verify container is running: `docker ps`

**Issue: CORS errors when using custom API**
- Ensure your backend API allows CORS from your frontend origin
- Or use Nginx proxy configuration to handle API requests

## API Configuration

### Using Gemini API (Default)

Set the API key in `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Using Custom Detection API

1. Set up your custom API endpoint in `.env.local`:
   ```env
   VITE_USE_CUSTOM_API=true
   VITE_API_ENDPOINT=http://192.168.1.100:8000/api/v1/detect
   ```

2. Your API should accept multipart/form-data with a file field and return:
   ```json
   {
     "predictions": [
       {
         "class_id": 0,
         "class_name": "person",
         "confidence": 0.95,
         "x1": 100,
         "y1": 150,
         "x2": 300,
         "y2": 450
       }
     ]
   }
   ```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
