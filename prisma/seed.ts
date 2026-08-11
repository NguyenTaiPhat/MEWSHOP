import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function getAvatarUrl(seed: string) {
  const initial = seed.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2316161c" rx="50"/><circle cx="50" cy="38" r="18" fill="%23eab308"/><path d="M22 80c0-15 13-26 28-26s28 11 28 26" fill="%23eab308"/><text x="50" y="92" font-size="12" fill="%23888890" font-family="sans-serif" text-anchor="middle" font-weight="bold">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}



async function main() {
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);
  const mewPassword = await hash("tiemcuamew123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@camrental.vn" },
    update: { avatar: getAvatarUrl("admin@camrental.vn") },
    create: {
      email: "admin@camrental.vn",
      passwordHash: adminPassword,
      name: "Admin System",
      role: "ADMIN",
      phone: "0901234567",
      avatar: getAvatarUrl("admin@camrental.vn"),
    },
  });

  const mewAdmin1 = await prisma.user.upsert({
    where: { email: "tiemcuamew" },
    update: {
      passwordHash: mewPassword,
      role: "ADMIN",
      name: "Tiệm Của Mew Admin",
      avatar: getAvatarUrl("tiemcuamew"),
    },
    create: {
      email: "tiemcuamew",
      passwordHash: mewPassword,
      name: "Tiệm Của Mew Admin",
      role: "ADMIN",
      phone: "0901234567",
      avatar: getAvatarUrl("tiemcuamew"),
    },
  });

  const mewAdmin2 = await prisma.user.upsert({
    where: { email: "tiemcuamew@gmail.com" },
    update: {
      passwordHash: mewPassword,
      role: "ADMIN",
      name: "Tiệm Của Mew Admin",
      avatar: getAvatarUrl("tiemcuamew@gmail.com"),
    },
    create: {
      email: "tiemcuamew@gmail.com",
      passwordHash: mewPassword,
      name: "Tiệm Của Mew Admin",
      role: "ADMIN",
      phone: "0901234567",
      avatar: getAvatarUrl("tiemcuamew@gmail.com"),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.vn" },
    update: { avatar: getAvatarUrl("user@test.vn") },
    create: {
      email: "user@test.vn",
      passwordHash: userPassword,
      name: "Nguyen Van A",
      role: "USER",
      phone: "0909876543",
      avatar: getAvatarUrl("user@test.vn"),
    },
  });

  // Seed Camera Products (Camera-Only)
  const cameraProducts = [
    {
      name: "Sony FX6 Cinema Line Camera",
      brand: "Sony",
      category: "Cinema Camera",
      description: "Máy ảnh Cinema full-frame chuyên nghiệp với cảm biến Exmor R 4K 120fps, ND Filter điện tử biến thiên.",
      pricePerDay: 1200000,
      pricePerHour: 150000,
      depositRequired: 15000000,
      condition: "Mới 99%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Cảm biến": "Full-frame 4K Exmor R CMOS", "FPS": "120fps tại 4K", "ISO": "Base ISO 800 / 12800" }),
    },
    {
      name: "RED V-Raptor 8K VV Cinema",
      brand: "RED",
      category: "Cinema Camera",
      description: "Dòng máy ảnh điện ảnh flagship 8K 120fps Multi-Format VistaVision, màu sắc tiêu chuẩn Hollywood.",
      pricePerDay: 2800000,
      pricePerHour: 350000,
      depositRequired: 35000000,
      condition: "Like New 99%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Độ phân giải": "8K VV (8192 x 4320)", "Dải tương phản": "17+ stops", "Ngàm": "RF Mount" }),
    },
    {
      name: "Sony FX3 Cinema Line",
      brand: "Sony",
      category: "Cinema Camera",
      description: "Thân máy nhỏ gọn tích hợp quạt tản nhiệt, chống rung 5 trục, quay 4K 120fps S-Cinetone rực rỡ.",
      pricePerDay: 750000,
      pricePerHour: 90000,
      depositRequired: 10000000,
      condition: "Mới 98%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Cảm biến": "Full-Frame 12.1MP", "Quay": "4K 120p 10-bit 4:2:2", "Tản nhiệt": "Tích hợp quạt" }),
    },
    {
      name: "Sony A7S III Full Frame",
      brand: "Sony",
      category: "Mirrorless",
      description: "Vua quay đêm với ISO lên tới 409600, hỗ trợ 4K 120p 10-bit 4:2:2, lấy nét theo ánh mắt thời gian thực.",
      pricePerDay: 600000,
      pricePerHour: 75000,
      depositRequired: 8000000,
      condition: "Mới 97%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1512790182412-b19e6d61b39a?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Lấy nét": "759 điểm Phase-Detection", "Màn hình": "Xoay lật cảm ứng 3.0 inch" }),
    },
    {
      name: "Canon EOS R5 C Cinema",
      brand: "Canon",
      category: "Cinema Camera",
      description: "Máy ảnh lai Cinema & Photography 8K 60fps RAW, cảm biến 45MP, hệ thống làm mát bằng quạt cưỡng bức.",
      pricePerDay: 850000,
      pricePerHour: 110000,
      depositRequired: 12000000,
      condition: "Mới 99%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Độ phân giải": "45 Megapixel", "Video": "8K 60p Cinema RAW Light" }),
    },
    {
      name: "Fujifilm X-T5 Mirrorless",
      brand: "Fujifilm",
      category: "Mirrorless",
      description: "Máy ảnh APS-C 40.2MP với màu ảnh giả lập film huyền thoại, chống rung 7 stop, quay 6.2K 30p.",
      pricePerDay: 400000,
      pricePerHour: 50000,
      depositRequired: 5000000,
      condition: "Mới 99%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Cảm biến": "X-Trans CMOS 5 HR 40.2MP", "Giả lập màu": "19 Film Simulation Modes" }),
    },
    {
      name: "Fujifilm X100VI Digital Camera",
      brand: "Fujifilm",
      category: "Compact & Vlog",
      description: "Máy ảnh compact thời trang 40.2MP, ống kính 23mm F2 đính kèm, chống rung IBIS 6 stop.",
      pricePerDay: 500000,
      pricePerHour: 60000,
      depositRequired: 7000000,
      condition: "Mới 100%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Ống kính": "Fixed 23mm f/2.0", "Kính ngắm": "Hybrid Optical/Electronic" }),
    },
    {
      name: "Canon EOS 5D Mark IV DSLR",
      brand: "Canon",
      category: "DSLR",
      description: "Huyền thoại nhiếp ảnh 30.4MP Full-Frame, Dual Pixel CMOS AF, thân máy hợp kim magie siêu bền bỉ.",
      pricePerDay: 450000,
      pricePerHour: 55000,
      depositRequired: 6000000,
      condition: "Mới 96%",
      images: JSON.stringify(["https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=800&q=80"]),
      specs: JSON.stringify({ "Cảm biến": "30.4MP Full-Frame", "Chip": "DIGIC 6+" }),
    },
  ];

  for (const prodData of cameraProducts) {
    const existing = await prisma.product.findFirst({ where: { name: prodData.name } });
    if (!existing) {
      const createdProd = await prisma.product.create({ data: prodData });
      // Create available slots
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + i * 2 + 1);
        startDate.setHours(8, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(18, 0, 0, 0);

        await prisma.availableSlot.create({
          data: {
            productId: createdProd.id,
            startDate,
            endDate,
            status: "OPEN",
          },
        });
      }
    }
  }

  // Payment settings
  const paymentSet = await prisma.paymentSettings.findFirst();
  if (!paymentSet) {
    await prisma.paymentSettings.create({
      data: {
        bankName: "Vietcombank",
        accountNumber: "090123456789",
        accountHolder: "TIEM CUA MEW CAMERA RENTAL",
      },
    });
  }

  console.log("Database seeded successfully with SQLite camera products & avatars!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
