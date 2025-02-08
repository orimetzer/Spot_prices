from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from flask import redirect
from extractData import get_spot_price_data


app = Flask(__name__)
# CORS(app)  # This will enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


# Database connection
engine = create_engine(f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")

@app.route('/api/refresh_data', methods=['POST'])
def refresh_data():
    try:
        get_spot_price_data()
        return jsonify({"status": "Data extraction successful", "success": True})
    except Exception as e:
        return jsonify({"status": "Data extraction failed", "success": False, "error": str(e)})



@app.route('/')
def home():
    return redirect('/api/spot_prices')

@app.route('/api/spot_prices', methods=['GET'])
def get_spot_prices():
    print("fetching spot prices")
    sql = text("SELECT * FROM spot_price_data")
    print(sql)
    with engine.connect() as connection:
        result = connection.execute(sql)
        data = [{
            "region": row[0],
            "instance_type": row[1],
            "spot_price": row[2],
            "timestamp": row[3].isoformat() if row[3] else None  # formatting datetime with timezone info
        } for row in result.fetchall()]
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)