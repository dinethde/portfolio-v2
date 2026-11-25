#!/usr/bin/env python3
"""Rewrite src/content/contributions.fallback.json from GitHub, with the same mapping as src/lib/github/map.ts.

GITHUB_TOKEN=... python3 scripts/refresh_fallback.py [--login dinethde]
python3 scripts/refresh_fallback.py --sample      (deterministic placeholder data, no network)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from collections.abc import Sequence
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "content" / "contributions.fallback.json"
ENDPOINT = "https://api.github.com/graphql"
WEEKS = 52
LEVELS = {"NONE": 0, "FIRST_QUARTILE": 1, "SECOND_QUARTILE": 2, "THIRD_QUARTILE": 3, "FOURTH_QUARTILE": 4}
QUERY = """query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}"""


def calendar_range(now: datetime) -> tuple[str, str]:
    """From is now minus 52 weeks, moved back to that Sunday (UTC). To is now."""
    back = (now - timedelta(weeks=WEEKS)).replace(hour=0, minute=0, second=0, microsecond=0)
    back -= timedelta(days=(back.weekday() + 1) % 7)
    return back.isoformat().replace("+00:00", "Z"), now.isoformat().replace("+00:00", "Z")


def to_contributions(raw: dict[str, Any], now: datetime, source: str = "fallback") -> dict[str, Any]:
    user = raw.get("user")
    if not user:
        raise ValueError("GitHub returned no user")
    calendar = user["contributionsCollection"]["contributionCalendar"]
    weeks = [
        [
            {"date": d["date"], "count": d["contributionCount"], "level": LEVELS[d["contributionLevel"]]}
            for d in w["contributionDays"]
        ]
        for w in calendar["weeks"]
        if w["contributionDays"]
    ][-WEEKS:]
    total = sum(day["count"] for week in weeks for day in week)
    return {"total": total, "weeks": weeks, "fetchedAt": now.isoformat().replace("+00:00", "Z"), "source": source}


def fetch_calendar(login: str, token: str, now: datetime) -> dict[str, Any]:
    start, end = calendar_range(now)
    body = json.dumps({"query": QUERY, "variables": {"login": login, "from": start, "to": end}}).encode()
    request = urllib.request.Request(
        ENDPOINT, data=body, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        payload = json.load(response)
    if payload.get("errors") or not payload.get("data"):
        raise RuntimeError(f"GitHub error: {payload.get('errors')}")
    data: dict[str, Any] = payload["data"]
    return data


def sample_calendar(now: datetime) -> dict[str, Any]:
    """Deterministic placeholder in GitHub's response shape, for the very first fallback file."""
    start = datetime.fromisoformat(calendar_range(now)[0].replace("Z", "+00:00"))
    names = list(LEVELS)
    weeks = []
    for w in range(WEEKS + 1):
        days = []
        for d in range(7):
            day = start + timedelta(weeks=w, days=d)
            if day > now:
                continue
            n = (w * 7 + d) * 2654435761 % 100
            level = 0 if n < 45 else 1 if n < 70 else 2 if n < 85 else 3 if n < 95 else 4
            days.append(
                {
                    "date": day.date().isoformat(),
                    "contributionCount": level * 2 + (1 if level else 0),
                    "contributionLevel": names[level],
                }
            )
        weeks.append({"contributionDays": days})
    return {"user": {"contributionsCollection": {"contributionCalendar": {"totalContributions": 0, "weeks": weeks}}}}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Refresh src/content/contributions.fallback.json.")
    parser.add_argument("--login", default="dinethde", help="GitHub login (default: dinethde)")
    parser.add_argument("--sample", action="store_true", help="write deterministic placeholder data, no network")
    args = parser.parse_args(argv)

    now = datetime.now(timezone.utc).replace(microsecond=0)
    if args.sample:
        raw = sample_calendar(now)
    else:
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            print("GITHUB_TOKEN is not set", file=sys.stderr)
            return 1
        raw = fetch_calendar(args.login, token, now)
    OUTPUT.write_text(json.dumps(to_contributions(raw, now), indent=2) + "\n")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
