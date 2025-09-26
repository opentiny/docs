# OpenTiny NEXT 文档

本地启动：

```shell
git submodule update --init
pnpm i
pnpm -F root build
pnpm dev
```

更新子仓库（以 next-sdk 为例）：

```shell
cd next-sdk
git checkout dev
git pull origin dev
```
