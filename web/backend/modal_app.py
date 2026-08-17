import os
import subprocess
import time

import modal
import requests


# ============================================================
# Modal app
# ============================================================

app = modal.App("still-true")


# ============================================================
# Persistent model storage
# ============================================================

model_volume = modal.Volume.from_name(
    "still-true-models",
    create_if_missing=True,
)

MODEL_MOUNT = "/models"
OLLAMA_MODELS_DIR = "/models/ollama"

# CRISPERS_GGUF = "/models/crispers/Crispers-14B-v1.Q4_K_M.gguf"

CRISPERS_GGUF = "/models/crispers/Crispers-7B-v1.Q4_K_M.gguf"
QWEN_GGUF = "/models/qwen/qwen2.5-3b-instruct-q4_k_m.gguf"

CRISPERS_MODEL_NAME = "crispers:14b-q4"
QWEN_MODEL_NAME = "qwen2.5:3b-q4"


# ============================================================
# Container image
# ============================================================

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "curl",
        "zstd",
    )
    .run_commands(
        "curl -fsSL https://ollama.com/install.sh | sh"
    )
    .pip_install_from_requirements("requirements.txt")
    # Ensure these are available even if they are missing
    # from requirements.txt.
    .pip_install(
        "requests",
        "huggingface-hub",
    )
    .add_local_dir(
        ".",
        remote_path="/root/backend",
    )
)


# ============================================================
# Helpers
# ============================================================

def get_ollama_env():
    """Environment used by the Ollama server/client processes."""
    return {
        **os.environ,
        "OLLAMA_MODELS": OLLAMA_MODELS_DIR,
        "OLLAMA_HOST": "127.0.0.1:11434",
        # Keep a recently used model in memory for a short period.
        # You can tune this later.
        "OLLAMA_KEEP_ALIVE": "5m",
    }


def wait_for_ollama(timeout_seconds: int = 60):
    """Wait until the local Ollama HTTP server responds."""
    import requests

    for _ in range(timeout_seconds):
        try:
            response = requests.get(
                "http://127.0.0.1:11434/api/tags",
                timeout=1,
            )
            if response.status_code == 200:
                print("[OLLAMA] Ready")
                return
        except requests.RequestException:
            pass

        time.sleep(1)

    raise RuntimeError(
        f"Ollama failed to start within {timeout_seconds} seconds"
    )


def assert_model_files_exist():
    """Fail early if the GGUF files are not present in the Volume."""
    missing = [
        path
        for path in (CRISPERS_GGUF, QWEN_GGUF)
        if not os.path.exists(path)
    ]

    if missing:
        raise FileNotFoundError(
            "Missing GGUF file(s): "
            + ", ".join(missing)
            + ". Run download_models first."
        )


# ============================================================
# STEP 1 — Download GGUF files once
#
# Run:
#   modal run modal_app.py::download_models
#
# You already completed this step, but keeping the function here
# makes the file self-contained.
# ============================================================

@app.function(
    image=image,
    volumes={
        MODEL_MOUNT: model_volume,
    },
    secrets=[
        modal.Secret.from_name("huggingface-secret")
    ],
    timeout=3600,
)
def download_models():
    from huggingface_hub import hf_hub_download

    os.makedirs("/models/crispers", exist_ok=True)
    os.makedirs("/models/qwen", exist_ok=True)

    print("[1/2] Downloading Crispers 14B Q4_K_M...")

    crisprs_path = hf_hub_download(
        repo_id="mradermacher/Crispers-7B-v1-GGUF",
        filename="Crispers-7B-v1.Q4_K_M.gguf",
        local_dir="/models/crispers",
    )

    print("[CRISPERS] Downloaded:")
    print(crisprs_path)

    print("[2/2] Downloading Qwen2.5 3B Instruct Q4_K_M...")

    qwen_path = hf_hub_download(
        repo_id="Qwen/Qwen2.5-3B-Instruct-GGUF",
        filename="qwen2.5-3b-instruct-q4_k_m.gguf",
        local_dir="/models/qwen",
    )

    print("[QWEN] Downloaded:")
    print(qwen_path)

    model_volume.commit()

    print("")
    print("============================")
    print("DOWNLOAD COMPLETE")
    print("============================")
    print("Crispers:", crisprs_path)
    print("Qwen:", qwen_path)


# ============================================================
# STEP 2 — Register GGUF files with Ollama once
#
# Run:
#   modal run modal_app.py::register_models
#
# This does not need a GPU.
# ============================================================

@app.function(
    image=image,
    volumes={
        MODEL_MOUNT: model_volume,
    },
    timeout=3600,
)
def register_models():
    assert_model_files_exist()

    os.makedirs(OLLAMA_MODELS_DIR, exist_ok=True)

    env = get_ollama_env()

    print("[OLLAMA] Starting temporary registration server...")

    server = subprocess.Popen(
        ["ollama", "serve"],
        env=env,
    )

    try:
        wait_for_ollama()

        # ----------------------------------------------------
        # Register Crispers
        # ----------------------------------------------------

        crisprs_modelfile = "/tmp/Modelfile.crispers"

        with open(
            crisprs_modelfile,
            "w",
            encoding="utf-8",
        ) as file:
            file.write(f"FROM {CRISPERS_GGUF}\n")

        print(f"[OLLAMA] Creating {CRISPERS_MODEL_NAME}...")

        subprocess.run(
            [
                "ollama",
                "create",
                CRISPERS_MODEL_NAME,
                "-f",
                crisprs_modelfile,
            ],
            env=env,
            check=True,
        )

        # ----------------------------------------------------
        # Register Qwen
        # ----------------------------------------------------

        qwen_modelfile = "/tmp/Modelfile.qwen"

        with open(
            qwen_modelfile,
            "w",
            encoding="utf-8",
        ) as file:
            file.write(f"FROM {QWEN_GGUF}\n")

        print(f"[OLLAMA] Creating {QWEN_MODEL_NAME}...")

        subprocess.run(
            [
                "ollama",
                "create",
                QWEN_MODEL_NAME,
                "-f",
                qwen_modelfile,
            ],
            env=env,
            check=True,
        )

        print("[OLLAMA] Registered models:")

        subprocess.run(
            ["ollama", "list"],
            env=env,
            check=True,
        )

        model_volume.commit()

        print("[DONE] Models registered")

    finally:
        server.terminate()

        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()


# ============================================================
# STEP 3 — FastAPI + Ollama + T4
#
# Development:
#   modal serve modal_app.py
#
# Production:
#   modal deploy modal_app.py
#
# Ollama is started once per Modal container in @modal.enter(),
# instead of being restarted for every HTTP request.
# ============================================================

@app.cls(
    image=image,
    gpu="T4",
    volumes={
        MODEL_MOUNT: model_volume,
    },
    min_containers=1,
    max_containers=1,
    scaledown_window=300,
    timeout=1800,
)
class Backend:

    @modal.enter()
    def startup(self):
        assert_model_files_exist()

        env = get_ollama_env()

        # These variables are read by the existing FastAPI backend.
        os.environ["OLLAMA_BASE_URL"] = "http://127.0.0.1:11434"
        os.environ["OLLAMA_MODELS"] = OLLAMA_MODELS_DIR
        os.environ["CHAT_MODEL"] = CRISPERS_MODEL_NAME
        os.environ["SUMMARY_MODEL"] = QWEN_MODEL_NAME

        print("[OLLAMA] Starting inference server...")

        # Keep a reference on self for the full container lifetime.
        self.ollama_process = subprocess.Popen(
            ["ollama", "serve"],
            env=env,
        )

        wait_for_ollama(timeout_seconds=120)

        if self.ollama_process.poll() is not None:
            raise RuntimeError(
                "Ollama exited during container startup "
                f"with code {self.ollama_process.returncode}"
            )

        print("[OLLAMA] Process is alive")
        print("[OLLAMA] Available models:")

        subprocess.run(
            ["ollama", "list"],
            env=env,
            check=True,
        )

        r = requests.get(
            "http://127.0.0.1:11434/api/tags",
            timeout=5,
        )

        print("[OLLAMA TEST]", r.status_code)
        print("[OLLAMA TEST]", r.text)


    @modal.exit()
    def shutdown(self):
        process = getattr(self, "ollama_process", None)

        if process is None:
            return

        if process.poll() is None:
            print("[OLLAMA] Stopping server...")
            process.terminate()

            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()

    @modal.asgi_app()
    def fastapi_app(self):
        import sys

        sys.path.insert(0, "/root/backend")

        # Import only after startup() has configured the environment.
        from main import app as web_app

        return web_app
