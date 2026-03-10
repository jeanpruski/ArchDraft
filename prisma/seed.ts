import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const systems = [
    { name: "HubSpot", type: "crm", description: "CRM cloud marketing and sales." },
    { name: "Salesforce", type: "crm", description: "Plateforme CRM Salesforce." },
    { name: "Shopify", type: "ecommerce", description: "Boutique e-commerce." },
    { name: "Stripe", type: "payment", description: "Paiement et facturation." },
    { name: "Pipedrive", type: "crm", description: "CRM commercial." },
    { name: "ERP interne", type: "erp", description: "Système métier interne." },
    { name: "API custom", type: "custom", description: "Interface API personnalisée." }
  ];

  for (const system of systems) {
    await prisma.system.upsert({
      where: { name: system.name },
      create: system,
      update: { description: system.description, type: system.type }
    });
  }

  const defaultQuestions = [
    { category: "business", question: "Quel est l’objectif métier de cette synchronisation ?", type: "text", required: true },
    { category: "business", question: "Quel problème actuel cherche-t-on à résoudre ?", type: "text", required: true },
    { category: "business", question: "Quel système est la source de vérité ?", type: "text", required: false },
    { category: "functional", question: "Quelles entités doivent être synchronisées ?", type: "text", required: true },
    { category: "functional", question: "Quels événements déclenchent la synchronisation ?", type: "text", required: false },
    { category: "technical", question: "Les APIs sont-elles disponibles ?", type: "boolean", required: true },
    { category: "technical", question: "Les webhooks sont-ils disponibles ?", type: "boolean", required: true },
    { category: "technical", question: "Quel type d’authentification est utilisé ?", type: "select", required: true },
    { category: "technical", question: "Quelle est la limite API ?", type: "text", required: false },
    { category: "data", question: "Quelle volumétrie de données ?", type: "text", required: true },
    { category: "data", question: "Faut-il synchroniser l’historique ?", type: "boolean", required: true },
    { category: "security", question: "Y a-t-il des données sensibles ?", type: "boolean", required: true },
    { category: "security", question: "Y a-t-il des contraintes RGPD ?", type: "text", required: true }
  ];

  for (const q of defaultQuestions) {
    const existing = await prisma.question.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.question.create({ data: q });
    }
  }
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
