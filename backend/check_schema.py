import psycopg2
import os

def check_schema():
    print("Checking submissions table schema...")
    
    # Config
    DB_PASSWORD = "Dodash2008080"
    PROJECT_REF = "pqzsgqbshvipovlmyril"
    DB_HOST = "aws-0-eu-central-1.pooler.supabase.com"
    
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=6543,
            user=f"postgres.{PROJECT_REF}",
            password=DB_PASSWORD,
            dbname="postgres",
            sslmode="require"
        )
        
        cur = conn.cursor()
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'submissions';
        """)
        columns = cur.fetchall()
        print("Columns in 'submissions':")
        for col in columns:
            print(f" - {col[0]} ({col[1]})")
            
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assignment_submissions';
        """)
        columns = cur.fetchall()
        print("\nColumns in 'assignment_submissions':")
        for col in columns:
            print(f" - {col[0]} ({col[1]})")

    except Exception as e:
        print(f"FAILED: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    check_schema()
