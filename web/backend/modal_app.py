import modal

app = modal.App("still-true-model-download")

model_volume = modal.Volume.from_name(
    "still-true-models",
    create_if_missing=True,
)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("huggingface-hub")
)


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

    # -----------------------------
    # Crispers 14B Q4_K_M
    # -----------------------------

    print("[1/2] Downloading Crispers 14B Q4_K_M...")

    crisprs_path = hf_hub_download(
        repo_id="mradermacher/Crispers-14B-v1-GGUF",
        filename="Crispers-14B-v1.Q4_K_M.gguf",
        local_dir="/models/crispers",
    )

    print("[CRISPERS] Downloaded:")
    print(crisprs_path)

    # -----------------------------
    # Qwen 2.5 3B Instruct Q4_K_M
    # -----------------------------

    print("[2/2] Downloading Qwen 2.5 3B Q4_K_M...")

    qwen_path = hf_hub_download(
        repo_id="Qwen/Qwen2.5-3B-Instruct-GGUF",
        filename="qwen2.5-3b-instruct-q4_k_m.gguf",
        local_dir="/models/qwen",
    )

    print("[QWEN] Downloaded:")
    print(qwen_path)

    # Persist everything
    model_volume.commit()

    print("")
    print("============================")
    print("DOWNLOAD COMPLETE")
    print("============================")
    print("Crispers:")
    print(crisprs_path)
    print("")
    print("Qwen:")
    print(qwen_path)