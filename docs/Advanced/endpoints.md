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