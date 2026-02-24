---
name: Example Directive — Template SOP
objective: Demonstrate the SOP format that all directives must follow
---

## Objective

Briefly describe what this task accomplishes and why it exists.

Example: "Scrape a list of job postings from a target website and store them in the database."

---

## Inputs

List all required inputs with their types and sources.

| Input | Type | Source | Required |
|---|---|---|---|
| `target_url` | string | User provides | Yes |
| `max_pages` | integer | Config / `.env` | No (default: 5) |
| `output_format` | string | User provides | No (default: `json`) |

---

## Outputs

Describe what the script produces and where results are stored.

- **Success**: Data written to `database.table_name` or saved to `outputs/result.json`
- **Failure**: Error logged to `.tmp/error_log.txt`

---

## Tools / Scripts to Use

Point to the exact script in `execution/` that performs the work.

```
execution/example_script.py
```

Call it with:
```bash
python execution/example_script.py --url <target_url> --pages <max_pages>
```

---

## Step-by-Step Execution

1. Validate that `target_url` is provided and reachable.
2. Run `execution/example_script.py` with the given inputs.
3. Validate the output — check for non-empty results.
4. Store results in the designated system (DB, API, file).
5. Report success or failure to the user.

---

## Edge Cases & Error Handling

| Scenario | Response |
|---|---|
| URL unreachable | Log error, abort, notify user |
| Rate limit hit (429) | Wait 60 seconds, retry once |
| Empty results | Warn user, do not write to DB |
| Authentication failure | Ask user to refresh credentials |

---

## Notes

- Never re-run a completed step unnecessarily.
- If the script costs money (API calls), ask user before retrying.
- Update this directive with any new edge cases discovered.
