# Property-options proposals: helper scripts

The proposal PDF lives in the **Staal CRM** (`C:\Users\texst\Staal CRM`,
`proposal.js`). On a lead page, Tex pastes funda in business links and clicks
**Prepare with Claude**. In Claude Code he says "prepare my proposals" (the
`property-proposal` skill in `~/.claude/skills`). The PDF is then
downloaded from the CRM.

This folder only holds the two local helpers Claude uses to prepare the
properties:

- `extract.js`: run in the built-in browser on a fundainbusiness.nl listing.
  It returns the facts, description, coordinates and full photo list. funda
  blocks plain HTTP clients with a bot check, so this needs a real browser.
- `contact-sheet.js`: `node tools/proposals/contact-sheet.js <json>` produces
  numbered photo sheets so Claude can pick the main photo and the gallery.
  The json is `{"options":[{"photos":[…]}]}`; it uses sharp from this repo.

`clients/` and `.cache/` are gitignored, and `tools/` is excluded from the
Vercel deploy.
