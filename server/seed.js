const https = require('https');
const Recipe = require('./models/Recipe');
const Rating = require('./models/Rating');

// Helper function to make GET requests via Node https module
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Map standard MealDB areas to our supported Cuisines
function normalizeCuisine(area) {
  if (!area) return 'American';
  const areaLower = area.toLowerCase();
  if (areaLower.includes('italian')) return 'Italian';
  if (areaLower.includes('mexican')) return 'Mexican';
  if (areaLower.includes('indian')) return 'Indian';
  if (areaLower.includes('japanese')) return 'Japanese';
  if (areaLower.includes('chinese')) return 'Chinese';
  if (areaLower.includes('american') || areaLower.includes('canadian')) return 'American';
  if (areaLower.includes('french')) return 'French';
  if (areaLower.includes('moroccan')) return 'Moroccan';
  
  // Default mapping for other areas to balance distribution
  if (areaLower.includes('thai') || areaLower.includes('vietnamese') || areaLower.includes('malaysian')) return 'Japanese';
  if (areaLower.includes('spanish') || areaLower.includes('greek')) return 'Italian';
  if (areaLower.includes('turkish') || areaLower.includes('egyptian')) return 'Moroccan';
  return 'American';
}

// Map standard MealDB categories to our supported Categories
function normalizeCategory(category) {
  if (!category) return 'Main';
  const catLower = category.toLowerCase();
  if (catLower.includes('starter') || catLower.includes('side')) return 'Starter';
  if (catLower.includes('dessert')) return 'Dessert';
  if (catLower.includes('breakfast')) return 'Breakfast';
  if (catLower.includes('side')) return 'Side';
  return 'Main';
}

// Extract Youtube embed URL or clean link
function formatYoutubeUrl(url) {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  return url;
}

// Convert individual MealDB ingredient/measure fields into a clean bulleted list string
function extractIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      const line = measure && measure.trim() !== '' ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
      items.push(line);
    }
  }
  return items.length > 0 ? items.join('\n') : '1 tbsp Olive Oil\n1 Pinch Salt\nFresh Herbs';
}

// Convert plain text instructions into clean step format
function formatInstructions(instructionsStr) {
  if (!instructionsStr) return '1. Prepare ingredients.\n2. Cook thoroughly.\n3. Serve warm.';
  // Clean linebreaks and normalize
  const cleaned = instructionsStr
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 3);
  
  return cleaned.join('\n\n');
}

// Seed execution function
async function seedDatabase() {
  try {
    const recipeCount = await Recipe.countDocuments();
    let seededRecipes = [];

    if (recipeCount === 0) {
      console.log('Fetching live recipes from TheMealDB API...');
      
      // Fetch diverse queries from TheMealDB API to gather 50+ rich real recipes
      const searchTerms = ['a', 'b', 'c', 'm', 'p', 's', 'chicken', 'pasta', 'curry', 'taco', 'salad'];
      const fetchedMealsMap = new Map();

      for (const term of searchTerms) {
        try {
          const res = await fetchJson(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
          if (res && res.meals) {
            for (const meal of res.meals) {
              if (!fetchedMealsMap.has(meal.idMeal)) {
                fetchedMealsMap.set(meal.idMeal, meal);
              }
            }
          }
        } catch (e) {
          console.warn(`Failed fetching term ${term}:`, e.message);
        }
      }

      const mealList = Array.from(fetchedMealsMap.values());
      console.log(`Retrieved ${mealList.length} distinct meals from TheMealDB.`);

      if (mealList.length > 0) {
        const recipeDocs = mealList.slice(0, 40).map((meal, index) => {
          const cuisine = normalizeCuisine(meal.strArea);
          const category = normalizeCategory(meal.strCategory);
          const ingredients = extractIngredients(meal);
          const instructions = formatInstructions(meal.strInstructions);
          const youtubeUrl = formatYoutubeUrl(meal.strYoutube);
          
          // Seed high average rating (4.2 - 4.9)
          const averageRating = parseFloat((4.2 + (index % 8) * 0.1).toFixed(1));

          return {
            name: meal.strMeal || 'Global Delicacy',
            cuisine,
            category,
            imageUrl: meal.strMealThumb || `https://picsum.photos/seed/recipe${index}/800/600`,
            ingredients,
            instructions,
            youtubeUrl,
            source: 'themealdb',
            status: 'approved',
            mealDbId: meal.idMeal,
            submittedBy: 'TheMealDB Master Chefs',
            averageRating,
            createdAt: new Date(Date.now() - (index * 86400000))
          };
        });

        // Add 3 curated high-quality Community / Custom recipes to showcase community platform power
        const customRecipes = [
          {
            name: 'Authentic Moroccan Tagine with Lamb & Apricots',
            cuisine: 'Moroccan',
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14da?auto=format&fit=crop&w=1000&q=80',
            ingredients: '800g Lamb shoulder, cubed\n2 tbsp Moroccan Ras el Hanout spice blend\n1 large Yellow Onion, finely chopped\n3 cloves Garlic, minced\n150g Dried Apricots\n1 tbsp Honey\n400ml Beef broth\n2 tbsp Olive Oil\nFresh Coriander and toasted almonds for garnish',
            instructions: '1. Heat olive oil in a heavy tagine or Dutch oven over medium heat.\n2. Season lamb cubes with Ras el Hanout and brown on all sides in batches.\n3. Remove lamb, add onions and garlic, cooking until softened and aromatic.\n4. Return lamb, stir in broth, honey, and dried apricots. Bring to a slow simmer.\n5. Cover and cook on low heat for 1.5 to 2 hours until the lamb is meltingly tender.\n6. Garnish with fresh chopped coriander and toasted flaked almonds before serving with fluffy couscous.',
            youtubeUrl: 'https://www.youtube.com/embed/930q42-E76s',
            source: 'user',
            status: 'approved',
            submittedBy: 'Chef Laila Bennani',
            averageRating: 4.9,
            createdAt: new Date()
          },
          {
            name: 'Handcrafted Classic Matcha Green Tea Mochi',
            cuisine: 'Japanese',
            category: 'Dessert',
            imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1000&q=80',
            ingredients: '100g Shiratamako (glutinous rice flour)\n1 tbsp Ceremonial Matcha Powder\n50g Fine Sugar\n180ml Water\n150g Sweetened Red Bean Paste (Anko)\nPotato starch for dusting',
            instructions: '1. Divide sweet red bean paste into 6 equal small balls and chill.\n2. In a heatproof glass bowl, whisk together Shiratamako, matcha powder, sugar, and water until smooth.\n3. Cover loosely with plastic wrap and microwave for 1 minute (800W). Stir well with a wet spatula.\n4. Microwave for another 45 seconds until glossy and translucent.\n5. Dust a board generously with potato starch and turn out the hot sticky mochi dough.\n6. Cut into 6 pieces, flatten each into a disk, wrap around a red bean ball, and pinch shut tightly.',
            youtubeUrl: 'https://www.youtube.com/embed/S_8qM8QvQis',
            source: 'user',
            status: 'approved',
            submittedBy: 'Kenji Takahashi',
            averageRating: 4.8,
            createdAt: new Date()
          },
          {
            name: 'Sizzling Street-Style Beef Birria Tacos',
            cuisine: 'Mexican',
            category: 'Main',
            imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80',
            ingredients: '1kg Beef Chuck Roast, cut into chunks\n4 dried Guajillo chilies, seeded\n2 dried Ancho chilies, seeded\n1 Onion, halved\n4 cloves Garlic\n1 tbsp Apple Cider Vinegar\n1 tsp Dried Oregano\n12 Corn tortillas\n200g Oaxaca or Mozzarella cheese, shredded\nChopped cilantro and diced onion for serving',
            instructions: '1. Toast dried chilies in a dry pan, then soak in boiling water for 15 minutes until soft.\n2. Blend softened chilies with garlic, onion, vinegar, oregano, salt, and broth until smooth.\n3. Pour chili marinade over beef in a Dutch oven or pressure cooker. Simmer slowly for 3 hours until shreds effortlessly.\n4. Shred the beef, reserving the flavorful red consommé sauce on top.\n5. Dip corn tortillas into the warm red consommé oil, place on a hot skillet, top with cheese and shredded beef.\n6. Fold taco over, crisp up until golden and melty. Serve with a bowl of hot consommé for dipping!',
            youtubeUrl: 'https://www.youtube.com/embed/5U2Y0U392W4',
            source: 'user',
            status: 'approved',
            submittedBy: 'Sofia Ramirez',
            averageRating: 5.0,
            createdAt: new Date()
          }
        ];

        seededRecipes = await Recipe.insertMany([...recipeDocs, ...customRecipes]);
        console.log(`Successfully seeded ${seededRecipes.length} recipes to database.`);
      }
    } else {
      console.log(`Recipes already exist in DB (${recipeCount} records). Fetching existing...`);
      seededRecipes = await Recipe.find({});
    }

    // Seed Ratings if collection is empty
    const ratingCount = await Rating.countDocuments();
    if (ratingCount === 0 && seededRecipes.length > 0) {
      console.log('Seeding initial community ratings and reviews...');
      const sampleReviews = [
        { stars: 5, comment: 'Absolute perfection! Made this for Friday dinner party and everyone asked for seconds.', authorName: 'Elena Rostova' },
        { stars: 5, comment: 'Step 3 was super easy to follow. The balance of spices and warmth in this dish is unbelievable.', authorName: 'Marcus Vance' },
        { stars: 4, comment: 'Delicious recipe! I added a touch extra garlic and fresh coriander. Will make again!', authorName: 'Sarah Jenkins' },
        { stars: 5, comment: 'Matcha quality makes all the difference here! authentic and comforting recipe.', authorName: 'David K.' },
        { stars: 4, comment: 'Turned out great on my first try! Loved the clear ingredient proportions.', authorName: 'Amira Patel' },
        { stars: 5, comment: 'Hands down our new favorite weeknight staple. Quick, vibrant, and incredibly tasty.', authorName: 'Lucas Meyer' }
      ];

      const ratingDocs = [];
      // Attach 2-3 reviews to the first 10 recipes
      for (let i = 0; i < Math.min(12, seededRecipes.length); i++) {
        const recipe = seededRecipes[i];
        const rev1 = sampleReviews[i % sampleReviews.length];
        const rev2 = sampleReviews[(i + 3) % sampleReviews.length];

        ratingDocs.push({
          recipeId: recipe._id.toString(),
          stars: rev1.stars,
          comment: rev1.comment,
          authorName: rev1.authorName,
          createdAt: new Date(Date.now() - (i * 3600000 * 5))
        });

        ratingDocs.push({
          recipeId: recipe._id.toString(),
          stars: rev2.stars,
          comment: rev2.comment,
          authorName: rev2.authorName,
          createdAt: new Date(Date.now() - (i * 3600000 * 12))
        });
      }

      await Rating.insertMany(ratingDocs);
      console.log(`Successfully seeded ${ratingDocs.length} community ratings.`);
    }

    console.log('Matcha seed pipeline complete!');
  } catch (err) {
    console.error('Error during database seed process:', err);
  }
}

// Execute seed process immediately
(async () => {
  await seedDatabase();
})();

module.exports = seedDatabase;