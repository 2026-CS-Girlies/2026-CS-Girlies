## Run Still True Locally

Still True can run locally so your conversation stays on your own computer.

The local version uses **Ollama** to run the CBT-focused Crispers language model.

> **Recommended:** 16 GB RAM or more
> The first setup may take a while because the model needs to be downloaded.

### 1. Install Ollama

Download and install Ollama for your operating system:

**Ollama:**
https://ollama.com/download

Ollama supports Windows, macOS, and Linux.

After installation, open a terminal and check that Ollama is available:

```bash
ollama --version
```

### 2. Download the Crispers model

Still True uses **Crispers-7B**, a language model trained for cognitive restructuring conversations.

The GGUF version is available on Hugging Face:

**Model:**
https://huggingface.co/mradermacher/Crispers-7B-v1-GGUF

We recommend the quantized version for local use.

You can download and run it directly through Ollama:

```bash
ollama run hf.co/mradermacher/Crispers-7B-v1-GGUF:Q4_K_M
```

Ollama will automatically download the model the first time you run this command.

Once you see the chat prompt, the model is ready.

You can type:

```text
Hello
```

to make sure it is working.

Press:

```text
Ctrl + D
```

or type:

```text
/bye
```

to exit the Ollama chat.

### 3. Clone Still True

Clone the project and move into the project directory:

```bash
git clone <STILL_TRUE_REPOSITORY_URL>
cd still-true
```

### 4. Install the backend

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it.

**Windows:**

```bash
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 5. Start the backend

Make sure Ollama is running, then start the Still True API:

```bash
uvicorn main:app --reload
```

By default, the backend will be available at:

```text
http://localhost:8000
```

Ollama runs locally at:

```text
http://localhost:11434
```

### 6. Start the frontend

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Then start the app:

```bash
npm run dev
```

Vite will show a local address, usually:

```text
http://localhost:5173
```

Open that address in your browser.

You're ready to use **Still True locally.**

---

## What runs locally?

When using the local version:

```text
Your Browser
     ↓
Still True Frontend
     ↓
Local FastAPI Backend
     ↓
Ollama
     ↓
Crispers-7B
```

The language model runs on your own machine rather than on our hosted GPU.

No API key is required.

---

## Model

Still True uses **Crispers-7B**, developed for multi-turn cognitive restructuring conversations.

Original project:

**Crisp: Cognitive Restructuring of Negative Thoughts through Multi-turn Supportive Dialogues**

Crispers models were trained specifically for identifying and restructuring negative thoughts through conversation.

For easier local inference, Still True uses a quantized GGUF version distributed through Hugging Face.

---

## Troubleshooting

### `ollama` is not recognized

Restart your terminal after installing Ollama and try:

```bash
ollama --version
```

If it still does not work, restart your computer and verify that Ollama is running.

### Check that the model is installed

```bash
ollama list
```

You should see the Crispers model in the list.

### Test the model separately

Before starting Still True, you can verify that the model works by running:

```bash
ollama run hf.co/mradermacher/Crispers-7B-v1-GGUF:Q4_K_M
```

If you can chat with the model here, Ollama and the model are working correctly.

### Backend cannot connect to Ollama

Make sure Ollama is running.

You can check:

```text
http://localhost:11434
```

If Ollama is active, it should respond that Ollama is running.

---

## Hardware Recommendation

For the smoothest local experience, we recommend:

* **RAM:** 16 GB or more
* **GPU:** Optional, but recommended for faster responses
* **Storage:** Make sure you have enough free space for the model
* **OS:** Windows, macOS, or Linux

Performance depends on your hardware. Running the model without a dedicated GPU is possible, but responses may be slower.

---

## Web or Local?

**Web Version**

The easiest way to try Still True. No installation is required.

**Local Version**

For users who prefer to run the language model directly on their own computer and avoid sending conversation content to our hosted model.

Choose whichever experience feels right for you.
