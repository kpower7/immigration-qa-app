from __future__ import annotations

from pydantic import BaseModel
from typing import Optional, Dict


class FormLinks(BaseModel):
    form_id: str
    page_url: str
    instructions_url: Optional[str] = None


# Minimal curated mappings for common forms. Extend as needed.
FORM_MAP: Dict[str, FormLinks] = {
    "I-140": FormLinks(
        form_id="I-140",
        page_url="https://www.uscis.gov/i-140",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-140instr.pdf",
    ),
    "I-485": FormLinks(
        form_id="I-485",
        page_url="https://www.uscis.gov/i-485",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-485instr.pdf",
    ),
    "I-130": FormLinks(
        form_id="I-130",
        page_url="https://www.uscis.gov/i-130",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-130instr.pdf",
    ),
    "I-864": FormLinks(
        form_id="I-864",
        page_url="https://www.uscis.gov/i-864",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-864instr.pdf",
    ),
    "I-539": FormLinks(
        form_id="I-539",
        page_url="https://www.uscis.gov/i-539",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-539instr.pdf",
    ),
    "I-765": FormLinks(
        form_id="I-765",
        page_url="https://www.uscis.gov/i-765",
        instructions_url="https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf",
    ),
}


def normalize_form_id(s: str) -> str:
    s = s.strip().upper().replace(" ", "").replace("_", "-")
    if s.startswith("I-"):
        return s
    if s.startswith("I") and len(s) > 1 and s[1].isdigit():
        # e.g., I140 -> I-140
        return f"I-{s[1:]}"
    return s


def find_form_links(form_id: str) -> FormLinks:
    """Return official form page and instructions link if known.
    If unknown, return a best-effort page URL to USCIS with no instructions_url.
    """
    fid = normalize_form_id(form_id)
    if fid in FORM_MAP:
        return FORM_MAP[fid]
    # Fallback to form landing page pattern (may 404 for unknown forms)
    # Users still get the main USCIS search if form page not found.
    page_url = f"https://www.uscis.gov/{fid.lower()}"
    return FormLinks(form_id=fid, page_url=page_url, instructions_url=None)
