"""
Entry point.

    python run.py

Then open http://127.0.0.1:5000 in your browser.
"""
from app import create_app
from extensions import db

app = create_app()


@app.shell_context_processor
def shell_context():
    import models
    return {"db": db, "m": models}


if __name__ == "__main__":
    import os
port = int(os.environ.get("PORT", 5000))
app.run(host="0.0.0.0", port=port)


