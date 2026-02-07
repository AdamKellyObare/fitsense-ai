import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def estimate_calories(food_description: str) -> str:
    """
    Sends food description to OpenAI and returns calorie estimate.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # modern, fast, low-cost
            messages=[
                {"role": "system", "content": "You are a helpful assistant that estimates calories for food."},
                {"role": "user", "content": f"Estimate the calories for the following food: {food_description}. Provide a concise answer in kcal."}
            ],
            max_tokens=50
        )
        return response.choices[0].message["content"].strip()
    except Exception as e:
        return f"Error: {e}"
