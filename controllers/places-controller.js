const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');

const HttpError = require("../models/http-error");
const getCordForAddress = require('../util/location')

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'ONe of the most famous sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 Q 24th St, New York, NY 10001',
        creator: 'u1'
    }
]

const getPlacesById = (req, res, next) => {
    const placeId = req.params.pid;
    const places = DUMMY_PLACES.find(p => p.id === placeId)

    if (!places) {
        throw new HttpError('Could not find place for the provided id.', 404);
    }

    res.json({places})
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter(p => p.creator === userId)

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id.', 404));
    }

    res.json({places})
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
       return  next (new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const {title, description, address, creator} = req.body;
    let coordinates;
    try {
        coordinates = await getCordForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace)
    res.status(201).json({place: createdPlace})
}

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;

    const updatePlace = {...DUMMY_PLACES.find(p => p.id === placeId)}
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;
    res.status(200).json({place: updatePlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;

    if (!DUMMY_PLACES.find(p=> p.id === placeId)) {
        throw new HttpError('Could not find a place for the provided id.', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
    res.status(200).json({message: 'Deleted place.'})
}


exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;