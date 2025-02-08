import datetime
import boto3
import psycopg2
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection parameters
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)

# Create a cursor object
cur = conn.cursor()


aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# Function to insert data into the database
def insert_data(record):
    region = record["region"]
    instance_type = record["instance_type"]
    price = record['spot_price']
    timestamp = record['timestamp']
    cur.execute(
        "INSERT INTO spot_price_data (region, instance_type, spot_price, timestamp) VALUES (%s, %s, %s, %s)",
        (region, instance_type, price, timestamp)
    )
    conn.commit()



def get_spot_price_data():
    try:
        # making sure at each call we will restart the DB to avoid duplicates
        cur.execute(
        "DELETE FROM spot_price_data"
    )
        print("Cleared old data")
        regions = get_all_regions()
        for region in regions:
            get_one_region_records(region)
            print(f'finished iterating over region: {region}')
    except Exception as e:
        print(f"An error occurred: {e}")

    # Close the cursor and connection
    cur.close()
    conn.close()


def get_all_regions():
    ec2 = boto3.client(
        'ec2',
        region_name='us-east-1',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key
    )
    response = ec2.describe_regions()
    return [region['RegionName'] for region in response['Regions']]


def get_one_region_records(region):
    ec2 = boto3.client(
            'ec2',
            region_name=region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )
    response = ec2.describe_spot_price_history(
            StartTime=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )
    for item in response['SpotPriceHistory']:
        record = {
            "region" : region,
            "instance_type": item["InstanceType"],
            "spot_price": item["SpotPrice"],
            "timestamp": item["Timestamp"].isoformat() # formatted ,    
        }

        insert_data(record)
        



# Make sure to replace the placeholder credentials with your actual AWS credentials
# if __name__ == "__main__":

#     get_spot_price_data()

    # Assume 'get_spot_price_data' fetches data and calls 'insert_data' for each record


