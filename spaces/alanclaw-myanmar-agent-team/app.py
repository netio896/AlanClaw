from __future__ import annotations

from dataclasses import dataclass
from html import escape
from pathlib import Path

import gradio as gr


ASSET_DIR = Path(__file__).parent / "assets"
LOGO_PATH = ASSET_DIR / "alanclaw-agent-team-icon-512.png"


@dataclass(frozen=True)
class TeamConfig:
    label: str
    mission: str
    channels: tuple[str, ...]
    roles: tuple[str, ...]
    menu: tuple[str, ...]
    default_rules: tuple[str, ...]


TEAMS: dict[str, TeamConfig] = {
    "Overseas Business Team": TeamConfig(
        label="AlanClaw Overseas Business Team",
        mission="Myanmar and overseas business support for sales, documents, project follow-up, multilingual communication, and market intelligence.",
        channels=("Telegram", "WeChat", "Facebook", "Email", "Web"),
        roles=(
            "Myanmar sales assistant",
            "Telegram / WeChat message drafter",
            "Quotation and invoice assistant",
            "Project follow-up assistant",
            "Chinese / English / Burmese translator",
            "Myanmar market intelligence analyst",
        ),
        menu=(
            "Customer inquiry reply",
            "Telegram / WeChat message draft",
            "Quotation or invoice draft",
            "Project follow-up summary",
            "Chinese / English / Burmese translation",
            "Market intelligence summary",
        ),
        default_rules=(
            "Do not invent business data, prices, dates, stock, or commitments.",
            "Keep customer-facing messages concise and ready for human review.",
            "Mark missing facts as needs human confirmation.",
        ),
    ),
    "Construction Industry Team": TeamConfig(
        label="AlanClaw Construction Industry Team",
        mission="Myanmar construction workflow support for BOQ, materials, quotations, meeting minutes, coordination, and project tracking.",
        channels=("Telegram", "WeChat", "Email", "Excel", "PDF", "Web"),
        roles=(
            "Project follow-up assistant",
            "BOQ and material list organizer",
            "Quotation and invoice assistant",
            "Meeting minutes assistant",
            "Site coordination message drafter",
            "Myanmar construction market intelligence analyst",
        ),
        menu=(
            "Project progress follow-up",
            "BOQ / material list cleanup",
            "Quotation / invoice draft",
            "Meeting minutes",
            "Telegram / WeChat site coordination message",
            "Risk and next-step checklist",
        ),
        default_rules=(
            "Mark quantities, dates, prices, contract terms, and safety details as needs human confirmation.",
            "Do not claim engineering, legal, financial, or safety certification authority.",
            "Do not send instructions to site teams automatically.",
        ),
    ),
    "Ecommerce Growth Team": TeamConfig(
        label="AlanClaw Ecommerce Growth Team",
        mission="Ecommerce growth support for product listings, campaigns, customer replies, order follow-up, reviews, and sales summaries.",
        channels=("Telegram", "WeChat", "Facebook", "TikTok", "Email", "Web"),
        roles=(
            "Product listing optimizer",
            "Customer inquiry reply assistant",
            "Campaign copywriter",
            "Order follow-up assistant",
            "Review and reputation assistant",
            "Sales data summary assistant",
        ),
        menu=(
            "Product listing optimization",
            "Customer inquiry reply",
            "Telegram / WeChat sales message",
            "Facebook / TikTok campaign copy",
            "Order follow-up message",
            "7-day campaign plan",
        ),
        default_rules=(
            "Do not promise discounts, stock, delivery dates, refunds, or warranties without provided facts.",
            "Ask for missing product, price, inventory, and policy details.",
            "Do not change storefront data automatically.",
        ),
    ),
    "Myanmar Social Media Marketing Team": TeamConfig(
        label="AlanClaw Myanmar Social Media Marketing Team",
        mission="Myanmar-focused social media marketing for Facebook, TikTok, Telegram, WeChat, multilingual content, and local campaign planning.",
        channels=("Facebook", "TikTok", "Telegram", "WeChat", "Messenger", "Web"),
        roles=(
            "Myanmar content topic planner",
            "Social copywriting expert",
            "Facebook / TikTok campaign planner",
            "Comment and inbox reply drafter",
            "KOL / community outreach assistant",
            "Burmese / Chinese / English localization expert",
        ),
        menu=(
            "Facebook post set",
            "TikTok short video scripts",
            "Telegram / WeChat private traffic copy",
            "Comment / inbox reply templates",
            "Local campaign idea",
            "7-day social media calendar",
        ),
        default_rules=(
            "Avoid unverified claims, fake urgency, and misleading promotions.",
            "Prefer Myanmar-local examples, channels, cities, and customer behavior.",
            "Do not publish or send anything automatically.",
        ),
    ),
    "Sallow / Swallow Hotel Promotion Team": TeamConfig(
        label="AlanClaw Sallow / Swallow Hotel Promotion Team",
        mission="Hotel promotion and lead generation for a Mandalay hotel, focused on OTA visibility, social media, travel-agent outreach, and private inquiry conversion.",
        channels=("Agoda", "Booking / OTA", "Google Business", "Facebook", "TikTok", "Telegram", "WeChat", "Messenger"),
        roles=(
            "OTA exposure optimizer",
            "Facebook hotel promotion expert",
            "TikTok short video script expert",
            "Mandalay travel content strategist",
            "Travel agent partnership developer",
            "Private inquiry conversion expert",
            "Burmese / Chinese / English localization expert",
        ),
        menu=(
            "OTA listing optimization",
            "Facebook hotel promotion plan",
            "TikTok short video scripts",
            "Telegram / WeChat inquiry conversion scripts",
            "Travel agent / guide / driver outreach",
            "Mandalay travel content ideas",
            "7-day hotel promotion calendar",
        ),
        default_rules=(
            "Do not generate room prices, discounts, rate comparisons, or promotional prices.",
            "Do not promise availability, upgrades, refunds, or booking changes.",
            "Mark official name, address, facilities, room types, and policies as needs human confirmation unless provided.",
        ),
    ),
}


LANGUAGE_NOTES = {
    "Chinese": "Write primarily in Chinese. Add English/Burmese variants only when requested.",
    "English": "Write primarily in English. Keep the language clear for international business users.",
    "Burmese": "Write in Burmese-friendly style. If Burmese text is uncertain, provide an English back-translation and mark it for native review.",
    "Trilingual": "Provide Chinese, English, and Burmese/localization notes where useful.",
}


def _bullets(items: tuple[str, ...] | list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def _numbered(items: tuple[str, ...] | list[str]) -> str:
    return "\n".join(f"{idx}. {item}" for idx, item in enumerate(items, start=1))


def build_demo_response(
    team_name: str,
    task: str,
    language: str,
    no_prices: bool,
    no_commitments: bool,
    mark_uncertain: bool,
    channel: str,
) -> str:
    team = TEAMS[team_name]
    task_text = task.strip() or "Start with a task menu and ask me what to do next."
    rules = list(team.default_rules)
    if no_prices:
        rules.append("Do not create or estimate prices.")
    if no_commitments:
        rules.append("Do not promise availability, discounts, delivery dates, refunds, or contract terms.")
    if mark_uncertain:
        rules.append('Mark uncertain details as "needs human confirmation".')

    return f"""# {team.label}

## What This Team Does

{team.mission}

## Recommended Team Roles

{_bullets(team.roles)}

## Supported Channels

{", ".join(team.channels)}

## Your Selected Channel

{channel}

## Task Menu

{_numbered(team.menu)}

## Draft For Your Task

**User task:** {task_text}

**Recommended next output structure:**

1. Clarify the target audience and channel.
2. Use only verified facts from the user.
3. Produce a ready-to-review draft.
4. Add a short checklist of missing facts.
5. Provide one next action the user can confirm.

## Starter Draft

Here is a safe first draft structure for **{channel}**:

**Headline / opening:**  
Create a concise opening matched to the selected team and audience.

**Main message:**  
Explain the offer, service, update, or promotion using only confirmed facts from the task.

**Action prompt:**  
Invite the customer or teammate to reply, confirm details, or request manual follow-up.

**Needs human confirmation:**  
- Exact business facts not provided in the task
- Any prices, stock, room availability, delivery dates, refund rules, or contract terms
- Names, addresses, phone numbers, facilities, and policies if not supplied

## Language Rule

{LANGUAGE_NOTES[language]}

## Safety Rules Applied

{_bullets(rules)}

## Copyable Next Prompt

```text
Use {team.label}.
Channel: {channel}
Task: {task_text}
Language: {language}
Rules: do not invent facts; mark missing details as needs human confirmation; do not send automatically.
```
"""


def team_summary(team_name: str) -> str:
    team = TEAMS[team_name]
    return f"""### {team.label}

**Mission:** {team.mission}

**Roles**
{_bullets(team.roles)}

**Task Menu**
{_numbered(team.menu)}
"""


CUSTOM_CSS = """
.alanclaw-hero {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
}
.alanclaw-hero img {
  width: 76px;
  height: 76px;
  border-radius: 18px;
}
.alanclaw-hero h1 {
  margin: 0 0 4px;
}
.alanclaw-hero p {
  margin: 0;
  color: #475569;
}
"""


def build_app() -> gr.Blocks:
    with gr.Blocks(css=CUSTOM_CSS, title="AlanClaw Myanmar Agent Team") as app:
        logo_html = ""
        if LOGO_PATH.exists():
            logo_html = f'<img src="/file={escape(str(LOGO_PATH))}" alt="AlanClaw logo">'

        gr.HTML(
            f"""
            <div class="alanclaw-hero">
              {logo_html}
              <div>
                <h1>AlanClaw Myanmar Agent Team</h1>
                <p>Choose an industry agent team, enter a business task, and get a safe structured draft for Myanmar-focused workflows.</p>
              </div>
            </div>
            """
        )

        with gr.Row():
            with gr.Column(scale=1):
                team = gr.Dropdown(
                    choices=list(TEAMS.keys()),
                    value="Sallow / Swallow Hotel Promotion Team",
                    label="Agent Team",
                )
                channel = gr.Dropdown(
                    choices=(
                        "Telegram",
                        "WeChat",
                        "Facebook",
                        "TikTok",
                        "Agoda / OTA",
                        "Email",
                        "Internal workflow",
                    ),
                    value="WeChat",
                    label="Target Channel",
                )
                language = gr.Radio(
                    choices=("Chinese", "English", "Burmese", "Trilingual"),
                    value="Chinese",
                    label="Output Language",
                )
                no_prices = gr.Checkbox(value=True, label="Do not generate prices")
                no_commitments = gr.Checkbox(value=True, label="Do not make business commitments")
                mark_uncertain = gr.Checkbox(value=True, label='Mark missing facts as "needs human confirmation"')

            with gr.Column(scale=2):
                task = gr.Textbox(
                    label="Business Task",
                    lines=8,
                    placeholder=(
                        "Example: Write a WeChat Moments post for a Mandalay hotel. "
                        "Do not include prices. Unknown facilities should be marked for confirmation."
                    ),
                )
                generate = gr.Button("Generate Safe Draft", variant="primary")

        output = gr.Markdown(label="AlanClaw Draft")

        with gr.Accordion("Team Details", open=False):
            team_info = gr.Markdown(team_summary("Sallow / Swallow Hotel Promotion Team"))

        generate.click(
            build_demo_response,
            inputs=[team, task, language, no_prices, no_commitments, mark_uncertain, channel],
            outputs=output,
        )
        team.change(team_summary, inputs=team, outputs=team_info)

        gr.Examples(
            examples=[
                [
                    "Sallow / Swallow Hotel Promotion Team",
                    "Write 3 WeChat Moments posts for a Mandalay hotel. Do not include prices or promise room availability.",
                    "Chinese",
                    True,
                    True,
                    True,
                    "WeChat",
                ],
                [
                    "Myanmar Social Media Marketing Team",
                    "Create a 7-day Facebook and TikTok content calendar for a local Myanmar business.",
                    "Trilingual",
                    True,
                    True,
                    True,
                    "Facebook",
                ],
                [
                    "Construction Industry Team",
                    "Turn these site notes into a Telegram coordination message and next-step checklist.",
                    "Chinese",
                    False,
                    True,
                    True,
                    "Telegram",
                ],
            ],
            inputs=[team, task, language, no_prices, no_commitments, mark_uncertain, channel],
        )

    return app


demo = build_app()


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
