import sqlite3

def init_db(db_path='votes.db'):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            winner TEXT NOT NULL,
            loser TEXT NOT NULL,
            time TEXT NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS llms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            provider TEXT NOT NULL,
            open BOOLEAN NOT NULL,
            context TEXT NOT NULL,
            params TEXT NOT NULL,
            reasoning BOOLEAN NOT NULL,
            input_cost REAL,
            output_cost REAL
        )
    ''')
    conn.commit()
    conn.close()


def migrate_llms(db_path='votes.db'):
    """
    Imports LLMs from llms.py into the llms table. Overwrites existing rows with same name.
    """
    from llms import get_llms
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    llms = get_llms()
    for m in llms:
        c.execute('''
            INSERT INTO llms (name, provider, open, context, params, reasoning, input_cost, output_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                provider=excluded.provider,
                open=excluded.open,
                context=excluded.context,
                params=excluded.params,
                reasoning=excluded.reasoning,
                input_cost=excluded.input_cost,
                output_cost=excluded.output_cost
        ''', (
            m['name'],
            m['provider'],
            int(m['open']),
            m['context'],
            m['params'],
            int(m['reasoning']),
            m['input_cost'],
            m['output_cost']
        ))
    conn.commit()
    conn.close()
    print(f"Imported {len(llms)} LLMs into database.")

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'migrate_llms':
        migrate_llms()
    else:
        init_db()
