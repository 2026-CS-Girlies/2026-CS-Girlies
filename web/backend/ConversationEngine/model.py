import config
from langchain_ollama import ChatOllama


working_belief_llm = ChatOllama(
    model=config.SUMMARY_MODEL,
    temperature=0.4,
)

crispers_llm = ChatOllama(
    model=config.CHAT_MODEL,
    temperature=0.4,
)

extractor_llm = ChatOllama(
    model=config.SUMMARY_MODEL,
    temperature=0,
)