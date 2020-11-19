const fs = require('fs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Location = require('../models/location');
const User = require('../models/user');

const getLocationByLocationId = async (req, res, next) => {
    const locationId = req.params.locationId;
    let location;

    try {
        location = await Location.findById(locationId);
    } catch(err) {
        const error = new HttpError(
            'Something went wrong, could not find that location.',
            500
        );
        return next(error);
    };

    if (!location) {
        return next(
            new HttpError('Could not find the location for the provided ID.', 404)
        );
    };

    res.json({ location: location.toObject( {getters: true} )});
};

const getLocationsByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithLocations;
    try {
        userWithLocations = await User.findById(userId).populate('locations');
    } catch(err) {
        return next(new HttpError('Something went wrong, could not retrieve locations.', 500));
    };

    if (!userWithLocations || userWithLocations.locations.length === 0) {
        return next(
            new HttpError('Could not find locations for the provided ID.', 404)
        );
    };

    res.json({ locations: userWithLocations.locations.map(location => location.toObject( {getters:true} ))});
};

const createLocation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    };

    const { title, description, address } = req.body;

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch(err) {
        return next(new HttpError('Creating location failed, please try again.', 500));
    };

    if (!user) {
        return next(new HttpError('Could not find user for provided id.', 404));
    };

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    };

    const createdLocation = new Location({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdLocation.save({ session: sess });
        user.locations.push(createdLocation);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch(err) {
        const error = new HttpError(
            'Creating location failed, please try again.',
            500
        );
        return next(error);
    };

    res.status(201).json({location: createdLocation});
};

const updateLocation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    };

    const { title, description } = req.body;
    const locationId = req.params.locationId;

    let location;

    try {
        location = await Location.findById(locationId);
    } catch(err) {
        return next(new HttpError('Something went wrong, could not update that location.', 500));
    };

    if (location.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this location.', 401));
    };

    location.title = title;
    location.description = description;

    try {
        await location.save();
    } catch(err) {
        return next(new HttpError('Something went wrong, could not update that location.', 500));
    };

    res.status(200).json({ location: location.toObject({ getters: true }) });
};

const deleteLocation = async (req, res, next) => {
    const locationId = req.params.locationId;

    let location;
    try {
        location = await Location.findById(locationId).populate('creator');
    } catch(err) {
        return next(new HttpError('Something went wrong, could not delete that location.', 500));
    };

    if (!location) return next(new HttpError('Could not find that location.', 404));

    if (location.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to delete this location.', 401));
    };

    const imagePath = location.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await location.remove({ session: sess });
        location.creator.locations.pull(location);
        await location.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch(err) {
        return next(new HttpError('Something went wrong, could not delete that location.', 500));
    };

    fs.unlink(imagePath, err => console.log(err));

    res.status(200).json({ message: 'Deleted location.' })
}

exports.getLocationByLocationId = getLocationByLocationId;
exports.getLocationsByUserId = getLocationsByUserId;
exports.createLocation = createLocation;
exports.updateLocation = updateLocation;
exports.deleteLocation = deleteLocation;