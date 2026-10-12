import json
import os
import re
from datetime import date
from typing import Any, Dict, List

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from tools import scrape_url, web_search

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
key = os.getenv("GROQ_API_KEY")

if key:
    print("GROQ KEY FOUND:", True)
    print("GROQ KEY PREFIX:", key[:4])
else:
    print("GROQ KEY FOUND:", False)
    print("GROQ KEY PREFIX:", "None")

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
    reasoning_effort="low",
    max_retries=3,
)


def strip_think(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def safe_json_loads(raw: Any, fallback: Any = None) -> Any:
    if raw is None:
        return fallback
    if isinstance(raw, (dict, list)):
        return raw
    if isinstance(raw, str):
        text = raw.strip()
        if not text:
            return fallback
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```", text, flags=re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            return fallback
    return fallback


def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search],
        system_prompt=(
            "You are a research search agent. Use the web_search tool to gather several relevant sources. "
            "Return the raw tool output with titles, URLs, and snippets intact. Prefer recent, credible, and "
            "specific sources. Do not invent results or fill in missing information."
        ),
    )


def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrape_url],
        system_prompt=(
            "You are a research reader agent. Read the provided URL and extract the most relevant facts, dates, "
            "methodology details, findings, and key passages while preserving source metadata. Do not claim "
            "unsupported conclusions. Return the raw scraped evidence clearly."
        ),
    )


def get_tool_result(agent_response: dict) -> str:
    for msg in reversed(agent_response.get("messages", [])):
        if msg.__class__.__name__ == "ToolMessage":
            content = getattr(msg, "content", "")
            if isinstance(content, str):
                return strip_think(content)
    if agent_response.get("messages"):
        last = agent_response["messages"][-1]
        content = getattr(last, "content", "")
        if isinstance(content, str):
            return strip_think(content)
    return ""


def normalize_search_results(raw_results: str) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []
    current: Dict[str, str] = {}
    for line in (raw_results or "").splitlines():
        if line.startswith("Title:"):
            if current.get("url"):
                results.append(current)
            current = {"title": line.replace("Title:", "", 1).strip()}
        elif line.startswith("URL:"):
            current["url"] = line.replace("URL:", "", 1).strip()
        elif line.startswith("Snippet:"):
            current["snippet"] = line.replace("Snippet:", "", 1).strip()
        elif line.startswith("Content:"):
            current["snippet"] = line.replace("Content:", "", 1).strip()
        elif line.startswith("-----") and current.get("url"):
            results.append(current)
            current = {}
    if current.get("url"):
        results.append(current)

    deduped: List[Dict[str, str]] = []
    seen = set()
    for item in results:
        url = (item.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        title = (item.get("title") or "Untitled").strip() or "Untitled"
        deduped.append({
            "title": title,
            "url": url,
            "snippet": (item.get("snippet") or "").strip(),
        })
    return deduped[:15]


def source_summary_for_url(url: str) -> Dict[str, Any]:
    domain = re.sub(r"^https?://", "", url)
    domain = domain.split("/")[0].replace("www.", "")
    return {
        "source_id": re.sub(r"[^a-zA-Z0-9]", "-", url)[:80],
        "title": "Source from " + domain,
        "url": url,
        "publication_date": None,
        "publisher_or_venue": domain,
        "doi": None,
        "passages": [],
        "key_findings": [],
        "methodology": "",
        "limitations": [],
        "retrieval_status": "success",
    }


refiner_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a research topic refiner. Improve the question without changing the user's intended subject. Return JSON only."),
    ("human", """Refine and structure the user's research topic.

Original topic:
{topic}

Return valid JSON in this schema:
{{
  "original_topic": "...",
  "refined_topic": "...",
  "research_scope": "...",
  "research_questions": ["..."],
  "search_keywords": ["..."],
  "search_queries": ["..."],
  "warnings": []
}}

Rules:
- Preserve the original intent, subject, and scope.
- Remove informal phrasing but do not add unrelated subjects.
- Keep the topic academically grounded and specific enough for search.
- Generate 2-4 strong search queries.
- Output valid JSON only, no markdown fences."""),
])

refiner_chain = refiner_prompt | llm | StrOutputParser()

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Ground every claim in the supplied evidence. Write a clear report with citations using source URLs where available."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}
Research context:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 findings, as a numbered list)
- Discussion
- Limitations
- Conclusion
- Sources (list the URLs used)

Rules:
- Use specific dates and numbers only when they are present in the evidence.
- Do not blend separate events or time periods into a single claim.
- Clearly distinguish established findings from interpretation.
- Mention which source supports each claim using the format: (Source: URL)
- Do not invent statistics or quotations.
- If a fact is unclear or not supported, say so plainly.
- Keep the report consistent with the original research intent."""),
])
writer_chain = writer_prompt | llm | StrOutputParser()

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", f"You are a precise research critic. Today's date is {date.today():%B %Y}. Judge the report only on relevance, clarity, evidence support, structure, and accuracy. Do not penalize sources simply because they are recent or outside your memory cutoff."),
    ("human", """Review the research report below.

Report:
{report}

Return a concise but structured review in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])
critic_chain = critic_prompt | llm | StrOutputParser()

fact_check_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a careful fact-checker. Break the report into checkable factual claims and determine whether they are supported by the evidence. Return JSON only."),
    ("human", """Check the following report against the supplied evidence.

Topic: {topic}
Report:
{report}
Evidence:
{evidence}

Return valid JSON in this schema:
{{
  "summary": "...",
  "claims": [
    {{
      "claim": "...",
      "status": "supported|partially_supported|unsupported|contradicted|not_verifiable",
      "source_urls": ["..."],
      "notes": "..."
    }}
  ]
}}

Only include claims that are actually checkable. Do not fabricate evidence."""),
])
fact_check_chain = fact_check_prompt | llm | StrOutputParser()

cross_ref_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a cross-reference validator and academic paper planner. Use the actual evidence and metadata to prepare academic deliverables without inventing references."),
    ("human", """Prepare academic output from the research topic and the provided evidence.

Original topic: {topic}
Refined topic: {refined_topic}
Research questions: {research_questions}
Evidence summary:
{evidence}

Return valid JSON in this schema:
{{
  "title_options": ["...", "..."],
  "abstract": "...",
  "keywords": ["..."],
  "objectives": ["..."],
  "methodology": "...",
  "references": [
    {{
      "title": "...",
      "url": "...",
      "publisher_or_venue": "...",
      "publication_date": "...",
      "doi": "..."
    }}
  ],
  "cross_reference_findings": {{
    "agreement": ["..."],
    "disagreement": ["..."],
    "gaps": ["..."]
  }},
  "warnings": ["..."]
}}

Important: If there are fewer than seven verified references, return the genuine available ones and clearly state a shortfall in warnings. Do not invent authors, titles, years, DOIs, or URLs."""),
])
cross_ref_chain = cross_ref_prompt | llm | StrOutputParser()


def build_result_payload(topic: str, refined: Dict[str, Any], search_results: List[Dict[str, str]], scraped_pages: List[Dict[str, Any]], report: str, critique: str, fact_check: Dict[str, Any], cross_ref: Dict[str, Any]) -> Dict[str, Any]:
    references = []
    for item in cross_ref.get("references", []) or []:
        if isinstance(item, dict):
            ref = {
                "title": item.get("title") or "Untitled source",
                "url": item.get("url") or "",
                "publisher_or_venue": item.get("publisher_or_venue") or "Unknown publisher",
                "publication_date": item.get("publication_date") or "Unknown date",
                "doi": item.get("doi") or "",
            }
            references.append(ref)
    for src in scraped_pages:
        if not any(ref.get("url") == src.get("url") for ref in references):
            references.append({
                "title": src.get("title") or "Source",
                "url": src.get("url") or "",
                "publisher_or_venue": src.get("publisher_or_venue") or "Unknown publisher",
                "publication_date": src.get("publication_date") or "Unknown date",
                "doi": src.get("doi") or "",
            })

    return {
        "original_topic": topic,
        "refined_topic": refined.get("refined_topic") or topic,
        "research_scope": refined.get("research_scope") or "",
        "research_questions": refined.get("research_questions") or [],
        "search_keywords": refined.get("search_keywords") or [],
        "search_queries": refined.get("search_queries") or [],
        "title_options": cross_ref.get("title_options") or [],
        "abstract": cross_ref.get("abstract") or "",
        "keywords": cross_ref.get("keywords") or [],
        "objectives": cross_ref.get("objectives") or [],
        "methodology": cross_ref.get("methodology") or "",
        "report": report,
        "quality_review": critique,
        "claim_verification": fact_check,
        "cross_reference_findings": cross_ref.get("cross_reference_findings") or {},
        "references": references,
        "sources": scraped_pages,
        "warnings": list(refined.get("warnings") or []) + list(cross_ref.get("warnings") or []),
        "search_results": search_results,
        "scraped_content": scraped_pages,
        "feedback": critique,
    }


def run_research_pipeline(topic: str) -> Dict[str, Any]:
    state: Dict[str, Any] = {"original_topic": topic}

    refined_raw = refiner_chain.invoke({"topic": topic})
    refined = safe_json_loads(refined_raw, {
        "original_topic": topic,
        "refined_topic": topic,
        "research_scope": "",
        "research_questions": [],
        "search_keywords": [],
        "search_queries": [topic],
        "warnings": [],
    })
    if not isinstance(refined, dict):
        refined = {
            "original_topic": topic,
            "refined_topic": topic,
            "research_scope": "",
            "research_questions": [],
            "search_keywords": [],
            "search_queries": [topic],
            "warnings": [],
        }

    state.update({
        "refined_topic": refined.get("refined_topic") or topic,
        "research_scope": refined.get("research_scope") or "",
        "research_questions": refined.get("research_questions") or [],
        "search_keywords": refined.get("search_keywords") or [],
        "search_queries": refined.get("search_queries") or [topic],
        "refiner_output": refined,
    })

    all_search_results: List[Dict[str, str]] = []
    for query in state["search_queries"][:4]:
        search_agent = build_search_agent()
        search_result = search_agent.invoke(
            {"messages": [("user", f"Research the topic using this search query: {query}")]},
            config={"recursion_limit": 25},
        )
        text = get_tool_result(search_result)
        all_search_results.extend(normalize_search_results(text))

    deduped = []
    seen = set()
    for item in all_search_results:
        url = (item.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        deduped.append(item)
    state["search_results"] = deduped

    scraped_pages: List[Dict[str, Any]] = []
    for idx, result in enumerate(deduped[:5]):
        url = result.get("url")
        if not url:
            continue
        reader_agent = build_reader_agent()
        reader_result = reader_agent.invoke(
            {"messages": [("user", f"Extract relevant evidence from this source: {url}")]},
            config={"recursion_limit": 25},
        )
        source = source_summary_for_url(url)
        source["title"] = result.get("title") or source["title"]
        source["passages"] = [strip_think(get_tool_result(reader_result))[:2000]]
        source["key_findings"] = ["Evidence extracted from the retrieved source."]
        scraped_pages.append(source)

    state["scraped_content"] = scraped_pages

    evidence_blob = "\n\n".join(
        f"TITLE: {src.get('title')}\nURL: {src.get('url')}\nCONTENT: {src.get('passages', [''])[0]}"
        for src in scraped_pages
    )

    report_input = {
        "topic": state["refined_topic"],
        "research": (
            f"Research topic: {state['refined_topic']}\n\n"
            f"Search queries: {state['search_queries']}\n\n"
            f"Evidence:\n{evidence_blob}"
        ),
    }
    state["report"] = strip_think(writer_chain.invoke(report_input))

    state["feedback"] = strip_think(critic_chain.invoke({"report": state["report"]}))

    fact_raw = fact_check_chain.invoke({
        "topic": state["refined_topic"],
        "report": state["report"],
        "evidence": evidence_blob,
    })
    fact_check = safe_json_loads(fact_raw, {"summary": "Fact check not available.", "claims": []})
    if not isinstance(fact_check, dict):
        fact_check = {"summary": "Fact check not available.", "claims": []}
    state["claim_verification"] = fact_check

    cross_ref_raw = cross_ref_chain.invoke({
        "topic": state["original_topic"],
        "refined_topic": state["refined_topic"],
        "research_questions": state["research_questions"],
        "evidence": evidence_blob,
    })
    cross_ref = safe_json_loads(cross_ref_raw, {
        "title_options": [],
        "abstract": "",
        "keywords": [],
        "objectives": [],
        "methodology": "",
        "references": [],
        "cross_reference_findings": {"agreement": [], "disagreement": [], "gaps": []},
        "warnings": [],
    })
    if not isinstance(cross_ref, dict):
        cross_ref = {
            "title_options": [],
            "abstract": "",
            "keywords": [],
            "objectives": [],
            "methodology": "",
            "references": [],
            "cross_reference_findings": {"agreement": [], "disagreement": [], "gaps": []},
            "warnings": [],
        }
    state["cross_reference_findings"] = cross_ref.get("cross_reference_findings") or {"agreement": [], "disagreement": [], "gaps": []}
    state["title_options"] = cross_ref.get("title_options") or []
    state["abstract"] = cross_ref.get("abstract") or ""
    state["keywords"] = cross_ref.get("keywords") or []
    state["objectives"] = cross_ref.get("objectives") or []
    state["methodology"] = cross_ref.get("methodology") or ""
    state["references"] = cross_ref.get("references") or []
    state["warnings"] = (refined.get("warnings") or []) + (cross_ref.get("warnings") or [])

    final_result = build_result_payload(
        topic=state["original_topic"],
        refined=refined,
        search_results=state["search_results"],
        scraped_pages=state["scraped_content"],
        report=state["report"],
        critique=state["feedback"],
        fact_check=state["claim_verification"],
        cross_ref=cross_ref,
    )
    state.update(final_result)
    return state


if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    result = run_research_pipeline(topic)
    print(json.dumps({
        "original_topic": result.get("original_topic"),
        "refined_topic": result.get("refined_topic"),
        "report": result.get("report"),
        "quality_review": result.get("quality_review"),
    }, indent=2))
