import assert from "node:assert/strict";
import test from "node:test";

test("Prisma client initializes with the PostgreSQL adapter", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/ai_studyos_test";

    const { default: prisma } = await import("../src/services/prisma.service.js");

    assert.equal(typeof prisma.user.findMany, "function");
    await prisma.$disconnect();
});
