# Home Page

**Version: {{version}}**

Flask-ProfilerForked measures the performance of your Flask application endpoints and provides detailed reports through a user-friendly web interface.

---

## Quick Start

### Installation

To install Flask-ProfilerForked, use:

```sh
pip install Flask-ProfilerForked
```

For the latest development version, use:

```sh
pip install git+https://github.com/Kalmai221/flask-profiler@master
```

### Example Setup

Here’s an example Flask application using Flask-ProfilerForked:

```python title="my_web_app.py"
# app.py
from flask import Flask
import flask_profiler

app = Flask(__name__)
app.config["DEBUG"] = True

# Flask-Profiler configuration
app.config["flask_profiler"] = {
    "verbose": True,
    "enabled": app.config["DEBUG"],
    "storage": {
        "engine": "sqlalchmey",
        "db_url": "sqlite:///flask_profiler.sql"  # optional
    },
    "basicAuth":{
        "enabled": True,
        "users": {
            "1": {
                "username": "admin",
                "password": "password",
                "role": "admin"
            },
            "2": {
                "username": "user",
                "password": "password",
                "role": "user"
            }
        }
    },
    "ignore": [
        "/static/*",
        "/secrets/password/"
    ],
    "updateCheck": True,
}

@app.route('/product/<id>', methods=['GET'])
def get_product(id):
    return f"Product ID is {id}"

# Activate flask-profiler
flask_profiler.init_app(app)

# Profile specific endpoint
@app.route('/doSomethingImportant', methods=['GET'])
@flask_profiler.profile()
def do_something_important():
    return "This endpoint is being profiled."

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000)
```

---

## Contributing

Contributions are welcome! Review the [Contributing Guidelines](https://github.com/Kalmai221/flask-profiler/wiki/Development) for more details on:

- Submitting issues
- Contributing solutions
- Adding new features

## License
MIT
