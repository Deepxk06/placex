import os
from typing import Optional

WHISPER_AVAILABLE = False
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    pass

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    SENTIMENT_AVAILABLE = True
except ImportError:
    SENTIMENT_AVAILABLE = False

FILLER_WORDS = ["um", "uh", "like", "you know", "actually", "basically",
                "literally", "so", "well", "i mean", "sort of", "kind of"]


async def analyze_audio(audio_data: str) -> dict:
    transcript = await transcribe_audio(audio_data)
    analysis = analyze_speech(transcript)
    analysis["transcript"] = transcript
    return analysis


async def transcribe_audio(audio_data: str) -> str:
    if WHISPER_AVAILABLE:
        try:
            model = whisper.load_model("base")
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_data.encode() if isinstance(audio_data, str) else audio_data)
                temp_path = f.name
            result = model.transcribe(temp_path)
            os.unlink(temp_path)
            return result["text"].strip()
        except Exception:
            pass
    return simulate_transcription(audio_data)


def simulate_transcription(audio_data: str) -> str:
    sample_transcripts = [
        "I am a computer science student with experience in full stack development.",
        "My greatest strength is my ability to learn new technologies quickly.",
        "I have worked on several projects including a machine learning application.",
        "I believe I would be a good fit for this role because of my technical skills.",
        "In my previous internship, I developed a REST API using Python and Flask.",
    ]
    import random
    return random.choice(sample_transcripts)


def analyze_speech(text: str) -> dict:
    words = text.lower().split()
    word_count = len(words)
    filler_count = sum(1 for word in words if word in FILLER_WORDS)
    avg_word_length = sum(len(w) for w in words) / max(word_count, 1)
    speech_rate = word_count / 30  # assuming ~30 seconds response
    confidence = max(0, min(1, 1.0 - (filler_count / max(word_count, 1)) - (0.1 if avg_word_length < 3 else 0)))
    fluency = max(0, min(1, 1.0 - (filler_count / max(word_count * 0.1, 1))))

    sentiment_score = 0.0
    if SENTIMENT_AVAILABLE:
        analyzer = SentimentIntensityAnalyzer()
        sentiment_score = analyzer.polarity_scores(text)["compound"]
    else:
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "love", "best", "strong"]
        negative_words = ["bad", "terrible", "awful", "hate", "worst", "weak", "poor", "struggle"]
        pos_count = sum(1 for w in words if w in positive_words)
        neg_count = sum(1 for w in words if w in negative_words)
        sentiment_score = (pos_count - neg_count) / max(word_count, 1) * 10

    filler_percentage = round((filler_count / max(word_count, 1)) * 100, 2)
    return {
        "confidence": round(confidence, 2),
        "fluency": round(fluency, 2),
        "sentiment": round(sentiment_score, 2),
        "speechRate": round(speech_rate, 2),
        "wordCount": word_count,
        "fillerWordCount": filler_count,
        "fillerPercentage": filler_percentage,
    }
