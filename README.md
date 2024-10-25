# Flask-ProfilerForked

**Version: 1.8.2.3**

Flask-ProfilerForked measures the performance of your Flask application endpoints and provides detailed reports through a user-friendly web interface.

### Key Questions Addressed:
- **Where are the bottlenecks in my application?**
- **Which endpoints are the slowest?**
- **What are the most frequently called endpoints?**
- **What causes slow performance?**
- **How long did a specific request take?**

Flask-ProfilerForked allows you to monitor all your endpoints' performance and inspect incoming requests by drilling down through filters.

---

## Screenshots

### Dashboard View
The dashboard provides a summary of the application’s performance:
![Dashboard View](https://github.com/Kalmai221/flask-profiler/blob/master/resources/Dashboard.png?raw=true)

### Filtering Requests
You can apply filters to investigate specific requests:
![Filtering](https://github.com/Kalmai221/flask-profiler/blob/master/resources/Filtering.png?raw=true)

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

```python
# app.py
from flask import Flask
import flask_profiler

app = Flask(__name__)
app.config["DEBUG"] = True

# Flask-Profiler configuration
app.config["flask_profiler"] = {
    "enabled": app.config["DEBUG"],
    "storage": {
        "engine": "sqlite"
    },
    "basicAuth": {
        "enabled": True,
        "username": "admin",
        "password": "admin"
    },
    "ignore": [
        "^/static/.*"
    ],
    "updateCheck": False
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

## Using with Different Databases

Flask-ProfilerForked supports **SQLite**, **MongoDB**, **PostgreSQL**, **MySQL**, and more. Here's how to set up some of the common database engines:

### SQLite Configuration:
```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "sqlite",
    }
}
```

| Key           | Description                        | Default Value             |
|---------------|------------------------------------|---------------------------|
| `storage.FILE`  | SQLite database file name          | `flask_profiler.sql`       |
| `storage.TABLE` | Table name to store profiling data | `measurements`             |

### MongoDB Configuration:
```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "mongodb",
    }
}
```

| Key                 | Description                         | Default Value |
|---------------------|-------------------------------------|---------------|
| `storage.MONGO_URL`   | MongoDB connection string            | `mongodb://localhost` |
| `storage.DATABASE`    | Database name                        | `flask_profiler` |
| `storage.COLLECTION`  | Collection name                      | `measurements` |

---

## Custom Database Engine

You can specify a custom storage engine as follows:

```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "custom.project.flask_profiler.mysql.MysqlStorage",
        "MYSQL": "mysql://user:password@localhost/flask_profiler"
    }
}
```

---

## Sampling Control

You can control the number of samples taken with a custom `sampling_function`. Here are two examples:

**Random Sampling (1 in 100 requests):**
```python
import random
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if random.randint(1, 100) == 42 else False
}
```

**Sample Specific Users:**
```python
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if user == 'admin' else False
}
```

---

## Changing Flask-Profiler Endpoint Root

By default, Flask-Profiler is available at `/profiler`. To change this:

```python
app.config["flask_profiler"] = {
    "endpointRoot": "custom-profiler-root"
}
```

---

## Ignoring Endpoints

To ignore specific endpoints from being tracked, use regex patterns:

```python
app.config["flask_profiler"] = {
    "ignore": [
        "^/static/.*",
        "/api/users/\w+/password"
    ]
}
```

---

## Contributing (Wiki coming soon)

Contributions are welcome! Review the [Contributing Guidelines](https://github.com/Kalmai221/flask-profiler/wiki/Development) for more details on:

- Submitting issues
- Contributing solutions
- Adding new features

## License
MIT
