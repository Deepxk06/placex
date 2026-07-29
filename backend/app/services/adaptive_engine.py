from typing import List, Optional


class AdaptiveAptitudeEngine:
    def __init__(self, history: List[dict] = None):
        self.history = history or []

    def next_difficulty(self, last_correct: Optional[bool] = None) -> str:
        if not self.history:
            return "medium"
        recent = self.history[-5:]
        correct_rate = sum(1 for a in recent if a.get("correct", False)) / max(len(recent), 1)
        if correct_rate >= 0.8:
            return "hard"
        elif correct_rate >= 0.5:
            return "medium"
        else:
            return "easy"

    def estimate_mastery(self, topic: str) -> float:
        questions = [q for q in self.history if q.get("topic") == topic]
        if not questions:
            return 0.5
        correct = sum(1 for q in questions if q.get("correct", False))
        return (correct + 1) / (len(questions) + 2)

    def get_topic_recommendations(self) -> List[str]:
        weak = []
        all_topics = ["percentage", "profit-loss", "time-work", "probability",
                      "averages", "ratio-proportion", "blood-relations", "series"]
        for topic in all_topics:
            mastery = self.estimate_mastery(topic)
            if mastery < 0.4:
                weak.append(topic)
        return weak
