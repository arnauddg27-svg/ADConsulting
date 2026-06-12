# CLAUDE.md

## Memory

Fill this in as you work. Claude will read this at the start of every session.

### Me
<!-- Your name, role, team, and what you do in one sentence -->

### People
| Who | Role |
|-----|------|
<!-- | **Name** | Full name, role | -->
-> Full list: memory/glossary.md | Profiles: memory/people/

### Terms
| Term | Meaning |
|------|---------|
<!-- | PSR | Pipeline Status Report | -->
-> Full glossary: memory/glossary.md

### Projects
| Name | What |
|------|------|
<!-- | **Phoenix** | DB migration, Q2 launch | -->
-> Details: memory/projects/

### Preferences
<!-- - Async-first, Slack over email -->
<!-- - No meetings Friday afternoons -->

## Task Tracking

Tasks are tracked in TASKS.md in this directory. At the start of a session, check TASKS.md and give a brief status of what's active. When action items come up in conversation, offer to add them.

## Skills

- **memory-management** (.claude/skills/memory/) — Persistent memory across sessions. Use when encountering unknown names, acronyms, or shorthand. Save new context as you learn it.
- **task-planning** (.claude/skills/task-planning/) — Task tracking and planning via TASKS.md. Use when the user asks about tasks, wants to add/complete items, or needs help breaking down work.

## Project Context

<!-- Add your project-specific info below -->
<!-- Tech stack, architecture, build commands, coding conventions, etc. -->

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
