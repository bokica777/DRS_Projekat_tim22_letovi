from multiprocessing import Process

def run_in_process(fn, *args, **kwargs) -> None:
    p = Process(target=_safe_run, args=(fn, args, kwargs), daemon=True)
    p.start()

def _safe_run(fn, args, kwargs):
    try:
        fn(*args, **kwargs)
    except Exception as e:
        print("[MAIL] failed:", e)
