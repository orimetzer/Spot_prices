from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from flask import redirect
from extractData import get_spot_price_data
import datetime



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
            "spot_price": row[2]
        } for row in result.fetchall()]

        return jsonify(data)
    
    
@app.route('/api/best_prices', methods=['GET'])
def get_best_prices_by_regions():
    print("fetching best")
    query = """SELECT DISTINCT s.region, s.instance_type, s.spot_price
FROM spot_price_data s
INNER JOIN (
    SELECT region, MIN(spot_price) AS min_price
    FROM spot_price_data
    GROUP BY region
) as min_prices ON s.region = min_prices.region AND s.spot_price = min_prices.min_price;
"""
    sql = text(query)
    with engine.connect() as connection:
        result = connection.execute(sql)
        data = [{
            "region": row[0],
            "instance_type": row[1],
            "spot_price": row[2]
        } for row in result.fetchall()]
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)