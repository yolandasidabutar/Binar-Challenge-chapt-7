//IMPORT TABLE GAME_USER ON DB
const {
    game_user
} = require('../../models');

//SAVE DATA USER ON VARIABLE (user)
const data = (user) => {
    const {
        id,
        username,
        asAdmin
    } = user
    return {
        id,
        username,
        asAdmin,
        accessToken: user.generateToken()
    }
}

module.exports = {
    //INDEX PAGE FUNCTION
    index: (req, res) => {
        res.status(200).send('Auth Page')
    },
    //REGISTER FUNCTION
    register: async (req, res) => {
        try {
            const input = {
                username: req.body.username,
                password: req.body.password,
                asAdmin: req.body.asAdmin || false
            }
            await game_user.register(input)
                .then((user) => {
                    res.status(200).json({
                        username: user.username,
                        msg: 'Create Account Successfully'
                    })
                })
        } catch (error) {
            res.status(500).json({
                msg: 'Failed Create Account'
            })
        }
    },
    //LOGIN FUNCTION
    login: (req, res) => {
        const input = {
            username: req.body.username,
            password: req.body.password
        }
        game_user.authenticate(input)
            .then(user => {
                res.status(200).json(data(user))
            })
            .catch((error) => {
                res.status(401).json({
                    msg: 'Login Failed, Check Your Password'
                })
            })
    },
    //LOGIN TOKEN FUNCTION
    loginToken: (req, res) => {
        const result = {
            id: req.user.id,
            username: req.user.username,
            iat: req.user.iat,
            message: "Login Successfully"
        }
        res.status(200).json(result)
    }
}