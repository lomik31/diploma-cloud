BINARY_STEP = 1024

def binary_size(bytes_: float, suffix: str = "B") -> str:
    """
    Превращает 17825792 → '17.0 MiB'
    Используются степени 1024 (Ki/Mi/Gi…).
    """
    if bytes_ is None or bytes_ < 0:
        return "0 B"
    for unit in ("", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"):
        if abs(bytes_) < BINARY_STEP:
            return f"{bytes_:.1f} {unit}{suffix}"
        bytes_ /= BINARY_STEP
    return f"{bytes_:.1f} Yi{suffix}"
