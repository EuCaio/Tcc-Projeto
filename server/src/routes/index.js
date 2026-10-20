import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { wrap } from '../middlewares/error.js';
import * as auth from '../controllers/auth.js';
import * as content from '../controllers/content.js';
import * as quiz from '../controllers/quiz.js';
import * as stats from '../controllers/stats.js';

const r = Router();
r.get('/health', (req, res) => res.json({ ok: true }));

r.post('/auth/register', wrap(auth.register));
r.post('/auth/login', wrap(auth.login));
r.get('/auth/me', requireAuth, wrap(auth.me));

r.get('/bacteria', requireAuth, wrap(content.listBacteria));
r.get('/antibiotics', requireAuth, wrap(content.listAntibiotics));

r.get('/questions/round', requireAuth, wrap(quiz.newRound));
r.post('/answers', requireAuth, wrap(quiz.submitAnswer));

r.get('/me/stats', requireAuth, wrap(stats.myStats));
r.get('/classes/:id/stats', requireAuth, requireRole('professor'), wrap(stats.classStats));

export default r;
