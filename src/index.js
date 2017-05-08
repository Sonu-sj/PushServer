import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import Expo from 'exponent-server-sdk';

// To check if something is a push token
let isPushToken = Expo.isExponentPushToken('23424');

// Create a new Expo SDK client
let expo = new Expo();

// To send push notifications -- note that there is a limit on the number of
// notifications you can send at once, use expo.chunkPushNotifications()
(async function() {
  try {
    let receipts = await expo.sendPushNotificationsAsync([{
      // The push token for the app user to whom you want to send the notification
      to: 'ExponentPushToken[BaBO9SIfxwrlp01Tq-7B-j]',
      sound: 'default',
      body: 'Tank T2 Diesel is running low',
      data: {withSome: 'data'},
    }]);
    console.log(receipts);
  } catch (error) {
    console.error(error);
  }
})();
let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port);

	console.log(`Started on port ${app.server.address().port}`);
});

export default app;
