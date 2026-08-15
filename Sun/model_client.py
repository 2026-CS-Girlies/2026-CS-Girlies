import requests

import config

class ModelClient:
    def __init__(self, timeout=120):
        self.base_url = config.OLLAMA_BASE_URL
        self.timeout = timeout

    def chat(self, system_prompt, history):
        return self._request(
            model=config.CHAT_MODEL,
            system_prompt=system_prompt,
            history=history
        )

    def summarize(self, system_prompt, history):
        return self._request(
            model=config.SUMMARY_MODEL,
            system_prompt=system_prompt,
            history=history
        )

    def _request(self, model, system_prompt, history):
        response = requests.post(
            f"{self.base_url}/api/chat",
            json={
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    *history
                ],
                "stream": False
            },
            timeout=self.timeout
        )

        print("\n[STATUS]", response.status_code)
        print("[RESPONSE]", response.text)

        response.raise_for_status()

        data = response.json()
        return data["message"]["content"].strip()