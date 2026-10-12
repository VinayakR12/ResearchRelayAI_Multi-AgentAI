"""FastAPI app exposing the research pipeline as a Server-Sent Events (SSE) stream."""

import json
import os

from fastapi import Body, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from pdf_generator import build_report_pdf
from streaming_pipeline import stream_research_pipeline

app = FastAPI(title="Multi-Agent ResearchRelay AI")


@app.post("/download-pdf")
def download_pdf(payload: dict = Body(...)):
    topic = str(payload.get("topic") or "Research Report").strip() or "Research Report"
    report = payload.get("report") or ""
    critique = payload.get("critique") or payload.get("quality_review") or ""
    academic = payload.get("academic") or payload.get("result") or payload or {}

    if not report:
        raise HTTPException(status_code=400, detail="The report body is required for PDF generation.")

    pdf_bytes = build_report_pdf(topic, report, critique, academic)
    safe_name = "".join(c if c.isalnum() or c in " -_" else "" for c in topic).strip().replace(" ", "_")[:50]
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_report.pdf"'},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
            ],
    allow_methods=["*"],
    allow_headers=["*"],
)


def sse_event_stream(topic: str):
    """Formats each pipeline event as an SSE message."""
    for event in stream_research_pipeline(topic):
        try:
            yield f"data: {json.dumps(event)}\n\n"
        except TypeError:
            safe_event = {"step": event.get("step"), "status": event.get("status"), "data": "Error: non-serializable payload"}
            yield f"data: {json.dumps(safe_event)}\n\n"


@app.get("/research")
def research(topic: str = Query(..., min_length=1, description="Research topic to investigate.")):
    if not topic.strip():
        raise HTTPException(status_code=400, detail="A non-empty topic is required.")
    return StreamingResponse(sse_event_stream(topic), media_type="text/event-stream")


@app.get("/health")
def health():
    return {"status": "ok", "environment": {"groq_configured": bool(os.getenv("GROQ_API_KEY")), "tavily_configured": bool(os.getenv("TAVILY_API_KEY"))}}