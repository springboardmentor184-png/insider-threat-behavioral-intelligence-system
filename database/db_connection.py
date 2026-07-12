import mysql.connector
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Ganesh babu123@",
        database="insider_threat_db"
    )