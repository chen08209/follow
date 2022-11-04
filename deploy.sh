#!/usr/bin/env sh

# 忽略错误
set -e

# 构建
npm run build:docs

# 进入待发布的目录
cd docs/.vitepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@gitee.com:chen08209/follow.git master:gh-pages

cd -