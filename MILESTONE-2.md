# CAYPO Milestone 2 — Agent Platform + Live Gateway

> Target: v1.0 release
> Depends on: Milestone 1 (v0.1.0) complete

## Deliverables

### 1. MCP Server Enhancement (14 live tools → 33 live tools)
- [ ] Implement savings tools (caypo_save, caypo_withdraw, caypo_rebalance_savings, caypo_earnings)
- [ ] Implement credit tools (caypo_borrow, caypo_repay, caypo_health)
- [ ] Implement exchange tools (caypo_exchange, caypo_quote)
- [ ] Implement investment tools (8 tools: buy, sell, earn, unearn, rebalance, portfolio, strategy, auto)
- [ ] Implement reward tools (caypo_claim_rewards, caypo_reward_history)
- [ ] Implement all 20 prompts fully (currently 5 full + 15 stubs)
- [ ] Add streaming response support for long-running tools

### 2. Gateway Live Deployment
- [ ] Deploy gateway to mpp.cayvox.io (Cherry VPS, Caddy reverse proxy)
- [ ] Configure all 17 API keys in production env
- [ ] Set up TransferPreapproval for gateway party on Canton DevNet
- [ ] Verify full 402 → payment → proxy flow end-to-end
- [ ] /api/services and /llms.txt live and discoverable
- [ ] Rate limiting and abuse prevention
- [ ] Monitoring and alerting (uptime, error rates, payment volume)

### 3. Agent Skills
- [ ] Publish caypo-agent-skills package (npx skills add cayvox-labs/caypo-agent-skills)
- [ ] 10 skills: check-balance, send, save, withdraw, exchange, borrow, repay, pay, sentinel, rebalance
- [ ] Compatible with: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Windsurf, Amp
- [ ] Test with Claude Code in real project
- [ ] YAML skill definitions with triggers and commands

### 4. Traffic Management
- [ ] Implement actual traffic purchase via Splice validator admin API
- [ ] Auto-purchase when traffic drops below threshold
- [ ] Traffic balance monitoring with alerts
- [ ] CC (Canton Coin) balance tracking

### 5. Landing Page
- [ ] Domain: caypo.dev or cantonagent.xyz
- [ ] Next.js site with pages: Home, Accounts, MPP, Gateway, Docs, Demo
- [ ] Interactive terminal demo (asciinema or custom)
- [ ] API documentation (generated from TypeScript types)
- [ ] SEO: target "canton payments", "ai agent banking", "mpp canton"

### 6. Documentation Site
- [ ] Full API reference for all 5 packages
- [ ] Integration guide for Canton developers
- [ ] Tutorial: "Build your first Canton agent in 5 minutes"
- [ ] Video demo (60s terminal recording)
- [ ] Architecture deep-dive document

### 7. Canton Method Spec PR
- [ ] Submit PR to tempoxyz/mpp-specs repository
- [ ] Canton method specification document (following mpp-specs format)
- [ ] Example code in PR (both client and server)
- [ ] Test vectors for interoperability

### 8. Testing & Quality
- [ ] Increase unit test coverage to >90%
- [ ] Add integration tests for gateway with mock upstream services
- [ ] Performance benchmarks: tx throughput, latency, memory
- [ ] Security audit: keystore encryption, input validation, injection prevention

## Timeline

| Week | Focus |
|------|-------|
| Week 1 | Gateway deployment + TransferPreapproval setup |
| Week 2 | MCP tools (savings, credit, exchange) |
| Week 3 | Agent skills + Traffic management |
| Week 4 | Landing page + Documentation |
| Week 5 | Investment tools + Rewards |
| Week 6 | Canton Method Spec PR + Testing |
| Week 7 | Polish, security audit, video demo |
| Week 8 | v1.0 release |

## Branch Strategy

- `main` — Public, stable releases (pushed to `origin` = anilkaracay/Caypo)
- `milestone-2` — Development branch (pushed to `dev` = anilkaracay/caypo-dev)
- Feature branches off `milestone-2` for individual deliverables
- Merge to `main` when ready for public release
