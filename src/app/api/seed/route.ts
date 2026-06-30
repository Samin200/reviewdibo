import { db } from "@/db";
import { products, users, reviews } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed
 * Idempotent seeding: only inserts sample data when the products table is
 * empty. Creates a realistic, active review website with 10 products,
 * 6 users, and 20 authentic reviews.
 */
export async function POST() {
  try {
    const existing = await db.select({ id: products.id }).from(products);
    if (existing.length > 0) {
      return Response.json({ ok: true, seeded: false, message: "Already seeded" });
    }

    const insertedProducts = await db
      .insert(products)
      .values([
        {
          title: 'MacBook Pro 14"',
          description: "Premium laptop for professionals. Powered by Apple's M3 chip with stunning Liquid Retina XDR display, 18-hour battery life, and pro-level performance for creative workflows.",
          imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        },
        {
          title: "Sony WH-1000XM5 Headphones",
          description: "Industry-leading noise cancelling with two processors controlling eight microphones. Exceptional sound quality and crystal-clear hands-free calling.",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        },
        {
          title: "Keychron K2 Keyboard",
          description: "Compact 75% layout wireless mechanical keyboard with hot-swappable switches. Connects via Bluetooth or USB-C. Perfect for Mac and Windows users.",
          imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        },
        {
          title: "Samsung 4K Monitor",
          description: "27-inch UHD IPS display with HDR10 support. 99% sRGB color accuracy makes it ideal for photo editing, design work, and immersive entertainment.",
          imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
        },
        {
          title: "Logitech MX Master 3 Mouse",
          description: "Advanced wireless mouse with MagSpeed electromagnetic scrolling. Ergonomic design crafted for power users, coders, and creative professionals.",
          imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
        },
        {
          title: 'iPad Pro 12.9"',
          description: "Ultimate creative tablet with M2 chip and Liquid Retina XDR display. Supports Apple Pencil hover and Magic Keyboard for laptop-like productivity.",
          imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
        },
        {
          title: "Anker PowerBank 26800mAh",
          description: "High-capacity portable charger with triple USB ports. Power up to three devices simultaneously. Perfect for travel, camping, and long commutes.",
          imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
        },
        {
          title: "Bose QuietComfort Earbuds",
          description: "True wireless noise cancelling earbuds with customizable fit. World-class quiet, lifelike sound, and secure stay-hear tips for all-day comfort.",
          imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
        },
        {
          title: 'LG 34" Ultrawide Monitor',
          description: "Curved 21:9 ultrawide display for multitaskers. Split-screen functionality and vibrant colors. Ideal for traders, developers, and content creators.",
          imageUrl: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800",
        },
        {
          title: "Apple Watch Series 9",
          description: "Advanced health and fitness tracking with double-tap gesture. Temperature sensing, blood oxygen monitoring, and crash detection keep you informed and safe.",
          imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
        },
      ])
      .returning();

    const adminHash = await hashPassword("admin123");

    const insertedUsers = await db
      .insert(users)
      .values([
        { name: "James Carter", email: "james@email.com", role: "user" },
        { name: "Sarah Ahmed", email: "sarah@email.com", role: "user" },
        { name: "Marcus Lee", email: "marcus@email.com", role: "user" },
        { name: "Priya Nair", email: "priya@email.com", role: "user" },
        { name: "David Kim", email: "david@email.com", role: "user" },
        { name: "Layla Hassan", email: "layla@email.com", role: "user" },
        { name: "Admin", email: "admin@reviewdibo.com", role: "admin", passwordHash: adminHash },
      ])
      .returning();

    const [
      macbook,
      sonyHeadphones,
      keychron,
      samsungMonitor,
      mxMaster,
      ipad,
      anker,
      bose,
      lgMonitor,
      appleWatch,
    ] = insertedProducts;

    const [
      james,
      sarah,
      marcus,
      priya,
      david,
      layla,
    ] = insertedUsers;

    await db.insert(reviews).values([
      // MacBook Pro - 3 reviews
      {
        productId: macbook.id,
        userId: james.id,
        rating: 5,
        comment: "Absolutely incredible machine. The M3 chip handles everything I throw at it - 4K video editing, Xcode builds, even gaming. Battery easily lasts through a full workday plus evening Netflix. The display is the best I've ever used on a laptop. Worth every penny!",
      },
      {
        productId: macbook.id,
        userId: sarah.id,
        rating: 5,
        comment: "Best laptop I've ever owned. The build quality is exceptional, keyboard is a joy to type on, and it runs completely silent for most tasks. Only downside is the price, but for professional use it's justified.",
      },
      {
        productId: macbook.id,
        userId: david.id,
        rating: 4,
        comment: "Great performance but I miss having more ports. Dongle life is annoying. Otherwise a fantastic machine that replaced my desktop setup.",
      },
      // Sony Headphones - 2 reviews
      {
        productId: sonyHeadphones.id,
        userId: marcus.id,
        rating: 5,
        comment: "The noise cancellation is witchcraft. I wear these on the subway every day and can't hear a thing. Sound quality is crisp with punchy bass. The speak-to-chat feature is surprisingly useful.",
      },
      {
        productId: sonyHeadphones.id,
        userId: layla.id,
        rating: 4,
        comment: "Excellent headphones overall. The call quality is crystal clear according to my colleagues. They're a bit bulky for travel though, and the case takes up significant bag space.",
      },
      // Keychron - 2 reviews
      {
        productId: keychron.id,
        userId: priya.id,
        rating: 5,
        comment: "Perfect for my WFH setup. The brown switches are satisfying without being too loud for calls. Bluetooth connectivity is reliable and battery lasts weeks. Love that it works seamlessly with both my Mac and PC.",
      },
      {
        productId: keychron.id,
        userId: james.id,
        rating: 3,
        comment: "Good keyboard but the keycaps feel a bit cheap. Also had some Bluetooth dropout issues initially. Switches sound great though and the compact size is perfect for my small desk.",
      },
      // Samsung Monitor - 2 reviews
      {
        productId: samsungMonitor.id,
        userId: sarah.id,
        rating: 5,
        comment: "Color accuracy is spot-on for my photography work. The 4K resolution makes everything look crisp. HDR content looks stunning. Stand is adjustable and build quality feels premium.",
      },
      {
        productId: samsungMonitor.id,
        userId: marcus.id,
        rating: 4,
        comment: "Great monitor for the price. Colors are vibrant and the IPS panel has good viewing angles. Wish it had USB-C connectivity for single-cable laptop setup though.",
      },
      // MX Master 3 - 2 reviews
      {
        productId: mxMaster.id,
        userId: david.id,
        rating: 5,
        comment: "This mouse has genuinely improved my productivity. The horizontal scroll wheel is perfect for Excel and video editing. Ergonomics are excellent - no more wrist pain after long sessions.",
      },
      {
        productId: mxMaster.id,
        userId: layla.id,
        rating: 5,
        comment: "Game changer for creative work. The customizable buttons and gestures save so much time. Battery lasts forever and charges quickly via USB-C.",
      },
      // iPad Pro - 2 reviews
      {
        productId: ipad.id,
        userId: priya.id,
        rating: 4,
        comment: "The M2 chip is incredibly fast and the display is gorgeous for drawing. I use it as my primary design tool with Procreate. iPadOS still has some limitations compared to macOS though.",
      },
      {
        productId: ipad.id,
        userId: sarah.id,
        rating: 5,
        comment: "Replaced my laptop completely. The Magic Keyboard makes it feel like a real computer, and the pencil is perfect for note-taking. Apple Pencil hover is a subtle but useful feature.",
      },
      // Anker PowerBank - 2 reviews
      {
        productId: anker.id,
        userId: marcus.id,
        rating: 5,
        comment: "Essential for travel. Charged my iPhone 7 times and iPad twice on a week-long trip. The three ports mean I can charge all my devices overnight. Robust build quality too.",
      },
      {
        productId: anker.id,
        userId: james.id,
        rating: 4,
        comment: "Massive capacity and reliable. A bit heavy to carry around daily, but perfect for flights and camping. Delivery was faster than expected.",
      },
      // Bose Earbuds - 2 reviews
      {
        productId: bose.id,
        userId: layla.id,
        rating: 5,
        comment: "Finally, earbuds that fit my ears! The wing tips keep them secure during runs. Sound is balanced and the noise cancellation is impressive for earbuds. Transparency mode sounds natural.",
      },
      {
        productId: bose.id,
        userId: priya.id,
        rating: 4,
        comment: "Great for workouts and commuting. The fit is comfortable for hours. Wish they had wireless charging case at this price point though.",
      },
      // LG Ultrawide - 1 review
      {
        productId: lgMonitor.id,
        userId: david.id,
        rating: 5,
        comment: "Transformed my coding workflow. Having three full windows side-by-side is incredible. The curve is subtle and immersive. Colors are accurate enough for my UI design work.",
      },
      // Apple Watch - 2 reviews
      {
        productId: appleWatch.id,
        userId: sarah.id,
        rating: 5,
        comment: "The double-tap gesture is surprisingly useful when my hands are full. Sleep tracking helped me improve my sleep schedule. Battery easily lasts a full day with workouts.",
      },
      {
        productId: appleWatch.id,
        userId: marcus.id,
        rating: 4,
        comment: "Excellent fitness companion. The heart rate monitoring is accurate compared to my chest strap. Always-on display is convenient. Wish battery lasted longer for multi-day trips.",
      },
    ]);

    return Response.json({ 
      ok: true, 
      seeded: true, 
      products: insertedProducts.length,
      users: insertedUsers.length,
      reviews: 20,
      note: "Admin login: admin@reviewdibo.com / admin123"
    });
  } catch (err) {
    console.error("POST /api/seed failed:", err);
    return Response.json({ detail: "Failed to seed database" }, { status: 500 });
  }
}
