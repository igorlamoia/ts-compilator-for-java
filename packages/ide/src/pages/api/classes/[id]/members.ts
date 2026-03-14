import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getClassMembersUseCase } from '@/use-cases/classes/get-members';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Não autorizado. Faltando x-user-id.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da turma inválido.' });
  }

  try {
    const data = await getClassMembersUseCase(prisma, { classId: id, userId });
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[API] /classes/[id]/members error:', error);
    if (error.message === 'Acesso negado.') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Turma não encontrada.') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erro interno ao buscar membros da turma.' });
  }
}
