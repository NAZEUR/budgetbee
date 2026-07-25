import { prisma } from "@/lib/prisma";

/**
 * Centralized transaction creation service
 * This is kept as a single function to make it easy to add
 * AI categorization in Phase 2
 */
export async function createTransaction({
  userId,
  categoryId,
  amount,
  description,
  type,
  date,
}: {
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: "expense" | "income";
  date: Date;
}) {
  // Phase 2: AI categorization hook would go here
  // e.g., if (!categoryId && aiEnabled) { categoryId = await aiCategorize(description); }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      amount,
      description,
      type,
      date,
    },
    include: {
      category: true,
    },
  });

  return transaction;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: {
    categoryId?: string;
    amount?: number;
    description?: string;
    type?: "expense" | "income";
    date?: Date;
  }
) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId, userId },
    data,
    include: {
      category: true,
    },
  });

  return transaction;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  transactionId: string,
  userId: string
) {
  return prisma.transaction.delete({
    where: { id: transactionId, userId },
  });
}
