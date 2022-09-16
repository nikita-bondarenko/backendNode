import express from 'express'
import { prisma, hash, getUserIdByToken, extractToken } from '../index'

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

export const createSession = async (id) => {
    const tokens = await prisma.userTag.create({
        data: {
            token: String(Date.now()),
            refreshToken: String(Date.now() + 20),
            userUid: id,
            touchedAt: String(Date.now())
        },
        select: {
            token: true,
            refreshToken: true,
            expire: true
        }
    })
    return tokens
}

export const validateInput = (email, password, nickname) => {

    const res = { status: 200, message: '' }
    if (nickname && nickname.length > 30) {
        res.status = 400
        res.message = wrongNicknameMessage()
    }

    if (password && isWrongPassword(password)) {
        res.status = 400
        res.message = wrongPasswordMessage
    }

    if (email && isWrongEmail(email)) {
        res.status = 400
        res.message = wrongEmailMessage()
    }

    return res
}


router.post('/signup', async (req, res) => {
    try {
        let { email, password, nickname } = req.body
        if (!email || !password || !nickname) {
            res.sendStatus(400)
            return
        }

        const valid = validateInput(email, password, nickname)

        if (valid.status === 400) return res.status(valid.status).send(valid.message)

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

        const tokens = await createSession(newUser.uid)

        res.json(tokens)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.post("/logout", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)

        if (!userId) {
            res.sendStatus(401)
            return
        }

        const token: string = extractToken(req)

        const userTags = await prisma.userTag.delete({
            where: { token }
        })

        userTags ? res.sendStatus(200) : 1
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.post("/login", async (req, res) => {
    try {
        let { password, email } = req.body

        if (!password || !email) {
            res.sendStatus(400)
            return
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            res.sendStatus(404)
            return
        }

        password = hash(password)

        if (user.password !== password) {
            res.sendStatus(400)
            return
        }

        const tokens = await createSession(user.uid)

        res.json(tokens)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.post("/refresh", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req, "Refresh")
        if (!userId) {
            res.sendStatus(401)
            return
        }
        const refreshToken = extractToken(req)

        const tokens = await prisma.userTag.update({
            where: {
                refreshToken
            },
            data: {
                token: String(Date.now()),
                touchedAt: String(Date.now())
            }
        })

        res.json(tokens)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


export default router