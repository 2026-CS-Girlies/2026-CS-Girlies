from CR.cr_helper import CRHelper

import config

print("MODEL:", config.CHAT_MODEL)
print("URL:", config.OLLAMA_BASE_URL)

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


if __name__ == "__main__":
    run_cli()