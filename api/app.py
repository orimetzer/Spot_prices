from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import os
from extractData import get_spot_price_data


app = Flask(__name__)
# Enable Cross-Origin Resource Sharing for all routes within the /api/ path
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


# Creating database connection using environment variables
engine = create_engine(f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}")


@app.route('/api/refresh_data', methods=['POST','GET'])
def refresh_data():
    """
    Endpoint to trigger the refresh button of spot price data from AWS.

    Returns:
        json: Status of the operation, successful or failed, along with any error messages.
    """
    try:
        get_spot_price_data() # Calls the function that fetches and updates spot price data
        return jsonify({"status": "Data extraction successful", "success": True})
    except Exception as e:
        return jsonify({"status": "Data extraction failed", "success": False, "error": str(e)})



@app.route('/api/spot_prices', methods=['GET'])
def get_spot_prices():
    """
     Retrieves all spot price data from the database and returns it in a JSON format.

    Returns:
        json: A list of dictionaries where each dictionary represents spot price data for a region.
    """
    print("fetching spot prices")
    sql = text("SELECT * FROM spot_price_data")
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
    """
    Fetches the best (lowest) spot prices for each region - for "Steals" sction. It performs an SQL query to find
    the minimum spot price per region and returns this information.

    Returns:
        json: A list of dictionaries where each dictionary contains the region, instance type,
        and its lowest spot price from the database.
    """

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