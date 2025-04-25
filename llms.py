# LLM model data and ELO logic

from typing import List, Dict, Optional
import random

# LLM model info
def get_llms():
    return [
        {"name": "GPT-4.1", "provider": "OpenAI", "open": False, "context": "1M tokens", "params": "Very Large", "reasoning": True, "input_cost": 2.50, "output_cost": 10.00},
        {"name": "GPT-4.1 Mini", "provider": "OpenAI", "open": False, "context": "1M tokens", "params": "Large", "reasoning": True, "input_cost": 0.15, "output_cost": 0.60},
        {"name": "Gemini 2.5 Flash", "provider": "Google", "open": False, "context": "1M tokens", "params": "Large", "reasoning": True, "input_cost": 0.35, "output_cost": 1.05},
        {"name": "Gemini 2.5 Pro", "provider": "Google", "open": False, "context": "1M tokens", "params": "Very Large", "reasoning": True, "input_cost": 3.50, "output_cost": 10.50},
        {"name": "o3", "provider": "OpenAI", "open": False, "context": "128K tokens", "params": "Very Large", "reasoning": True, "input_cost": 15.00, "output_cost": 60.00},
        {"name": "o3 Mini", "provider": "OpenAI", "open": False, "context": "128K tokens", "params": "Large", "reasoning": True, "input_cost": 3.00, "output_cost": 12.00},
        {"name": "o4 Mini", "provider": "OpenAI", "open": False, "context": "128K tokens", "params": "Large", "reasoning": True, "input_cost": 3.00, "output_cost": 12.00},
        {"name": "Claude 3.7 Sonnet", "provider": "Anthropic", "open": False, "context": "200K tokens", "params": "Very Large", "reasoning": True, "input_cost": 3.00, "output_cost": 15.00},
        {"name": "Llama 4 Scout", "provider": "Meta", "open": True, "context": "10M tokens", "params": "Medium", "reasoning": True, "input_cost": None, "output_cost": None},
        {"name": "Llama 4 Maverick", "provider": "Meta", "open": True, "context": "10M tokens", "params": "Very Large", "reasoning": True, "input_cost": None, "output_cost": None},
        {"name": "DeepSeek R1", "provider": "DeepSeek", "open": True, "context": "4K tokens", "params": "Medium", "reasoning": True, "input_cost": 0.14, "output_cost": 2.19},
    ]

# ELO system
class EloRanker:
    def __init__(self, llms: List[Dict]):
        self.scores = {m['name']: 1500 for m in llms}
        self.history = []  # List of (winner, loser, before_scores, after_scores)
        self.changes = {m['name']: 0 for m in llms}

    def expected(self, a, b):
        return 1 / (1 + 10 ** ((self.scores[b] - self.scores[a]) / 400))

    def vote(self, winner, loser):
        K = 32
        ea = self.expected(winner, loser)
        eb = self.expected(loser, winner)
        before = dict(self.scores)
        self.scores[winner] += K * (1 - ea)
        self.scores[loser] += K * (0 - eb)
        after = dict(self.scores)
        self.changes[winner] = int(round(after[winner] - before[winner]))
        self.changes[loser] = int(round(after[loser] - before[loser]))
        self.history.append({
            'winner': winner,
            'loser': loser,
            'before': before,
            'after': after,
            'time': None  # Set by API
        })

    def rankings(self):
        return sorted(self.scores.items(), key=lambda x: -x[1])

    def get_changes(self):
        return self.changes

    def get_history(self, n=5):
        return self.history[-n:]

    def random_pair(self):
        names = list(self.scores.keys())
        a, b = random.sample(names, 2)
        return a, b
