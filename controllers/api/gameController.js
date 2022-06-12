//IMPORT DB
const {
    Result
} = require('express-validator')
const {
    game_user,
    game_history,
    game_room
} = require('../../models')

module.exports = {
    //FUNCTION CREATE ROOM
    createRoom: async (req, res) => {
        try {
            const roomExist = await game_room.findOne({
                where: {
                    room_name: req.body.room_name
                }
            })
            //CHECK ROOM FULL OR NOT
            if (roomExist) return res.status(200).json({
                room_name: req.body.room_name,
                msg: 'ROOM NAME ALREADY USED'
            })
            //PLAYER INPUT USING FK P1_ID ON DB
            const playerInput = {
                room_name: req.body.room_name,
                p1_id: req.user.id,
                p2_id: null
            }
            //CREATE A NEW ROOM
            const newRoom = await game_room.create(playerInput)

            //ROUND ON ROOM
            round = 1
            while (round <= 3) {
                //CREATE DATA ON GAME_HISTORY ON DB
                await game_history.create({
                        room_id: newRoom.id,
                        p1_pick: null,
                        p2_pick: null,
                        round: round,
                        round_winner: null
                    })
                    //INCREASED NUMBER OF ROUND
                    .then(() => round = round + 1)
            }
            //SHOW GAME ROUND
            const gameRound = await game_history.findAll({
                where: {
                    room_id: newRoom.id
                },
                include: {
                    model: game_room
                }
            })
            res.status(200).json(gameRound)
        } catch (error) {
            res.status(500).json({
                msg: 'CREATE ROOM METHOD ERROR'
            })
        }
    },
    // FUNCTION VIEW ROOM
    viewRoom: async (req, res) => {
        try { //FIND ROOM BY ID
            const detail = await game_room.findOne({
                where: {
                    id: req.params.id
                }
            })
            //CHECK ALREADY PLAYER ON ROOM
            const player_detail = [
                await game_user.findOne({
                    where: {
                        id: detail.p1_id
                    },
                    attributes: ['id', 'username']
                }),
                await game_user.findOne({
                    where: {
                        id: detail.p2_id
                    },
                    attributes: ['id', 'username']
                })
            ]
            res.status(200).json(player_detail)
        } catch (error) {
            res.status(500).json('VIEW ROOM METHOD ERROR')
        }
    },
    // FUNCTION JOIN ROOM
    joinRoom: async (req, res) => {
        try {
            const findRoom = await game_room.findOne({
                where: {
                    room_name: req.body.room_name
                }
            })
            // IF ROOM NOT EXIST
            if (!findRoom) {
                return res.status(400).json({
                    msg: 'ROOM NOT FOUND'
                })
            }
            //IF ALREADY JOIN ROOM
            //CHECK IF DATA USER ALREADY ON ROOM
            if (findRoom.p1_id == req.user.id || findRoom.p2_id == req.user.id) {
                return res.status(200).json({
                    id: req.user.id,
                    username: req.user.username,
                    msg: 'YOU ALREADY JOIN THIS ROOM'
                })
            }
            //IF ROOM FULL
            //IF P2_ID FIELD FULLFILED
            if (findRoom.p2_id) {
                return res.status(200).json({
                    room_name: findRoom.room_name,
                    msg: 'ROOM IS FULL'
                })
            }
            //GET INPUT FROM PLAYER 2 TO JOIN A ROOM
            const input = {
                p2_id: req.user.id
            }
            //UPDATE P2_ID ON GAME_ROOM
            await game_room.update(input, {
                    where: {
                        room_name: findRoom.room_name
                    }
                })
                .then(Result => {
                    res.status(200).json({
                        msg: 'JOIN SUCCESS'
                    })
                })
        } catch (error) {
            res.status(500).json({
                msg: 'JOIN ROOM METHOD ERROR'
            })
        }
    },
    // FUNCTION GAME ROOM AND FIGHT
    fightRoom: async (req, res) => {
        //USER INPUT ROCK PAPER SCISSORS
        try {
            var input = {
                roomId: req.params.room_id,
                user: req.user.id,
                choose: req.body.choose
            }
            //GET ALL DATA FROM GAME_HISTORY
            const dataGame = await game_history.findAll({
                where: {
                    room_id: input.roomId
                },
                attributes: ['round', 'round_winner', 'p1_pick', 'p2_pick']
            })
            //SORTING THE ROUND
            dataGame.sort((a, b) => a.round - b.round)
            const findGame = dataGame.map(game => {
                var round_winner = ''
                //IF MATCH DRAW
                if (game.round_winner == 0) {
                    round_winner = 'DRAW'
                    //IF PLAYER 1 WIN
                } else if (game.round_winner == 1) {
                    round_winner = 'Player 1'
                    //IF PLAYER 2 WIN
                } else if (game.round_winner == 2) {
                    round_winner = 'Player 2'
                    //DEFAULT VALUE IF USER NOT PICK 
                } else {
                    round_winner = null
                }
                //RETURN THE VALUE OF USER INPUT
                return {
                    round: game.round,
                    round_winner: round_winner,
                    p1_pick: game.p1_pick,
                    p2_pick: game.p2_pick
                }
            })
            //FUNCTION TO GET DATA GAME ROOM
            const findRoom = await game_room.findByPk(input.roomId)
            var gameResult = {
                roomId: input.roomId,
                roomName: findRoom.room_name,
                onGoingRound: 0,
                yourRole: 0,
                gameHistory: findGame,
            }
            // END OF FUNCTION GAME ROOM AND FIGHT

            // ROUND CHECKER FOR 3 ROUND
            if (findRoom.p1_id == input.user) gameResult.yourRole = 1
            else gameResult.yourRole = 2
            //ROUND 1
            if (gameResult.gameHistory[0].p1_pick == null || gameResult.gameHistory[0].p2_pick == null) {
                gameResult.onGoingRound = 1
            }
            //ROUND 2
            else if (gameResult.gameHistory[1].p1_pick == null || gameResult.gameHistory[1].p2_pick == null) {
                gameResult.onGoingRound = 2
            }
            //ROUND 3
            else if (gameResult.gameHistory[2].p1_pick == null || gameResult.gameHistory[2].p2_pick == null) {
                gameResult.onGoingRound = 3
            }
            //IF PLAYER ALREADY INPUT 3 TIMES GAMES
            else {
                var finalResult = {
                    roomId: input.roomId,
                    roomname: findRoom.room_name,
                    notification: 'GAME IS OVER, THE WINNER IS PLAYER',
                    gameHistory: findGame
                }
                //GAME SCORE
                const scoreResults = await game_history.findAll({
                    where: {
                        room_id: input.roomId
                    },
                    attributes: ['round', 'round_winner']
                })
                //DEFAULT SCORE VALUE
                var p1_win = 0
                var p2_win = 0
                //INCREASE SCORE AFTER WINNING A 1 ROUND OF GAME
                scoreResults.forEach(scoreResult => {
                    if (scoreResult.round_winner == 1) {
                        p1_win = p1_win + 1
                    } else if (scoreResult.round_winner == 2) {
                        p2_win = p2_win + 1
                    }
                })

                //NOTIF THE WINNER IS
                const player1_win = await game_user.findOne({
                    where: { id: findRoom.p1_id },
                    attributes : ['id', 'username']
                })

                const player2_win = await game_user.findOne({
                    where: { id: findRoom.p2_id  },
                    attributes : ['id', 'username']
                })

                //CONDITION 
                if (p1_win == p2_win) {
                    finalResult.notification = `GAME IS DRAW`
                } else if (p1_win > p2_win) {
                    finalResult.notification = finalResult.notification + ' 1 ' + 'WITH ' +'ID: ' + player1_win.id +' AND USERNAME: '+ player1_win.username
                } else {
                    finalResult.notification = finalResult.notification + ' 2 ' + 'WITH '+ 'ID: ' + player2_win.id +' AND USERNAME: '+ player2_win.username
                }
                return res.status(200).json(finalResult)
            }

            //USER INPUT THE GAME CHOICE
            //USER CAN INPUT LOWERCASE OR UPPERCASE LETTER
            if (!(input.choose == 'R' || input.choose == 'P' || input.choose == 'S' || input.choose == 'r' || input.choose == 'p' || input.choose == 's')) {
                var gameResult = {
                    roomId: input.roomId,
                    roomName: findRoom.room_name,
                    onGoingRound: 0,
                    yourRole: 0,
                    warning: `PLEASE MAKE SURE YOU CHOOSE R (rock) or P (paper) or S (scissor)`,
                    gameHistory: findGame,
                }
                return res.status(200).json(gameResult)
            }
            //MAKE A LOWERCASE ON JSON CONVERT TO UPPERCASE
            if (input.choose == 'r' || input.choose == 'p' || input.choose == 's') {
                const converted = input.choose.toUpperCase()
                input.choose = converted
            }
            //TURN OF PICK
            const player = gameResult.yourRole
            //CHECK OTHER PLAYER PICK
            if (gameResult.yourRole == 1 && gameResult.gameHistory[gameResult.onGoingRound - 1].p1_pick != null) {
                return res.status(200).json({
                    WARNING: `WAIT YOUR OPPONENT CHOOSE`,
                    onGoingRound: gameResult.onGoingRound,
                    yourRole: player,
                })
            }
            //CHECK OTHER PLAYER PICK
            if (gameResult.yourRole == 2 && gameResult.gameHistory[gameResult.onGoingRound - 1].p2_pick != null) {
                return res.status(200).json({
                    WARNING: `WAIT YOUR OPPONENT CHOOSE`,
                    onGoingRound: gameResult.onGoingRound,
                    yourRole: player,
                })
            }
            //PLAYER PICK UPDATE TO GAME_HISTORY DB
            //P1 UPDATE
            if (player == 1) {
                await game_history.update({
                    p1_pick: input.choose
                }, {
                    where: {
                        room_id: input.roomId,
                        round: gameResult.onGoingRound
                    }
                })
                //P2 UPDATE
            } else {
                await game_history.update({
                    p2_pick: input.choose
                }, {
                    where: {
                        room_id: input.roomId,
                        round: gameResult.onGoingRound
                    }
                })
            }

            //DATA RESULT OF THE GAME
            const resultDataGame = await game_history.findAll({
                where: {
                    room_id: input.roomId
                },
                attributes: ['round', 'p1_pick', 'p2_pick']
            })
            //SORTING ROUND 1,2,and 3
            resultDataGame.sort((a, b) => a.round - b.round)
            var finalGameResult = {
                roomId: input.roomId,
                roomName: findRoom.room_name,
                round: gameResult.onGoingRound,
                yourRole: gameResult.yourRole,
                gameHistory: resultDataGame
            }

            //
            if (resultDataGame[finalGameResult.round - 1].p1_pick && resultDataGame[finalGameResult.round - 1].p2_pick) {
                if (resultDataGame[finalGameResult.round - 1].p1_pick == resultDataGame[finalGameResult.round - 1].p2_pick)
                {
                    await game_history.update({
                        round_winner: 0
                    }, {
                        where: {
                            room_id: input.roomId,
                            round: gameResult.onGoingRound
                        }
                    })
                } else {
                    if ((resultDataGame[finalGameResult.round - 1].p1_pick == 'R' && resultDataGame[finalGameResult.round - 1].p2_pick == 'S') ||
                        (resultDataGame[finalGameResult.round - 1].p1_pick == 'P' && resultDataGame[finalGameResult.round - 1].p2_pick == 'R') ||
                        (resultDataGame[finalGameResult.round - 1].p1_pick == 'S' && resultDataGame[finalGameResult.round - 1].p2_pick == 'P')) {
                        await game_history.update({
                            round_winner: 1
                        }, {
                            where: {
                                room_id: input.roomId,
                                round: gameResult.onGoingRound
                            }
                        })
                    } else {
                        await game_history.update({
                            round_winner: 2
                        }, {
                            where: {
                                room_id: input.roomId,
                                round: gameResult.onGoingRound
                            }
                        })
                    }
                }
            }

            return res.status(200).json(finalGameResult)

        } catch (error) {
            res.status(500).json({
                msg: 'FIGHT METHOD IS ERROR'
            })

        }

    }
}