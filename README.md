# OpenCode-Saturn

> A fork of [OpenCode](https://github.com/anomalyco/opencode) with integrated Saturn network provider for zero-configuration AI service discovery.

This fork adds support for [Saturn](https://github.com/jperrello/Saturn), a service discovery system that enables applications to automatically locate and use AI backends on a local network via mDNS—like Bonjour, but for AI services.

---

## What is Saturn?

Saturn eliminates the need for per-application API key configuration. Instead of configuring each application with provider credentials, Saturn advertises AI services on your network:

- **Cloud Deployments ("Beacons")** — Advertise remote API credentials (OpenRouter, OpenAI, DeepInfra) with ephemeral key rotation
- **Network Deployments ("Proxies")** — Advertise local LAN services (Ollama, vLLM) by host/port

Applications using the Saturn provider automatically discover and connect to available AI backends. See the [Saturn SPEC](https://github.com/jperrello/Saturn/blob/main/ai-sdk-provider-saturn/SPEC.md) for full details.

## What Changed in This Fork

This fork integrates [`ai-sdk-provider-saturn`](https://github.com/jperrello/Saturn/tree/main/ai-sdk-provider-saturn) as a bundled provider:

- **Saturn provider** added to `BUNDLED_PROVIDERS` in `packages/opencode/src/provider/provider.ts`
- **Custom loader** that performs mDNS discovery to find `_saturn._tcp.local` services
- **Dynamic model registration** from discovered network services
- **Default configuration** in `.opencode/opencode.jsonc` with Saturn enabled

When you launch OpenCode-Saturn, it automatically discovers Saturn services on your network and makes their models available for use—no API keys or manual configuration required.

## Quick Start

1. Ensure a Saturn service is running on your network (beacon or proxy)
2. Clone and build this fork
3. Run OpenCode—Saturn models appear automatically

```bash
git clone https://github.com/jperrello/opencode-saturn
cd opencode-saturn
bun install
bun run dev
```

## Related Projects

- **[Saturn](https://github.com/jperrello/Saturn)** — The core service discovery system and provider SDK
- **[ai-sdk-provider-saturn](https://github.com/jperrello/Saturn/tree/main/ai-sdk-provider-saturn)** — The Vercel AI SDK provider used by this fork

---

## About OpenCode

<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/opencode-ai"><img alt="npm" src="https://img.shields.io/npm/v/opencode-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

OpenCode is a 100% open source AI coding agent created by [Anomaly](https://github.com/anomalyco). Key features:

- **Provider agnostic** — Works with Claude, OpenAI, Google, local models, or Saturn-discovered services
- **LSP support** — Out of the box language server integration
- **TUI focus** — Built by neovim users and the creators of [terminal.shop](https://terminal.shop)
- **Client/server architecture** — Run OpenCode locally and drive it remotely

For upstream installation, documentation, and community links, visit the [official OpenCode repository](https://github.com/anomalyco/opencode).

---

**This fork is not affiliated with the OpenCode team as of February 2026.**
