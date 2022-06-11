//IMPORT PASSPORT MODULE
const passport = require('passport');
//IMPORT JWT STRATEGY
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
//IMPORT TABLE GAME_USER
const { game_user } = require('../models')
//READ AUTHORIZATION TOKEN FROM HEADER
const options = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: 'iniadalahpasswordtoken'
}
//READ PAYLOAD
passport.use(new JwtStrategy (options, async (payload, done) => {
    return done(null, payload)
}))

module.exports = passport