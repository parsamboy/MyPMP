#!/usr/bin/env python3
"""Small no-dependency preview server for the standalone UI."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/web/")
            self.end_headers()
            return
        super().do_GET()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4173"))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
