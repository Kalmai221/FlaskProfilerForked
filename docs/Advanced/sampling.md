## Sampling Control

You can control the number of samples taken with a custom `sampling_function`. Here are two examples:

**Random Sampling (1 in 100 requests):**
```python title="my_web_app.py"
import random
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if random.randint(1, 100) == 42 else False
}
```

**Sample Specific Users:**
```python title="my_web_app.py"
app.config["flask_profiler"] = {
    "sampling_function": lambda: True if user == 'admin' else False
}
```