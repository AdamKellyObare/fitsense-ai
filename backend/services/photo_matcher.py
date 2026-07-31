import zlib

CATEGORY_KEYWORDS = {
    "breakfast": ["egg", "toast", "pancake", "oatmeal", "cereal", "waffle", "breakfast", "yogurt", "bacon"],
    # Split out of a single "protein" bucket that used to cover everything
    # from chicken to salmon to ribs — a real dish could land on any of the
    # 5 photos in that pool regardless of what kind of meat it actually was
    # (e.g. "fish and rice" landing on a ribs photo). Order matters here:
    # more specific meat categories are checked before the generic ones.
    "fish": ["fish", "salmon", "shrimp", "tuna", "seafood", "cod", "tilapia", "crab", "lobster", "scallop", "sushi"],
    "poultry": ["chicken", "turkey", "poultry"],
    "red_meat": ["beef", "steak", "pork", "ribs", "meat", "lamb"],
    "salad": ["salad", "greens", "spinach", "kale", "veggie", "vegetable"],
    "grains": ["rice", "pasta", "noodle", "bread", "pizza", "quinoa", "potato", "naan", "spaghetti"],
    "fruit": ["apple", "banana", "berry", "berries", "orange", "mango", "grape", "melon", "fruit", "kiwi", "pineapple"],
}

PHOTO_COUNTS = {
    "breakfast": 5,
    "fish": 5,
    "poultry": 5,
    "red_meat": 5,
    "salad": 5,
    "grains": 5,
    "fruit": 5,
    "generic": 5,
}

CATEGORY_ORDER = ["breakfast", "fish", "poultry", "red_meat", "salad", "grains", "fruit"]


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
