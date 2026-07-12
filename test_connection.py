from database.db_connection import get_connection
conn = get_connection()
if conn.is_connected():
 print("Connected to MYSQL successfully!")
 
else:
  print("Connection failed")
  conn.close()