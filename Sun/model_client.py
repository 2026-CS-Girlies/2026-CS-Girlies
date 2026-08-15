import json
import requests

import config

class ModelClient:
    def __init__(self, timeout=120):
        self.base_url = config.OLLAMA_BASE_URL
        self.timeout = timeout

    def chat(self, system_prompt, history):
        result = self._request(model=config.CHAT_MODEL, system_prompt=system_prompt, history=history,
                               response_format=config.CHAT_RESPONSE_SCHEMA)

        try:
            data = json.loads(result)
            return data["reply"], data["next_stage"], data["next_phase"]
        except json.JSONDecodeError:
            print("[ERROR] Invalid JSON response:")
            print(result)
            raise
        except KeyError as e:
            print(f"[ERROR] Missing field: {e}")
            print(result)
            raise

    def judge_verdict(self, system_prompt, history):
        result = self._request(model=config.CHAT_MODEL, system_prompt=system_prompt, history=history,
                               response_format=config.VERDICT_RESPONSE_SCHEMA)

        try:
            data = json.loads(result)

            resolved = data["resolution_status"] == "resolved"
            rationale = data["rationale"]

            return resolved, rationale
        except json.JSONDecodeError:
            print("[ERROR] Invalid verdict JSON response:")
            print(result)
            raise
        except KeyError as e:
            print(f"[ERROR] Missing verdict field: {e}")
            print(result)
            raise

    def summarize(self, system_prompt, history):
        return self._request(
            model=config.SUMMARY_MODEL,
            system_prompt=system_prompt,
            history=history
        )

    def _request(self, model, system_prompt, history, response_format=None):
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                *history
            ],
            "stream": False
        }

        if  response_format is not None:
            payload["format"] = response_format

        response = requests.post(
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=self.timeout
        )

        print("[RESPONSE]", response.text)

        response.raise_for_status()

        data = response.json()
        return data["message"]["content"].strip()