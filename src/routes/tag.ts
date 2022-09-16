import express from 'express'
import { prisma, getUserIdByToken } from '../index'

const router = express.Router()
export const wrongTagName = (name: any = false) => {
    if (name) {
        return `Tag with name '${name}' already exists`
    } else {
        return `Name should be not more than forty symbols in length`
    }
}

export const validateTagInput = async (name) => {

    const res = { status: 200, message: 'Ok' }
    if (!name) {
        res.status = 400
        res.message = 'Bad Request'
        return res
    }

    if (name.length > 40) {
        res.status = 400
        res.message = wrongTagName()
        return res
    }

    const tagByName = await prisma.tag.findUnique({
        where: { name }
    })

    if (tagByName) {
        res.status = 400
        res.message = wrongTagName(name)
        return res
    }
    return res
}


router.post('/', async (req, res) => {
    try {
        const { name, sortOrder } = req.body

        const userId = await getUserIdByToken(req)

        if (!userId) {
            res.sendStatus(401)
            return
        }

        const valid = await validateTagInput(name)

        if (valid.status === 400) {
            res.status(valid.status).send(valid.message)
            return
        }

        const tag = await prisma.tag.create({
            data: {
                ... (sortOrder && Number(sortOrder) ? { sortOrder: Number(sortOrder) } : {}),
                name, creatorId: userId
            },
            select: {
                id: true,
                name: true,
                sortOrder: true
            }
        })

        res.json(tag)

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

        const { sortByName, sortByOrder, page, pageSize } = req.query

        const list = Number(page) || 1
        const limit = Number(pageSize) || 10

        const tags = await prisma.tag.findMany({
            orderBy: {
                ...(typeof sortByOrder === 'string' && typeof sortByName === 'string' ? { sortOrder: 'asc' } : typeof sortByName === 'string' ? { name: 'asc' } : typeof sortByName === 'string' ? { sortOrder: 'asc' } : {}),
            },

            select: {
                name: true,
                sortOrder: true,
                creator: {
                    select: {
                        uid: true,
                        nickname: true,
                    }
                }
            },
            skip: limit * (list - 1),
            take: limit
        })

        const allTags = await prisma.tag.findMany()

        res.json({
            data: tags, meta: {
                page: list,
                pageSize: limit,
                quantity: allTags.length
            }
        })

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.get("/:id", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)
        if (!userId) {
            res.sendStatus(401)
            return
        }

        const { id } = req.params

        const tag: any = await prisma.tag.findUnique({
            where: { id: Number(id) },
            select: {
                name: true,
                sortOrder: true,
                creator: {
                    select: {
                        uid: true,
                        nickname: true
                    }
                }
            }
        })

        if (!tag) {
            res.sendStatus(404)
            return
        }

        res.json(tag)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.put("/:id", async (req, res) => {
    try {

        const userId = await getUserIdByToken(req)

        if (!userId) {
            res.sendStatus(401)
            return
        }

        const { id } = req.params

        if (!Number(id)) {
            res.sendStatus(400)
            return
        }

        const tag = await prisma.tag.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                creator: true
            }
        })

        if (!tag) {
            res.sendStatus(404)
            return
        }

        if (tag.creator && tag.creator.uid !== userId) {
            res.sendStatus(403)
            return
        }

        const { name, sortOrder } = req.body

        if ((!name || name.length > 40) && !Number(sortOrder)) {
            res.sendStatus(400)
            return
        }

        if (name) {
            const tagByName = await prisma.tag.findUnique({
                where: { name }
            })

            if (tagByName && tagByName.id !== tag.id) {
                res.sendStatus(409)
                return
            }
        }

        const updatedTag = await prisma.tag.update({
            where: { id: Number(id) },
            data: {
                ...(name ? { name } : {}),
                ...(Number(sortOrder) ? { sortOrder } : {})
            }
        })

        res.json(updatedTag)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const userId = await getUserIdByToken(req)

        if (!userId) return res.sendStatus(401)

        const { id } = req.params

        if (!Number(id)) return res.sendStatus(400)

        const tag = await prisma.tag.findUnique({
            where: { id: Number(id) },
            select: {
                creatorId: true
            }
        })

        if (!tag) return res.sendStatus(404)

        if (tag.creatorId !== userId) return res.sendStatus(403)

        const deletedTag = await prisma.tag.delete({
            where: { id: Number(id) }
        })

        if (deletedTag) res.sendStatus(204)

    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

export default router