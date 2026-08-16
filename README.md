# Still True
*An AI-guided Cognitive Restructuring tool that helps users examine whether negative thoughts still hold up against the evidence.*

## Inspiration & Overview

Anxiety, low mood, excessive worry, and self-critical thinking are common experiences that can significantly affect a person's well-being.
Cognitive Behavioral Therapy provided an interesting direction because Cognitive Restructuring focuses on examining the thoughts and beliefs behind emotional distress rather than simply replacing them.
We wanted to create a tool that could help users slow down and examine those thoughts on their own instead of simply receiving reassurance.

**Still True** is an AI-guided Cognitive Restructuring tool inspired by Cognitive Behavioral Therapy (CBT). It helps users **identify the belief behind a negative thought, explore why it feels true, and reflect on the evidence before developing a more balanced perspective**.

Instead of asking users to simply “think positively,” 

Still True asks: **"After looking at the evidence, is this thought still true?"**

## Methodology

Still True uses two complementary language models, each assigned to a different part of the Cognitive Restructuring process.

- ### Crispers-7B — Cognitive Restructuring Dialogue
: is a language model specialized for multi-turn Cognitive Restructuring conversations. In Still True, it powers the guided reflection stage, using the user's confirmed belief and supporting experiences to explore the thought from different perspectives.

Rather than using Crispers as an unrestricted chatbot, Still True provides it with the context gathered during earlier stages so that the conversation stays focused on a specific belief and reflection goal.

- ### Qwen2.5 — Structured Insight Extraction
: handles the structured reasoning and extraction tasks around the conversation. It helps identify the user's underlying **working belief**, determines when that belief is clear enough to confirm, and extracts the key insights from the completed reflection.

At the end of a session, Qwen2.5 organizes the conversation into:
**Original Thought**, **Why It Felt True**, **What Changed**, **Balanced Thought**

By separating these roles, **Crispers focuses on the Cognitive Restructuring dialogue while Qwen focuses on identifying and organizing key information**, creating a more controlled and structured experience than relying on a single general-purpose chatbot.


## How It Works
Check out our [demo video](https://www.canva.com/design/DAHSfcZb87A/Ga0yMbs6HM4DfKwlQ6FIVw/watch ).

[Workflow]<br>
![image.png](./Sun/still_true_how_works.png)

## Features

- AI-guided Cognitive Restructuring
- Automatic extraction of key reflection insights
- User-confirmed belief identification
- Structured step-by-step guidance
- Personalized end-of-session summaries
- Downloadable reflection reports
- Safety checks for high-risk language

## Technology

### Frontend
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)

### AI
![Ollama](https://img.shields.io/badge/Ollama-000000?logo=ollama&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white)

**Models:** Crispers-7B · Qwen2.5
