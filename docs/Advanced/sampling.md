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