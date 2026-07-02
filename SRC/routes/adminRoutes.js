const express = require('express');

const adminController =
require('../controllers/adminController');

const adminAuth =
require('../middlewares/adminAuth');

const router = express.Router();

router.get(
    '/admin/dashboard',
    adminAuth,
    adminController.getDashboardStats
);

router.post(
    '/admin/riders',
    adminAuth,
    adminController.registerRider
);

router.get(
    '/admin/riders',
    adminAuth,
    adminController.getAllRiders
);

router.delete(
    '/admin/riders/:riderId',
    adminAuth,
    adminController.deleteRider
);

router.get(
    '/admin/customers',
    adminAuth,
    adminController.getAllCustomers
);

router.delete(
    '/admin/customers/:customerId',
    adminAuth,
    adminController.deleteCustomer
);

router.get(
    '/admin/pending-riders',
    adminAuth,
    adminController.getPendingRiders
);

router.patch(
    '/admin/riders/:riderId/approve',
    adminAuth,
    adminController.approveRider
);

router.patch(
    '/admin/riders/:riderId/reject',
    adminAuth,
    adminController.rejectRider
);

router.get(
    '/admin/orders',
    adminAuth,
    adminController.getAllOrders
);

router.patch(
    '/admin/orders/:orderId/cancel',
    adminAuth,
    adminController.cancelOrder
);

router.get(
    '/admin/approved-riders',
    adminAuth,
    adminController.getApprovedRiders
);

router.get(
    '/admin/rejected-riders',
    adminAuth,
    adminController.getRejectedRiders
);

module.exports = router;