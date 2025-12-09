# /trace-matcher/app.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "from Python Matcher Service"}

# This will be your main endpoint later:
# @app.post("/match-to-route")
# def match_photo(coords: dict):
#    ... geospatial logic here ...
#    return snapped_coords