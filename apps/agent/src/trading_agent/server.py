"""FastAPI server with WebSocket support for the trading agent."""

import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from trading_agent.graph import app as graph_app

app = FastAPI(title="Golden Fleece Trading Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "golden-fleece", "version": "0.1.0"}


@app.post("/run")
async def run_cycle():
    """Run one trading cycle through the graph."""
    result = await asyncio.to_thread(graph_app.invoke, {})
    return {"result": result}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time agent state updates."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif msg.get("type") == "run":
                result = await asyncio.to_thread(graph_app.invoke, {})
                await websocket.send_json({"type": "cycle_result", "data": result})
    except WebSocketDisconnect:
        pass
