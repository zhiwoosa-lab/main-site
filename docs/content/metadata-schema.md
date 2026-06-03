# Metadata Schema

> Standard frontmatter fields for all content entries.

## Journal / Log Entries

```yaml
---
date: 2026-06-01       # required: ISO date
type: journal           # journal | note | reflection | experiment
section: health         # section identifier
status: active          # active | done | paused
tags: []                # optional keywords
---
```

## Apple Event Entries

```yaml
---
title: ""
date: ""                # required: ISO date
place: ""
lifePeriod: ""
appleType: "red"        # red | green | gift | rotten
appleSize: "medium"     # small | medium | large
summary: ""
visibility: "public"    # public | private
tags: []
---
```

## Index Files

```json
{
  "schemaVersion": 1,
  "section": "health",
  "entries": [{ "file": "2026-06-01-real-health.md" }]
}
```
