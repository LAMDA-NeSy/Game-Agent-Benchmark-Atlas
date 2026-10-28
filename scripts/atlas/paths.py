"""Resolve all build paths relative to this checkout, never the caller's directory."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'src'
CURATION = ROOT / 'data' / 'curation'
DIST = ROOT / 'dist'
REPORTS = ROOT / 'output'
