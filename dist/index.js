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
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
var admin = require("firebase-admin");
var serviceAccount = require("../config/notification-4f2c3-firebase-adminsdk-oafq0-fd0b153fd1.json");
const certPath = admin.credential.cert(serviceAccount);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
mongoose.connect('mongodb://127.0.0.1:27017/flywareMobileApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connected successfully');
});
app.use(bodyParser.json());
app.use(cors());
const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    nbAdult: Number,
    nbChildren: Number,
    travelClass: String,
    status: String
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
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
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
    duration: { type: Number, required: true },
    status: String
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
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
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
    status: String
});
const Flight = mongoose.model('Flight', flightSchema);
const Hotel = mongoose.model('Hotel', hotelSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const HotelBooking = mongoose.model('HotelBooking', hotelBookingSchema);
const Transport = mongoose.model('Transport', transportSchema);
const TransportBooking = mongoose.model('TransportBooking', transportBookingSchema);
const User = mongoose.model('User', userSchema);
app.get('/flights', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flights = yield Flight.find().exec();
        res.json(flights);
    }
    catch (err) {
        res.status(500).json({ message: "erreur" });
    }
}));
app.get('/flights/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flightId = req.params.id;
        const flight = yield Flight.findById(flightId).exec();
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.json(flight);
    }
    catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found', userId });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
app.post('/bookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, flight, nbAdult, nbChildren, travelClass } = req.body;
        const booking = new Booking({ user, flight, nbAdult, nbChildren, travelClass, status: "en attente" });
        yield booking.save();
        res.json({ message: 'Booking created successfully', data: booking });
    }
    catch (error) {
        console.error(error);
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
app.put('/status/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        const existingBooking = yield Booking.findById(bookingId).exec();
        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const updatedBooking = yield Booking.findByIdAndUpdate(bookingId, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: updatedBooking });
        if (updatedBooking.status === "accepted") {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Flight Booking is accepted');
        }
        else {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Flight Booking is accepted');
        }
    }
    catch (error) {
        console.error('Error updating Booking:', error);
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
app.put('/statusHotel/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        const existingBooking = yield HotelBooking.findById(bookingId).exec();
        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const updatedBooking = yield HotelBooking.findByIdAndUpdate(bookingId, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: updatedBooking });
        if (updatedBooking.status === "accepted") {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Hotel Booking is accepted');
        }
        else {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Hotel Booking is accepted');
        }
    }
    catch (error) {
        console.error('Error updating Booking:', error);
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
app.put('/statusTransport/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.id;
        const existingBooking = yield TransportBooking.findById(bookingId).exec();
        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const updatedBooking = yield TransportBooking.findByIdAndUpdate(bookingId, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: updatedBooking });
        if (updatedBooking.status === "accepted") {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Transport Booking is accepted');
        }
        else {
            sendPushNotification("c36N0r2bSQiKIYJktxcRZ7:APA91bGoDWGQ6bgOtsoPOQ4z40VkuIeyZnixMKYOqQaQoH-SRv5nprOFulE1YRz1g7ftqnWyDKDa8McRli1ffZo9uRASCe1EJOVL-07jyTuvgb2_r3lWRg1vHekXw89owajDASKaxhPK", 'Your Transport Booking is accepted');
        }
    }
    catch (error) {
        console.error('Error updating Booking:', error);
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
const sendPushNotification = (fcmToken, title) => {
    try {
        const message = {
            notification: {
                title: "Flyware Agency",
                body: title,
            },
            token: fcmToken,
        };
        admin.messaging().send(message)
            .then((response) => {
            console.log('Successfully sent notification:', response);
        })
            .catch((error) => {
            console.error('Error sending notification:', error);
        });
    }
    catch (err) {
        console.error('Error sending notification:', err);
    }
};
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
        res.json({ message: 'Booking updated successfully', data: booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating Booking' });
    }
}));
app.delete('/bookings/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully', data: booking });
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
        const { pays, name, location, price, description, nbRoom, date, duration } = req.body;
        const hotelBooking = new HotelBooking({ pays, name, location, price, description, nbRoom, date, duration, status: "en attente" });
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
        res.status(500).json({ message: 'Error fetching transports' });
    }
}));
app.post('/transportBookings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, pays, title, location, price, description, nbPersonne, date, luggage } = req.body;
        const transportBooking = new TransportBooking({ name,
            pays,
            title,
            location,
            price,
            description,
            nbPersonne,
            date,
            luggage, status: "en attente" });
        yield transportBooking.save();
        res.json({ message: 'Transport booking created successfully', data: transportBooking });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating transport booking'
        });
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
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, token } = req.body;
        const existingUser = yield User.findOne({ username }).exec();
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const user = new User({ username, password, token });
        yield user.save();
        res.json({ message: 'User created successfully', data: user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield User.findOne({ username, password });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error during signin process' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
