import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client';
import auth from './routes/auth'
import tag from './routes/tag'
import user from './routes/user'

export const prisma = new PrismaClient();
export const hash = (p) => crypto.createHash('sha256').update(p).digest('hex');
export const app = express()

app.use(cors())
app.use(express.json())
app.use("/", auth)
app.use("/tag", tag)
app.use("/user", user)

export const extractToken = (req) => {
  const { authorization } = req.headers
  const token = authorization.trim().split(' ')[1]
  return token
}

export const getUserIdByToken = async (req, tokenType = "Bearer") => {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      return
    }
    const [type, token] = authorization.trim().split(' ')
    if (type !== tokenType) {
      return
    }

    let userTag: any = null
    if (type === 'Bearer') {
      userTag = await prisma.userTag.findUnique({
        where: { token }
      })
    } else {
      userTag = await prisma.userTag.findUnique({
        where: { refreshToken: token }
      })
    }

    return userTag.userUid
  } catch (err) {
    console.error('getUserIdByToken', err)
  }

}

const deleteExpiredUserTags = async () => {
  const sessions = await prisma.userTag.findMany()
  sessions.forEach(async item => {
      const token: any = item.token
      if (Date.now() - Number(item.touchedAt) > 1000 * 60 * 30) {
          await prisma.userTag.delete({
              where: { token }
          })
      }
  })
}


setTimeout(() => deleteExpiredUserTags(), 1000 * 60)

app.listen(4000, () => {
  console.log('Listenning at http://localhost:4000')
})
