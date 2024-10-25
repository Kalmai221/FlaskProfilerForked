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