from . import config
from langchain_ollama import ChatOllama


working_belief_llm = ChatOllama(
    model=config.SUMMARY_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.1,
    top_k=20,
    top_p=0.8,
    num_predict=128
)

crispers_llm = ChatOllama(
    model=config.CHAT_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.4,
    top_k=30,
    top_p=0.9,
)

extractor_llm = ChatOllama(
    model=config.SUMMARY_MODEL,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.0,
    top_k=10,
    top_p=0.8,
)