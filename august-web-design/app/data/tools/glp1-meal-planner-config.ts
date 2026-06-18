// Pure data config for GLP-1 Meal Planner tool.
// No React.

export type ActivityLevel = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  multiplier: number;
};

export type GLP1Phase = {
  id: string;
  label: string;
  description: string;
  portionMultiplier: number;
};

export type MealSlot =
  | "breakfast"
  | "morning-snack"
  | "lunch"
  | "afternoon-snack"
  | "dinner";

export type Meal = {
  name: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  prepTime: number; // minutes
  ingredients: string[];
  dietTags: string[]; // "standard", "vegetarian", "pescatarian", "dairy-free", "gluten-free"
  mealSlot: MealSlot;
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    id: "sedentary",
    label: "Sedentary",
    shortLabel: "Sedentary",
    description: "Desk job, minimal exercise",
    multiplier: 1.0,
  },
  {
    id: "light",
    label: "Lightly Active",
    shortLabel: "Light",
    description: "Light exercise 1-3 days/week",
    multiplier: 1.2,
  },
  {
    id: "moderate",
    label: "Moderately Active",
    shortLabel: "Moderate",
    description: "Exercise 3-5 days/week",
    multiplier: 1.4,
  },
  {
    id: "active",
    label: "Active",
    shortLabel: "Active",
    description: "Hard exercise 6-7 days/week",
    multiplier: 1.6,
  },
];

export const GLP1_PHASES: GLP1Phase[] = [
  {
    id: "early",
    label: "Early (Weeks 1-4)",
    description: "First 4 weeks. Smaller portions, appetite very suppressed",
    portionMultiplier: 0.75,
  },
  {
    id: "adjusted",
    label: "Adjusted (Weeks 4-12)",
    description: "4-12 weeks. Appetite stabilizing, moderate portions",
    portionMultiplier: 0.9,
  },
  {
    id: "maintenance",
    label: "Maintenance (12+ Weeks)",
    description: "12+ weeks. Comfortable with normal portion sizes",
    portionMultiplier: 1.0,
  },
];

export const DIET_OPTIONS: string[] = [
  "Standard",
  "Vegetarian",
  "Pescatarian",
  "Dairy-Free",
  "Gluten-Free",
];

export const MEALS_PER_DAY_OPTIONS: number[] = [3, 4, 5];

// Compact meal data: [name, cal, protein, carbs, fat, prep, slot, "tags", ...ingredients]
type MealTuple = [string, number, number, number, number, number, string, string, ...string[]];

function parseMeal(r: MealTuple): Meal {
  const [name, calories, protein, carbs, fat, prepTime, slot, tags, ...ingredients] = r;
  return { name, calories, protein, carbs, fat, prepTime, ingredients, dietTags: tags.split(","), mealSlot: slot as MealSlot };
}

const MEALS_RAW: MealTuple[] = [
  // ── Breakfast (11) ──
  ["Greek Yogurt Parfait", 280, 28, 24, 8, 5, "breakfast", "standard,vegetarian,gluten-free", "1 cup nonfat Greek yogurt", "1/4 cup mixed berries", "1 tbsp chia seeds", "5 almonds"],
  ["Egg White Veggie Scramble", 220, 26, 8, 10, 10, "breakfast", "standard,vegetarian,dairy-free,gluten-free", "6 egg whites", "1/2 cup spinach", "1/4 cup diced bell pepper", "2 tbsp diced onion", "1 tsp olive oil"],
  ["Protein Smoothie", 290, 30, 28, 6, 5, "breakfast", "standard,vegetarian,dairy-free,gluten-free", "1 scoop vanilla protein powder", "1/2 banana", "1/2 cup frozen strawberries", "1 cup unsweetened almond milk", "1 tbsp flaxseed"],
  ["Cottage Cheese Bowl", 250, 28, 18, 7, 5, "breakfast", "standard,vegetarian,gluten-free", "1 cup low-fat cottage cheese", "1/4 cup pineapple chunks", "1 tbsp sunflower seeds", "dash of cinnamon"],
  ["Turkey Sausage & Egg Muffins", 260, 24, 6, 16, 15, "breakfast", "standard,dairy-free,gluten-free", "3 oz turkey sausage", "2 whole eggs", "2 tbsp diced red pepper", "1 tbsp chopped chives"],
  ["Overnight Oats with Protein", 310, 26, 34, 8, 5, "breakfast", "standard,vegetarian,dairy-free", "1/2 cup rolled oats", "1 scoop protein powder", "3/4 cup unsweetened almond milk", "1 tbsp chia seeds", "1/4 cup blueberries"],
  ["Smoked Salmon Toast", 280, 22, 20, 12, 5, "breakfast", "standard,pescatarian", "1 slice whole-grain bread", "3 oz smoked salmon", "1 tbsp cream cheese", "capers and dill", "lemon wedge"],
  ["Tofu Scramble with Vegetables", 252, 22, 14, 12, 12, "breakfast", "standard,vegetarian,dairy-free,gluten-free", "5 oz firm tofu, crumbled", "1/2 cup diced bell pepper", "1/2 cup baby spinach", "2 tbsp nutritional yeast", "1 tsp olive oil", "1/4 tsp turmeric"],
  ["Chia Seed Pudding with Hemp Hearts", 278, 18, 20, 14, 5, "breakfast", "standard,vegetarian,dairy-free,gluten-free", "3 tbsp chia seeds", "1 cup unsweetened almond milk", "2 tbsp hemp hearts", "1/4 cup raspberries", "1 scoop plant-based protein powder"],
  ["Sweet Potato & Black Bean Hash", 282, 20, 28, 10, 15, "breakfast", "standard,vegetarian,dairy-free,gluten-free", "1/2 cup diced sweet potato", "1/3 cup black beans", "1/4 cup diced red onion", "1/2 cup diced zucchini", "1 tsp olive oil", "cumin and smoked paprika", "2 tbsp pumpkin seeds"],
  ["Smoked Salmon & Avocado Plate", 282, 24, 6, 18, 5, "breakfast", "standard,pescatarian,dairy-free,gluten-free", "4 oz smoked salmon", "1/4 avocado, sliced", "1/4 cup sliced cucumber", "1 tbsp capers", "lemon wedge and fresh dill"],

  // ── Snacks (20) ──
  ["Cottage Cheese & Cucumber", 120, 14, 6, 4, 3, "morning-snack", "standard,vegetarian,gluten-free", "1/2 cup low-fat cottage cheese", "1/2 cup sliced cucumber", "pinch of everything bagel seasoning"],
  ["Turkey Roll-Ups", 150, 18, 4, 7, 5, "morning-snack", "standard,gluten-free", "3 oz deli turkey breast", "1 slice Swiss cheese", "mustard", "2 pickle spears"],
  ["Hard-Boiled Eggs", 140, 12, 1, 10, 2, "morning-snack", "standard,vegetarian,dairy-free,gluten-free", "2 large hard-boiled eggs", "pinch of salt and pepper"],
  ["Edamame", 190, 17, 13, 8, 3, "afternoon-snack", "standard,vegetarian,dairy-free,gluten-free", "1 cup shelled edamame", "pinch of sea salt"],
  ["String Cheese & Almonds", 190, 12, 4, 14, 1, "afternoon-snack", "standard,vegetarian,gluten-free", "1 string cheese stick", "12 almonds"],
  ["Protein Energy Bites", 160, 10, 18, 6, 5, "afternoon-snack", "standard,vegetarian", "1 tbsp peanut butter", "2 tbsp rolled oats", "1 tbsp protein powder", "1 tsp honey", "1 tsp mini chocolate chips"],
  ["Tuna Salad Lettuce Cups", 170, 20, 3, 9, 5, "morning-snack", "standard,pescatarian,dairy-free,gluten-free", "3 oz canned tuna in water", "1 tbsp olive oil mayo", "diced celery", "2 butter lettuce leaves"],
  ["Hummus & Veggies", 160, 6, 16, 8, 3, "afternoon-snack", "standard,vegetarian,dairy-free,gluten-free", "3 tbsp hummus", "1/2 cup carrot sticks", "1/2 cup celery sticks", "1/4 cup sliced bell pepper"],
  ["Jerky & Mixed Nuts", 200, 16, 8, 12, 1, "morning-snack", "standard,dairy-free,gluten-free", "1.5 oz beef jerky", "10 mixed nuts"],
  ["Ricotta & Berries", 168, 10, 14, 8, 3, "afternoon-snack", "standard,vegetarian,gluten-free", "1/3 cup part-skim ricotta", "1/4 cup mixed berries", "drizzle of honey", "mint leaf"],
  ["Roasted Chickpeas", 174, 10, 20, 6, 5, "morning-snack", "standard,vegetarian,dairy-free,gluten-free", "1/2 cup canned chickpeas, drained and patted dry", "1 tsp olive oil", "1/2 tsp smoked paprika", "1/4 tsp garlic powder", "pinch of sea salt"],
  ["Smoked Salmon Cucumber Bites", 152, 16, 4, 8, 5, "morning-snack", "standard,pescatarian,dairy-free,gluten-free", "3 oz smoked salmon", "1/2 large cucumber, sliced into rounds", "1 tbsp dairy-free cream cheese", "fresh dill"],
  ["Pumpkin Seed & Dark Chocolate Trail Mix", 212, 12, 14, 12, 2, "afternoon-snack", "standard,vegetarian,dairy-free,gluten-free", "2 tbsp pumpkin seeds", "1 tbsp sunflower seeds", "1 tbsp dark chocolate chips", "1 tbsp dried cranberries"],
  ["Almond Butter Celery Sticks", 198, 10, 8, 14, 3, "afternoon-snack", "standard,vegetarian,dairy-free,gluten-free", "3 large celery stalks, cut into sticks", "2 tbsp almond butter", "1 tsp chia seeds"],
  ["Greek Yogurt with Walnuts", 176, 16, 10, 8, 2, "morning-snack", "standard,vegetarian,gluten-free", "3/4 cup nonfat Greek yogurt", "6 walnut halves, chopped", "1/4 tsp cinnamon"],
  ["Shrimp Cocktail", 106, 18, 4, 2, 5, "afternoon-snack", "standard,pescatarian,dairy-free,gluten-free", "4 oz cooked shrimp", "2 tbsp cocktail sauce", "lemon wedge"],
  ["Black Bean Dip with Jicama", 140, 8, 18, 4, 5, "morning-snack", "standard,vegetarian,dairy-free,gluten-free", "1/4 cup mashed black beans", "1 cup jicama sticks", "1 tsp olive oil", "squeeze of lime", "pinch of cumin"],
  ["Sunflower Seed Butter & Apple Slices", 212, 8, 18, 12, 3, "afternoon-snack", "standard,vegetarian,dairy-free,gluten-free", "1 small apple, sliced", "1.5 tbsp sunflower seed butter"],
  ["Marinated Tofu Bites", 142, 14, 8, 6, 10, "morning-snack", "standard,vegetarian,dairy-free,gluten-free", "4 oz extra-firm tofu, cubed", "1 tsp tamari (gluten-free soy sauce)", "1/2 tsp sesame oil", "1/4 tsp garlic powder"],
  ["Sardines on Rice Cakes", 200, 16, 16, 8, 3, "afternoon-snack", "standard,pescatarian,dairy-free,gluten-free", "1 tin sardines in water (3 oz), drained", "2 plain rice cakes", "squeeze of lemon", "pinch of black pepper"],

  // ── Lunch (13) ──
  ["Grilled Chicken Salad", 380, 35, 12, 22, 15, "lunch", "standard,dairy-free,gluten-free", "5 oz grilled chicken breast", "2 cups mixed greens", "1/4 cup cherry tomatoes", "1/4 avocado", "1 tbsp olive oil vinaigrette"],
  ["Turkey Lettuce Wraps", 330, 32, 10, 18, 10, "lunch", "standard,dairy-free", "5 oz ground turkey", "3 butter lettuce leaves", "2 tbsp hoisin sauce", "diced water chestnuts", "sliced green onion"],
  ["Tuna Salad Bowl", 360, 34, 14, 20, 10, "lunch", "standard,pescatarian,dairy-free,gluten-free", "5 oz canned albacore tuna", "1 tbsp olive oil mayo", "1/4 cup diced celery", "1 cup mixed greens", "1/4 avocado", "lemon juice"],
  ["Chicken & Quinoa Bowl", 370, 33, 28, 14, 20, "lunch", "standard,dairy-free,gluten-free", "4 oz grilled chicken", "1/2 cup cooked quinoa", "1/4 cup black beans", "1/4 cup corn", "salsa and lime"],
  ["Shrimp Stir-Fry", 320, 30, 18, 14, 15, "lunch", "standard,pescatarian,dairy-free", "5 oz shrimp", "1 cup stir-fry vegetables", "1 tbsp low-sodium soy sauce", "1 tsp sesame oil", "1/4 cup brown rice"],
  ["Lentil & Vegetable Soup", 312, 22, 38, 8, 25, "lunch", "standard,vegetarian,dairy-free,gluten-free", "1/2 cup cooked lentils", "1/2 cup diced carrots", "1/2 cup diced celery", "1/4 cup diced onion", "1 cup low-sodium vegetable broth", "cumin and turmeric"],
  ["Chicken Caesar Wrap", 390, 32, 26, 18, 10, "lunch", "standard", "4 oz grilled chicken", "1 whole-wheat tortilla", "1 cup romaine lettuce", "1 tbsp Caesar dressing", "1 tbsp shaved parmesan"],
  ["Salmon Poke Bowl", 380, 31, 30, 16, 15, "lunch", "standard,pescatarian,dairy-free", "4 oz sushi-grade salmon, cubed", "1/2 cup sushi rice", "1/4 cup edamame", "sliced cucumber", "1 tbsp low-sodium soy sauce", "sesame seeds"],
  ["Black Bean & Tofu Bowl", 350, 24, 36, 12, 15, "lunch", "standard,vegetarian,dairy-free,gluten-free", "4 oz firm tofu, cubed and pan-fried", "1/3 cup black beans", "1/4 cup brown rice", "1/4 cup roasted corn", "salsa and lime"],
  ["Chickpea & Quinoa Mediterranean Bowl", 340, 22, 36, 12, 20, "lunch", "standard,vegetarian,dairy-free,gluten-free", "1/3 cup cooked quinoa", "1/2 cup canned chickpeas, rinsed", "1/4 cup diced cucumber", "1/4 cup cherry tomatoes, halved", "2 tbsp kalamata olives, sliced", "1 tbsp olive oil", "1 tbsp lemon juice", "fresh parsley"],
  ["Seared Tuna Salad with Sesame", 328, 34, 12, 16, 15, "lunch", "standard,pescatarian,dairy-free,gluten-free", "5 oz sushi-grade ahi tuna, seared", "2 cups mixed greens", "1/4 cup shredded carrot", "1/4 cup sliced radish", "1 tsp sesame oil", "1 tbsp rice vinegar", "1 tsp sesame seeds"],
  ["Lentil & Roasted Vegetable Bowl", 314, 22, 34, 10, 25, "lunch", "standard,vegetarian,dairy-free,gluten-free", "1/2 cup cooked green lentils", "1/2 cup roasted butternut squash", "1/2 cup roasted broccoli", "1 tbsp tahini", "1 tsp lemon juice", "pinch of za'atar"],
  ["Shrimp & Avocado Salad", 332, 28, 10, 20, 12, "lunch", "standard,pescatarian,dairy-free,gluten-free", "5 oz cooked shrimp", "1/3 avocado, diced", "2 cups arugula", "1/4 cup cherry tomatoes, halved", "1 tbsp olive oil", "1 tbsp lime juice", "pinch of chili flakes"],

  // ── Dinner (13) ──
  ["Baked Salmon with Roasted Vegetables", 404, 34, 22, 20, 30, "dinner", "standard,pescatarian,dairy-free,gluten-free", "5 oz salmon fillet", "1 cup broccoli florets", "1/2 cup diced sweet potato", "1 tsp olive oil", "lemon and dill"],
  ["Grilled Chicken Breast with Sweet Potato", 390, 36, 30, 14, 25, "dinner", "standard,dairy-free,gluten-free", "5 oz chicken breast", "1 medium sweet potato", "1 cup steamed green beans", "1 tsp olive oil"],
  ["Turkey Meatballs with Zucchini Noodles", 380, 32, 16, 22, 25, "dinner", "standard,gluten-free", "5 oz ground turkey", "2 medium zucchini, spiralized", "1/4 cup marinara sauce", "1 tbsp parmesan cheese", "Italian seasoning"],
  ["Cod with Asparagus", 340, 35, 12, 16, 20, "dinner", "standard,pescatarian,dairy-free,gluten-free", "6 oz cod fillet", "8 asparagus spears", "1 tsp olive oil", "lemon juice", "garlic and herbs"],
  ["Lean Beef Stir-Fry", 400, 32, 22, 20, 20, "dinner", "standard,dairy-free", "5 oz lean sirloin, sliced thin", "1 cup mixed stir-fry vegetables", "1 tbsp low-sodium soy sauce", "1 tsp sesame oil", "1/4 cup brown rice"],
  ["Shrimp & Zucchini", 320, 30, 14, 16, 15, "dinner", "standard,pescatarian,dairy-free,gluten-free", "5 oz shrimp", "2 medium zucchini, sliced", "1 tsp olive oil", "garlic and red pepper flakes", "lemon wedge"],
  ["Tofu & Vegetable Curry", 360, 20, 28, 18, 25, "dinner", "standard,vegetarian,dairy-free,gluten-free", "5 oz firm tofu, cubed", "1/2 cup chickpeas", "1/2 cup diced bell pepper", "1/3 cup light coconut milk", "1 tbsp curry paste", "1/4 cup brown rice"],
  ["Herb Roasted Chicken Thighs", 430, 38, 8, 28, 35, "dinner", "standard,dairy-free,gluten-free", "6 oz bone-in chicken thigh", "1 cup roasted Brussels sprouts", "1 tsp olive oil", "rosemary, thyme, and garlic"],
  ["Stuffed Bell Peppers", 370, 26, 24, 18, 30, "dinner", "standard,gluten-free", "2 bell peppers, halved", "4 oz lean ground turkey", "1/4 cup cooked rice", "1/4 cup black beans", "2 tbsp shredded cheese", "cumin and chili powder"],
  ["Stuffed Portobello Mushrooms", 294, 22, 20, 14, 25, "dinner", "standard,vegetarian,dairy-free,gluten-free", "2 large portobello mushroom caps", "1/3 cup cooked quinoa", "1/4 cup diced sun-dried tomatoes", "2 tbsp pine nuts", "1/2 cup baby spinach, wilted", "1 tsp olive oil", "garlic and Italian herbs"],
  ["Miso-Glazed Cod with Bok Choy", 282, 32, 16, 10, 20, "dinner", "standard,pescatarian,dairy-free,gluten-free", "6 oz cod fillet", "1 tbsp white miso paste", "1 tsp mirin", "2 heads baby bok choy, halved", "1 tsp sesame oil", "1 tsp sesame seeds"],
  ["Cauliflower & Chickpea Tikka Masala", 326, 20, 30, 14, 30, "dinner", "standard,vegetarian,dairy-free,gluten-free", "1 cup cauliflower florets", "1/2 cup canned chickpeas, rinsed", "1/4 cup light coconut milk", "2 tbsp tikka masala paste", "1/4 cup diced tomatoes", "1/4 cup cooked basmati rice", "fresh cilantro"],
  ["Pan-Seared Trout with Roasted Fennel", 330, 30, 12, 18, 22, "dinner", "standard,pescatarian,dairy-free,gluten-free", "5 oz rainbow trout fillet", "1 cup fennel, sliced", "1/2 cup cherry tomatoes", "1 tbsp olive oil", "1 tsp capers", "lemon juice and fresh thyme"],
];

export const MEAL_DATABASE: Meal[] = MEALS_RAW.map(parseMeal);
