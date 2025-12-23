const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('../services/users.service');
const config = require('./index');

/**
 * ==============================================
 * STRATEGY 1: LOCAL LOGIN (Email + Password)
 * Used when user tries to sign in.
 * ==============================================
 */
const localOptions = { 
    usernameField: 'email',
    passwordField: 'password'
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        const user = await UserService.findByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Invalid login details' });
        }

        const isMatch = await UserService.verifyPassword(user.passwordHash, password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid login details' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

/**
 * ==============================================
 * STRATEGY 2: JWT AUTH (Protected Routes)
 * Used when user sends an "Authorization: Bearer <token>" header.
 * ==============================================
 */
const jwtOptions = {
    // Tell Passport to look for the token in the 'Authorization' header
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Use the ACCESS secret to verify the signature
    secretOrKey: config.jwt.accessSecret
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // payload.userId comes from the token we created in auth.controller
        const user = await UserService.getUserById(payload.userId);

        if (user) {
            return done(null, user); // User found, request is authorized
        } else {
            return done(null, false); // User deleted or invalid
        }
    } catch (err) {
        return done(err, false);
    }
});

/**
 * ==============================================
 * STRATEGY 3: GOOGLE OAUTH
 * ==============================================
 */
if (config.oauth.google.clientID) {
    passport.use(new GoogleStrategy({
        clientID: config.oauth.google.clientID,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Check if user exists with this Google ID
            const existingUser = await UserService.findByProvider('google', profile.id);
            if (existingUser) return done(null, existingUser);

            // 2. Check if email exists (Optional: Link accounts)
            // If a user signed up with email/pass, and now uses Google with same email
            const email = profile.emails?.[0]?.value;
            if (email) {
                const userByEmail = await UserService.findByEmail(email);
                if (userByEmail) {
                    // Link the Google ID to the existing local account
                    await UserModel.linkProvider({
                        userId: userByEmail.id,
                        provider: 'google',
                        providerId: profile.id
                    });
                    return done(null, userByEmail);
                }
            }

            // 3. Create new user
            const newUser = await UserService.createOAuthUser({
                email: email,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                provider: 'google',
                providerId: profile.id
            });
            return done(null, newUser);

        } catch (err) {
            return done(err);
        }
    }));
}

/**
 * ==============================================
 * STRATEGY 4: APPLE SIGN IN - need apple developer account boo!
 * ==============================================
 */
// if (config.oauth.apple.clientID && config.oauth.apple.privateKey) {
//     passport.use(new AppleStrategy({
//         clientID: config.oauth.apple.clientID,
//         teamID: config.oauth.apple.teamID,
//         keyID: config.oauth.apple.keyID,
//         privateKeyString: config.oauth.apple.privateKey,
//         callbackURL: config.oauth.apple.callbackURL,
//         passReqToCallback: false
//     }, async (accessToken, refreshToken, idToken, profile, done) => {
//         // Apple only sends 'profile' (name/email) on the FIRST login.
//         // Subsequent logins only send the idToken.
//         try {
//             const providerId = idToken.sub; // The unique Apple User ID
//             const email = idToken.email; // Extracted from JWT

//             const existingUser = await UserService.findByProvider('apple', providerId);
//             if (existingUser) return done(null, existingUser);

//             if (email) {
//                 const userByEmail = await UserService.findByEmail(email);
//                 if (userByEmail) {
//                     await UserModel.linkProvider({
//                         userId: userByEmail.id,
//                         provider: 'apple',
//                         providerId: providerId
//                     });
//                     return done(null, userByEmail);
//                 }
//             }

//             // Fallback for name if profile is missing (common in Apple subsequent logins)
//             // You might want to default to "Apple User" or split the email
//             const name = (profile && profile.name) 
//                 ? `${profile.name.firstName} ${profile.name.lastName}` 
//                 : (email ? email.split('@')[0] : 'Apple User');

//             const newUser = await UserService.createOAuthUser({
//                 email: email,
//                 name: name,
//                 avatar: null, // Apple doesn't provide avatars
//                 provider: 'apple',
//                 providerId: providerId
//             });
//             return done(null, newUser);
//         } catch (err) {
//             return done(err);
//         }
//     }));
// }

// Register both strategies
passport.use(localLogin);
passport.use(jwtLogin);