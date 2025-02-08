import datetime
import boto3
import psycopg2
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection (using pgAdmin) parameters stored in env file
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)

# Create a cursor object
cur = conn.cursor()

# AWS credential parameters, for fetching the data, sotred in env file
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')



# Top function for pulling the data
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

# Function to insert data of a specific record into the database
def insert_data(record):
    region = record["region"]
    instance_type = record["instance_type"]
    price = record['spot_price']
    cur.execute(
        "INSERT INTO spot_price_data (region, instance_type, spot_price) VALUES (%s, %s, %s)",
        (region, instance_type, price)
    )
    conn.commit()



# Function to pull all the region's names from API, which are accessible for the account
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
    currDate = datetime.datetime.now(datetime.timezone.utc).isoformat()
    response = ec2.describe_spot_price_history(
            StartTime=currDate,
            )
    for item in response['SpotPriceHistory']:
        record = {
            "region" : region,
            "instance_type": item["InstanceType"],
            "spot_price": item["SpotPrice"],  
        }

        insert_data(record)

        


