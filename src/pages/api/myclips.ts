import type { NextApiRequest, NextApiResponse } from 'next';
import { APIResponse } from '../../lib/types';
import { db } from '../../lib/prisma';
import { getSession } from 'next-auth/react';
import { getUserIDFromEmail } from '../../lib/dbHelpers';
import rateLimit from '../../lib/rateLimit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 reqs per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>,
) {
  try {
    await limiter.check(res, 30, 'CACHE_TOKEN');
  } catch {
    res.status(429).json({
      status: 'error',
      result: 'Rate limit exceeded',
    });
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({
      status: 'error',
      result: 'Unauthenticated.',
    });
  }

  const queriedClips = db.clip.findMany({
    where: {
      ownerID: await getUserIDFromEmail(session?.user?.email),
    },
  });

  try {
    const result = await queriedClips;
    res.status(200).json({ status: 'success', result: result });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      result: 'An error with the database has occured.',
    });
  }
}
