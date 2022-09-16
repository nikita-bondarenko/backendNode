import express from 'express'
import { prisma, getUserIdByToken } from '../index'
import { validateInput } from './auth'

const router = express.Router()

router.delete("/tag/:id", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)
        if (!userId) return res.sendStatus(401)

        const { id } = req.params

        if (!Number(id)) return res.sendStatus(400)

        const tag = await prisma.tag.findUnique({
            where: { id: Number(id) },
            select: {
                creatorId: true,
                id: true
            }
        })

        if (!tag) {
            res.sendStatus(404)
            return
        }

        if (tag.creatorId !== userId) return res.sendStatus(403)

        const deletedTag = await prisma.tag.delete({
            where: {
                id: tag.id
            }
        })

        if (deletedTag) res.sendStatus(204)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


router.delete('/', async (req, res) => {
    try {

        const userId = await getUserIdByToken(req)

        if (!userId) {
            res.sendStatus(401)
            return
        }

        const tags = await prisma.tag.deleteMany({
            where: {
                creatorId: userId
            }
        })

        const userTags = await prisma.userTag.deleteMany({
            where: {
                userUid: userId
            }
        })

        const user = await prisma.user.delete({
            where: { uid: userId },
        })

        if (user && tags && userTags) {
            res.sendStatus(204)
        }

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})


router.get("/", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)
        if (!userId) {
            res.sendStatus(401)
            return
        }

        const user = await prisma.user.findUnique({
            where: { uid: userId },
            include: { tags: true }
        })

        res.json(user)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.post("/tag", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)

        if (!userId) return res.sendStatus(401)

        const { tags } = req.body

        if (typeof tags !== 'object' || tags.some((id) => !Number(id))) {
            res.sendStatus(400)
            return
        }

        let updatedTags
        try {
            updatedTags = await Promise.all(tags.map(async (id) => {
                const updatedTag = await prisma.tag.update({
                    where: { id: Number(id) },
                    data: {
                        creatorId: userId
                    }
                })
                return updatedTag
            }))

        } catch {
            res.sendStatus(404)
        }

        if (updatedTags) {
            const user = await prisma.user.findUnique({
                where: { uid: userId },
                select: {
                    tags: {
                        select: {
                            id: true,
                            name: true,
                            sortOrder: true
                        }
                    }
                }
            })
            res.json(user)
        }



    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.get("/tag/my", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)
        if (!userId) return res.sendStatus(401)

        const user = await prisma.user.findUnique({
            where: { uid: userId },
            select: {
                tags: {
                    select: {
                        id: true,
                        name: true,
                        sortOrder: true
                    }
                }
            }
        })

        res.json(user)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.put('/', async (req, res) => {
    try {
        let { email, password, nickname } = req.body

        if (!email && !password && !nickname) {
            res.sendStatus(400)
            return
        }

        const valid = validateInput(email, password, nickname)

        if (valid.status === 400) return res.status(valid.status).send(valid.message)

        const userId: string = await getUserIdByToken(req)


        if (!userId) {
            res.sendStatus(401)
            return
        }

        let userByEmail: any = null, userByNickname: any = null
        if (email) {
            userByEmail = await prisma.user.findUnique({
                where: {
                    email
                }
            })
        }

        if (nickname) {
            userByNickname = await prisma.user.findUnique({
                where: {
                    nickname
                }
            })
        }
        if ((userByEmail && userByEmail.uid !== userId) || (userByNickname && userByNickname.uid !== userId)) {
            res.sendStatus(409)
            return
        }


        const user = await prisma.user.update({
            where: { uid: userId },
            data: {
                ...(email ? { email } : {}),
                ...(password ? { password } : {}),
                ...(nickname ? { nickname } : {})
            }
        })

        res.json({ email: user.email, nickname: user.nickname })

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

export default router