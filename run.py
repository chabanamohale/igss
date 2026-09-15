from app import create_app
from extensions import db
import os

# Create the Flask app using your factory function
app = create_app()

# Entry point
if __name__ == "__main__":
    # Railway (and other hosts) provide a PORT environment variable
    port = int(os.environ.get("PORT", 5000))
    # Bind to 0.0.0.0 so the app is accessible externally
    app.run(host="0.0.0.0", port=port, debug=True)
