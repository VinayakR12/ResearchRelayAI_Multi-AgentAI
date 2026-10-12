"""Build a styled PDF for research reports and their academic metadata."""

import markdown as md
from html import escape
from io import BytesIO
from datetime import datetime

from xhtml2pdf import pisa


PDF_TEMPLATE = """
<html>
<head>
<style>
  @page {{
    size: A4;
    margin: 2.4cm 2.2cm;
    @frame footer_frame {{
      -pdf-frame-content: footer_content;
      bottom: 1cm;
      margin-left: 2.2cm;
      margin-right: 2.2cm;
      height: 1cm;
    }}
  }}
  body {{
    font-family: "Times New Roman", Times, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
  }}
  .eyebrow {{
    font-family: Helvetica, sans-serif;
    font-size: 8.5pt;
    letter-spacing: 2px;
    color: #7a5cff;
  }}
  h1.title {{ font-size: 21pt; margin: 6px 0 2px; }}
  .meta {{
    font-family: Helvetica, sans-serif;
    font-size: 9pt;
    color: #666666;
    margin-bottom: 18px;
    border-bottom: 1pt solid #cccccc;
    padding-bottom: 12px;
  }}
  h2 {{
    font-size: 14pt;
    color: #3d2f8f;
    margin-top: 22px;
    margin-bottom: 6px;
    border-bottom: 0.5pt solid #dddddd;
    padding-bottom: 4px;
  }}
  h3 {{ font-size: 12pt; margin-top: 14px; }}
  p {{ margin: 0 0 10px; text-align: justify; }}
  ul, ol {{ margin: 0 0 10px; padding-left: 20px; }}
  li {{ margin-bottom: 4px; }}
  strong {{ color: #3d2f8f; }}
  .section-label {{
    font-family: Helvetica, sans-serif;
    font-size: 9pt;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #999999;
    margin-top: 30px;
    margin-bottom: 8px;
  }}
  .meta-box {{
    border: 1pt solid #e3e3e3;
    background: #faf8ff;
    padding: 10px 12px;
    margin-bottom: 18px;
  }}
  .callout {{
    border-left: 3pt solid #7a5cff;
    background: #faf8ff;
    padding: 8px 12px;
    margin: 8px 0 14px;
  }}
  .warning {{
    border: 1pt solid #f1c27d;
    background: #fffaf0;
    padding: 8px 12px;
    margin: 8px 0;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px;
  }}
  th, td {{
    border: 0.5pt solid #dddddd;
    padding: 6px;
    vertical-align: top;
    font-size: 9pt;
  }}
  th {{ background: #f4f2ff; text-align: left; }}
  #footer_content {{
    font-family: Helvetica, sans-serif;
    font-size: 8pt;
    color: #999999;
    text-align: center;
  }}
</style>
</head>
<body>
  <div class="eyebrow">AUTONOMOUS RESEARCH PIPELINE</div>
  <h1 class="title">{topic}</h1>
  <div class="meta">Generated on {date}</div>
  {academic_html}
  {report_html}
  {critique_section}
  <div id="footer_content">Page <pdf:pagenumber /> of <pdf:pagecount /></div>
</body>
</html>
"""


def build_report_pdf(topic: str, report_markdown: str, critique_markdown: str = None, academic: dict = None) -> bytes:
    """Takes the markdown report and optional academic metadata, returns PDF bytes."""
    academic = academic or {}
    title_options = academic.get("title_options") or []
    abstract = academic.get("abstract") or ""
    keywords = academic.get("keywords") or []
    objectives = academic.get("objectives") or []
    methodology = academic.get("methodology") or ""
    references = academic.get("references") or []
    research_scope = academic.get("research_scope") or ""
    research_questions = academic.get("research_questions") or []
    search_keywords = academic.get("search_keywords") or []
    search_queries = academic.get("search_queries") or []
    claim_verification = academic.get("claim_verification") or {}
    cross_reference_findings = academic.get("cross_reference_findings") or {}
    warnings = academic.get("warnings") or []
    sources = academic.get("sources") or academic.get("scraped_content") or []
    search_results = academic.get("search_results") or []

    academic_parts = []
    if title_options:
        academic_parts.append(f'<div class="section-label">Alternative Titles</div><ul><li>{"</li><li>".join(escape(str(item)) for item in title_options)}</li></ul>')
    if abstract:
        academic_parts.append(f'<div class="section-label">Abstract</div>{md.markdown(abstract)}')
    if keywords:
        academic_parts.append(f'<div class="section-label">Keywords</div><p>{escape(", ".join(str(item) for item in keywords))}</p>')
    if objectives:
        academic_parts.append(f'<div class="section-label">Objectives</div><ul><li>{"</li><li>".join(escape(str(item)) for item in objectives)}</li></ul>')
    if methodology:
        academic_parts.append(f'<div class="section-label">Methodology</div>{md.markdown(methodology)}')
    if research_scope:
        academic_parts.append(f'<div class="section-label">Research Scope</div><div class="callout">{md.markdown(research_scope)}</div>')
    if research_questions:
        academic_parts.append(f'<div class="section-label">Research Questions</div><ol><li>{"</li><li>".join(escape(str(item)) for item in research_questions)}</li></ol>')
    if search_keywords:
        academic_parts.append(f'<div class="section-label">Search Keywords</div><p>{escape(", ".join(str(item) for item in search_keywords))}</p>')
    if search_queries:
        academic_parts.append(f'<div class="section-label">Search Queries Used</div><ul><li>{"</li><li>".join(escape(str(item)) for item in search_queries)}</li></ul>')
    if references:
        refs_html = "<ul>"
        for ref in references[:10]:
            title = ref.get("title") or "Untitled source"
            url = ref.get("url") or ""
            details = " · ".join(str(value) for value in [ref.get("publisher_or_venue"), ref.get("publication_date"), ref.get("doi")] if value)
            refs_html += f"<li><strong>{escape(str(title))}</strong> - {escape(str(url))}{' · ' + escape(details) if details else ''}</li>"
        refs_html += "</ul>"
        academic_parts.append(f'<div class="section-label">References</div>{refs_html}')

    claims = claim_verification.get("claims") if isinstance(claim_verification, dict) else []
    if isinstance(claim_verification, dict) and claim_verification.get("summary"):
        academic_parts.append(f'<div class="section-label">Fact-check summary</div><div class="callout">{md.markdown(str(claim_verification["summary"]))}</div>')
    if claims:
        rows = ["<table><tr><th>Claim</th><th>Status</th><th>Notes / sources</th></tr>"]
        for claim in claims:
            if not isinstance(claim, dict):
                continue
            source_urls = ", ".join(str(url) for url in claim.get("source_urls") or [])
            rows.append(
                f"<tr><td>{escape(str(claim.get('claim') or ''))}</td>"
                f"<td>{escape(str(claim.get('status') or 'unknown'))}</td>"
                f"<td>{escape(str(claim.get('notes') or source_urls or '—'))}</td></tr>"
            )
        rows.append("</table>")
        academic_parts.append('<div class="section-label">Claim Verification</div>' + "".join(rows))

    if cross_reference_findings:
        cross_parts = []
        for label in ("agreement", "disagreement", "gaps"):
            values = cross_reference_findings.get(label) or []
            if values:
                cross_parts.append(f"<h3>{escape(label.title())}</h3><ul><li>{'</li><li>'.join(escape(str(item)) for item in values)}</li></ul>")
        if cross_parts:
            academic_parts.append('<div class="section-label">Cross-reference Findings</div>' + "".join(cross_parts))

    if warnings:
        academic_parts.append(f'<div class="section-label">Research Notes & Limitations</div><div class="warning"><ul><li>{"</li><li>".join(escape(str(item)) for item in warnings)}</li></ul></div>')

    if sources:
        source_items = []
        for source in sources:
            if isinstance(source, dict):
                source_html = f"<li><strong>{escape(str(source.get('title') or 'Source'))}</strong> — {escape(str(source.get('url') or ''))}"
                passages = source.get("passages") or []
                findings = source.get("key_findings") or []
                if passages:
                    source_html += f"<div class=\"callout\">{md.markdown(str(passages[0]))}</div>"
                if findings:
                    source_html += f"<ul><li>{'</li><li>'.join(escape(str(item)) for item in findings)}</li></ul>"
                source_items.append(source_html + "</li>")
        if source_items:
            academic_parts.append('<div class="section-label">Reader Agent Sources</div><ul>' + "".join(source_items) + '</ul>')

    if search_results:
        result_items = []
        for source in search_results:
            if isinstance(source, dict):
                result_items.append(f"<li><strong>{escape(str(source.get('title') or 'Search result'))}</strong> — {escape(str(source.get('url') or ''))}</li>")
        if result_items:
            academic_parts.append('<div class="section-label">Search Agent Results</div><ul>' + "".join(result_items) + '</ul>')

    report_html = md.markdown(report_markdown)
    critique_section = ""
    if critique_markdown:
        critique_html = md.markdown(critique_markdown)
        critique_section = f'<div class="section-label">Critic\'s Review</div>{critique_html}'

    html = PDF_TEMPLATE.format(
        topic=topic,
        date=datetime.now().strftime("%B %d, %Y"),
        academic_html="".join(academic_parts),
        report_html=report_html,
        critique_section=critique_section,
    )

    output = BytesIO()
    pisa.CreatePDF(html, dest=output)
    return output.getvalue()