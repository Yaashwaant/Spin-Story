import { adminDb } from "@/lib/firebase-admin"

interface WardrobeItem {
  name: string
  image: string
  type: string
  color: string
  season: string
  styles: string[]
  customerId: string
  createdAt: Date
  updatedAt: Date
}

const DEMO_OUTFITS = [
  {
    name: "Classic Denim Jacket",
    image: "/classic-denim-jacket.png",
    type: "jacket",
    color: "blue",
    season: "All Season",
    styles: ["casual", "classic"]
  },
  {
    name: "Black Blazer",
    image: "/black-blazer.jpg",
    type: "blazer",
    color: "black",
    season: "All Season",
    styles: ["formal", "professional"]
  },
  {
    name: "Denim Jeans",
    image: "/denim-jeans.png",
    type: "pants",
    color: "blue",
    season: "All Season",
    styles: ["casual", "classic"]
  },
  {
    name: "Casual T-Shirt",
    image: "/casual-tshirt.png",
    type: "top",
    color: "white",
    season: "Summer",
    styles: ["casual", "minimalist"]
  },
  {
    name: "Floral Dress",
    image: "/floral-dress.png",
    type: "dress",
    color: "multi",
    season: "Spring",
    styles: ["feminine", "casual"]
  },
  {
    name: "Brown Leather Boots",
    image: "/brown-leather-boots.png",
    type: "shoes",
    color: "brown",
    season: "Winter",
    styles: ["classic", "rustic"]
  },
  {
    name: "White Minimalist Sneakers",
    image: "/white-minimalist-sneakers.png",
    type: "shoes",
    color: "white",
    season: "All Season",
    styles: ["minimalist", "casual"]
  },
  {
    name: "Red Scarf",
    image: "/red-scarf.png",
    type: "accessory",
    color: "red",
    season: "Winter",
    styles: ["classic", "warm"]
  },
  {
    name: "Beige Trench Coat",
    image: "/beige-trench-coat.png",
    type: "coat",
    color: "beige",
    season: "Winter",
    styles: ["classic", "elegant"]
  }
]

async function getDemoUsers() {
  const snapshot = await adminDb
    .collection("users")
    .where("isDemo", "==", true)
    .limit(2)
    .get()
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }))
}

async function clearExistingWardrobe(customerId: string) {
  const snapshot = await adminDb
    .collection("wardrobe")
    .where("customerId", "==", customerId)
    .get()
  
  const batch = adminDb.batch()
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  
  if (snapshot.docs.length > 0) {
    await batch.commit()
    console.log(`Cleared ${snapshot.docs.length} existing wardrobe items for customer ${customerId}`)
  }
}

async function addWardrobeItems(customerId: string, items: any[]) {
  const batch = adminDb.batch()
  
  items.forEach(item => {
    const ref = adminDb.collection("wardrobe").doc()
    batch.set(ref, {
      ...item,
      customerId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })
  
  await batch.commit()
  console.log(`Added ${items.length} wardrobe items for customer ${customerId}`)
}

async function seedDemoWardrobe() {
  try {
    console.log("Starting demo wardrobe seeding...")
    
    // Get the first two demo users
    const demoUsers = await getDemoUsers()
    
    if (demoUsers.length < 2) {
      console.error("Need at least 2 demo users, found:", demoUsers.length)
      return
    }
    
    console.log("Found demo users:", demoUsers)
    
    // Split outfits between the two users
    const user1Items = DEMO_OUTFITS.slice(0, 4) // First 4 items
    const user2Items = DEMO_OUTFITS.slice(4, 8) // Next 4 items
    
    // Clear existing wardrobe for both users
    await clearExistingWardrobe(demoUsers[0].id)
    await clearExistingWardrobe(demoUsers[1].id)
    
    // Add new wardrobe items
    await addWardrobeItems(demoUsers[0].id, user1Items)
    await addWardrobeItems(demoUsers[1].id, user2Items)
    
    console.log("Demo wardrobe seeding completed successfully!")
    console.log(`User 1 (${demoUsers[0].name}): ${user1Items.length} items`)
    console.log(`User 2 (${demoUsers[1].name}): ${user2Items.length} items`)
    
  } catch (error) {
    console.error("Error seeding demo wardrobe:", error)
  }
}

// Run the seeding
seedDemoWardrobe()