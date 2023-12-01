"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/flywareMobileApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connected successfully');
});
app.use(bodyParser.json());
app.use(cors());
const bookingSchema = new mongoose.Schema({
    duration: String,
    date: String,
    returnDate: String,
    destination: String,
    departure: String,
    price: Number,
    nbAdult: Number,
    nbChildren: Number,
    travelClass: String,
});
const flightSchema = new mongoose.Schema({
    duration: { type: String, required: true },
    date: { type: String, required: true },
    returnDate: { type: String, default: null },
    destination: { type: String, required: true },
    departure: { type: String, required: true },
    price: { type: Number, required: true },
    nbBuisPlaces: { type: Number, required: true },
    nbEcoPlaces: { type: Number, required: true },
});
const hotelSchema = new mongoose.Schema({
    pays: { type: String, required: true },
    hotel: { name: { type: String, required: true },
        location: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
    },
});
const hotelBookingSchema = new mongoose.Schema({
    pays: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    nbRoom: { type: Number, required: true },
    date: { type: String, required: true },
    duration: { type: Number, required: true }
});
const transportSchema = new mongoose.Schema({
    name: String,
    location: String,
    price: String,
    description: String,
    nbPersonne: Number,
    date: String,
    luggage: Number,
});
const transportBookingSchema = new mongoose.Schema({
    name: String,
    pays: String,
    title: String,
    location: String,
    price: String,
    description: String,
    nbPersonne: Number,
    date: String,
    luggage: Number,
});
const Flight = mongoose.model('Flight', flightSchema);
const Hotel = mongoose.model('Hotel', hotelSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);
const Transport = mongoose.model('Transport', transportSchema);
const TransportBooking = mongoose.model('TransportBooking', transportBookingSchema);
app.get('/flights', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flights = yield Flight.find().exec();
        res.json(flights);
    }
    catch (err) {
        res.status(500).json({ message: "erreur" });
    }
}));
app.post('/bookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = new Booking(req.body);
        yield booking.save();
        res.json({ message: 'booking created successfully', data: booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
}));
app.get('/bookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking.find();
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
}));
app.get('/bookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking.findById(req.params.id);
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching booking' });
    }
}));
app.put('/bookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: Booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
app.delete('/bookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully', data: Booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting booking' });
    }
}));
app.get('/hotels', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countries = yield Hotel.find().distinct('pays');
        res.json(countries);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching countries' });
    }
}));
app.get('/hotels/:pays', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield Hotel.find({ pays: req.params.pays });
        res.json(hotels);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching hotels' });
    }
}));
app.post('/hotelBookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelBooking = new HotelBooking(req.body);
        yield hotelBooking.save();
        res.json({ message: 'booking created successfully', data: hotelBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
}));
app.get('/hotelBookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelBooking = yield HotelBooking.find().exec();
        res.json(hotelBooking);
    }
    catch (err) {
        res.status(500).json({ message: "erreur" });
    }
}));
app.put('/hotelBookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelBookings = yield HotelBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: HotelBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
app.delete('/hotelBookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelBookings = yield HotelBooking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully', data: HotelBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting booking' });
    }
}));
app.get('/transports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transports = yield Transport.find().distinct('pays');
        res.json(transports);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching transports' });
    }
}));
app.get('/transports/:pays', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transports = yield Transport.find({ pays: req.params.pays });
        res.json(transports);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching hotels' });
    }
}));
app.post('/transportBookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transportBooking = new TransportBooking(req.body);
        yield transportBooking.save();
        res.json({ message: 'Transport booking created successfully', data: transportBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating transport booking' });
    }
}));
app.get('/transportBookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transportBookings = yield TransportBooking.find().exec();
        res.json(transportBookings);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching transport bookings' });
    }
}));
app.put('/transportBookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedTransportBooking = yield TransportBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Transport booking updated successfully', data: updatedTransportBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating transport booking' });
    }
}));
app.delete('/transportBookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTransportBooking = yield TransportBooking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transport booking deleted successfully', data: deletedTransportBooking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting transport booking' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
