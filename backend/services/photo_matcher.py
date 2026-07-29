import zlib

CATEGORY_KEYWORDS = {
    "breakfast": ["egg", "toast", "pancake", "oatmeal", "cereal", "waffle", "breakfast", "yogurt", "bacon"],
    "protein": ["chicken", "beef", "steak", "pork", "turkey", "salmon", "fish", "shrimp", "tuna", "meat", "ribs"],
    "salad": ["salad", "greens", "spinach", "kale", "veggie", "vegetable"],
    "grains": ["rice", "pasta", "noodle", "bread", "pizza", "quinoa", "potato", "naan", "spaghetti"],
    "fruit": ["apple", "banana", "berry", "berries", "orange", "mango", "grape", "melon", "fruit", "kiwi", "pineapple"],
}

PHOTO_COUNTS = {
    "breakfast": 5,
    "protein": 5,
    "salad": 5,
    "grains": 5,
    "fruit": 5,
    "generic": 5,
}

CATEGORY_ORDER = ["breakfast", "protein", "salad", "grains", "fruit"]


def _match_category(food: str) -> str:
    lowered = food.lower()
    for category in CATEGORY_ORDER:
        if any(keyword in lowered for keyword in CATEGORY_KEYWORDS[category]):
            return category
    return "generic"


def pick_photo_key(food: str) -> str:
    category = _match_category(food)
    count = PHOTO_COUNTS[category]
    index = (zlib.crc32(food.strip().lower().encode()) % count) + 1
    return f"{category}-{index}"
