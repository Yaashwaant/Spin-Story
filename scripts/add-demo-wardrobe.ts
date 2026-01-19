import { adminDb } from "@/lib/firebase-admin"

// Demo wardrobe items with public folder images
const demoWardrobeItems = [
  {
    name: "Blue Denim Jacket",
    type: "jacket",
    color: "blue",
    season: "All Season",
    styles: ["casual", "vintage", "streetwear"],
    image: "/classic-denim-jacket.png",
    customerId: "demo-customer",
    description: "Classic blue denim jacket with button closure and chest pockets"
  },
  {
    name: "Black Blazer",
    type: "blazer",
    color: "black",
    season: "Fall/Winter",
    styles: ["formal", "business", "elegant"],
    image: "/black-blazer.jpg",
    customerId: "demo-customer",
    description: "Professional black blazer with notch lapels and single-breasted design"
  },
  {
    name: "Casual T-Shirt",
    type: "shirt",
    color: "white",
    season: "All Season",
    styles: ["casual", "basic", "comfortable"],
    image: "/casual-tshirt.png",
    customerId: "demo-customer",
    description: "Simple white cotton t-shirt with crew neck and short sleeves"
  },
  {
    name: "Denim Jeans",
    type: "pants",
    color: "blue",
    season: "All Season",
    styles: ["casual", "classic", "versatile"],
    image: "/denim-jeans.png",
    customerId: "demo-customer",
    description: "Classic blue denim jeans with straight leg and five-pocket styling"
  },
  {
    name: "Floral Summer Dress",
    type: "dress",
    color: "multi-color",
    season: "Spring/Summer",
    styles: ["casual", "feminine", "romantic"],
    image: "/floral-dress.png",
    customerId: "demo-customer",
    description: "Light floral print dress with flowing fabric and midi length"
  },
  {
    name: "Brown Leather Boots",
    type: "shoes",
    color: "brown",
    season: "Fall/Winter",
    styles: ["casual", "vintage", "durable"],
    image: "/brown-leather-boots.png",
    customerId: "demo-customer",
    description: "Classic brown leather ankle boots with side zipper and low heel"
  },
  {
    name: "White Minimalist Sneakers",
    type: "shoes",
    color: "white",
    season: "All Season",
    styles: ["casual", "modern", "minimalist"],
    image: "/white-minimalist-sneakers.png",
    customerId: "demo-customer",
    description: "Clean white leather sneakers with minimal branding and comfortable sole"
  },
  {
    name: "Beige Trench Coat",
    type: "coat",
    color: "beige",
    season: "Spring/Fall",
    styles: ["classic", "elegant", "professional"],
    image: "/beige-trench-coat.png",
    customerId: "demo-customer",
    description: "Classic beige trench coat with belt, epaulets, and double-breasted front"
  },
  {
    name: "Red Knit Scarf",
    type: "accessories",
    color: "red",
    season: "Fall/Winter",
    styles: ["casual", "cozy", "colorful"],
    image: "/red-scarf.png",
    customerId: "demo-customer",
    description: "Soft red knit scarf with fringe ends and warm wool blend"
  }
]

export async function addDemoWardrobeItems() {
  try {
    console.log("Adding demo wardrobe items...")
    
    const batch = adminDb.batch()
    const wardrobeRef = adminDb.collection('wardrobe')
    
    for (const item of demoWardrobeItems) {
      const now = new Date()
      const itemData = {
        ...item,
        createdAt: now,
        updatedAt: now,
        aiAnalyzed: false // These are manually created demo items
      }
      
      const docRef = wardrobeRef.doc()
      batch.set(docRef, itemData)
      console.log(`Added demo item: ${item.name}`)
    }
    
    await batch.commit()
    console.log(`Successfully added ${demoWardrobeItems.length} demo wardrobe items`)
    
  } catch (error) {
    console.error("Error adding demo wardrobe items:", error)
    throw error
  }
}

// Run this script to add demo items
if (require.main === module) {
  addDemoWardrobeItems()
    .then(() => {
      console.log("Demo wardrobe items added successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Failed to add demo wardrobe items:", error)
      process.exit(1)
    })
}