import express from 'express'
import { prisma, hash } from '../index'

const router = express.Router()

export const wrongNicknameMessage = (nickname: any = false) => {
    if (nickname) {
        return `User with nickname "${nickname}" already exists.`
    } else {
        return 'Nickname should include not more than thirty simbols'
    }
}

export const wrongEmailMessage = (email: any = false) => {
    if (email) {
        return `User with email "${email}" already exists.`
    } else {
        return 'Email must include at least one simbol "@" and one point'
    }
}
export const wrongPasswordMessage = 'Wrong format of password. Password should consist at list one letter in upper case, one letter in lower case and one nimber. Also password should be at list eight simbols in length'

export const isWrongEmail = email => {
    const emailArr = email.trim().split('')
    return !(emailArr.some(s => s === '@')) || !(emailArr.some(s => s === '.'))
}

export const isWrongPassword = (password) => {
    const pwdArr = password.trim().split('')
    const numbers = pwdArr.reduce((arr, item) => parseInt(item) ? [...arr, item] : arr, [])
    const letters = pwdArr.reduce((arr, item) => !parseInt(item) ? [...arr, item] : arr, [])
    return !(letters.some((l) => l === l.toUpperCase())) || !(letters.some((l) => l === l.toLowerCase())) || !(pwdArr.length >= 8) || !(numbers.length !== 0) || !(letters.length !== 0)
}

router.post('/signup', async (req, res) => {
    try {
        let { email, password, nickname } = req.body
        if (!email || !password || !nickname) {
            res.sendStatus(400)
            return
        }

        if (nickname.length > 30) {
            res.status(400).send(wrongNicknameMessage())
            return
        }

        if (isWrongPassword(password)) {
            res.status(400).send(wrongPasswordMessage)
            return
        }

        if (isWrongEmail(email)) {
            res.status(400).send(wrongEmailMessage())
            return
        }

        const user1 = await prisma.user.findUnique({
            where: { email }
        })

        if (user1) {
            res.status(400).send(wrongEmailMessage(email))
            return
        }

        const user2 = await prisma.user.findUnique({
            where: { nickname }
        })

        if (user2) {
            res.status(400).send(wrongNicknameMessage(nickname))
            return
        }

        password = hash(password)

        const newUser: any = await prisma.user.create({
            data: {
                email: String(email), password, nickname: String(nickname)
            }
        })

        const tokens = await prisma.userTag.create({
            data: {
                token: String(Date.now()),
                refreshToken: String(Date.now() + 20),
                userUid: newUser.uid
            }
        })

        res.json(tokens)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


export default router