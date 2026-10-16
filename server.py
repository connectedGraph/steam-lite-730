#!/usr/bin/env python3
"""730 道健康餐数据浏览器 —— 纯标准库静态 + API 服务。

用法:
    python3 server.py [--host 127.0.0.1] [--port 8730]
"""
import argparse
import http.server
import json
import os
import socketserver

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data", "healthy_meals_730_export.json")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASE, **kw)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/data":
            try:
                with open(DATA, "rb") as f:
                    body = f.read()
            except OSError as e:
                self.send_error(500, str(e))
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        pass


class ReuseTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8730)
    args = ap.parse_args()
    with ReuseTCPServer((args.host, args.port), Handler) as httpd:
        print(f"730 健康餐浏览器: http://{args.host}:{args.port}/", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
