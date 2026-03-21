"""Extract text from a PDF file path and print JSON to stdout."""

import json
import sys

import pdfplumber


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing PDF path"}))
        sys.exit(1)

    pdf_path = sys.argv[1]

    try:
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(page_text)

        print(json.dumps({"text": "\n".join(text_parts).strip()}))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
