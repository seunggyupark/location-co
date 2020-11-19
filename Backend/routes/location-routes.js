const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const locationsControllers = require('../controllers/locations-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

router.get('/:locationId', locationsControllers.getLocationByLocationId);

router.get('/user/:uid', locationsControllers.getLocationsByUserId);

router.use(checkAuth);

router.post('/', 
    fileUpload.single('image'),
    [
    check('title').not().isEmpty(),
    check('description').isLength({min: 5}),
    check('address').not().isEmpty()
    ],
    locationsControllers.createLocation);

router.patch('/:locationId', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
    ],  locationsControllers.updateLocation)

router.delete('/:locationId', locationsControllers.deleteLocation)

module.exports = router;