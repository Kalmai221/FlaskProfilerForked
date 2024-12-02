## Multiple User's on the Profiler

You can set the usernames of each user and their permissions in the config.

```python title="my_web_app.py"
app.config["flask_profiler"] = {
    "basicAuth":{
        "enabled": True,
        "users": {
            "1": {
                "username": "admin",
                "password": "password",
                "role": "admin" # Admin Account
            },
            "2": {
                "username": "user",
                "password": "password",
                "role": "user" # User Account
            }
        }
    },
}
```

If you set the role as anything that isnt **admin** or **user**, then the profiler will not work.

## Set Permissions for each feature

You can set the permissions of each feature, controling what role can view which function.

```python title="my_web_app.py"
app.config["flask_profiler"] = {
    "features": {
        "filtering":{
            "enabled": True,
            "role": "user" # Filtering can be accessed by everyone
        },
        "emulation": {
            "enabled": True,
            "role": "admin" # Emulation can only be accessed by admins
        }
    },
}
```