# GitHub Pages Setup Guide

## Automatic Deployment

This repository is configured with GitHub Actions to automatically deploy to GitHub Pages on every push to `main` branch.

## Enable GitHub Pages

After pushing this repository to GitHub, you need to enable GitHub Pages:

1. Go to your repository on GitHub: https://github.com/hotea/locas-ants

2. Click **Settings** (⚙️ icon)

3. In the left sidebar, click **Pages**

4. Under **Source**, select:
   - Source: **GitHub Actions**

5. Save the settings

## First Deployment

The first deployment will happen automatically when you push to the `main` branch:

```bash
git push -u origin main
```

After the workflow completes (usually 1-2 minutes), your site will be available at:

**https://hotea.github.io/locas-ants/**

## Manual Deployment

You can also trigger a manual deployment:

1. Go to **Actions** tab on GitHub
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select `main` branch and click **Run workflow**

## Check Deployment Status

- Go to **Actions** tab to see workflow runs
- Green checkmark ✅ = successful deployment
- Red X ❌ = failed deployment (click to see logs)

## Troubleshooting

### Workflow doesn't run
- Make sure GitHub Actions is enabled in Settings → Actions
- Check if you have proper permissions

### Build fails
- Check the workflow logs in Actions tab
- Make sure all dependencies are in `package.json`
- Test build locally: `npm run build`

### 404 on deployed site
- Verify base path in `vite.config.ts` matches repository name
- Check that Pages is configured to use GitHub Actions
- Wait a few minutes for DNS propagation

---

## 中文说明

## 启用 GitHub Pages

推送仓库到 GitHub 后，需要启用 GitHub Pages：

1. 访问仓库：https://github.com/hotea/locas-ants

2. 点击 **Settings**（设置）

3. 左侧菜单点击 **Pages**

4. **Source** 选择：
   - Source: **GitHub Actions**

5. 保存设置

## 首次部署

推送到 `main` 分支时自动部署：

```bash
git push -u origin main
```

工作流完成后（通常 1-2 分钟），网站将在以下地址可用：

**https://hotea.github.io/locas-ants/**

## 手动部署

也可以手动触发部署：

1. 进入 **Actions** 标签页
2. 点击 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow** 按钮
4. 选择 `main` 分支并点击 **Run workflow**

## 故障排查

### 工作流不运行
- 确保在 Settings → Actions 中启用了 GitHub Actions
- 检查是否有适当的权限

### 构建失败
- 查看 Actions 标签页中的工作流日志
- 确保所有依赖都在 `package.json` 中
- 本地测试构建：`npm run build`

### 部署的网站显示 404
- 验证 `vite.config.ts` 中的 base 路径与仓库名匹配
- 检查 Pages 是否配置为使用 GitHub Actions
- 等待几分钟让 DNS 传播
