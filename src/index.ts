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

export const getUserIdByToken = async (req, res, tokenType = "Bearer") => {
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

app.listen(3000, () => {
  console.log('Listenning at http://localhost:3000')
})
