import config
from langchain_ollama import ChatOllama


conversation_llm = ChatOllama(model=config.CHAT_MODEL, temperature=0.4,)
extractor_llm = ChatOllama(model=config.SUMMARY_MODEL, temperature=0,)