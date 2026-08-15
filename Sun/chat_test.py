from CR.cr_helper import CRHelper
import requests

import config

def run_cli():
    helper = CRHelper()

    print("CR Helper")
    print("Type /quit to exit.\n")

    while True:
        user_message = input("You: ").strip()

        if user_message == "/quit":
            break

        if not user_message:
            continue

        result = helper.chat(user_message)

        print(f"\nCR Helper:\n{result}\n")


def run_qwen_normal():

    dialogue = []

    while True:
        line = input()
        if line.strip() == "END":
            break

        dialogue.append(line)

    dialogue_text = "\n".join(dialogue)


    prompt = f"""
    Analyze the following Cognitive Restructuring dialogue.

    Identify the user's intermediate belief and core belief, indicating when the core belief is inferred rather than explicitly stated.
    Identify the balanced thought the user has developed, preferably using the user's own words.
    Summarize the progress that has already been made in restructuring the negative belief.
    Then suggest the next CBT steps for how the assistant should continue the conversation.
    
    The next steps should describe the assistant's therapeutic actions, not homework or tasks for the user.
    
    Clearly present:
    - Intermediate Belief
    - Core Belief
    - Balanced Thought
    - Current Progress
    - Next Steps
    
    Dialogue:
    {dialogue_text}
    """

    response = requests.post(
        f"{config.OLLAMA_BASE_URL}/api/chat",
        json={
            "model": "qwen2.5:3b",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False,
            "options": {
                "temperature": 0.0
            }
        },
        timeout=120
    )

    print("[RESPONSE]", response.text)

    response.raise_for_status()

    data = response.json()
    result = data["message"]["content"].strip()

    print(f"\nQwen normal:\n{result}\n")


if __name__ == "__main__":
    #run_cli()
    run_qwen_normal()