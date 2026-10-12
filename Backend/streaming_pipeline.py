"""Streaming pipeline for the seven-agent research workflow."""

from agents import (
    build_reader_agent,
    build_search_agent,
    build_result_payload,
    cross_ref_chain,
    fact_check_chain,
    get_tool_result,
    normalize_search_results,
    refiner_chain,
    safe_json_loads,
    source_summary_for_url,
    strip_think,
    writer_chain,
    critic_chain,
)


def stream_research_pipeline(topic: str):
    state = {"original_topic": topic, "search_results": [], "scraped_content": []}

    yield {"step": "topic_refiner", "status": "running"}
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
    state["refined_topic"] = refined.get("refined_topic") or topic
    state["research_questions"] = refined.get("research_questions") or []
    state["search_keywords"] = refined.get("search_keywords") or []
    state["search_queries"] = refined.get("search_queries") or [topic]
    state["refiner_output"] = refined
    yield {"step": "topic_refiner", "status": "done", "data": refined}

    yield {"step": "search", "status": "running"}
    search_results = []
    for query in state["search_queries"][:4]:
        search_agent = build_search_agent()
        result = search_agent.invoke(
            {"messages": [("user", f"Search for evidence related to: {query}")]},
            config={"recursion_limit": 25},
        )
        search_results.extend(normalize_search_results(get_tool_result(result)))

    deduped = []
    seen = set()
    for item in search_results:
        url = (item.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        deduped.append(item)
    state["search_results"] = deduped
    yield {"step": "search", "status": "done", "data": {"queries": state["search_queries"], "results": deduped}}

    yield {"step": "reader", "status": "running"}
    scraped = []
    for result in deduped[:5]:
        url = result.get("url")
        if not url:
            continue
        reader_agent = build_reader_agent()
        reader_result = reader_agent.invoke(
            {"messages": [("user", f"Read and extract evidence from: {url}")]},
            config={"recursion_limit": 25},
        )
        source = source_summary_for_url(url)
        source["title"] = result.get("title") or source["title"]
        content = get_tool_result(reader_result)
        source["passages"] = [content[:2000]]
        source["key_findings"] = ["Evidence extracted and retained for the final report."]
        scraped.append(source)
    state["scraped_content"] = scraped
    yield {"step": "reader", "status": "done", "data": scraped}

    yield {"step": "writer", "status": "running"}
    evidence_blob = "\n\n".join(
        f"TITLE: {src.get('title')}\nURL: {src.get('url')}\nCONTENT: {src.get('passages', [''])[0]}"
        for src in scraped
    )
    state["report"] = strip_think(writer_chain.invoke({
        "topic": state["refined_topic"],
        "research": (
            f"Research topic: {state['refined_topic']}\n\n"
            f"Research questions: {state['research_questions']}\n\n"
            f"Evidence:\n{evidence_blob}"
        ),
    }))
    yield {"step": "writer", "status": "done", "data": state["report"]}

    yield {"step": "critic", "status": "running"}
    state["feedback"] = strip_think(critic_chain.invoke({"report": state["report"]}))
    yield {"step": "critic", "status": "done", "data": state["feedback"]}

    yield {"step": "fact_check", "status": "running"}
    fact_check = safe_json_loads(fact_check_chain.invoke({
        "topic": state["refined_topic"],
        "report": state["report"],
        "evidence": evidence_blob,
    }), {"summary": "Fact check unavailable.", "claims": []})
    if not isinstance(fact_check, dict):
        fact_check = {"summary": "Fact check unavailable.", "claims": []}
    state["claim_verification"] = fact_check
    yield {"step": "fact_check", "status": "done", "data": fact_check}

    yield {"step": "cross_ref", "status": "running"}
    cross_ref = safe_json_loads(cross_ref_chain.invoke({
        "topic": state["original_topic"],
        "refined_topic": state["refined_topic"],
        "research_questions": state["research_questions"],
        "evidence": evidence_blob,
    }), {
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
    yield {"step": "cross_ref", "status": "done", "data": final_result}

    yield {"step": "pipeline", "status": "complete", "data": final_result}