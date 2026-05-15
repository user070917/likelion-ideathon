import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_column():
    print("Attempting to add mmse_score column to analysis_results...")
    try:
        # Supabase Python client doesn't have a direct 'run_sql' method for anon/service keys easily
        # but we can try to use a RPC if one exists, or just tell the user.
        # However, many Supabase projects have a 'pg_net' or similar but usually it's better to just
        # inform the user or try to insert a dummy row with the column to see if it works (it won't if column missing).
        
        # A more reliable way in this environment is to ask the user to run it in the SQL editor,
        # but I can also try to use the REST API to execute a simple RPC if the user has one.
        # Since I don't know if they have an RPC, I'll just write the instructions and try to update the code.
        
        print("Please run the following SQL in your Supabase SQL Editor:")
        print("ALTER TABLE public.analysis_results ADD COLUMN IF NOT EXISTS mmse_score INTEGER;")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
