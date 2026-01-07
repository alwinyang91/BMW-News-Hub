#!/bin/bash

# 构建静态网站脚本
# 临时重命名 API 目录以避免静态导出错误

API_DIR="src/app/api"
TEMP_API_DIR="src/app/_api_temp"

# 如果 API 目录存在，临时重命名它
if [ -d "$API_DIR" ]; then
  echo "Temporarily renaming API directory for static export..."
  mv "$API_DIR" "$TEMP_API_DIR"
fi

# 运行构建
echo "Building static site..."
npm run build:next

# 恢复 API 目录
if [ -d "$TEMP_API_DIR" ]; then
  echo "Restoring API directory..."
  mv "$TEMP_API_DIR" "$API_DIR"
fi

echo "Build complete!"
