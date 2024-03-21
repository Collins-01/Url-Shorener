"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const shortid_1 = __importDefault(require("shortid"));
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const firebaseCredentials = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN,
};
admin.initializeApp({
    credential: admin.credential.cert(firebaseCredentials)
});
const db = admin.firestore();
// dotenv.config()
const URL_NAMESPACE = 'urls';
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(body_parser_1.default.urlencoded({ extended: false }));
// parse application/json
app.use(body_parser_1.default.json());
// app.use((req, res, next) => {
//     res.status(404).json({
//         message: `Not Found`
//     })
//   });
app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'Pong',
        ip: req.ip
    });
});
app.post('/shorten', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { longUrl } = req.body;
        // Generate a short URL
        const shortUrl = shortid_1.default.generate();
        console.log(shortUrl);
        // Save to the database
        // await url.save();
        const entry = db.collection(URL_NAMESPACE).doc();
        const data = {
            'short_url': shortUrl,
            'long_url': longUrl,
            'clicks': 0,
        };
        yield entry.set(data);
        res.status(201).json({ shortUrl });
    }
    catch (error) {
        console.log(`Failed to generate url::: ${error}`);
        return res.status(500).json({
            message: `Failed to generate url`,
            error: error,
        });
    }
}));
app.get('/:shortUrl', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortUrl } = req.params;
        // console.log(shortUrl);
        // Find the long URL in the database
        const querySnapshot = yield db.collection(URL_NAMESPACE)
            .where('short_url', '==', shortUrl) // replace 'attribute' and 'value' with your desired attribute and value
            .get();
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data()['long_url'];
            res.redirect(data);
        }
        else {
            return res.status(404).json({
                message: `url not found`
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error,
        });
    }
}));
const PORT = parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map