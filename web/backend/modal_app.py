import modal

app = modal.App("still-true-backend")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install_from_requirements("requirements.txt")
    .add_local_dir(".", remote_path="/root/backend")
)


@app.function(
    image=image,
    gpu="T4",
    min_containers=0,
    max_containers=1,
    scaledown_window=30,
)
@modal.asgi_app()
def fastapi_app():
    import sys

    sys.path.insert(0, "/root/backend")

    from main import app as fastapi_app_instance

    return fastapi_app_instance