import datetime
import boto3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()


# AWS credential, for fetching the data, sotred in env file
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')


def get_spot_price_data():
    """
    Pulls the latest spot price data from AWS EC2 and stores it in the PostgreSQL database.
    Clears the existing data from the 'spot_price_data' table to prevent duplicates before
    inserting the new data. This function organizes the process by fetching all available
    AWS regions and iterating over them to fetch and store their spot price data.

    Exceptions:
        General exceptions are caught and logged, which could occur during database operations
        or AWS API calls.
    """
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
    # Create a cursor object 
    cur = conn.cursor()
    try:
        cur.execute(
        "DELETE FROM spot_price_data"
    )
        print("Cleared old data") 
        regions = get_all_regions()       
        for region in regions:
            get_one_region_records(region,cur, conn)
            print(f'finished iterating over region: {region}')
    except Exception as e:
        print(f"An error occurred: {e}")

    # Close the cursor and connection
    cur.close()
    conn.close()


def insert_data(record, cur, conn):
    """
    Inserts a single record of spot price data into the PostgreSQL database.

    Args:
        record (dict): Contains the 'region', 'instance_type', and 'spot_price'.
        cur (cursor): Database cursor for PostgreSQL.
        conn (connection): Database connection object for PostgreSQL.

    This function executes an SQL command to insert the provided data into the
    'spot_price_data' table.
    """
    region = record["region"]
    instance_type = record["instance_type"]
    price = record['spot_price']
    cur.execute(
        "INSERT INTO spot_price_data (region, instance_type, spot_price) VALUES (%s, %s, %s)",
        (region, instance_type, price)
    )
    conn.commit()



def get_all_regions():
    """
    Retrieves a list of all regions available for the AWS account associated with the provided credentials.

    Returns:
        list: A list of region names.

    Utilizes the AWS EC2 client to describe regions, returning the names of all available regions.
    This is used to determine where spot price data should be fetched from.
    """
    ec2 = boto3.client(
        'ec2',
        region_name='us-east-1',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key
    )
    response = ec2.describe_regions()
    return [region['RegionName'] for region in response['Regions']]


def get_one_region_records(region, cur, conn):
    """
    Fetches and stores spot prices for a specific region.

    Args:
        region (str): The name of the region to fetch data for.
        cur (cursor): Database cursor for PostgreSQL.
        conn (connection): Database connection object for PostgreSQL.

    Fetches the spot price history for EC2 instances from AWS starting from the current UTC time.
    Data for each spot price point is then inserted into the database using `insert_data`.
    """
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

        insert_data(record, cur, conn)

        


