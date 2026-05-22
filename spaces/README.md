# AlanClaw Spaces

This directory contains Hugging Face Space-ready demos for AlanClaw.

## alanclaw-myanmar-agent-team

Path:

```text
spaces/alanclaw-myanmar-agent-team
```

Purpose:

- Public demo for AlanClaw Myanmar Agent Team
- Gradio app
- No API key required
- Deterministic template output for safe public preview

Local run:

```powershell
cd spaces/alanclaw-myanmar-agent-team
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Hugging Face upload:

1. Create a new Space on Hugging Face.
2. Choose SDK: `Gradio`.
3. Upload the files in `spaces/alanclaw-myanmar-agent-team`.
4. The Space will install `requirements.txt` and run `app.py`.

