import re

from agents import run_research_pipeline


def get_tool_result(agent_response: dict) -> str:
    """Backward-compatible helper kept for older callers."""
    messages = agent_response.get("messages", [])
    for msg in reversed(messages):
        content = getattr(msg, "content", "")
        if isinstance(content, str) and content.strip():
            return re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
    return ""


def strip_think(text: str) -> str:
    """Safety net - removes any leftover <think>...</think> block from output."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    result = run_research_pipeline(topic)
    print(result.get("report", ""))