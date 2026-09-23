const express = require('express');

const authRoutes = require('./modules/auth/auth.routes');
const projectRoutes = require('./modules/projects/projects.routes');
const tenderRoutes = require('./modules/tenders/tenders.routes');
const noticeRoutes = require('./modules/notices/notices.routes');
const publicNoticeRoutes = require('./modules/publicNotices/publicNotices.routes');
const bannerRoutes = require('./modules/banners/banners.routes');
const uploadRoutes = require('./modules/uploads/uploads.routes');

const router = express.Router();

/** One place to see every module mounted in the monolith. */
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tenders', tenderRoutes);
router.use('/notices', noticeRoutes);
router.use('/public-notices', publicNoticeRoutes);
router.use('/banners', bannerRoutes);
router.use('/uploads', uploadRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
