# Deployment Guide

This guide covers various ways to deploy Locas-Ants to production.

[中文](#中文) | [English](#english)

---

## English

### GitHub Pages

#### Option 1: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The built files will be in `dist/` directory

3. Push the `dist/` folder to `gh-pages` branch:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

4. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `root`

#### Option 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v3
        id: deployment
```

Update `vite.config.ts` with base path:

```typescript
export default defineConfig({
  base: '/locas-ants/', // Replace with your repo name
});
```

### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Or connect your GitHub repo to Vercel dashboard for automatic deployments

### Netlify

#### Option 1: Netlify CLI

```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### Option 2: Drag and Drop

1. Build: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag `dist/` folder to the page

#### Option 3: GitHub Integration

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Static Hosting (Apache/Nginx)

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy `dist/` contents to web server directory:
   ```bash
   cp -r dist/* /var/www/html/
   ```

3. Configure server (example Nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t locas-ants .
docker run -p 8080:80 locas-ants
```

---

## 中文

### GitHub Pages

#### 方式一：手动部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 构建文件在 `dist/` 目录中

3. 将 `dist/` 文件夹推送到 `gh-pages` 分支：
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

4. 在仓库设置中启用 GitHub Pages：
   - 进入 Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` / `root`

#### 方式二：GitHub Actions（自动化）

创建 `.github/workflows/deploy.yml`：

```yaml
name: 部署到 GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v3
        id: deployment
```

更新 `vite.config.ts` 添加 base 路径：

```typescript
export default defineConfig({
  base: '/locas-ants/', // 替换为你的仓库名
});
```

### Vercel

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 部署：
   ```bash
   vercel
   ```

3. 或者将 GitHub 仓库连接到 Vercel 控制台以自动部署

### Netlify

#### 方式一：Netlify CLI

```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### 方式二：拖拽上传

1. 构建：`npm run build`
2. 访问 https://app.netlify.com/drop
3. 将 `dist/` 文件夹拖到页面上

#### 方式三：GitHub 集成

1. 将仓库连接到 Netlify
2. 构建命令：`npm run build`
3. 发布目录：`dist`

### 静态托管（Apache/Nginx）

1. 构建项目：
   ```bash
   npm run build
   ```

2. 复制 `dist/` 内容到 Web 服务器目录：
   ```bash
   cp -r dist/* /var/www/html/
   ```

3. 配置服务器（Nginx 示例）：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Docker

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行：
```bash
docker build -t locas-ants .
docker run -p 8080:80 locas-ants
```

---

## Environment Variables

If you need to configure environment-specific settings, create `.env` files:

```env
# .env.production
VITE_API_URL=https://api.example.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Performance Considerations

- Enable gzip compression on your server
- Set proper cache headers for static assets
- Consider using a CDN for better global performance
- Monitor bundle size with `npm run build -- --mode analyze`

---

## Troubleshooting

### Blank page after deployment
- Check browser console for errors
- Verify `base` path in `vite.config.ts` matches deployment URL
- Ensure all assets are loading correctly (check Network tab)

### 404 on page refresh (SPA routing)
- Configure server to redirect all routes to `index.html`
- For GitHub Pages, add a `404.html` that redirects to `index.html`

---

## Questions?

If you encounter deployment issues, please open an issue on GitHub.

如果遇到部署问题，请在 GitHub 上开启 issue。
