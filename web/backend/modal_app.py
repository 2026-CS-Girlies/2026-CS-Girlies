import modal
import os
import subprocess
import time

app = modal.App("still-true-model-download")

model_volume = modal.Volume.from_name(
    "still-true-models",
    create_if_missing=True,
)

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
    .add_local_dir(
        ".",
        remote_path="/root/backend",
    )
)

OLLAMA_MODELS_DIR = "/models/ollama"
CRISPERS_GGUF = ( "/models/crispers/" "Crispers-14B-v1.Q4_K_M.gguf")
QWEN_GGUF = ( "/models/qwen/" "qwen2.5-3b-instruct-q4_k_m.gguf")


def get_ollama_env():
    return {
        **os.environ,
        "OLLAMA_MODELS": OLLAMA_MODELS_DIR,
        "OLLAMA_HOST": "127.0.0.1:11434",
    }

def wait_for_ollama():
    import requests

    for _ in range(60):
        try:
            r = requests.get(
                "http://127.0.0.1:11434/api/tags",
                timeout=1,
            )

            if r.status_code == 200:
                print("[OLLAMA] Ready")
                return

        except requests.RequestException:
            pass

        time.sleep(1)

    raise RuntimeError("Ollama failed to start")


@app.function(
    image=image,
    volumes={
        "/models": model_volume,
    },
    secrets=[
        modal.Secret.from_name("huggingface-secret")
    ],
    timeout=3600,
)
def register_models():

    os.makedirs(
        OLLAMA_MODELS_DIR,
        exist_ok=True,
    )

    env = get_ollama_env()

    # -------------------------
    # Start Ollama
    # -------------------------

    print("[OLLAMA] Starting server...")

    server = subprocess.Popen(
        ["ollama", "serve"],
        env=env,
    )

    wait_for_ollama()

    # -------------------------
    # Crispers
    # -------------------------

    crisprs_modelfile = "/tmp/Modelfile.crispers"

    with open(
        crisprs_modelfile,
        "w",
        encoding="utf-8",
    ) as f:
        f.write(
            f"FROM {CRISPERS_GGUF}\n"
        )

    print("[OLLAMA] Creating Crispers...")

    subprocess.run(
        [
            "ollama",
            "create",
            "crispers:14b-q4",
            "-f",
            crisprs_modelfile,
        ],
        env=env,
        check=True,
    )

    # -------------------------
    # Qwen
    # -------------------------

    qwen_modelfile = "/tmp/Modelfile.qwen"

    with open(
        qwen_modelfile,
        "w",
        encoding="utf-8",
    ) as f:
        f.write(
            f"FROM {QWEN_GGUF}\n"
        )

    print("[OLLAMA] Creating Qwen...")

    subprocess.run(
        [
            "ollama",
            "create",
            "qwen2.5:3b-q4",
            "-f",
            qwen_modelfile,
        ],
        env=env,
        check=True,
    )

    # -------------------------
    # Verify
    # -------------------------

    print("[OLLAMA] Models:")

    subprocess.run(
        ["ollama", "list"],
        env=env,
        check=True,
    )

    model_volume.commit()

    server.terminate()

    print("[DONE] Models registered")


@app.function(
    image=image,
    volumes={
        "/models": model_volume,
    },
    secrets=[
        modal.Secret.from_name("huggingface-secret")
    ],
    timeout=3600,
)
def download_models():
    from huggingface_hub import hf_hub_download
    import os

    os.makedirs("/models/crispers", exist_ok=True)
    os.makedirs("/models/qwen", exist_ok=True)

    print("[1/2] Downloading Crispers 14B Q4_K_M...")

    crisprs_path = hf_hub_download(
        repo_id="mradermacher/Crispers-14B-v1-GGUF",
        filename="Crispers-14B-v1.Q4_K_M.gguf",
        local_dir="/models/crispers",
    )

    print("[CRISPERS] Downloaded:")
    print(crisprs_path)

    print("[2/2] Downloading Qwen 2.5 3B Q4_K_M...")

    qwen_path = hf_hub_download(
        repo_id="Qwen/Qwen2.5-3B-Instruct-GGUF",
        filename="qwen2.5-3b-instruct-q4_k_m.gguf",
        local_dir="/models/qwen",
    )

    print("[QWEN] Downloaded:")
    print(qwen_path)

    model_volume.commit()

    print("[DONE] Downloads complete")



@app.function(
    image=image,
    gpu="T4",
    volumes={
        "/models": model_volume,
    },
    min_containers=0,
    max_containers=1,
    scaledown_window=300,
    timeout=1800,
)
@modal.asgi_app()
def fastapi_app():

    import sys

    sys.path.insert(
        0,
        "/root/backend",
    )

    env = get_ollama_env()

    print("[OLLAMA] Starting inference server...")

    subprocess.Popen(
        ["ollama", "serve"],
        env=env,
    )

    wait_for_ollama()

    print("[OLLAMA] Available models:")

    subprocess.run(
        ["ollama", "list"],
        env=env,
    )

    from main import app as web_app

    return web_app