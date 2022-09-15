import express from 'express'
import { prisma, getUserIdByToken } from '../index'

const router = express.Router()

router.delete('/', async (req, res) => {
    try {
        console.log(req.headers)

        const userId = await getUserIdByToken(req, res)

        if (!userId) {
            res.sendStatus(400)
            return
        }

        const user = await prisma.user.delete({
            where: { uid: userId }
        })

        const userTags = await prisma.userTag.deleteMany({
            where: {
                userUid: userId
            }
        })

        if (userTags && user) {
            res.sendStatus(204)
        }

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

export default router