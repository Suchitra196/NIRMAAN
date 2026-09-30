import { PrismaClient, Role, UserStatus, Department, ProjectStatus, TaskStatus, PaymentRequestStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { SAMPLE_USERS, SAMPLE_PROJECTS } from "../src/lib/sampleProjects";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent database seed for NIRMAAN...");

  const defaultPassword = await bcrypt.hash("demo1234", 10);

  // 1. Seed Users (1 Admin, 3 Officers, 4 Contractors)
  console.log("👥 Upserting users...");
  for (const user of SAMPLE_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role as Role,
        status: user.status as UserStatus,
        phone: user.phone,
        department: (user.department || "NONE") as Department,
        designation: user.designation,
        hierarchyLevel: user.hierarchyLevel,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: defaultPassword,
        role: user.role as Role,
        status: user.status as UserStatus,
        department: (user.department || "NONE") as Department,
        designation: user.designation,
        hierarchyLevel: user.hierarchyLevel,
      },
    });
  }

  // 2. Seed 60+ Sample Projects (72 projects covering all 36 districts)
  console.log(`🏗️ Upserting ${SAMPLE_PROJECTS.length} sample projects across 36 Maharashtra districts...`);

  for (const proj of SAMPLE_PROJECTS) {
    // Upsert project
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {
        name: proj.name,
        description: proj.description,
        status: proj.status as ProjectStatus,
        budgetPlanned: proj.budgetPlanned,
        budgetActual: proj.budgetActual,
        tenderAmount: proj.tenderAmount,
        officerId: proj.officerId,
        contractorId: proj.contractorId,
      },
      create: {
        id: proj.id,
        name: proj.name,
        description: proj.description,
        status: proj.status as ProjectStatus,
        budgetPlanned: proj.budgetPlanned,
        budgetActual: proj.budgetActual,
        tenderAmount: proj.tenderAmount,
        officerId: proj.officerId,
        contractorId: proj.contractorId,
      },
    });

    // Upsert Tasks (Milestones)
    for (const task of proj.tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {
          title: task.title,
          description: task.description,
          status: task.status as TaskStatus,
          dueDate: new Date(task.dueDate),
          projectId: proj.id,
        },
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as TaskStatus,
          dueDate: new Date(task.dueDate),
          projectId: proj.id,
        },
      });
    }

    // Upsert Installments
    for (const inst of proj.installments) {
      await prisma.installment.upsert({
        where: { id: inst.id },
        update: {
          amount: inst.amount,
          description: inst.description,
          datePaid: new Date(inst.datePaid),
          projectId: proj.id,
        },
        create: {
          id: inst.id,
          amount: inst.amount,
          description: inst.description,
          datePaid: new Date(inst.datePaid),
          projectId: proj.id,
        },
      });
    }

    // Upsert Payment Requests
    for (const req of proj.paymentRequests) {
      await prisma.paymentRequest.upsert({
        where: { id: req.id },
        update: {
          amount: req.amount,
          description: req.description,
          proofImages: req.proofImages,
          status: req.status as PaymentRequestStatus,
          officerNote: req.officerNote,
          projectId: proj.id,
          contractorId: proj.contractorId,
          officerId: proj.officerId,
        },
        create: {
          id: req.id,
          amount: req.amount,
          description: req.description,
          proofImages: req.proofImages,
          status: req.status as PaymentRequestStatus,
          officerNote: req.officerNote,
          projectId: proj.id,
          contractorId: proj.contractorId,
          officerId: proj.officerId,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully! All 36 districts, 6 departments, and 72 projects seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
