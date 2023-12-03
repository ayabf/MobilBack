import { ListFormat } from "typescript";

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
    date:{type: String,required: true},
    returnDate:{type: String,default:null},
    destination: { type: String, required: true },
    departure: { type: String, required: true },
    price: { type: Number, required: true },
    nbBuisPlaces:{ type: Number, required: true },
    nbEcoPlaces:{ type: Number, required: true },
});


const hotelSchema = new mongoose.Schema({
    pays: { type: String, required: true },
    hotel:{ name: { type: String, required: true },
    location:{type: String,required: true},
    price: { type: Number, required: true },
    description:{type: String,required: true},
},

});
const hotelBookingSchema = new mongoose.Schema({
    pays: { type: String, required: true },
    name: { type: String, required: true },
    location:{type: String,required: true},
    price: { type: Number, required: true },
    description:{type: String,required: true},
    nbRoom:{type: Number,required: true},
    date:{type: String,required: true},
    duration:{type: Number,required: true}
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
const User = mongoose.model('User', userSchema);

app.get('/flights', async (req:any, res:any) => {
    try {
        const flights = await Flight.find().exec();
        res.json(flights);
    } catch (err) {
        res.status(500).json({ message: "erreur" });
    }
});


app.post('/bookings', async (req:any, res:any) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ message: 'booking created successfully', data: booking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

app.get('/bookings', async (req:any, res:any) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings'});
    }
});

app.get('/bookings/:id', async (req:any, res:any) => {
    try {
        const booking = await Booking.findById(req.params.id);
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking' });
    }
});

app.put('/bookings/:id', async (req:any, res:any) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: Booking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Booking'});
    }
});

app.delete('/bookings/:id', async (req:any, res:any) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully', data: Booking });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking' });
    }
});


app.get('/hotels', async (req:any, res:any) => {
    try {
        const countries = await Hotel.find().distinct('pays');
        res.json(countries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching countries' });
    }
});
app.get('/hotels/:pays', async (req:any, res:any) => {
    try {
        const hotels = await Hotel.find({ pays: req.params.pays });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotels' });
    }
});
app.post('/hotelBookings', async (req:any, res:any) => {
    try {
        const hotelBooking = new HotelBooking(req.body);
        await hotelBooking.save();
        res.json({ message: 'booking created successfully', data: hotelBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

app.get('/hotelBookings', async (req:any, res:any) => {
    try {
        const hotelBooking = await HotelBooking.find().exec();
        res.json(hotelBooking);
    } catch (err) {
        res.status(500).json({ message: "erreur" });
    }
});


app.put('/hotelBookings/:id', async (req:any, res:any) => {
    try {
        const hotelBookings = await HotelBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Booking updated successfully', data: HotelBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Booking'});
    }
});

app.delete('/hotelBookings/:id', async (req:any, res:any) => {
    try {
        const hotelBookings = await HotelBooking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully', data: HotelBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking' });
    }
});

app.get('/transports', async (req: any, res: any) => {
    try {
        const transports = await Transport.find().distinct('pays');
        res.json(transports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transports' });
    }
});
app.get('/transports/:pays', async (req:any, res:any) => {
    try {
        const transports = await Transport.find({ pays: req.params.pays });
        res.json(transports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transports' });
    }
});
app.post('/transportBookings', async (req: any, res: any) => {
    try {
        const transportBooking = new TransportBooking(req.body);
        await transportBooking.save();
        res.json({ message: 'Transport booking created successfully', data: transportBooking });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Error creating transport booking'
});
    }
});


app.get('/transportBookings', async (req: any, res: any) => {
    try {
        const transportBookings = await TransportBooking.find().exec();
        res.json(transportBookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transport bookings' });
    }
});

app.put('/transportBookings/:id', async (req: any, res: any) => {
    try {
        const updatedTransportBooking = await TransportBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Transport booking updated successfully', data: updatedTransportBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating transport booking' });
    }
});

app.delete('/transportBookings/:id', async (req: any, res: any) => {
    try {
        const deletedTransportBooking = await TransportBooking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transport booking deleted successfully', data: deletedTransportBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transport booking' });
    }
});
app.post('/signup', async (req:any, res:any) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: 'booking created successfully', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});
app.post('/signin', async (req:any, res:any) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (user) {
            res.json({ message: 'Signin successful', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error during signin process' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});