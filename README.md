# Flask-ProfilerForked

**Version: 1.8.1.12**

##### Flask-profilerforked measures endpoints defined in your flask application and provides you fine-grained reports through a web interface.

It gives answers to these questions:
* Where are the bottlenecks in my application?
* Which endpoints are the slowest in my application?
* Which are the most frequently called endpoints?
* What causes my slow endpoints? In which context, with what args and kwargs are they slow?
* How much time did a specific request take?

In short, if you are curious about what your endpoints are doing and what requests they are receiving, give a try to flask-profiler.

With flask-profiler's web interface, you can monitor all your endpoints' performance and investigate endpoints and received requests by drilling down through filters.

## Screenshots

Dashboard view displays a summary.

![Dashboard View](https://github.com/Kalmai221/flask-profiler/blob/master/resources/Dashboard.png?raw=true)

You can create filters to investigate certain types of requests.

![Filtering](https://github.com/Kalmai221/flask-profiler/blob/master/resources/Filtering.png?raw=true)

## Quick Start

It is easy to understand flask-profiler by going through an example. Let's dive in.

Install `Flask-ProfilerForked` via pip:

```sh
pip install Flask-ProfilerForked
```

Or the Development version via Pip:
```sh
pip install git+https://github.com/Kalmai221/flask-profiler@master
```

Edit your code where you are creating the Flask app:

```python
# your app.py
from flask import Flask
import flask_profiler

app = Flask(__name__)
app.config["DEBUG"] = True

# Declare necessary configuration to initialize flask-profiler
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
    return "Product ID is " + str(id)

@app.route('/product/<id>', methods=['PUT'])
def update_product(id):
    return "Product {} is being updated".format(id)

@app.route('/products', methods=['GET'])
def list_products():
    return "Suppose I send you the product list..."

@app.route('/static/something/', methods=['GET'])
def static_something():
    return "This endpoint will not be tracked."

# Activate flask-profiler by passing the flask app
flask_profiler.init_app(app)

# Endpoint declarations after flask_profiler.init_app() will be ignored by flask_profiler.
@app.route('/doSomething', methods=['GET'])
def do_something():
    return "Flask-profiler will not measure this."

# Use the profile() decorator to explicitly measure an endpoint
@app.route('/doSomethingImportant', methods=['GET'])
@flask_profiler.profile()
def do_something_important():
    return "Flask-profiler will measure this request."

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000)
```

## Using with different database systems

You can use flask-profiler with **SQLite**, **MongoDB**, **PostgreSQL**, **MySQL**, or **MongoDB** database systems. However, it is easy to support other database systems. If you would like to have others, please go to contribution documentation. (It is really easy.)

### SQLite
In order to use SQLite, just specify it as the value of `storage.engine` directive as follows:

```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "sqlite",
    }
}
```

Below the other options are listed.

| Filter key   |      Description      |  Default |
|--------------|-----------------------|----------|
| storage.FILE | SQLite database file name | flask_profiler.sql |
| storage.TABLE | Table name in which profiling data will reside | measurements |

### MongoDB
In order to use MongoDB, just specify it as the value of `storage.engine` directive as follows:

```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "mongodb",
    }
}
```

### SQLAlchemy
In order to use SQLAlchemy, just specify it as the value of `storage.engine` directive as follows. Also, first create an empty database with the name "flask_profiler".

```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "sqlalchemy",
        "db_url": "postgresql://user:pass@localhost:5432/flask_profiler"  # optional, if no db_url specified then SQLite will be used.
    }
}
```

### Custom database engine
Specify engine as string module and class path:

```python
app.config["flask_profiler"] = {
    "storage": {
        "engine": "custom.project.flask_profiler.mysql.MysqlStorage",
        "MYSQL": "mysql://user:password@localhost/flask_profiler"
    }
}
```

The other options are listed below.

| Filter key   |      Description      |  Default |
|--------------|-----------------------|----------|
| storage.MONGO_URL | MongoDB connection string | mongodb://localhost |
| storage.DATABASE | Database name | flask_profiler |
| storage.COLLECTION | Collection name | measurements |

### Sampling
Control the number of samples taken by flask-profiler.

You may want control over how many times flask-profiler takes samples while running in production mode. You can supply a function and control the sampling according to your business logic.

Example 1: Sample 1 in 100 times with random numbers:

```python
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if random.sample(list(range(1, 101)), 1) == [42] else False
}
```

Example 2: Sample for specific users:

```python
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if user == 'divyendu' else False
}
```

If a sampling function is not present, all requests will be sampled.

### Changing flask-profiler endpoint root
By default, you can access flask-profiler at `<your-app>/flask-profiler`.

```python
app.config["flask_profiler"] = {
        "endpointRoot": "secret-flask-profiler"
}
```

### Ignored endpoints
Flask-profiler will try to track every endpoint defined so far when `init_app()` is invoked. If you want to exclude some of the endpoints, you can define matching regex for them as follows:

```python
app.config["flask_profiler"] = {
        "ignore": [
            "^/static/.*",
            "/api/users/\w+/password"
        ]
}
```

## Contributing

Contributions are welcome!

Review the [Contributing Guidelines](https://github.com/Kalmai221/flask-profiler/wiki/Development) for details on how to:

* Submit issues
* Add solutions to existing challenges
* Add new challenges

## Authors
* [Musafa Atik](https://www.linkedin.com/in/muatik)
* Fatih Sucu
* [Safa Yasin Yildirim](https://www.linkedin.com/in/safayasinyildirim)
* Kalmai221 - Forking thr original version

## License
MIT
```
